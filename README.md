# SnackStop — Campus Snack Bar POS

IT 415 Midterm Practical Exam, Scenario 4. A desktop point-of-sale web app
for a campus snack bar, used by a cashier with a mouse and keyboard.

## What it does

- Shows 6 hard-coded products with prices (Classic Burger ₱55.00,
  Cheeseburger ₱65.00, Ham Sandwich ₱40.00, French Fries (Regular) ₱45.00,
  Nachos ₱50.00, Soda (Can) ₱25.00).
- Adds products to an order; adding the same product again increases its
  quantity. + and − change the quantity (1 to 99); Remove deletes a line.
- Recomputes each subtotal and the total after every change.
- Takes a cash payment in a numeric field and rejects blank, non-numeric,
  negative, over-₱100,000.00, and insufficient amounts with a clear message.
- Computes the change, confirms the payment, and shows a digital receipt
  with a transaction number `SB-YYYYMMDD-NNNN`.
- "New Transaction" clears everything and moves to the next number.

Plain HTML, CSS, and JavaScript. No server code, no database, no
dependencies. Data lives in memory only (a page refresh starts over).

## Transaction flow

Browse Products → Add to Cart → Review Order → Enter Payment →
Validate & Compute → Confirm Payment → Receipt / New Transaction

## Run the app

```bash
python -m http.server 8000
```

Then open http://127.0.0.1:8000/

## Run the tests

Requires Node.js (built-in test runner, nothing to install).

```bash
node --test
```

Node finds `tests/logic.test.js` automatically. Note: on Node 22 and newer,
`node --test tests/` fails with `Cannot find module '...\tests'` because a
folder argument is treated as a file name; use `node --test` (or
`node --test tests/logic.test.js`).

## File structure

```
campus-snack-bar-pos/
  index.html          page with 4 sections: Products, Order Summary, Payment, Receipt
  css/styles.css      styles (plain CSS, CSS variables, no CDN)
  js/products.js      the 6 hard-coded products (prices in centavos)
  js/logic.js         pure functions: cart, totals, payment validation,
                      change, transaction number, receipt (no DOM; tested)
  js/app.js           state, event handlers, and render() (textContent only)
  tests/logic.test.js 41 automated tests (node --test)
  docs/
    PLAN.md           build plan
    AI_LOG.md         log of every AI prompt and result
    TESTING.md        test results and manual test table
    DOCUMENTATION.md  exam documentation
    evidence/         screenshots
  README.md
  .gitignore
```

## Documentation

- [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) — exam documentation
- [docs/TESTING.md](docs/TESTING.md) — test results
- [docs/PLAN.md](docs/PLAN.md) — build plan
- [docs/AI_LOG.md](docs/AI_LOG.md) — AI usage log
