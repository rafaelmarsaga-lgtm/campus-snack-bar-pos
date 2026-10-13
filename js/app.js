// SnackStop DOM wiring. All rules live in logic.js; this file only keeps
// state, listens for clicks, and redraws. Text goes in with textContent
// (never innerHTML), so nothing typed or stored can run as HTML.

const L = window.SnackLogic;

// App state (memory only; a page refresh starts over, by design).
let cart = [];
let seq = 1;          // transaction counter for this browser session
let receipt = null;   // null while taking an order; an object once paid
let addedTimer = null;

const els = {
  txnNumber: document.getElementById("txn-number"),
  productList: document.getElementById("product-list"),
  addedMessage: document.getElementById("added-message"),
  cartBody: document.getElementById("cart-body"),
  cartEmpty: document.getElementById("cart-empty"),
  cartTotal: document.getElementById("cart-total"),
  paymentForm: document.getElementById("payment-form"),
  cashInput: document.getElementById("cash-input"),
  payButton: document.getElementById("pay-button"),
  paymentMessage: document.getElementById("payment-message"),
  receipt: document.getElementById("receipt"),
  receiptBody: document.getElementById("receipt-body"),
  newTransaction: document.getElementById("new-transaction"),
};

// While a receipt is shown the sale is finished, so nothing may change it.
function isLocked() {
  return receipt !== null;
}

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

// ---------- Header ----------
function renderHeader() {
  els.txnNumber.textContent = receipt
    ? receipt.txnNo
    : L.nextTransactionNumber(new Date(), seq);
}

// ---------- Products ----------
function renderProducts() {
  els.productList.replaceChildren();
  PRODUCTS.forEach((product) => {
    const card = el("li", "product-card");
    const add = button("btn-add", "Add", "add", product.id, "Add " + product.name);
    add.disabled = isLocked();
    card.append(
      el("h3", "product-name", product.name),
      el("p", "product-price num", L.formatPeso(product.priceCents)),
      add
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
  minus.disabled = isLocked() || item.qty <= 1;
  plus.disabled = isLocked() || item.qty >= L.MAX_QTY;
  controls.append(minus, el("span", "qty num", String(item.qty)), plus);
  qtyCell.append(controls);

  const removeCell = el("td", "col-remove");
  const remove = button("btn-remove", "Remove", "remove", item.id, "Remove " + item.name);
  remove.disabled = isLocked();
  removeCell.append(remove);

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

// ---------- Payment ----------
function renderPayment() {
  els.cashInput.disabled = isLocked();
  els.payButton.disabled = isLocked();
}

// kind: "error" (red) or "success" (green). Empty text hides the box.
function setPaymentMessage(text, kind) {
  els.paymentMessage.textContent = text;
  els.paymentMessage.classList.toggle("is-success", kind === "success");
}

// ---------- Receipt ----------
function receiptLine(label, value, className) {
  const row = el("div", "receipt-line " + (className || ""));
  row.append(el("dt", "", label), el("dd", "num", value));
  return row;
}

function renderReceiptItems(items) {
  const table = el("table", "cart receipt-items");
  const head = el("tr");
  ["Item", "Qty", "Unit Price", "Subtotal"].forEach((title, i) => {
    const th = el("th", i === 0 ? "" : i === 1 ? "col-qty" : "col-money", title);
    th.scope = "col";
    head.append(th);
  });
  const thead = el("thead");
  thead.append(head);

  const tbody = el("tbody");
  items.forEach((item) => {
    const row = el("tr");
    row.append(
      el("td", "", item.name),
      el("td", "col-qty num", String(item.qty)),
      el("td", "col-money num", L.formatPeso(item.priceCents)),
      el("td", "col-money num", L.formatPeso(item.subtotalCents))
    );
    tbody.append(row);
  });
  table.append(thead, tbody);
  return table;
}

function renderReceipt() {
  els.receipt.hidden = !receipt;
  if (!receipt) {
    els.receiptBody.replaceChildren();
    return;
  }
  const dateText = receipt.date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const meta = el("dl", "receipt-meta");
  meta.append(
    receiptLine("Transaction no.", receipt.txnNo),
    receiptLine("Date and time", dateText)
  );

  const totals = el("dl", "receipt-totals");
  totals.append(
    receiptLine("Total", L.formatPeso(receipt.totalCents), "is-total"),
    receiptLine("Amount paid", L.formatPeso(receipt.paidCents)),
    receiptLine("Change", L.formatPeso(receipt.changeCents), "is-change")
  );

  els.receiptBody.replaceChildren(
    el("p", "receipt-store", receipt.storeName),
    meta,
    renderReceiptItems(receipt.items),
    totals
  );
}

// Redraw everything from state. Cheap for 6 products, and it means the
// screen can never disagree with the data.
function renderAll() {
  renderHeader();
  renderProducts();
  renderCart();
  renderPayment();
  renderReceipt();
}

// ---------- Events (one listener per area, using data-action) ----------
els.productList.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action='add']");
  if (!btn || isLocked()) return;
  const product = PRODUCTS.find((p) => p.id === btn.dataset.id);
  cart = L.addToCart(cart, product);
  renderCart();
  showAdded(product.name);
});

els.cartBody.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn || isLocked()) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "increase") cart = L.increaseQty(cart, id);
  if (btn.dataset.action === "decrease") cart = L.decreaseQty(cart, id);
  if (btn.dataset.action === "remove") cart = L.removeItem(cart, id);
  renderCart();
});

// "submit" fires for both the Confirm Payment button and the Enter key.
els.paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isLocked()) return;

  const result = L.validatePayment(els.cashInput.value, L.cartTotal(cart));
  if (!result.ok) {
    setPaymentMessage(result.message, "error");
    els.cashInput.focus();
    return;
  }

  const now = new Date();
  receipt = L.buildReceipt(cart, result.paidCents, L.nextTransactionNumber(now, seq), now);
  setPaymentMessage("Payment successful. Change: " + L.formatPeso(receipt.changeCents), "success");
  renderAll();
  // Move focus so the cashier can press Enter to start the next sale.
  els.newTransaction.focus();
  els.receipt.scrollIntoView({ block: "nearest" });
});

els.newTransaction.addEventListener("click", () => {
  cart = [];
  receipt = null;
  seq += 1;
  els.cashInput.value = "";
  setPaymentMessage("");
  els.addedMessage.textContent = "";
  renderAll();
  els.productList.querySelector("button").focus();
});

renderAll();
