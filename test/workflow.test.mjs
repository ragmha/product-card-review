import { test } from "node:test";
import assert from "node:assert/strict";
import { lenses, meta, plan, run } from "../.github/extensions/product-card-review/workflow.mjs";

function fakeContext(answers, { paused = false, changed } = {}) {
  const events = [];
  const prompts = [];
  return {
    events,
    prompts,
    args: { locales: ["de", "ar"], changed },
    phase: (title) => events.push(`phase:${title}`),
    log: (message) => events.push(`log:${message}`),
    pause: async (key) => {
      events.push(`pause:${key}`);
      if (paused) throw new Error("paused");
    },
    parallel: (thunks) => Promise.all(thunks.map((thunk) => thunk().catch(() => null))),
    agent: async (prompt, { label }) => {
      events.push(`agent:${label}`);
      prompts.push(prompt);
      return answers[label] ?? null;
    },
  };
}

const finding = { severity: "low", location: "product-card.css", issue: "x", fix: "y" };
const answers = {
  "review:design": { findings: [finding] },
  "review:product": { findings: [] },
  "review:accessibility": { findings: [] },
  "review:security": { findings: [] },
  "translate:de": { messages: { addToCart: "In den Warenkorb" }, problems: [] },
  "translate:ar": { messages: { addToCart: "أضف إلى السلة" }, problems: [] },
};

test("declares the phases and arguments the CLI checks", () => {
  assert.deepEqual(meta.phases.map((phase) => phase.title), ["Review", "Translate"]);
  assert.deepEqual(meta.argsSchema.required, ["locales"]);
  assert.deepEqual(Object.keys(lenses), ["design", "product", "accessibility", "security"]);
});

test("the first attempt reviews four ways and stops before translating", async () => {
  const ctx = fakeContext(answers, { paused: true });
  await assert.rejects(run(ctx), /paused/);
  const agents = ctx.events.filter((event) => event.startsWith("agent:"));
  assert.deepEqual(agents, [
    "agent:review:design",
    "agent:review:product",
    "agent:review:accessibility",
    "agent:review:security",
  ]);
  assert.equal(ctx.events.at(-1), "pause:approve-copy");
  assert.ok(ctx.prompts.every((prompt) => prompt.endsWith("Report only problems you can point to.")));
});

test("after approval it translates each locale", async () => {
  const ctx = fakeContext(answers);
  const result = await run(ctx);
  const afterPause = ctx.events.slice(ctx.events.indexOf("pause:approve-copy"));
  assert.deepEqual(
    afterPause.filter((event) => event.startsWith("agent:")),
    ["agent:translate:de", "agent:translate:ar"],
  );
  assert.deepEqual(result.report.design, [finding]);
  assert.equal(result.translations.de.messages.addToCart, "In den Warenkorb");
});

test("a failed review stays null instead of looking clean", async () => {
  const ctx = fakeContext({ ...answers, "review:security": null });
  const result = await run(ctx);
  assert.deepEqual(result.report.product, []);
  assert.equal(result.report.security, null);
  assert.ok(ctx.events.includes("log:security: no result"));
});

test("routes each changed file to the steps it needs", () => {
  assert.deepEqual([...plan(["product-card.css"])], ["design", "accessibility"]);
  assert.deepEqual([...plan(["messages/en.json"])], ["translate"]);
  assert.deepEqual([...plan(["data/products.json"])], ["product", "security"]);
  assert.equal(plan(["product-card.js"]).size, 5);
  assert.equal(plan(undefined).size, 5);
});

test("a CSS change gets two focused reviews and no pause", async () => {
  const ctx = fakeContext(answers, { changed: ["product-card.css"] });
  const result = await run(ctx);
  const agents = ctx.events.filter((event) => event.startsWith("agent:"));
  assert.deepEqual(agents, ["agent:review:design", "agent:review:accessibility"]);
  assert.ok(!ctx.events.includes("pause:approve-copy"));
  assert.ok(ctx.prompts.every((prompt) => prompt.endsWith("Focus on product-card.css; read the other files only for context.")));
  assert.deepEqual(Object.keys(result.report), ["design", "accessibility"]);
  assert.equal(result.translations, undefined);
});
