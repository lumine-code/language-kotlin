describe("language-kotlin editor line comments", () => {
  let editor;
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-kotlin");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.kotlin"));
  });
  afterEach(async () => {
    editor.destroy();
    await lumine.packages.deactivatePackage("language-kotlin");
  });
  it("comments source with a valid two-slash marker and round-trips it", async () => {
    editor.setText("value\n");
    editor.setCursorBufferPosition([0, 0]);
    await editor.whenGrammarSettled();
    editor.toggleLineCommentsInSelection();
    expect(editor.getText()).toBe("// value\n");
    editor.toggleLineCommentsInSelection();
    expect(editor.getText()).toBe("value\n");
  });
  it("removes an existing language line comment without leaving an operator", async () => {
    editor.setText("// value\n");
    editor.setCursorBufferPosition([0, 0]);
    await editor.whenGrammarSettled();
    editor.toggleLineCommentsInSelection();
    expect(editor.getText()).toBe("value\n");
  });
});
