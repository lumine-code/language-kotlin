describe("Kotlin multi-dollar interpolation", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-kotlin");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.kotlin"));
  });

  afterEach(() => editor?.destroy());

  it("parses and scopes the interpolation delimiters without marking single dollars", async () => {
    editor.setText('val name = "Ada"\nval value = $$"$literal $$name $${name}"\n');
    await editor.languageMode.ready;
    const root = editor.languageMode.tree.rootNode;
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("interpolation_identifier_start")[0].text).toBe("$$");
    expect(root.descendantsOfType("interpolation_expression_start")[0].text).toBe("$${");
    for (const needle of ["$$name", "$${name}"]) {
      const index = editor.getText().indexOf(needle);
      const point = editor.getBuffer().positionForCharacterIndex(index);
      expect(editor.scopeDescriptorForBufferPosition(point).getScopesArray()).toContain(
        "punctuation.definition.template-expression.begin.kotlin",
      );
    }
    expect(editor.scopeDescriptorForBufferPosition([1, 15]).getScopesArray()).not.toContain(
      "punctuation.definition.template-expression.begin.kotlin",
    );
  });
});
