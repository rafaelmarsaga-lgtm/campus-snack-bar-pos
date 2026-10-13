# SnackStop: Campus Snack Bar POS — Build Plan (docs/PLAN.md)

> IT 415 Midterm Practical Exam, Scenario 4 · Kit B (HTML + vanilla JS, no server logic)
> Checkpoint-driven: one step at a time, verify, commit on `main`, then wait for "Proceed to Step N".

**Environment checked:** Node v24.15.0 (so we use `node --test`), Python 3.12.10 (for `python -m http.server 8000`). Folder currently has only `CLAUDE.md` and `docs/DOCUMENTATION_TEMPLATE.md`. Not a git repo yet.

---

## 1. Objectives

**General objective:** Build a working desktop POS web app for a campus snack bar that takes a customer from browsing products to a paid order with a digital receipt, with correct totals, validated cash payment, and change.

**Specific objectives:**
1. Let the cashier build an order from 6 hard-coded products, change quantities (1–99), and remove items, with subtotals and the total recomputed on every change.
2. Accept a cash amount and reject blank, non-numeric, negative, over-limit, and insufficient amounts with clear messages, then compute change exactly (integer centavos, no float errors).
3. Confirm the payment and show a digital receipt with a unique `SB-YYYYMMDD-NNNN` transaction number, then reset everything for the next customer with "New Transaction".

## 2. Features as Input → Processing → Output

| Feature | Input | Processing | Output |
|---|---|---|---|
| **A. Order building (cart)** | Click "Add" on a product; click +, −, Remove on a cart line | `addToCart` / `increaseQty` / `decreaseQty` / `removeItem` return a new cart; `lineSubtotal` and `cartTotal` recompute | Order Summary with name, qty, unit price, subtotal per line, total; "Added: <name>"; "Your cart is empty." when empty |
| **B. Payment & change** | Cash typed in payment field; click "Confirm Payment" or press Enter | `validatePayment(text, totalCents)` parses to centavos and checks rules; `computeChange(paid, total)` | Error message under the field, or success confirmation "Payment successful. Change: ₱X" |
| **C. Receipt & new transaction** | Valid payment; click "New Transaction" | `buildReceipt(...)` packs items, totals, paid, change, txn no., date/time; `nextTransactionNumber` gives the next number | Receipt section (store name, txn no., date/time, items, total, paid, change); cart+payment locked; New Transaction clears all and shows next number |

## 3. Pure functions in `js/logic.js` (no DOM; tested with `node --test`)

Cart item shape: `{ id, name, priceCents, qty }`. Every cart function returns a **new array** (does not mutate), so tests are simple and the UI just re-renders.

| Function | Returns |
|---|---|
| `formatPeso(cents)` | string, e.g. `formatPeso(123450)` → `"₱1,234.50"`, `formatPeso(0)` → `"₱0.00"` |
| `addToCart(cart, product)` | new cart; existing line → qty+1 (capped at 99), else new line qty 1 |
| `increaseQty(cart, id)` | new cart; qty+1, never above 99 |
| `decreaseQty(cart, id)` | new cart; qty−1, never below 1 |
| `removeItem(cart, id)` | new cart without that line |
| `lineSubtotal(item)` | integer cents = `priceCents × qty` |
| `cartTotal(cart)` | integer cents, sum of subtotals (0 for empty) |
| `parsePaymentToCents(text)` | integer cents, or `null` if not a valid amount (strict regex `^\d+(\.\d{1,2})?$` after trim; string → cents without floats) |
| `validatePayment(text, totalCents)` | `{ ok: true, paidCents }` or `{ ok: false, message }` |
| `computeChange(paidCents, totalCents)` | integer cents = paid − total |
| `nextTransactionNumber(date, seq)` | `"SB-YYYYMMDD-NNNN"`, e.g. `(2026-10-13, 1)` → `"SB-20261013-0001"` |
| `buildReceipt(cart, paidCents, txnNo, date)` | `{ storeName, txnNo, date, items[{name, qty, priceCents, subtotalCents}], totalCents, paidCents, changeCents }` |

`app.js` holds the only state: `cart`, `seq` (starts 1), `receipt` (null or object). It renders with `textContent` only.

## 4. Validation table

| Input | Rule | Message |
|---|---|---|
| Cart empty | Payment field and Confirm button disabled | "Your cart is empty." (in Order Summary) |
| Blank / spaces only | Must not be empty | "Please enter a valid payment amount." |
| Non-numeric (`abc`, `12a`, `1e3`, `₱50`) | Must match digits with optional 2 decimals | "Please enter a valid payment amount." |
| Negative (`-5`) | Must be ≥ 0 | "Please enter a valid payment amount." |
| More than 2 decimals (`50.123`) | Max 2 decimal places | "Please enter a valid payment amount." |
| Over limit (`100000.01`) | Must be ≤ ₱100,000.00 | "Please enter a valid payment amount." |
| Less than total (`50` for ₱55 total, also `0`) | paid ≥ total | "Insufficient payment. Please enter at least ₱55.00." |
| Equal to total | valid | Success, change ₱0.00 |
| More than total | valid | Success, change = paid − total |
| Payment while receipt shown | Cart buttons and payment locked (disabled) | — |

## 5. Required feature → step map

| # | Required feature | Step |
|---|---|---|
| 1 | ≥5 products with names and prices | 2 (static), 3 (rendered from `products.js`) |
| 2 | Add to cart with on-screen buttons | 3 |
| 3 | Increase / decrease quantity | 3 |
| 4 | Remove a product | 3 |
| 5 | Subtotals and total recomputed every change | 3 |
| 6 | Clear order summary | 2 (layout), 3 (live) |
| 7 | Cash payment in numeric field | 2 (field), 4 (wired) |
| 8 | Reject blank / non-numeric / negative / insufficient | 5 |
| 9 | Change = paid − total | 4 |
| 10 | Payment confirmation | 4 |
| 11 | Receipt with items, qty, subtotals, total, paid, change, txn no. | 4 |
| 12 | New Transaction clears cart, payment, receipt | 4 |

## 6. Design decisions (one-liners to defend)

- **Integer centavos:** `0.1 + 0.2 ≠ 0.3` in JS; integers make totals and change exact.
- **Parse the payment string with a regex, not `parseFloat`:** `parseFloat("12abc")` returns 12, which would wrongly accept bad input.
- **Payment field `type="number" step="0.01" min="0"` with `novalidate` on the form:** it is a numeric field as required, Enter submits the form, and our own messages show instead of browser pop-ups. Browser gives `""` for junk text, which our check reports as invalid.
- **Plain CSS file (`css/styles.css`) instead of Tailwind CDN:** the CDN needs internet; a local file can't fail during the demo. (Approved by Rafael.)
- **No `storage.js`:** scenario says data lives in memory only, so localStorage isn't needed.
- **Immutable cart functions:** each returns a new array, so every action is "compute new cart → render", one path for all updates.
- **One "Confirm Payment" button:** validates, computes change, confirms, and shows the receipt in one click; Enter does the same.

## 7. File layout

```
index.html          # 4 sections: Products, Order Summary, Payment, Receipt
css/styles.css
js/products.js      # 6 hard-coded products (ids p1..p6, priceCents)
js/logic.js         # pure functions above; module.exports + window.SnackLogic
js/app.js           # state, event handlers, render()
tests/logic.test.js # node --test
docs/PLAN.md AI_LOG.md TESTING.md DOCUMENTATION.md evidence/
README.md  .gitignore
```

## 8. Steps (≈75 min of building)

### Step 1 — Initial project setup (~8 min)
Build: folders and empty files above; `.gitignore` (`node_modules/`, `.env`, `*.db`, `__pycache__/`, `.vscode/`, `Thumbs.db`, `.DS_Store`); README stub (title, how to run, how to test); `docs/PLAN.md` (this plan); `docs/AI_LOG.md` with first entry; `logic.js` exporting an empty object; one smoke test (`logic module loads`); `git init -b main`.
Verify: `node --version`; `node --test` → 1 pass; `git status` shown to you.
Commit: `Initial project setup: create Kit B folders, .gitignore, README, plan, and test runner`

### Step 2 — Create application interface (~12 min)
Build: `index.html` + `styles.css` with header (store name "SnackStop", current transaction no. placeholder), Products grid (6 cards, name, price, Add button — static HTML), Order Summary (table headers, "Your cart is empty.", Total ₱0.00), Payment (number field, Confirm Payment button, message area), Receipt (hidden section, New Transaction button). Desktop two-column layout, readable at 1366×768.
Verify: `python -m http.server 8000` → open http://127.0.0.1:8000/ in Browser pane, check all 4 sections, no console errors. Rafael captures the screenshot.
Commit: `Create application interface: add static layout for products, order summary, payment, and receipt`

### Step 3 — Implement core functionality: cart (TDD, ~15 min)
Tests first (`tests/logic.test.js`), see them fail, then implement:
- `formatPeso`: 0 → `₱0.00`; 5500 → `₱55.00`; 123450 → `₱1,234.50`; 10000000 → `₱100,000.00`
- `addToCart`: empty + burger → 1 line qty 1; add burger twice → 1 line qty 2; add two products → 2 lines; at qty 99 add again → stays 99; original array unchanged
- `increaseQty` 98→99, 99→99; `decreaseQty` 2→1, 1→1; `removeItem` removes only that id
- `lineSubtotal` 6500×3 = 19500; `cartTotal` [] → 0, burger×2 + soda×1 → 13500
Then render products from `products.js`, wire Add/+/−/Remove, show "Added: <name>", disable − at 1 and + at 99, empty-cart message.
Verify: `node --test` all pass (show output); in browser add Burger twice → qty 2, ₱110.00; remove → "Your cart is empty."
Commit: `Implement core functionality: add to cart, change quantity, remove items, and recompute totals`

### Step 4 — Implement core functionality: payment, receipt, new transaction (TDD, ~18 min)
Tests first:
- `parsePaymentToCents`: `"100"` → 10000; `"55.5"` → 5550; `"55.05"` → 5505; `" 60 "` → 6000
- `computeChange`: (10000, 5500) → 4500; (5500, 5500) → 0
- `nextTransactionNumber(new Date(2026, 9, 13), 1)` → `"SB-20261013-0001"`; seq 12 → `…-0012`
- `buildReceipt`: correct items, subtotals, total, paid, change, txnNo
- `validatePayment("100", 5500)` → `{ ok: true, paidCents: 10000 }` (happy path only here)
Then wire form submit (button + Enter): on success show "Payment successful. Change: ₱X", render receipt, disable cart buttons and payment; New Transaction clears cart, field, messages, receipt, `seq++`, updates header number.
Verify: tests pass; browser: Burger + Soda (₱80.00), pay 100 → change ₱20.00, receipt shows SB-<today>-0001; New Transaction → empty cart, header shows -0002.
Commit: `Implement core functionality: cash payment, change, confirmation, receipt, and new transaction`

### Step 5 — Add input validation (TDD, ~10 min)
Tests first — `validatePayment` returns `ok:false` with "Please enter a valid payment amount." for: `""`, `"   "`, `"abc"`, `"12a"`, `"-5"`, `"50.123"`, `"1e3"`, `"100000.01"`; `"100000"` with total 5500 is ok; `"50"` with total 5500 → "Insufficient payment. Please enter at least ₱55.00."; `"0"` → insufficient; exact `"55"` → ok.
Then show the message in the UI (`role="alert"`), clear it when the field changes, keep focus in the field; disable payment when cart is empty; re-check empty cart in the submit handler too (defense if a button state is wrong).
Verify: tests pass; in browser try each row of the validation table and screenshot the messages.
Commit: `Add input validation: reject blank, non-numeric, negative, over-limit, and insufficient payments`

### Step 6 — Fix application error (~5–10 min, reserved)
Only for a REAL bug we hit during Steps 2–5 or the manual run-through (e.g. something the browser test reveals). Use `superpowers:systematic-debugging`: reproduce, find root cause, write a failing test if it's in logic, fix, re-verify. If no bug has appeared by now, we run the edge-case list below for **at most 10 minutes** and fix only what genuinely breaks. We never invent one.
Commit: `Fix application error: <what was actually wrong>`

### Step 7 — Refactor application code (~5 min)
Behavior stays the same. Likely candidates: one `render()` that draws all sections from state; pull magic numbers into constants (`MAX_QTY = 99`, `MAX_PAYMENT_CENTS = 10000000`, `STORE_NAME`); short "why" comments.
Verify: all tests still pass (same count); quick browser run of one full transaction.
Commit: `Refactor application code: centralize rendering and name limits as constants`

### Step 8 — Update documentation (~8 min)
README (features, run, test, file structure), `docs/TESTING.md` (test output + manual test table from the validation table and edge cases, with screenshot links), `docs/DOCUMENTATION.md` (from the template), complete `docs/AI_LOG.md`.
`DOCUMENTATION.md` follows exam **Section VIII**: for each AI use (at least 2; ideally planning, code generation, debugging, refactoring) list the exact prompt used, purpose, AI response summary, evaluation (correct / partially correct / incorrect, and why), and modifications made. Plus a **Screenshots** section (Section X) with placeholders for: product list, cart, payment, receipt, GitHub commit history.
Verify: links open; `node --test` output pasted into TESTING.md.
Commit: `Update documentation: README, testing results, AI log, and project documentation`

## 9. Edge cases the instructor may try in the demo

1. Pay with an empty cart (field/button disabled; message shown).
2. Press Enter on a blank field.
3. Type letters, `e` (e.g. `1e3`), `₱50`, `1,000` → invalid message (commas are rejected; say if you want `1,000` accepted).
4. `-50`, `0`, `-0`.
5. `55.555` (3 decimals) or `.5`.
6. Exact amount (change ₱0.00).
7. Amount just under total (₱54.99 for ₱55.00) → insufficient with exact total in message.
8. Huge amount `999999` → invalid (over ₱100,000.00 limit).
9. Click + past 99 / − below 1 (buttons disabled; logic also caps).
10. Add same product many times → one line, quantity grows.
11. Remove the last item → "Your cart is empty." and payment disabled.
12. Try to edit the cart or pay again while the receipt is shown (locked).
13. Several transactions in a row → numbers -0001, -0002, -0003.
14. Totals with mixed items, e.g. 3× Cheeseburger + 2× Fries + 1× Soda = ₱195 + ₱90 + ₱25 = ₱310.00.
15. Large order: 99× Cheeseburger = ₱6,435.00 (thousands separator shown).
16. Refresh the page → everything resets, numbering restarts at 0001 (in-memory by design).

## 10. Verification overall
- `node --test` after every logic step (actual output shown each time).
- Browser pane at http://127.0.0.1:8000/ after every UI step; Claude says what to capture, Rafael takes the screenshots into `docs/evidence/`.
- `git status` shown before every commit; you run `git push` yourself.
