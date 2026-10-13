// SnackStop pure logic: no DOM access here, so Node can test every function.
// Functions are added step by step (see docs/PLAN.md section 3).

const SnackLogic = {};

// Node (tests) uses module.exports; the browser reads window.SnackLogic.
if (typeof module !== "undefined" && module.exports) {
  module.exports = SnackLogic;
} else {
  window.SnackLogic = SnackLogic;
}
