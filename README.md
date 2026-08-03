# language-kotlin

Kotlin language support.

## Features

- **Grammars**: provides Tree-sitter grammars, built from [tree-sitter-kotlin](https://github.com/fwcd/tree-sitter-kotlin).
- **Syntax highlighting**: full tree-sitter grammar coverage for Kotlin files.
- **Folding**: folds blocks from the parse tree rather than by indentation.

## Installation

To install `language-kotlin` search for _language-kotlin_ in the Install pane of the Lumine settings or run `lumine --install lumine-code/language-kotlin`.

## Services

- **hyperlink.injection** (`^1.0.0`): consumed to highlight URLs inside Kotlin files as clickable links.
- **todo.injection** (`^1.0.0`): consumed to highlight `TODO`-style markers inside comments.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
