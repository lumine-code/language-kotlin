describe("kotlin conservative indentation", () => {
  let editor;
  beforeEach(async () => {
    editor = null;
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-kotlin");
  });
  afterEach(() => editor?.destroy());
  async function start(file, text) {
    if (!editor || !editor.getPath()?.endsWith(file)) {
      editor?.destroy();
      editor = await lumine.workspace.open(file);
    }
    editor.update({ autoIndent: true, tabLength: 2, softTabs: true });
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
  }
  describe("kt", () => {
    it("indents Enter inside a block", async () => {
      await start("indentation.kt", "fun main() {\n}");
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.lineTextForBufferRow(1)).toBe("  ");
    });
    it("dedents a typed closing brace", async () => {
      await start("indentation.kt", "fun main() {\n  run()\n  ");
      editor.setCursorBufferPosition([2, Infinity]);
      await editor.insertText("}", { autoIndent: true, autoDecreaseIndent: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(2)).toBe("}");
    });
    it("reindents a body and its closing delimiter once", async () => {
      await start("indentation.kt", "fun main() {\nrun()\n}");
      await editor.autoIndentBufferRows(0, 2);
      expect(editor.getText()).toBe("fun main() {\n  run()\n}");
    });
    it("does not add indent after a complete one-line block or delimiters in a comment", async () => {
      for (const text of ["fun main() { run() }", "// { [ ("]) {
        await start("indentation.kt", text);
        editor.moveToEndOfLine();
        await editor.insertNewline();
        expect(editor.lineTextForBufferRow(1)).toBe("");
      }
    });
    it("preserves multiline literal whitespace during reindent", async () => {
      const source = 'val value = """first\n      { [ (\n  last"""';
      await start("indentation.kt", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
    it("preserves multiline comment interiors during reindent", async () => {
      const source = "/* first\n      { [ (\n  last */";
      await start("indentation.kt", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
  });

  it("does not infer indentation from an unfinished declaration", async () => {
    await start("declaration.kt", "fun value() =");
    editor.setCursorBufferPosition([0, Infinity]);
    await editor.insertNewline();
    expect(editor.lineTextForBufferRow(1)).toBe("");
  });

  it("keeps quoted recovery punctuation from indenting the next row", async () => {
    for (const source of [
      'val value = "{',
      'val value = "(',
      'val value = "[',
      'val value = """{',
      'val value = """has" {',
      'val value = "a\\"{',
    ]) {
      await start("recovery.kt", source);
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.lineTextForBufferRow(1)).withContext(source).toBe("");
    }
  });

  it("retains the current margin while entering recovered literal text", async () => {
    await start("recovery.kt", 'fun main() {\n  val value = "{');
    editor.setCursorBufferPosition([1, Infinity]);
    await editor.insertNewline();
    expect(editor.lineTextForBufferRow(2)).toBe("  ");
  });

  it("retains indentation for real incomplete containers and interpolation", async () => {
    for (const source of [
      'val value = "${listOf(',
      "fun main() {",
      "val value = listOf(",
      'listOf("done", listOf(',
    ]) {
      await start("recovery.kt", source);
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.indentationForBufferRow(1)).withContext(source).toBe(1);
    }
  });

  it("preserves authored whitespace in recovered multiline literal content", async () => {
    const source = 'val value = """{\n      payload';
    await start("recovery.kt", source);
    await editor.autoIndentBufferRows(1, 1);
    expect(editor.getText()).toBe(source);
  });

  it("reindents a real body after a complete triple-quoted literal", async () => {
    await start("complete.kt", 'val value = """done""" + run {\nwork()\n}');
    await editor.autoIndentBufferRows(1, 2);
    expect(editor.getText()).toBe('val value = """done""" + run {\n  work()\n}');
  });
});
