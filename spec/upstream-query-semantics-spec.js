describe("Kotlin upstream query semantics", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-regex");
    await lumine.packages.activatePackage("language-kotlin");
    editor = await lumine.workspace.open("queries.kt");
  });

  afterEach(() => editor.destroy());

  it("classifies imports, aliases, constants, nullable types and callable references", async () => {
    editor.setText(
      "import sample.Widget as Renamed\nimport sample.convert as transform\ntypealias Optional = String?\nval MAX_SIZE = 10\nval ref = ::convert\n",
    );
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.languageMode.tree.rootNode.hasError).toBe(false);
    const scopes = (row, text) =>
      editor
        .scopeDescriptorForBufferPosition([row, editor.lineTextForBufferRow(row).indexOf(text)])
        .getScopesArray();
    expect(scopes(0, "Widget")).toContain("support.type.kotlin");
    expect(scopes(0, "Renamed")).toContain("entity.name.type.alias.kotlin");
    expect(scopes(1, "convert")).toContain("entity.name.function.kotlin");
    expect(scopes(1, "transform")).toContain("entity.name.function.kotlin");
    expect(scopes(2, "Optional")).toContain("entity.name.type.alias.kotlin");
    expect(scopes(2, "?")).toContain("punctuation.definition.nullable.kotlin");
    expect(scopes(3, "MAX_SIZE")).toContain("constant.other.kotlin");
    expect(scopes(4, "convert")).toContain("entity.name.function.kotlin");
  });

  it("injects regex syntax only in constructors and toRegex, leaving literal text and interpolation alone", async () => {
    editor.setText(
      'val regex = Regex("[a-z]+")\nval converted = "[0-9]+".toRegex()\nval literal = Regex.fromLiteral("[a-z]+")\nval value = Regex("[a-z]+${name}")\n',
    );
    expect(await editor.whenGrammarSettled()).toBe(true);
    const scopes = (row, text) =>
      editor
        .scopeDescriptorForBufferPosition([row, editor.lineTextForBufferRow(row).indexOf(text)])
        .getScopesArray();
    expect(scopes(0, "a-z")).toContain("source.regexp");
    expect(scopes(1, "0-9")).toContain("source.regexp");
    expect(scopes(2, "a-z")).not.toContain("source.regexp");
    expect(scopes(3, "name")).not.toContain("source.regexp");
  });

  it("folds an unindented function body", async () => {
    editor.setText("fun greet() {\nprintln(1)\nprintln(2)\n}\n");
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.isFoldableAtBufferRow(0)).toBe(true);
  });

  it("distinguishes KDoc from ordinary block comments", async () => {
    editor.setText("/** API documentation */\nfun greet() {}\n/* ordinary block */\n");
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.scopeDescriptorForBufferPosition([0, 5]).getScopesArray()).toContain(
      "comment.block.documentation.kotlin",
    );
    expect(editor.scopeDescriptorForBufferPosition([2, 5]).getScopesArray()).not.toContain(
      "comment.block.documentation.kotlin",
    );
  });

  it("keeps one regex content range within a call containing 6000 arguments", async () => {
    const lines = ["val expression = Regex(", '"[a-z]+",'];
    for (let index = 0; index < 6000; index++) lines.push(`argument${index},`);
    lines.push(")");
    editor.setText(lines.join("\n"));
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.languageMode.tree.rootNode.hasError).toBe(false);
    const layers = editor.languageMode
      .getAllLanguageLayers()
      .filter((layer) => layer.grammar.scopeName === "source.regexp");
    expect(layers.length).toBe(1);
    expect(editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray()).toContain(
      "source.regexp",
    );
    expect(editor.scopeDescriptorForBufferPosition([3000, 2]).getScopesArray()).not.toContain(
      "source.regexp",
    );
    const matches = (await editor.getGrammar().getQuery("injectionsQuery")).matches(
      editor.languageMode.tree.rootNode,
    );
    const contents = matches
      .flatMap((match) => match.captures)
      .filter((capture) => capture.name === "injection.content");
    expect(contents.length).toBe(1);
    expect(contents[0].node.text).toBe("[a-z]+");
  });
});
