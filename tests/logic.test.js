const { test } = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../js/logic.js");
const {
  formatPeso, addToCart, increaseQty, decreaseQty,
  removeItem, lineSubtotal, cartTotal,
  parsePaymentToCents, validatePayment, computeChange,
  nextTransactionNumber, buildReceipt,
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

// ---------- parsePaymentToCents ----------
test("parsePaymentToCents reads whole pesos", () => {
  assert.equal(parsePaymentToCents("100"), 10000);
});

test("parsePaymentToCents reads one decimal place as tens of centavos", () => {
  assert.equal(parsePaymentToCents("55.5"), 5550);
});

test("parsePaymentToCents reads two decimal places exactly", () => {
  assert.equal(parsePaymentToCents("55.05"), 5505);
});

test("parsePaymentToCents ignores spaces around the number", () => {
  assert.equal(parsePaymentToCents(" 60 "), 6000);
});

// ---------- computeChange ----------
test("computeChange is amount paid minus total", () => {
  assert.equal(computeChange(10000, 5500), 4500);
});

test("computeChange is 0 when paying the exact amount", () => {
  assert.equal(computeChange(5500, 5500), 0);
});

// ---------- nextTransactionNumber ----------
test("nextTransactionNumber uses SB-YYYYMMDD-NNNN", () => {
  assert.equal(nextTransactionNumber(new Date(2026, 9, 13), 1), "SB-20261013-0001");
});

test("nextTransactionNumber pads the counter to 4 digits", () => {
  assert.equal(nextTransactionNumber(new Date(2026, 9, 13), 12), "SB-20261013-0012");
});

test("nextTransactionNumber pads single-digit months and days", () => {
  assert.equal(nextTransactionNumber(new Date(2026, 0, 5), 3), "SB-20260105-0003");
});

// ---------- buildReceipt ----------
test("buildReceipt lists items, totals, paid amount, and change", () => {
  const date = new Date(2026, 9, 13, 14, 30);
  const cart = [{ ...BURGER, qty: 2 }, { ...SODA, qty: 1 }];
  assert.deepEqual(buildReceipt(cart, 20000, "SB-20261013-0001", date), {
    storeName: "SnackStop — Campus Snack Bar",
    txnNo: "SB-20261013-0001",
    date,
    items: [
      { name: "Classic Burger", qty: 2, priceCents: 5500, subtotalCents: 11000 },
      { name: "Soda (Can)", qty: 1, priceCents: 2500, subtotalCents: 2500 },
    ],
    totalCents: 13500,
    paidCents: 20000,
    changeCents: 6500,
  });
});

// ---------- validatePayment (happy path; full rules in Step 5) ----------
test("validatePayment accepts an amount above the total", () => {
  assert.deepEqual(validatePayment("100", 5500), { ok: true, paidCents: 10000 });
});

test("validatePayment accepts the exact total", () => {
  assert.deepEqual(validatePayment("55", 5500), { ok: true, paidCents: 5500 });
});

// ---------- validatePayment: every rule (Step 5) ----------
const INVALID = "Please enter a valid payment amount.";
const INSUFFICIENT_55 = "Insufficient payment. Please enter at least ₱55.00.";

const invalidInputs = [
  ["blank", ""],
  ["spaces only", "   "],
  ["letters", "abc"],
  ["digits followed by a letter", "12a"],
  ["a negative amount", "-5"],
  ["more than 2 decimal places", "50.123"],
  ["scientific notation", "1e3"],
  ["more than ₱100,000.00", "100000.01"],
];

invalidInputs.forEach(([label, input]) => {
  test(`validatePayment rejects ${label} (${JSON.stringify(input)})`, () => {
    assert.deepEqual(validatePayment(input, 5500), { ok: false, message: INVALID });
  });
});

test("validatePayment rejects less than the total with the total in the message", () => {
  assert.deepEqual(validatePayment("50", 5500), { ok: false, message: INSUFFICIENT_55 });
});

test("validatePayment treats 0 as insufficient, not invalid", () => {
  assert.deepEqual(validatePayment("0", 5500), { ok: false, message: INSUFFICIENT_55 });
});

test("validatePayment accepts exactly ₱100,000.00 (the upper limit)", () => {
  assert.deepEqual(validatePayment("100000", 5500), { ok: true, paidCents: 10000000 });
});
