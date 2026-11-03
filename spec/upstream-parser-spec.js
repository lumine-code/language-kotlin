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

describe("Kotlin updated parser semantics", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-kotlin");
    editor = await lumine.workspace.open("updated.kt");
  });

  afterEach(() => editor?.destroy());

  async function parse(source) {
    editor.setText(source);
    expect(await editor.whenGrammarSettled()).toBe(true);
    return editor.languageMode.tree.rootNode;
  }

  it("parses context parameters and explicit backing fields with contextual keyword scopes", async () => {
    const root = await parse(
      "context(ctx: Logger)\nfun message() {}\nclass Values {\nval numbers: List<Int> field: MutableList<Int> = mutableListOf()\n}\n",
    );
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("context_receiver").length).toBe(1);
    expect(root.descendantsOfType("backing_field").length).toBe(1);
    for (const [row, word] of [
      [0, "context"],
      [3, "field"],
    ]) {
      expect(
        editor
          .scopeDescriptorForBufferPosition([row, editor.lineTextForBufferRow(row).indexOf(word)])
          .getScopesArray(),
      ).toContain("keyword.control.kotlin");
    }
  });

  it("accepts guarded else and multiple when conditions", async () => {
    const root = await parse(
      "fun choose(x: Int) = when (x) {\n1, 2 if x > 0 -> 3\nelse if x == 0 -> 4\nelse -> 5\n}\n",
    );
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("guard_condition").length).toBe(2);
  });

  it("keeps decorated next-line lambdas attached and soft-keyword calls separate", async () => {
    const root = await parse(
      "fun work() {\nitems.filter()\nlabel@ { true }\nwhere()\ncatch()\nfinally()\n}\n",
    );
    expect(root.hasError).toBe(false);
    const statements = root.descendantsOfType("statements")[0];
    expect(statements.namedChildren.length).toBe(4);
    expect(statements.namedChildren[0].text).toContain("label@");
    expect(statements.namedChildren.slice(1).map((node) => node.text)).toEqual([
      "where()",
      "catch()",
      "finally()",
    ]);
  });

  it("preserves NUL in quoted identifiers and nested comments and ends comments at bare CR", async () => {
    const source =
      "val `a\0b` = 1\n/* outer /* inner */ \0 end */\nfun work() {\n// comment\rval next = 2\n}\n";
    const root = await parse(source);
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("simple_identifier").some((node) => node.text === "`a\0b`")).toBe(
      true,
    );
    expect(root.descendantsOfType("multiline_comment")[0].text).toBe(
      "/* outer /* inner */ \0 end */",
    );
    expect(root.descendantsOfType("property_declaration").length).toBe(2);
  });

  it("retains annotations on statements and nullable callable-reference receivers", async () => {
    const root = await parse(
      'val member = String?::length\nfun work() {\n@Suppress("test")\nvalue = next()\n}\n',
    );
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("annotated_expression").length).toBe(1);
    expect(root.descendantsOfType("callable_reference")[0].text).toBe("String?::length");
  });

  it("accepts annotation, parameter, object and literal forms handled by Kotlin's parser", async () => {
    const sources = [
      "val callback: @Ann (Int) -> Unit = TODO()",
      '@file:JvmMultifileClass @file:JvmName("Sample")\npackage sample\n',
      "@Ann([]) class Sample(@param:Ann value: Int)",
      "class Sample<out out, abstract T>",
      "object Sample<T>(value: Int) {}",
      "class Sample\nprivate constructor(val value: Int) {}",
      "fun sample(value, val other: Int) {}\nval callback = fun <T>() {}",
      "fun sample() {; label@ val value: dynamic.Type = TODO() }",
      "class Sample { val value: Int; get() = 1 }",
      "val hexadecimal = 0x\nval binary = 0b2\nval decimal = 1_\nval long = 1l",
    ];
    for (const source of sources) {
      const root = await parse(source);
      expect(root.hasError).withContext(source).toBe(false);
    }
  });

  it("keeps a dollar prefix above 255 exact instead of interpolating a shorter run", async () => {
    const source = "val text = " + "$".repeat(256) + '"' + "$".repeat(255) + '{value}"';
    const root = await parse(source);
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("interpolation_expression_start").length).toBe(0);
  });

  it("recovers from excessive nested string templates without terminating the parser", async () => {
    const root = await parse("val value = " + '"${'.repeat(513) + "0" + '}"'.repeat(513));
    expect(root.hasError).toBe(true);
    expect((await parse("val recovered = 1")).hasError).toBe(false);
  });
});
