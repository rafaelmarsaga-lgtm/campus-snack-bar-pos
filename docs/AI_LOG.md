# AI Usage Log

Tool: Claude Code (desktop app), model Claude Opus 5.5, with the Superpowers skills.
One entry per step. Evaluation and Modifications are drafts for Rafael to rewrite.

---

## Entry 1 — Planning (no commit; plan saved as docs/PLAN.md)

**Prompt used:**

```
Context: I'm taking my IT 415 Midterm Practical Exam with about 2 hours
left. Read CLAUDE.md first: it has my rules, the stack (Kit B), and every
scenario rule. My scenario is Scenario 4, Campus Snack Bar POS, a
desktop food ordering and POS app.

Required transaction flow: Browse Products → Add to Cart → Review Order →
Enter Payment → Validate & Compute → Confirm Payment → Receipt / New
Transaction.

Required features: (1) at least 5 products with names and prices;
(2) add to cart with on-screen buttons; (3) increase and decrease
quantity; (4) remove a product; (5) subtotals and total recomputed on
every change; (6) clear order summary; (7) cash payment in a numeric
field; (8) reject blank, non-numeric, negative, and insufficient amounts,
each with a clear message; (9) change = amount paid − total;
(10) payment confirmation; (11) digital receipt with items, quantities,
subtotals, total, amount paid, change, and a transaction number;
(12) New Transaction clears the cart, payment, and receipt.

Objective: Plan the build before any code.

Requirements:
- No clarifying questions unless something truly blocks you; CLAUDE.md
  already answers the scenario rules.
- Write: the general objective and 3 specific objectives, the 3 features
  as Input → Processing → Output, the list of pure functions in logic.js
  with what each returns, the validation table (input → rule → message),
  and a table mapping each of the 12 required features to the step that
  builds it.
- Steps, in order, each with what gets built and how we verify it:
  Step 1 Initial project setup (files, .gitignore, README stub, check
  node --version, test setup, git init)
  Step 2 Create application interface (all 4 sections, static)
  Step 3 Implement core functionality: cart, quantities, remove, totals
  (TDD)
  Step 4 Implement core functionality: payment, change, confirmation,
  receipt, new transaction (TDD)
  Step 5 Add input validation (every payment rule + empty cart)
  Step 6 Fix application error (reserved for a real error)
  Step 7 Refactor application code
  Step 8 Update documentation
- List edge cases my instructor might try in the demo.

Constraints: fit about 1 hour 15 minutes of building. No code yet. No
branches. No new dependencies.

Expected output: the plan ready to save as docs/PLAN.md, plus a short
summary. Stop and wait for my approval.
```

**Purpose:** Get a complete, step-by-step build plan before writing any code, so wrong directions are caught early.

**AI response:** Checked the environment (Node v24.15.0, Python 3.12.10), then wrote docs/PLAN.md: objectives, 3 features as Input → Processing → Output, 12 pure functions for logic.js, validation table, feature-to-step map, design decisions (integer centavos, regex parsing instead of parseFloat, plain CSS instead of Tailwind CDN, no storage.js), 8 steps with tests and verification, and 16 demo edge cases.

**Evaluation (draft):** Correct. Covers all 12 required features and every CLAUDE.md rule. Proposed two changes from the kit (plain CSS, no storage.js) and explained why. Saved screenshots to files and had no limit on Step 6 time, which I changed.

**Modifications (draft):** Approved plain CSS. I take screenshots myself. DOCUMENTATION.md must follow exam Section VIII with a screenshots section. Step 6 edge-case run capped at 10 minutes.

---

## Entry 2 — Step 1

**Step / commit:** `Initial project setup: create Kit B folders, .gitignore, README, plan, and test runner`

**Prompt used:**

```
Plan approved with these notes. Save it as docs/PLAN.md and do Step 1.

1. Plain CSS instead of Tailwind is approved (no internet dependency).
2. I'll take the screenshots myself; don't try to save Browser-pane
   screenshots to files. Just tell me what to capture at each step.
3. Step 8: DOCUMENTATION.md must follow exam Section VIII. For each AI
   use (at least 2, ideally planning, code generation, debugging, and
   refactoring), include: exact prompt used, purpose, AI response summary,
   my evaluation (correct / partially correct / incorrect and why), and
   modifications made. Add a screenshots section with placeholders for
   product list, cart, payment, receipt, and GitHub commit history
   (Section X).
4. Step 6: if no real bug has appeared by then, run the edge-case list
   for at most 10 minutes and fix only what genuinely breaks.
```

**Purpose:** Apply my plan notes and set up the project skeleton, test runner, and Git repository.

**AI response:** Updated docs/PLAN.md with my 4 notes. Created `.gitignore`, README stub, `index.html` shell, empty `css/styles.css`, `js/products.js`, `js/app.js`, `js/logic.js` (exports work in both Node and the browser), `tests/logic.test.js` with one smoke test, `docs/TESTING.md` stub, `docs/evidence/`, this log. Ran `git init -b main`. The planned command `node --test tests/` failed with `Cannot find module '...\tests'`: on Node 22+ a folder argument is treated as a file. Switched to `node --test` (auto-discovers `*.test.js`) → 1 pass. Updated README and PLAN.md to match.

**Evaluation (draft):** Partially correct. The plan's test command was wrong for Node 24; the AI ran it, saw the real error, and fixed it before committing. `.gitignore` exists before the first commit.

**Modifications (draft):** Test command changed to `node --test`.

---

## Entry 3 — Step 2

**Step / commit:** `Create application interface: static layout for products, order summary, payment, and receipt`

**Prompt used:** "Proceed to Step 2 of docs/PLAN.md." plus my requirements: use frontend-design and ui-ux-pro-max, propose one design direction, build index.html with header, 6 product cards, Order Summary table (Item, Qty with − and +, Unit Price, Subtotal, Remove), "Your cart is empty.", Total ₱0.00, Payment form (type="number" step="0.01" min="0", novalidate, Confirm Payment, role="alert" message), hidden Receipt with New Transaction; two-column layout readable at 1366×768; visible focus; no JS, no CDN, no external fonts. (Full text in chat.)

**Purpose:** Build the full static interface so every required section exists before adding logic.

**AI response:** Ran the ui-ux-pro-max design-system search (suggested appetizing red + warm gold for food POS; its web fonts and landing-page pattern were not used). Direction: "counter ticket" — grey counter background, white panels, ketchup-red action buttons, one mustard-yellow total band as the loudest element, system fonts so it works offline. Wrote index.html (5 regions) and css/styles.css with CSS variables for colors and spacing, 3:2 product grid, tabular numbers for prices, 44px+ buttons, blue focus ring, single-column layout under 1000px. Checked in the Browser pane: fits one screen with no horizontal scroll and no console errors. Added `.claude/` (local preview config) to .gitignore.

**Evaluation (draft):** Correct. All sections present and readable; static only, no logic.

**Modifications (draft):** None yet.

---

## Entry 4 — Step 3

**Step / commit:** `Implement core functionality: add to cart, change quantity, remove items, and recompute totals`

**Prompt used:** "keep the bug for Step 6... Proceed to Step 3 of docs/PLAN.md." plus my requirements: TDD (show tests failing, then passing) for formatPeso, addToCart, increaseQty, decreaseQty, removeItem, lineSubtotal, cartTotal in integer centavos, cart functions never mutate; products.js with ids p1–p6 and priceCents; app.js renders cards, wires Add/+/−/Remove, shows "Added: <name>", disables − at 1 and + at 99, empty message and ₱0.00, textContent only; no payment logic; no layout changes except wiring. (Full text in chat.)

**Purpose:** Make the cart (Section V features 1–6) work end to end, proven by tests.

**AI response:** Wrote 17 new tests first; RED run: 17 failed with `TypeError: formatPeso is not a function` (1 smoke test passed). Implemented the 7 functions in logic.js (formatPeso built by hand, not toLocaleString, so output is the same on every PC; MAX_QTY = 99); GREEN run: 18/18 pass. products.js holds the 6 products in centavos. app.js keeps `cart` as the only state; each click does `cart = logic(cart)` then `renderCart()`; one click listener per area using `data-action`; all text via textContent. index.html: static cards replaced by an empty list filled from products.js. CSS: small rules for the qty controls. Browser check: Burger ×2 + Soda = ₱135.00, + on Soda → ₱160.00, − on Burger → ₱105.00, Remove both → "Your cart is empty." and ₱0.00; − disabled at qty 1; no console errors.

Also in this commit: removed the thick mustard left border on product cards (design check flagged it as clashing with rounded corners). The narrow-screen horizontal-scroll bug found after Step 2 is deliberately left unfixed for Step 6.

**Evaluation (draft):** Correct. Tests failed for the right reason before the code existed, then passed; browser behaviour matches.

**Modifications (draft):** Asked to keep the layout bug for Step 6 instead of committing the fix now.

---

## Entry 5 — Step 4

**Step / commit:** `Implement core functionality: cash payment, change, confirmation, receipt, and new transaction`

**Prompt used:** "Proceed to Step 4 of docs/PLAN.md." plus my requirements: TDD for parsePaymentToCents, computeChange, nextTransactionNumber, buildReceipt, and the happy path of validatePayment; wire Confirm Payment and Enter; show "Payment successful. Change: ₱X.XX" then the receipt (store name, SB-YYYYMMDD-NNNN, date and time, items with qty/unit price/subtotal, total, paid, change); lock Add, +, −, Remove and the payment form while the receipt shows; New Transaction clears everything and increases the number. Only happy-path validation; don't change cart behaviour. (Full text in chat.)

**Purpose:** Complete one full transaction from payment to receipt to the next transaction (Section V features 7, 9–12).

**AI response:** Wrote 12 new tests first; RED run: 12 failed with `TypeError: parsePaymentToCents is not a function`, the 18 cart tests still passed. Implemented parsePaymentToCents (regex on the text, no parseFloat, so "55.05" is exactly 5505), validatePayment (happy path only), computeChange, nextTransactionNumber (zero-padded date and 4-digit counter), buildReceipt (a snapshot object). GREEN run: 30/30 pass. app.js: added `seq` and `receipt` state, `isLocked()` = receipt is shown, one `renderAll()` that redraws header, products, cart, payment and receipt from state; the form's submit event covers both the button and Enter; focus moves to New Transaction after paying, and to the first Add button after a new transaction. Browser check: Burger + Soda = ₱80.00, typed 100 + Enter → "Payment successful. Change: ₱20.00", receipt shows SB-20261013-0001, date/time, both items, Total ₱80.00, Amount paid ₱100.00, Change ₱20.00; all Add/+/−/Remove, cash field and Confirm button disabled; New Transaction → empty cart, ₱0.00, blank field, no message, receipt hidden, header SB-20261013-0002; no console errors.

**Evaluation (draft):** Correct for the happy path. Known gap left for Step 5: with an empty cart the total is ₱0.00, so paying 0 is accepted and prints an empty receipt; Step 5 disables payment for an empty cart.

**Modifications (draft):** None.
