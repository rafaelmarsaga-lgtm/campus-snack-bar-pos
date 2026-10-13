// SnackStop DOM wiring. All rules live in logic.js; this file only keeps
// state, listens for clicks, and redraws. Text goes in with textContent
// (never innerHTML), so nothing typed or stored can run as HTML.

const L = window.SnackLogic;

// App state (memory only; a page refresh starts over, by design).
let cart = [];
let seq = 1;          // transaction counter for this browser session
let receipt = null;   // null while taking an order; an object once paid
let message = null;   // payment message: { text, kind } or null

const ADDED_MESSAGE_MS = 2000; // how long "Added: <name>" stays visible
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
// Built once: the product list never changes. Rebuilding the cards on
// every redraw would also throw away keyboard focus on the Add button.
function buildProducts() {
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

function renderProducts() {
  els.productList.querySelectorAll("button").forEach((add) => {
    add.disabled = isLocked();
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
  addedTimer = setTimeout(() => { els.addedMessage.textContent = ""; }, ADDED_MESSAGE_MS);
}

// ---------- Payment ----------
// Payment is only possible when there is something to pay for and the
// sale is not already finished.
function renderPayment() {
  const canPay = !isLocked() && cart.length > 0;
  els.cashInput.disabled = !canPay;
  els.payButton.disabled = !canPay;
}

// message.kind is "error" (red) or "success" (green). Empty text hides the box.
function renderMessage() {
  els.paymentMessage.textContent = message ? message.text : "";
  els.paymentMessage.classList.toggle("is-success", Boolean(message) && message.kind === "success");
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
  const columns = [
    ["Item", ""],
    ["Qty", "col-qty"],
    ["Unit Price", "col-money"],
    ["Subtotal", "col-money"],
  ];
  columns.forEach(([title, className]) => {
    const th = el("th", className, title);
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
  const wrapper = el("div", "table-scroll");
  wrapper.append(table);
  return wrapper;
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

// The ONE way the screen is updated: every handler changes state, then
// calls render(). No handler has to remember which parts to redraw.
function render() {
  renderHeader();
  renderProducts();
  renderCart();
  renderPayment();
  renderMessage();
  renderReceipt();
}

// Every cart action ends here. A payment message describes the OLD total
// (e.g. "at least ₱55.00"), so it must go when the total changes. An
// empty cart disables the field, so its old amount is cleared too.
function updateCart(newCart) {
  cart = newCart;
  message = null;
  if (cart.length === 0) els.cashInput.value = "";
  render();
}

// ---------- Events (one listener per area, using data-action) ----------
els.productList.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action='add']");
  if (!btn || isLocked()) return;
  const product = PRODUCTS.find((p) => p.id === btn.dataset.id);
  updateCart(L.addToCart(cart, product));
  showAdded(product.name);
});

els.cartBody.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn || isLocked()) return;
  const id = btn.dataset.id;
  const actions = {
    increase: L.increaseQty,
    decrease: L.decreaseQty,
    remove: L.removeItem,
  };
  updateCart(actions[btn.dataset.action](cart, id));
});

// An old error should not stay on screen while the cashier is retyping.
els.cashInput.addEventListener("input", () => {
  message = null;
  renderMessage();
});

// "submit" fires for both the Confirm Payment button and the Enter key.
els.paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isLocked()) return;
  // Second check: the disabled button already blocks this, but a stale
  // button state must never let an empty sale through.
  if (cart.length === 0) {
    message = { text: "Your cart is empty.", kind: "error" };
    render();
    return;
  }

  const result = L.validatePayment(els.cashInput.value, L.cartTotal(cart));
  if (!result.ok) {
    message = { text: result.message, kind: "error" };
    render();
    els.cashInput.focus();
    return;
  }

  const now = new Date();
  receipt = L.buildReceipt(cart, result.paidCents, L.nextTransactionNumber(now, seq), now);
  message = {
    text: "Payment successful. Change: " + L.formatPeso(receipt.changeCents),
    kind: "success",
  };
  render();
  // Move focus so the cashier can press Enter to start the next sale.
  els.newTransaction.focus();
  els.receipt.scrollIntoView({ block: "nearest" });
});

els.newTransaction.addEventListener("click", () => {
  cart = [];
  receipt = null;
  seq += 1;
  message = null;
  els.cashInput.value = "";
  els.addedMessage.textContent = "";
  render();
  els.productList.querySelector("button").focus();
});

buildProducts();
render();
