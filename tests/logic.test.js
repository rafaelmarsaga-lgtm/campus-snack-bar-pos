const { test } = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../js/logic.js");
const {
  formatPeso, addToCart, increaseQty, decreaseQty,
  removeItem, lineSubtotal, cartTotal,
} = logic;

// Test products (same shape as js/products.js).
const BURGER = { id: "p1", name: "Classic Burger", priceCents: 5500 };
const CHEESE = { id: "p2", name: "Cheeseburger", priceCents: 6500 };
const SODA = { id: "p6", name: "Soda (Can)", priceCents: 2500 };

test("logic module loads", () => {
  assert.equal(typeof logic, "object");
});

// ---------- formatPeso ----------
test("formatPeso shows zero as ₱0.00", () => {
  assert.equal(formatPeso(0), "₱0.00");
});

test("formatPeso shows whole pesos with 2 decimals", () => {
  assert.equal(formatPeso(5500), "₱55.00");
});

test("formatPeso adds thousands separators and centavos", () => {
  assert.equal(formatPeso(123450), "₱1,234.50");
  assert.equal(formatPeso(10000000), "₱100,000.00");
});

// ---------- addToCart ----------
test("addToCart puts a new product in an empty cart with qty 1", () => {
  assert.deepEqual(addToCart([], BURGER), [
    { id: "p1", name: "Classic Burger", priceCents: 5500, qty: 1 },
  ]);
});

test("addToCart on a product already in the cart increases its qty", () => {
  const cart = addToCart(addToCart([], BURGER), BURGER);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 2);
});

test("addToCart with two different products makes two lines", () => {
  const cart = addToCart(addToCart([], BURGER), SODA);
  assert.deepEqual(cart.map((item) => item.id), ["p1", "p6"]);
});

test("addToCart does not go above qty 99", () => {
  const cart = [{ ...BURGER, qty: 99 }];
  assert.equal(addToCart(cart, BURGER)[0].qty, 99);
});

test("addToCart does not change the original cart", () => {
  const cart = [{ ...BURGER, qty: 1 }];
  addToCart(cart, BURGER);
  addToCart(cart, SODA);
  assert.deepEqual(cart, [{ ...BURGER, qty: 1 }]);
});

// ---------- increaseQty / decreaseQty / removeItem ----------
test("increaseQty adds 1", () => {
  assert.equal(increaseQty([{ ...BURGER, qty: 98 }], "p1")[0].qty, 99);
});

test("increaseQty stops at 99", () => {
  assert.equal(increaseQty([{ ...BURGER, qty: 99 }], "p1")[0].qty, 99);
});

test("decreaseQty subtracts 1", () => {
  assert.equal(decreaseQty([{ ...BURGER, qty: 2 }], "p1")[0].qty, 1);
});

test("decreaseQty stops at 1", () => {
  assert.equal(decreaseQty([{ ...BURGER, qty: 1 }], "p1")[0].qty, 1);
});

test("increaseQty and decreaseQty do not change the original cart", () => {
  const cart = [{ ...BURGER, qty: 5 }];
  increaseQty(cart, "p1");
  decreaseQty(cart, "p1");
  assert.equal(cart[0].qty, 5);
});

test("removeItem removes only the matching line", () => {
  const cart = [{ ...BURGER, qty: 1 }, { ...SODA, qty: 2 }];
  assert.deepEqual(removeItem(cart, "p1"), [{ ...SODA, qty: 2 }]);
  assert.equal(cart.length, 2); // original unchanged
});

// ---------- lineSubtotal / cartTotal ----------
test("lineSubtotal is unit price times qty", () => {
  assert.equal(lineSubtotal({ ...CHEESE, qty: 3 }), 19500);
});

test("cartTotal of an empty cart is 0", () => {
  assert.equal(cartTotal([]), 0);
});

test("cartTotal adds all subtotals", () => {
  const cart = [{ ...BURGER, qty: 2 }, { ...SODA, qty: 1 }];
  assert.equal(cartTotal(cart), 13500);
});
