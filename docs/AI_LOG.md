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

---

## Entry 6 — Step 5

**Step / commit:** `Add input validation: reject blank, non-numeric, negative, over-limit, and insufficient payments`

**Prompt used:** "Proceed to Step 5 of docs/PLAN.md." plus my requirements: write every Step 5 test first (blank, spaces, "abc", "12a", "-5", "50.123", "1e3", "100000.01" → invalid; "50" and "0" with ₱55.00 total → insufficient; "55" and "100000" → ok), show failing then passing; UI: message in role="alert", clear on field change, keep focus, disable payment on empty cart, re-check empty cart in submit; run the validation table in the browser and report problems without fixing them. (Full text in chat.)

**Purpose:** Reject every invalid payment with a clear message (Section V feature 8).

**AI response:** Added 11 tests. RED run: 3 failed ("100000.01" was accepted; "50" and "0" got the generic message instead of "Insufficient payment…"); the other 8 invalid-input tests passed immediately because Step 4's strict parsePaymentToCents already rejects them — reported honestly, tests kept as regression guards. Implemented the ₱100,000.00 limit (MAX_PAYMENT_CENTS) and the insufficient message with the formatted total. GREEN: 41/41. UI: payment field and button disabled while the cart is empty; message cleared on `input`; focus stays in the field after an error; submit handler re-checks for an empty cart. Ran 13 cases by typing in the browser (table in chat). Problems found and NOT fixed (for Step 6): (1) layout scrolls sideways on narrow screens (known since Step 2); (2) the number field silently drops letters, so typing "12a" submits 12; (3) an old payment message and amount stay on screen after the cart changes (e.g. after removing the last item).

**Evaluation (draft):** Correct for the rules; tests and browser agree. Partially complete UX: problems (2) and (3) found during the run.

**Modifications (draft):** None yet; Step 6 fixes one real problem.

---

## Entry 7 — Step 6 (two real bugs, two commits)

**Step / commits:**
- `Fix application error: stop the page scrolling sideways on narrow screens`
- `Fix application error: clear the old payment message when the cart changes`

**Prompt used:** "keep the bug for Step 6..." (after Step 2), then "Proceed to Step 6 ... also want #3 fixed..."

**Purpose:** Fix real bugs found while building, using root-cause debugging (superpowers:systematic-debugging), not invented ones.

**AI response — bug 1 (found while checking Step 2 in a narrow Browser pane):**
- Reproduced at 375px phone width with items in the cart: page was 524px wide, so it scrolled sideways and cut off receipt amounts.
- Measured instead of guessing: the one-column grid track was `507.487px` = the minimum width of the right column; inside it the payment row needed 458px (cash field 282px + no-wrap button 163px) and the 5-column cart table about 410px.
- Root cause: in the narrow-screen media query the grid used `1fr`, which in CSS grid means "never narrower than the widest content".
- Tested the first idea live before editing (`minmax(0, 1fr)`): page shrank to 435px but the cart table still stuck out, so the cause has two parts.
- Fix: `minmax(0, 1fr)` for the column + a `.table-scroll` wrapper (overflow-x: auto) around the cart and receipt tables.
- Verify: at 375px page width = 375px with cart and with receipt, all receipt amounts visible; at 1366×768 layout unchanged (834px + 460px columns, no scroll); 41/41 tests pass. (A first re-check still showed 524px because the browser was serving cached old files; reloading fresh copies confirmed the fix.)

**AI response — bug 3 (found while running the validation table in Step 5):**
- Reproduced: Burger (₱55.00), pay 50 → "Insufficient payment. Please enter at least ₱55.00."; add Soda → total ₱80.00 but the message still said ₱55.00; empty the cart → field disabled but old amount and message still shown.
- Root cause: the payment message was only cleared on typing in the cash field and on New Transaction; the cart handlers never cleared it, so a message about an old total outlived that total.
- Fix: one `onCartChanged()` used by Add, +, −, Remove: redraws cart and payment, clears the message, and clears the amount when the cart becomes empty.
- Verify: same steps → message cleared after adding Soda; re-submitting 50 now says "at least ₱80.00"; paying 100 still gives change ₱20.00; emptying the cart clears field and message. No automated test: this is DOM behaviour and logic.js did not change (41/41 still pass).

**Not fixed (documented as a known limitation):** the number field silently drops letters, so "12a" is submitted as 12.

**Evaluation (draft):** Correct. Both fixes address the measured root cause and were checked before and after.

**Modifications (draft):** I chose to keep bug 1 for this step instead of fixing it in Step 2, and asked for bug 3 to be fixed too.

---

## Entry 8 — Step 7

**Step / commit:** `Refactor application code: redraw every section from state through one render()`

**Prompt used:** "Proceed to Step 7 of docs/PLAN.md." plus my requirements: tests before, show before code and the problem in 2 lines, change it, tests after with the same count, one full transaction in the browser; behaviour must not change; don't touch tests, messages, or layout; if something else is messier than the planned targets, pick that and say why. (Full text in chat.)

**Purpose:** Make app.js easier to read and harder to break, with no behaviour change.

**AI response:** Reported that the planned constants (MAX_QTY, MAX_PAYMENT_CENTS, STORE_NAME) and a renderAll() already existed from Steps 3–5, so picked the messier part: app.js updated the screen three different ways (renderAll(), a partial onCartChanged(), and direct setPaymentMessage() DOM writes), and the payment message lived only in the page, not in state — the same weakness that caused bug #3. Changes: payment message moved into state (`message`); one `render()` draws every section from state; every handler is "change state → render()"; cart actions go through `updateCart(newCart)`; product cards built once (`buildProducts()`) and `render()` only enables/disables Add, so keyboard focus stays on Add; nested ternary for receipt column classes replaced by a column list; `2000` ms named `ADDED_MESSAGE_MS`; increase/decrease/remove chosen from a lookup object. Tests: 41/41 before and after (`node --test tests/` still fails on Node 24, so `node --test` used). Browser: Add keeps focus on the button; pay 50 → insufficient ₱55.00 with focus in field; add Soda → message cleared, ₱80.00; pay 100 → "Payment successful. Change: ₱20.00", same receipt, everything locked, focus on New Transaction; Enter → SB-20261013-0002, all cleared, focus on first Add; emptying the cart clears field and message; no console errors.

Also in this commit: removed the thick green top border on the receipt panel (design check: accent border clashing with rounded corners). Visual only.

**Evaluation (draft):** Correct. Same test count, same browser behaviour; fewer ways for the screen and data to disagree.

**Modifications (draft):** None.
