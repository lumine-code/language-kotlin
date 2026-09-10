const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

describe("Kotlin highlight query locality", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-kotlin");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.kotlin"));
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor.setText(text);
    await editor.languageMode.ready;
    await editor.languageMode.atTransactionEnd();
  }

  function capturesForRows(startRow, endRow) {
    const layer = editor.languageMode.rootLanguageLayer;
    return layer.queries.highlightsQuery.captures(layer.tree.rootNode, {
      startPosition: new Point(startRow, 0),
      endPosition: new Point(endRow, 0),
    });
  }

  function scopesAt(row, text, occurrence = 0) {
    const line = editor.lineTextForBufferRow(row);
    let column = -1;
    for (let i = 0; i <= occurrence; i++) column = line.indexOf(text, column + 1);
    expect(column).not.toBe(-1);
    return editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
  }

  it("keeps Regex string classification local inside 6000 arguments", async () => {
    const query = fs.readFileSync(
      path.join(__dirname, "..", "grammars", "kotlin-highlights.scm"),
      "utf8",
    );
    expect(query).not.toMatch(
      /\(call_expression[\s\S]{0,240}\(value_arguments[\s\S]{0,160}@string\.quoted\.double\.regex\.kotlin/,
    );
    expect(query).not.toMatch(
      /\(navigation_expression[\s\S]{0,160}@string\.quoted\.double\.regex\.kotlin/,
    );
    expect(query).toContain('(#is? test.textAt "parent.lastNamedChild.firstNamedChild toRegex")');

    await setUp(`val a = "a".toRegex()
val notInvoked = "plain".toRegex
val b = Regex("b")
val c = Regex . fromLiteral("c")
val d = Regex
  .fromLiteral("d")`);
    for (const row of [0, 2, 3, 5]) {
      const column = editor.lineTextForBufferRow(row).indexOf('"') + 1;
      expect(editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray()).toContain(
        "string.quoted.double.regex.kotlin",
      );
    }
    const plainColumn = editor.lineTextForBufferRow(1).indexOf('"') + 1;
    expect(
      editor.scopeDescriptorForBufferPosition([1, plainColumn]).getScopesArray(),
    ).not.toContain("string.quoted.double.regex.kotlin");

    const lines = ["val regex = Regex(", '  "pattern",'];
    for (let i = 1; i < 6000; i++) lines.push(`  value_${i}${i === 5999 ? "" : ","}`);
    lines.push(")");
    await setUp(lines.join("\r\n"));
    expect(editor.languageMode.rootLanguageLayer.tree.rootNode.hasError).toBe(false);
    expect(capturesForRows(2998, 3004).length).toBeLessThanOrEqual(96);
  });

  it("keeps navigation and lambda captures local inside 6000-row parents", async () => {
    const query = fs.readFileSync(
      path.join(__dirname, "..", "grammars", "kotlin-highlights.scm"),
      "utf8",
    );
    expect(query).not.toMatch(/^\(_\s+\(navigation_suffix/m);
    expect(query).not.toMatch(/^\(lambda_literal\s+\(lambda_parameters/m);
    expect(query).not.toMatch(/^\(call_expression\s+\(navigation_expression/m);

    await setUp("val value = root.property.method()");
    expect(editor.scopeDescriptorForBufferPosition([0, 17]).getScopesArray()).toContain(
      "variable.other.member.kotlin",
    );
    expect(editor.scopeDescriptorForBufferPosition([0, 26]).getScopesArray()).toContain(
      "entity.name.function.kotlin",
    );

    const navigationLines = ["val value = root"];
    for (let i = 0; i < 6000; i++) navigationLines.push(`  .property${i}`);
    navigationLines.push("  .method()");
    await setUp(navigationLines.join("\r\n"));
    expect(editor.languageMode.rootLanguageLayer.tree.rootNode.hasError).toBe(false);
    expect(capturesForRows(2998, 3004).length).toBeLessThanOrEqual(96);

    const lambdaLines = ["val value = {"];
    for (let i = 0; i < 6000; i++) {
      lambdaLines.push(`  argument${i}${i === 5999 ? "" : ","}`);
    }
    lambdaLines.push("  -> argument0", "}");
    await setUp(lambdaLines.join("\r\n"));
    expect(editor.languageMode.rootLanguageLayer.tree.rootNode.hasError).toBe(false);
    expect(capturesForRows(2998, 3004).length).toBeLessThanOrEqual(96);
  });

  it("keeps paired interpolation delimiters local inside a 6000-row raw string", async () => {
    const query = fs.readFileSync(
      path.join(__dirname, "..", "grammars", "kotlin-highlights.scm"),
      "utf8",
    );
    expect(query).not.toMatch(/\(string_literal\s+"(?:\$|\$\{|\})"/);
    expect(query).toContain('(#is? test.typeAt "nextSibling interpolated_identifier")');
    expect(query).toContain('(#is? test.typeAt "nextSibling interpolated_expression }")');
    expect(query).toContain('(#is? test.typeAt "previousSibling interpolated_expression")');

    await setUp(['val a = "$name ${value}"', 'val b = "${}"', 'val c = "${one}${two}"'].join("\n"));
    expect(scopesAt(0, "$", 0)).toContain(
      "punctuation.definition.template-expression.begin.kotlin",
    );
    expect(scopesAt(0, "${")).toContain("punctuation.definition.template-expression.begin.kotlin");
    expect(scopesAt(0, "}")).toContain("punctuation.definition.template-expression.end.kotlin");
    expect(scopesAt(1, "${")).toContain("punctuation.definition.template-expression.begin.kotlin");
    expect(scopesAt(1, "}")).toContain("punctuation.definition.template-expression.end.kotlin");
    expect(scopesAt(1, "}")).not.toContain("punctuation.definition.block.end.bracket.curly.kotlin");

    const lines = ['val value = """'];
    for (let i = 0; i < 6000; i++) lines.push(`line \${value_${i}}`);
    lines.push('"""');
    await setUp(lines.join("\r\n"));
    expect(editor.languageMode.rootLanguageLayer.tree.rootNode.hasError).toBe(false);
    expect(capturesForRows(2998, 3004).length).toBeLessThanOrEqual(96);
  });
});
