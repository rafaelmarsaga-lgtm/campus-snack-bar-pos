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

const SnackLogic = {
  MAX_QTY,
  formatPeso,
  addToCart,
  increaseQty,
  decreaseQty,
  removeItem,
  lineSubtotal,
  cartTotal,
};

// Node (tests) uses module.exports; the browser reads window.SnackLogic.
if (typeof module !== "undefined" && module.exports) {
  module.exports = SnackLogic;
} else {
  window.SnackLogic = SnackLogic;
}
