# CLAUDE.md — IT 415 Midterm Lab Exam Project

> Standing instructions for Claude Code. Filled in for the IT 415 Midterm
> Practical Exam, Scenario 4: Campus Snack Bar POS.

## Who I am and what this is
- I'm Rafael, a BSIT student taking the IT 415 midterm: an individual,
  performance-based lab exam, 2 hours 30 minutes, face to face.
- I must build a working application from my instructor's scenario, manage
  it with Git and GitHub, document my AI usage, and explain every part of it.
- Blind submission of AI code counts against me. Everything you write must
  be something I can read, test, and explain.
- Project: **SnackStop — Campus Snack Bar POS** (Scenario 4)
- Stack chosen: **Kit B (lightweight)**. The exam says no database is
  needed and products may be hard-coded, so a plain HTML + JavaScript app
  is the simplest thing that meets every requirement, with no server to
  break during the demo.
- Time left is about 2 hours. Keep everything small and working.

## Scenario defaults
Exam requirements are in Sections IV and V of the exam PDF. These rules
implement them; don't ask about them again.

- Products (hard-coded, in this order):
  Classic Burger ₱55.00 · Cheeseburger ₱65.00 · Ham Sandwich ₱40.00 ·
  French Fries (Regular) ₱45.00 · Nachos ₱50.00 · Soda (Can) ₱25.00
- Money is handled as whole centavos (integers) and shown as ₱ with 2
  decimals and thousands separators.
- Layout: one desktop screen with clearly separate sections: Products,
  Order Summary (cart), Payment, and Receipt (shown after payment).
  Mouse and keyboard only. Pressing Enter in the payment field submits.
- Add to cart: an "Add" button on each product. Adding a product already in
  the cart increases its quantity. Show a short "Added: <name>" message.
- Quantity: + and − buttons on each cart line. Quantity is 1 to 99; −
  is disabled at 1, + is disabled at 99. A "Remove" button deletes the line.
- Subtotal = unit price × quantity. Total = sum of subtotals. Recomputed on
  every cart change.
- Empty cart: show "Your cart is empty." and disable payment.
- Payment input: a numeric field for cash.
  - Blank, non-numeric, negative, or more than 2 decimal places →
    "Please enter a valid payment amount."
  - Less than the total → "Insufficient payment. Please enter at least
    ₱<total>."
  - Equal to or more than the total → valid. Change = paid − total
    (₱0.00 if exact).
  - Upper limit ₱100,000.00 → "Please enter a valid payment amount."
- After a valid payment: show a success confirmation, then the receipt:
  store name, transaction number, date and time, items with qty, unit
  price, subtotal, total, amount paid, change.
- Transaction number: "SB-YYYYMMDD-NNNN", NNNN counting up from 0001 in
  memory for this browser session.
- While the receipt is shown, the cart and payment are locked.
- "New Transaction" clears the cart, the payment field, messages, and the
  receipt, and gets the next transaction number.
- No database, login, inventory, product editing, or deployment (out of
  scope per Section VII). Data lives in memory only.

## Kit B details for this exam
```
campus-snack-bar-pos/
  index.html
  js/
    products.js   # hard-coded product list
    logic.js      # pure functions: cart ops, totals, validatePayment,
                  # computeChange, formatPeso, nextTransactionNumber
    app.js        # DOM wiring and rendering (textContent only)
  tests/
    logic.test.js # node --test
  docs/
    PLAN.md  AI_LOG.md  TESTING.md  DOCUMENTATION.md
    evidence/     # screenshots
  README.md
  .gitignore
```
- `logic.js` has no DOM access, so it can be tested. Export with
  `module.exports` when available so Node can import it, and attach to
  `window` in the browser.
- Tests: run `node --version` first. If Node exists, use `node --test
  tests/`. If not, say so, and put a manual test table in docs/TESTING.md
  instead. Don't install anything.
- Run the app: `python -m http.server 8000` → http://127.0.0.1:8000/

## How we work (non-negotiable)
1. **Checkpoint-driven.** Do ONE step at a time. When a step is done, stop,
   summarize what changed, tell me how to verify it, and wait for me to type
   "Proceed to Step N". Never build several steps in one go.
2. **Plan before code.** For anything bigger than a small fix, outline the
   approach first so I can catch a wrong direction before code exists.
3. **Verify, don't claim.** Before saying something works, run it (tests, the
   server, a request) and show me the actual output. If you could not run
   something, say so plainly.
4. **Explain decisions briefly.** One or two sentences on *why* for each
   design choice, so I can defend it. No long essays.
5. **Stay in scope.** Build what the scenario asks. Suggest extras; don't add
   them.
6. **Never delete or weaken a test to make it pass.** Fix the code, or tell me
   the test is wrong and why.
7. **No new dependencies** beyond the kit below without asking me first.
8. **Time is short (2.5 h).** Prefer the simplest design that meets every
   requirement. Scope for about 1 h 20 min of building.

## Skills to use
- Planning: `superpowers:brainstorming` then `superpowers:writing-plans`.
  Ask all clarifying questions in ONE batch (max 5).
- Logic: `superpowers:test-driven-development`.
- Bugs: `superpowers:systematic-debugging`: root cause before the fix.
- Finishing a step: `superpowers:verification-before-completion`.
- UI: `ui-ux-pro-max` and `frontend-design`.
- Do NOT use git worktrees, branches, or subagent-driven development.

## Git and GitHub (graded)
- Work only on the `main` branch. No branches, no pull requests.
- The repository must show this development history, in this order, with
  these exact prefixes in the commit messages:
  1. `Initial project setup: ...`
  2. `Create application interface: ...`
  3. `Implement core functionality: ...` (one commit per feature is fine)
  4. `Add input validation: ...`
  5. `Fix application error: ...` (a REAL error we hit, never an invented one)
  6. `Refactor application code: ...`
  7. `Update documentation: ...`
- Commit only after the step is verified. Message = prefix + what changed,
  in plain English, e.g. `Implement core functionality: record a sale and
  deduct stock`.
- Before committing, show me `git status` so I see what's included.
- I push to GitHub myself with `git push` after each commit. Don't push
  unless I ask.
- Never commit `.db` files, virtual environments, `__pycache__`, or secrets.
  `.gitignore` must exist from the first commit.

## Stack kits

### Kit B — Lightweight (for "website" / small tool scenarios, no server)
- `index.html`, `js/logic.js` (pure functions), `js/storage.js` (localStorage
  in try/catch), `js/app.js` (DOM), Tailwind via CDN.
- Tests: `node --test` on `logic.js` if Node is installed; otherwise a manual
  test table in docs/TESTING.md.
- Run: `python -m http.server 8000` → http://127.0.0.1:8000/

## Code rules
- Validate every input on the server AND give friendly messages in the UI.
  Status codes: 400 rule broken, 404 not found, 409 duplicate, 422 invalid.
- Put user text in the page with `textContent`, never `innerHTML`.
- No hardcoded secrets, passwords, or API keys.
- Small functions, clear names, comments explain *why*.
- Responsive UI with loading, empty, and error states.
- After UI changes, check the running app in the Browser pane.

## AI log (for my documentation — graded, exam Section VIII)
After each step, append to `docs/AI_LOG.md`:
- **Step / commit:** the commit message
- **Prompt used:** the exact prompt text I gave
- **Purpose:** what I was trying to accomplish
- **AI response:** what you produced
- **Evaluation:** what was right, what was wrong or risky, how it was tested
- **Modifications:** what I changed, rejected, or asked you to redo
Leave Evaluation and Modifications as short drafts; I'll rewrite them.
