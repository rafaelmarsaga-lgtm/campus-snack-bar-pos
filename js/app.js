// SnackStop DOM wiring. All rules live in logic.js; this file only keeps
// state, listens for clicks, and redraws. Text goes in with textContent
// (never innerHTML), so nothing typed or stored can run as HTML.

const L = window.SnackLogic;

// The only app state for the cart.
let cart = [];
let addedTimer = null;

const els = {
  productList: document.getElementById("product-list"),
  addedMessage: document.getElementById("added-message"),
  cartBody: document.getElementById("cart-body"),
  cartEmpty: document.getElementById("cart-empty"),
  cartTotal: document.getElementById("cart-total"),
};

// Small helper: create an element with a class and text.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(className, text, action, id, label) {
  const btn = el("button", "btn " + className, text);
  btn.type = "button";
  btn.dataset.action = action;
  btn.dataset.id = id;
  if (label) btn.setAttribute("aria-label", label);
  return btn;
}

// ---------- Products ----------
function renderProducts() {
  els.productList.replaceChildren();
  PRODUCTS.forEach((product) => {
    const card = el("li", "product-card");
    card.append(
      el("h3", "product-name", product.name),
      el("p", "product-price num", L.formatPeso(product.priceCents)),
      button("btn-add", "Add", "add", product.id, "Add " + product.name)
    );
    els.productList.append(card);
  });
}

// ---------- Order Summary ----------
function renderCartRow(item) {
  const row = el("tr");

  const qtyCell = el("td", "col-qty");
  const controls = el("div", "qty-controls");
  const minus = button("btn-qty", "−", "decrease", item.id, "Decrease " + item.name);
  const plus = button("btn-qty", "+", "increase", item.id, "Increase " + item.name);
  minus.disabled = item.qty <= 1;
  plus.disabled = item.qty >= L.MAX_QTY;
  controls.append(minus, el("span", "qty num", String(item.qty)), plus);
  qtyCell.append(controls);

  const removeCell = el("td", "col-remove");
  removeCell.append(button("btn-remove", "Remove", "remove", item.id, "Remove " + item.name));

  row.append(
    el("td", "col-item", item.name),
    qtyCell,
    el("td", "col-money num", L.formatPeso(item.priceCents)),
    el("td", "col-money num", L.formatPeso(L.lineSubtotal(item))),
    removeCell
  );
  return row;
}

function renderCart() {
  els.cartBody.replaceChildren(...cart.map(renderCartRow));
  els.cartEmpty.hidden = cart.length > 0;
  els.cartTotal.textContent = L.formatPeso(L.cartTotal(cart));
}

function showAdded(name) {
  els.addedMessage.textContent = "Added: " + name;
  clearTimeout(addedTimer);
  addedTimer = setTimeout(() => { els.addedMessage.textContent = ""; }, 2000);
}

// ---------- Events (one listener per area, using data-action) ----------
els.productList.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action='add']");
  if (!btn) return;
  const product = PRODUCTS.find((p) => p.id === btn.dataset.id);
  cart = L.addToCart(cart, product);
  renderCart();
  showAdded(product.name);
});

els.cartBody.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "increase") cart = L.increaseQty(cart, id);
  if (btn.dataset.action === "decrease") cart = L.decreaseQty(cart, id);
  if (btn.dataset.action === "remove") cart = L.removeItem(cart, id);
  renderCart();
});

renderProducts();
renderCart();
