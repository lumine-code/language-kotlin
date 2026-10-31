; Only explicit delimiters change indentation; incomplete expressions do not.
["{" "[" "("] @indent
["}" "]" ")"] @dedent

; Reindent code without rewriting whitespace that belongs to multiline text.
([(string_literal) (multiline_comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))
