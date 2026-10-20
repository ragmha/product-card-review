import { test } from "node:test";
import assert from "node:assert/strict";
import { lenses, meta, run } from "../.github/extensions/product-card-review/workflow.mjs";

function fakeContext(answers, { paused = false } = {}) {
  const events = [];
  return {
    events,
    args: { locales: ["de", "ar"] },
    phase: (title) => events.push(`phase:${title}`),
    log: (message) => events.push(`log:${message}`),
    pause: async (key) => {
      events.push(`pause:${key}`);
      if (paused) throw new Error("paused");
    },
    parallel: (thunks) => Promise.all(thunks.map((thunk) => thunk().catch(() => null))),
    agent: async (_prompt, { label }) => {
      events.push(`agent:${label}`);
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
