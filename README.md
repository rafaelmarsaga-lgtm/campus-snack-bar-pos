# SnackStop — Campus Snack Bar POS

IT 415 Midterm Practical Exam, Scenario 4. A desktop point-of-sale web app:
browse products → add to cart → review order → pay cash → receipt → new transaction.

Plain HTML + JavaScript (no server code, no database, no dependencies).

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

Node finds `tests/*.test.js` automatically. (On Node 22+, `node --test tests/`
fails because a folder argument is treated as a file name.)

## Project plan

See [docs/PLAN.md](docs/PLAN.md).
