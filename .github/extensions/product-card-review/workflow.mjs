const findingsSchema = {
  type: "object",
  required: ["findings"],
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        required: ["severity", "location", "issue", "fix"],
        properties: {
          severity: { type: "string", enum: ["high", "medium", "low"] },
          location: { type: "string" },
          issue: { type: "string" },
          fix: { type: "string" },
        },
      },
    },
  },
};

const translationSchema = {
  type: "object",
  required: ["messages", "problems"],
  properties: {
    messages: { type: "object" },
    problems: { type: "array", items: { type: "string" } },
  },
};

export const lenses = {
  design: "Check it against DESIGN.md: tokens, the spacing scale and the required states.",
  product: "Check it against BRIEF.md: every requirement, for every product in data/products.json.",
  accessibility: "Check it against WCAG 2.2 AA: names, roles, keyboard access, text alternatives and contrast.",
  security: "Treat every product field as untrusted merchant input. Look for injection and unsafe URLs.",
};

// The steps each changed file needs. A file that matches no route gets every
// step, so a missing route costs an extra review instead of skipping one.
export const routes = [
  [/^messages\//, ["translate"]],
  [/\.css$/, ["design", "accessibility"]],
  [/^data\//, ["product", "security"]],
];

export function plan(changed) {
  const every = [...Object.keys(lenses), "translate"];
  if (!changed) return new Set(every);
  return new Set(changed.flatMap((file) => routes.find(([route]) => route.test(file))?.[1] ?? every));
}

export const meta = {
  name: "product-card-review",
  description:
    "Review the product card for design, product, accessibility and security, " +
    "pause so a person can approve the copy, then translate it. " +
    'args: { locales: string[], changed?: string[] }, for example ["de", "ar"]. ' +
    "With changed, run only the steps those files need; without it, run every step.",
  phases: [{ title: "Review" }, { title: "Translate" }],
  argsSchema: {
    type: "object",
    required: ["locales"],
    properties: {
      locales: { type: "array", items: { type: "string" } },
      changed: { type: "array", items: { type: "string" } },
    },
  },
};

export async function run(ctx) {
  const { locales, changed } = ctx.args;
  const steps = plan(changed);
  ctx.log(`steps: ${[...steps].join(", ") || "none"}`);
  const focus = changed ? ` Focus on ${changed.join(", ")}; read the other files only for context.` : "";

  ctx.phase("Review");
  const names = Object.keys(lenses).filter((name) => steps.has(name));
  const reviews = await ctx.parallel(
    names.map((name) => () =>
      ctx.agent(
        `Review the product card in product-card.js, product-card.css and index.html ` +
          `as the ${name} reviewer. ${lenses[name]} ` +
          "Read the files but do not change them. Report only problems you can point to." +
          focus,
        { label: `review:${name}`, schema: findingsSchema },
      ),
    ),
  );

  const report = {};
  names.forEach((name, i) => {
    report[name] = reviews[i]?.findings ?? null;
    ctx.log(report[name] ? `${name}: ${report[name].length} findings` : `${name}: no result`);
  });

  if (!steps.has("translate")) return { report };
  await ctx.pause("approve-copy");

  ctx.phase("Translate");
  const results = await ctx.parallel(
    locales.map((locale) => () =>
      ctx.agent(
        `Translate messages/en.json into ${locale}, keeping every key. Then list anything in ` +
          `product-card.js or product-card.css that would still render wrongly in ${locale}.`,
        { label: `translate:${locale}`, schema: translationSchema },
      ),
    ),
  );

  const translations = {};
  locales.forEach((locale, i) => {
    translations[locale] = results[i];
  });
  return { report, translations };
}
