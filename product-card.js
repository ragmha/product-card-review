export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}

function stockLabel(product, t) {
  if (product.stock > 5) return t.inStock;
  if (product.stock > 0) return t.onlyLeft.replace("{count}", product.stock);
  return t.outOfStock;
}

export function renderProductCard(product, t) {
  return `
    <article class="product-card">
      <a class="product-card__link" href="${escapeHtml(product.url)}">
        <img class="product-card__image" src="${escapeHtml(product.image)}" width="320" height="240">
        <h2 class="product-card__name">${escapeHtml(product.name)}</h2>
      </a>
      <span class="product-card__wishlist" data-action="wishlist">♡</span>
      <div class="product-card__body">
        <div class="product-card__description">${product.description}</div>
        <p class="product-card__price">${formatPrice(product.price)}</p>
        <p class="product-card__stock">${escapeHtml(stockLabel(product, t))}</p>
        <button class="product-card__add" type="button" data-action="add">${escapeHtml(t.addToCart)}</button>
      </div>
    </article>`;
}

export function mountProductCard(element, product, t, handlers = {}) {
  element.innerHTML = renderProductCard(product, t);
  element
    .querySelector('[data-action="add"]')
    .addEventListener("click", () => handlers.onAdd?.(product));
  element
    .querySelector('[data-action="wishlist"]')
    .addEventListener("click", () => handlers.onWishlist?.(product));
}
