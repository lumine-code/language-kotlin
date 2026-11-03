; Anchor the receiver and argument positions so rediscovery inside a wide call
; does not enumerate every combination of its sibling arguments. Interpolated
; Kotlin expressions are never part of the injected content.
((call_expression
   .
   (navigation_expression
     .
     (string_literal (string_content) @injection.content)
     .
     (navigation_suffix (simple_identifier) @_method)
     .)) @injection.owner
  (#eq? @_method "toRegex")
  (#set! injection.language "regex"))
((call_expression
   .
   (simple_identifier) @_constructor
   .
   (call_suffix
     (value_arguments
       .
       (value_argument
         .
         (string_literal (string_content) @injection.content))))) @injection.owner
  (#eq? @_constructor "Regex")
  (#set! injection.language "regex"))

((call_expression
   .
   (simple_identifier) @_constructor
   .
   (call_suffix
     (value_arguments
       (value_argument
         .
         (simple_identifier) @_argument
         .
         (string_literal (string_content) @injection.content))))) @injection.owner
  (#eq? @_constructor "Regex")
  (#eq? @_argument "pattern")
  (#set! injection.language "regex"))

([
  (line_comment)
  (multiline_comment)
] @injection.owner @injection.content
  (#set! injection.language "hyperlink")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
([
  (line_comment)
  (multiline_comment)
] @injection.owner @injection.content
  (#set! injection.language "todo")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
