# Testing — SnackStop

Two kinds of testing were done:

1. **Automated tests** on the pure functions in `js/logic.js`
   (`tests/logic.test.js`, Node's built-in test runner, 41 tests).
2. **Manual browser tests** in the Claude Code Browser pane, typing and
   clicking for real at http://localhost:8000/.

## Automated test summary

Command: `node --test` (Node v24.15.0).

```
ℹ tests 41
ℹ suites 0
ℹ pass 41
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 277.2067
```

`node --test tests/` (with a folder) does **not** work on Node 24: it fails
with `Error: Cannot find module '...\campus-snack-bar-pos\tests'`, because
newer Node treats a folder argument as a file. `node --test` finds
`tests/logic.test.js` on its own.

Every logic test was written first and seen failing before the code existed
(Steps 3, 4, 5; see [AI_LOG.md](AI_LOG.md)).

## Automated tests (from `tests/logic.test.js`)

Total in the examples = ₱55.00 (one Classic Burger) unless stated.

| Test | Description | Input | Expected | Actual | Status |
|------|-------------|-------|----------|--------|--------|
| 1 | Format zero | `formatPeso(0)` | `₱0.00` | `₱0.00` | PASS |
| 2 | Format whole pesos | `formatPeso(5500)` | `₱55.00` | `₱55.00` | PASS |
| 3 | Format with thousands separators | `formatPeso(123450)`, `formatPeso(10000000)` | `₱1,234.50`, `₱100,000.00` | same | PASS |
| 4 | Add new product | empty cart + Classic Burger | 1 line, qty 1 | 1 line, qty 1 | PASS |
| 5 | Add same product again | Burger, Burger | 1 line, qty 2 | 1 line, qty 2 | PASS |
| 6 | Add two products | Burger, Soda | 2 lines | 2 lines | PASS |
| 7 | Edge: add at qty 99 | Burger at qty 99 + Add | stays 99 | 99 | PASS |
| 8 | Cart not mutated | add to an existing cart | original unchanged | unchanged | PASS |
| 9 | Increase to limit | qty 98 → + | 99 | 99 | PASS |
| 10 | Edge: increase past limit | qty 99 → + | 99 | 99 | PASS |
| 11 | Decrease | qty 2 → − | 1 | 1 | PASS |
| 12 | Edge: decrease below 1 | qty 1 → − | 1 | 1 | PASS |
| 13 | Remove one line | Burger + Soda, remove Burger | only Soda left | only Soda left | PASS |
| 14 | Subtotal | Cheeseburger ×3 | 19500 (₱195.00) | 19500 | PASS |
| 15 | Total of empty cart | `[]` | 0 | 0 | PASS |
| 16 | Total | Burger ×2 + Soda ×1 | 13500 (₱135.00) | 13500 | PASS |
| 17 | Parse whole pesos | `"100"` | 10000 | 10000 | PASS |
| 18 | Parse one decimal | `"55.5"` | 5550 | 5550 | PASS |
| 19 | Parse two decimals exactly | `"55.05"` | 5505 | 5505 | PASS |
| 20 | Parse with spaces | `" 60 "` | 6000 | 6000 | PASS |
| 21 | Change | paid 10000, total 5500 | 4500 (₱45.00) | 4500 | PASS |
| 22 | Edge: exact payment change | paid 5500, total 5500 | 0 | 0 | PASS |
| 23 | Transaction number | 2026-10-13, seq 1 | `SB-20261013-0001` | `SB-20261013-0001` | PASS |
| 24 | Transaction number padding | 2026-10-13, seq 12 | `SB-20261013-0012` | `SB-20261013-0012` | PASS |
| 25 | Date padding | 2026-01-05, seq 3 | `SB-20260105-0003` | `SB-20260105-0003` | PASS |
| 26 | Receipt contents | Burger ×2 + Soda, paid ₱200 | items, total ₱135, paid ₱200, change ₱65 | same | PASS |
| 27 | Valid: more than total | `"100"` | ok, paid 10000 | ok, paid 10000 | PASS |
| 28 | Valid: exact total | `"55"` | ok, paid 5500 | ok, paid 5500 | PASS |
| 29 | Invalid: blank | `""` | "Please enter a valid payment amount." | same | PASS |
| 30 | Invalid: spaces only | `"   "` | "Please enter a valid payment amount." | same | PASS |
| 31 | Invalid: letters | `"abc"` | "Please enter a valid payment amount." | same | PASS |
| 32 | Invalid: digits + letter | `"12a"` | "Please enter a valid payment amount." | same | PASS |
| 33 | Invalid: negative | `"-5"` | "Please enter a valid payment amount." | same | PASS |
| 34 | Invalid: 3 decimals | `"50.123"` | "Please enter a valid payment amount." | same | PASS |
| 35 | Invalid: scientific notation | `"1e3"` | "Please enter a valid payment amount." | same | PASS |
| 36 | Invalid: over limit | `"100000.01"` | "Please enter a valid payment amount." | same | PASS |
| 37 | Insufficient | `"50"` | "Insufficient payment. Please enter at least ₱55.00." | same | PASS |
| 38 | Edge: zero is insufficient | `"0"` | "Insufficient payment. Please enter at least ₱55.00." | same | PASS |
| 39 | Edge: exactly the limit | `"100000"` | ok, paid 10000000 | ok | PASS |

(Plus the smoke test "logic module loads" and the "increase/decrease do not
change the original cart" test: 41 in total.)

## Manual browser tests

Done in Step 5 (validation) and re-checked in Steps 6–7. Cart: one Classic
Burger (total ₱55.00) unless stated.

| Test | Description | Input | Expected | Actual | Status |
|------|-------------|-------|----------|--------|--------|
| M1 | Empty cart | no items | payment disabled, "Your cart is empty." | cash field and Confirm Payment disabled, message shown | PASS |
| M2 | Blank + Enter | (nothing) | invalid message | "Please enter a valid payment amount." | PASS |
| M3 | Letters | typed `abc` | invalid message | field stays empty (browser drops letters); "Please enter a valid payment amount." | PASS |
| M4 | Negative | `-5` | invalid message | "Please enter a valid payment amount." | PASS |
| M5 | 3 decimals | `50.123` | invalid message | "Please enter a valid payment amount." | PASS |
| M6 | Scientific notation | `1e3` | invalid message | "Please enter a valid payment amount." | PASS |
| M7 | Over limit | `100000.01`, `999999` | invalid message | "Please enter a valid payment amount." | PASS |
| M8 | Insufficient | `50`, `0`, `54.99` | insufficient message | "Insufficient payment. Please enter at least ₱55.00." | PASS |
| M9 | Exact payment | `55` + Enter | success, change ₱0.00 | "Payment successful. Change: ₱0.00", receipt shown | PASS |
| M10 | Full transaction | Burger + Soda (₱80.00), pay `100` | change ₱20.00, receipt, locked | "Payment successful. Change: ₱20.00"; receipt SB-20261013-0001 with both items, Total ₱80.00, Paid ₱100.00, Change ₱20.00; all buttons and the field disabled | PASS |
| M11 | New Transaction | click after M10 | everything cleared, next number | empty cart, ₱0.00, blank field, no message, receipt hidden, header SB-20261013-0002 | PASS |
| M12 | Cart change after error (bug 3, fixed in Step 6) | pay `50` (₱55 total), then add Soda | old message cleared | message cleared; paying 50 again says "at least ₱80.00" | PASS (after fix) |
| M13 | Phone width (bug 1, fixed in Step 6) | 375px wide, cart + receipt | no sideways scrolling | page width 375px (was 524px before the fix) | PASS (after fix) |
| M14 | Keyboard | Enter in cash field; Enter on New Transaction | submits; starts next sale | both work; focus moves to New Transaction, then to the first Add button | PASS |

## Known limitation

| Input | What happens | Why it is accepted for now |
|-------|--------------|----------------------------|
| `12a` typed in the cash field | The browser's number field silently drops the `a`, so `12` is submitted (here: insufficient). With a ₱55 total, `100a` would be accepted as ₱100. | The field shows the cleaned number, so the cashier sees exactly what will be charged. Not fixed within the exam time. |
