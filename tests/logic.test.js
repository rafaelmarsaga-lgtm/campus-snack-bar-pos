const { test } = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../js/logic.js");

test("logic module loads", () => {
  assert.equal(typeof logic, "object");
});
