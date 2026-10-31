; The string scanner can omit its opener in ERROR recovery. Only an unmatched
; quote on one recovery row claims its margin; real interpolation stays code.
(["{" "[" "("] @match.next
  (#is? test.childOfType ERROR)
  (#is? test.matchAt "parent (?:^|\\n)[^\"\n]*\"(?:\"\")?(?:[^\"\\\\\n]|\\\\.)*(?:\\r?\\n[ \\t]*)?$|(?:^|\\n)[^\"\n]*\"\"\"(?:(?!\"\"\")[^\n])*(?:\\r?\\n[ \\t]*)?$")
  (#is-not? test.matchAt "parent \\$\\{")
  (#set! indent.match startPosition))

; Recovery can attach literal payload to the declaration after its opener.
((property_declaration (ERROR) @_recovered) @preserve
  (#match? @_recovered "^\"\"\"")
  (#not-match? @_recovered "^\"\"\"[\\s\\S]*\"\"\"")
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

; Only explicit delimiters change indentation; incomplete expressions do not.
["{" "[" "("] @indent
["}" "]" ")"] @dedent

; Reindent code without rewriting whitespace that belongs to multiline text.
([(string_literal) (multiline_comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))
