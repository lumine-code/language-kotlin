const path = require("path");

// Asserts the scopes the grammar actually produces, using the fixture beside
// this file. `runGrammarTests` reads `<- scope` and `^ scope` assertions out of
// the fixture's own comments, so the fixture is the readable spec.
//
// A fixture whose assertions never run still reports green, so break one
// expected scope and confirm this fails before trusting it.

describe("Kotlin Tree-sitter grammar", () => {
  beforeEach(async () => {
    await atom.packages.activatePackage("language-kotlin");
  });

  it("tokenizes the fixture", async () => {
    await runGrammarTests(path.join(__dirname, "fixtures", "sample.kt"), /\/\//);
  });
});
