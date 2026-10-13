// SnackStop pure logic: no DOM access here, so Node can test every function.
// All money is in whole centavos (integers) so totals are exact: 0.1 + 0.2
// is not 0.3 in JavaScript, but 10 + 20 is always 30.

const MAX_QTY = 99;

// 123450 -> "₱1,234.50". Built by hand instead of toLocaleString so the
// output is the same on every computer, whatever its language settings.
function formatPeso(cents) {
  const pesos = Math.floor(cents / 100);
  const centavos = String(cents % 100).padStart(2, "0");
  const withCommas = String(pesos).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "₱" + withCommas + "." + centavos;
}

// Cart functions return a NEW array and never change the one passed in,
// so the app always does: new cart = f(old cart), then re-render.

function addToCart(cart, product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    return increaseQty(cart, product.id);
  }
  return [...cart, { id: product.id, name: product.name, priceCents: product.priceCents, qty: 1 }];
}

function increaseQty(cart, id) {
  return cart.map((item) =>
    item.id === id ? { ...item, qty: Math.min(item.qty + 1, MAX_QTY) } : item
  );
}

function decreaseQty(cart, id) {
  return cart.map((item) =>
    item.id === id ? { ...item, qty: Math.max(item.qty - 1, 1) } : item
  );
}

function removeItem(cart, id) {
  return cart.filter((item) => item.id !== id);
}

function lineSubtotal(item) {
  return item.priceCents * item.qty;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + lineSubtotal(item), 0);
}

// ---------- Payment ----------

const STORE_NAME = "SnackStop — Campus Snack Bar";

// "55.5" -> 5550. Reads the text digit by digit instead of parseFloat,
// because parseFloat("12abc") is 12 and 55.05 * 100 is 5504.999...
// Returns null when the text is not plain digits with up to 2 decimals.
function parsePaymentToCents(text) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(text).trim());
  if (!match) return null;
  const pesos = Number(match[1]);
  const centavos = Number((match[2] || "").padEnd(2, "0"));
  return pesos * 100 + centavos;
}

// Happy path for Step 4; the full rule list (messages for each case)
// is added in Step 5.
function validatePayment(text, totalCents) {
  const paidCents = parsePaymentToCents(text);
  if (paidCents !== null && paidCents >= totalCents) {
    return { ok: true, paidCents };
  }
  return { ok: false, message: "Please enter a valid payment amount." };
}

function computeChange(paidCents, totalCents) {
  return paidCents - totalCents;
}

// (2026-10-13, 1) -> "SB-20261013-0001". seq counts up in memory.
function nextTransactionNumber(date, seq) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return "SB-" + yyyy + mm + dd + "-" + String(seq).padStart(4, "0");
}

// A plain snapshot of the sale, so the receipt does not change if the
// cart is cleared afterwards.
function buildReceipt(cart, paidCents, txnNo, date) {
  const totalCents = cartTotal(cart);
  return {
    storeName: STORE_NAME,
    txnNo,
    date,
    items: cart.map((item) => ({
      name: item.name,
      qty: item.qty,
      priceCents: item.priceCents,
      subtotalCents: lineSubtotal(item),
    })),
    totalCents,
    paidCents,
    changeCents: computeChange(paidCents, totalCents),
  };
}

const SnackLogic = {
  MAX_QTY,
  formatPeso,
  addToCart,
  increaseQty,
  decreaseQty,
  removeItem,
  lineSubtotal,
  cartTotal,
  parsePaymentToCents,
  validatePayment,
  computeChange,
  nextTransactionNumber,
  buildReceipt,
};

// Node (tests) uses module.exports; the browser reads window.SnackLogic.
if (typeof module !== "undefined" && module.exports) {
  module.exports = SnackLogic;
} else {
  window.SnackLogic = SnackLogic;
}
