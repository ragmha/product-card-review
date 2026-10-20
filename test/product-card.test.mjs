import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { escapeHtml, renderProductCard } from "../product-card.js";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url)));
const [kettle] = await readJson("../data/products.json");
const messages = await readJson("../messages/en.json");

test("renders the name, link and button", () => {
  const html = renderProductCard(kettle, messages);
  assert.match(html, /Harbor Pour-Over Kettle/);
  assert.match(html, /href="\/products\/harbor-pour-over-kettle"/);
  assert.match(html, />Add to cart</);
});

test("shows a low-stock label at five or fewer", () => {
  assert.match(renderProductCard(kettle, messages), /Only 3 left/);
  assert.match(renderProductCard({ ...kettle, stock: 9 }, messages), /In stock/);
});

test("escapes the product name", () => {
  const html = renderProductCard({ ...kettle, name: "<b>Kettle</b>" }, messages);
  assert.match(html, /&lt;b&gt;Kettle&lt;\/b&gt;/);
  assert.equal(escapeHtml(`"'&`), "&quot;&#39;&amp;");
});
