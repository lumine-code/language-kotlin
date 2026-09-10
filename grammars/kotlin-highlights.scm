;; Based on the nvim-treesitter highlighting, which is under the Apache license.
;; See https://github.com/nvim-treesitter/nvim-treesitter/blob/f8ab59861eed4a1c168505e3433462ed800f2bae/queries/kotlin/highlights.scm
;;
;; The only difference in this file is that queries using #lua-match?
;; have been removed.

;;; Identifiers

(simple_identifier) @variable.other.kotlin

; `it` keyword inside lambdas
; FIXME: This will highlight the keyword outside of lambdas since tree-sitter
;        does not allow us to check for arbitrary nestation
((simple_identifier) @variable.language.kotlin
(#eq? @variable.language.kotlin "it"))

; `field` keyword inside property getter/setter
; FIXME: This will highlight the keyword outside of getters and setters
;        since tree-sitter does not allow us to check for arbitrary nestation
((simple_identifier) @variable.language.kotlin
(#eq? @variable.language.kotlin "field"))

; `this` this keyword inside classes
(this_expression) @variable.language.kotlin

; `super` keyword inside classes
(super_expression) @variable.language.kotlin

(class_parameter
	(simple_identifier) @variable.other.member.kotlin)

((simple_identifier) @variable.other.member.kotlin
	(#is? test.typeAt "parent variable_declaration")
	(#is? test.typeAt "parent.parent property_declaration")
	(#is? test.typeAt "parent.parent.parent class_body"))

; id_1.id_2.id_3: `id_2` and `id_3` are assumed as object properties
(navigation_suffix
	(simple_identifier) @variable.other.member.kotlin)

(enum_entry
	(simple_identifier) @constant.other.kotlin)

(type_identifier) @support.type.kotlin

((type_identifier) @support.type.builtin.kotlin
	(#any-of? @support.type.builtin.kotlin
		"Byte"
		"Short"
		"Int"
		"Long"
		"UByte"
		"UShort"
		"UInt"
		"ULong"
		"Float"
		"Double"
		"Boolean"
		"Char"
		"String"
		"Array"
		"ByteArray"
		"ShortArray"
		"IntArray"
		"LongArray"
		"UByteArray"
		"UShortArray"
		"UIntArray"
		"ULongArray"
		"FloatArray"
		"DoubleArray"
		"BooleanArray"
		"CharArray"
		"Map"
		"Set"
		"List"
		"EmptyMap"
		"EmptySet"
		"EmptyList"
		"MutableMap"
		"MutableSet"
		"MutableList"
))

(package_header
	. (identifier)) @entity.name.namespace.kotlin

(import_header
	"import" @keyword.control.import.kotlin)

; TODO: Seperate labeled returns/breaks/continue/super/this
;       Must be implemented in the parser first
(label) @entity.name.label.kotlin

;;; Function definitions

(function_declaration
	. (simple_identifier) @entity.name.function.kotlin)

(getter
	("get") @support.function.builtin.kotlin)
(setter
	("set") @support.function.builtin.kotlin)

(primary_constructor) @entity.name.function.constructor.kotlin
(secondary_constructor
	("constructor") @entity.name.function.constructor.kotlin)

(constructor_invocation
	(user_type
		(type_identifier) @entity.name.function.constructor.kotlin))

(anonymous_initializer
	("init") @entity.name.function.constructor.kotlin)

(parameter
	(simple_identifier) @variable.parameter.kotlin)

(parameter_with_optional_type
	(simple_identifier) @variable.parameter.kotlin)

; lambda parameters
((variable_declaration
	(simple_identifier) @variable.parameter.kotlin)
	(#is? test.typeAt "parent.parent lambda_parameters")
	(#is? test.typeAt "parent.parent.parent lambda_literal"))

;;; Function calls

; function()
(call_expression
	. (simple_identifier) @entity.name.function.kotlin)

; object.function() or object.property.function()
((navigation_suffix
	(simple_identifier) @entity.name.function.kotlin)
	(#is? test.typeAt "parent.parent navigation_expression")
	(#is? test.typeAt "parent.parent.parent call_expression")
	(#is-not? test.typeAt "parent.nextNamedSibling navigation_suffix"))

(call_expression
	. (simple_identifier) @support.function.builtin.kotlin
    (#any-of? @support.function.builtin.kotlin
		"arrayOf"
		"arrayOfNulls"
		"byteArrayOf"
		"shortArrayOf"
		"intArrayOf"
		"longArrayOf"
		"ubyteArrayOf"
		"ushortArrayOf"
		"uintArrayOf"
		"ulongArrayOf"
		"floatArrayOf"
		"doubleArrayOf"
		"booleanArrayOf"
		"charArrayOf"
		"emptyArray"
		"mapOf"
		"setOf"
		"listOf"
		"emptyMap"
		"emptySet"
		"emptyList"
		"mutableMapOf"
		"mutableSetOf"
		"mutableListOf"
		"print"
		"println"
		"error"
		"TODO"
		"run"
		"runCatching"
		"repeat"
		"lazy"
		"lazyOf"
		"enumValues"
		"enumValueOf"
		"assert"
		"check"
		"checkNotNull"
		"require"
		"requireNotNull"
		"with"
		"suspend"
		"synchronized"
))

;;; Literals

((line_comment) @comment.line.kotlin
	(#set! adjust.endBeforeFirstMatchOf "\\r?$"))

[
	(multiline_comment)
	(shebang_line)
] @comment.line.kotlin

(real_literal) @constant.numeric.float.kotlin
[
	(integer_literal)
	(long_literal)
	(hex_literal)
	(bin_literal)
	(unsigned_literal)
] @constant.numeric.kotlin

[
	"null" ; should be highlighted the same as booleans
	(boolean_literal)
] @constant.language.boolean.kotlin

(character_literal) @string.quoted.single.kotlin

(string_literal) @string.quoted.double.kotlin

(character_escape_seq) @constant.character.escape.kotlin

; There are 3 ways to define a regex
;    - "[abc]?".toRegex()
((string_literal) @string.quoted.double.regex.kotlin
	(#is? test.typeAt "parent navigation_expression")
	(#is? test.typeAt "parent.parent call_expression")
	(#is? test.textAt "parent.lastNamedChild.firstNamedChild toRegex"))

;    - Regex("[abc]?")
((string_literal) @string.quoted.double.regex.kotlin
	(#is? test.typeAt "parent value_argument")
	(#is? test.typeAt "parent.parent value_arguments")
	(#is? test.typeAt "parent.parent.parent call_suffix")
	(#is? test.textAt "parent.parent.parent.parent.firstNamedChild Regex"))

;   - Regex.fromLiteral("[abc]?")
((string_literal) @string.quoted.double.regex.kotlin
	(#is? test.typeAt "parent value_argument")
	(#is? test.typeAt "parent.parent value_arguments")
	(#is? test.typeAt "parent.parent.parent call_suffix")
	(#is? test.typeAt "parent.parent.parent.parent.firstNamedChild navigation_expression")
	(#is? test.textAt "parent.parent.parent.parent.firstNamedChild.firstNamedChild Regex")
	(#is? test.textAt "parent.parent.parent.parent.firstNamedChild.lastNamedChild.firstNamedChild fromLiteral"))

;;; Keywords

(type_alias "typealias" @keyword.control.kotlin)
[
	(class_modifier)
	(member_modifier)
	(function_modifier)
	(property_modifier)
	(platform_modifier)
	(variance_modifier)
	(parameter_modifier)
	(visibility_modifier)
	(reification_modifier)
	(inheritance_modifier)
]@keyword.control.kotlin

[
	"val"
	"var"
	"enum"
	"class"
	"object"
	"interface"
;	"typeof" ; NOTE: It is reserved for future use
] @keyword.control.kotlin

("fun") @storage.type.function.kotlin

(jump_expression) @keyword.control.return.kotlin

[
	"if"
	"else"
	"when"
] @keyword.control.conditional.kotlin

[
	"for"
	"do"
	"while"
] @keyword.control.loop.kotlin

[
	"try"
	"catch"
	"throw"
	"finally"
] @keyword.control.exception.kotlin

(annotation
	"@" @entity.other.attribute-name.kotlin (use_site_target)? @entity.other.attribute-name.kotlin)
(annotation
	(user_type
		(type_identifier) @entity.other.attribute-name.kotlin))
(annotation
	(constructor_invocation
		(user_type
			(type_identifier) @entity.other.attribute-name.kotlin)))

(file_annotation
	"@" @entity.other.attribute-name.kotlin "file" @entity.other.attribute-name.kotlin ":" @entity.other.attribute-name.kotlin)
(file_annotation
	(user_type
		(type_identifier) @entity.other.attribute-name.kotlin))
(file_annotation
	(constructor_invocation
		(user_type
			(type_identifier) @entity.other.attribute-name.kotlin)))

;;; Operators & Punctuation

[
	"!"
	"!="
	"!=="
	"="
	"=="
	"==="
	">"
	">="
	"<"
	"<="
	"||"
	"&&"
	"+"
	"++"
	"+="
	"-"
	"--"
	"-="
	"*"
	"*="
	"/"
	"/="
	"%"
	"%="
	"?."
	"?:"
	"!!"
	"is"
	"!is"
	"in"
	"!in"
	"as"
	"as?"
	".."
	"->"
] @keyword.operator.kotlin

; `$name` and `${expr}` splice into a string literal. Keep these patterns
; rooted on the delimiter tokens so a long raw string remains viewport-local.
("$" @punctuation.definition.template-expression.begin.kotlin
	(#is? test.childOfType string_literal)
	(#is? test.typeAt "nextSibling interpolated_identifier"))
("${" @punctuation.definition.template-expression.begin.kotlin
	(#is? test.childOfType string_literal)
	(#is? test.typeAt "nextSibling interpolated_expression }"))
("}" @punctuation.definition.template-expression.end.kotlin
	(#is? test.childOfType string_literal)
	(#is? test.typeAt "previousSibling interpolated_expression"))

"(" @punctuation.definition.arguments.begin.bracket.round.kotlin
")" @punctuation.definition.arguments.end.bracket.round.kotlin
"[" @punctuation.definition.index.begin.bracket.square.kotlin
"]" @punctuation.definition.index.end.bracket.square.kotlin
"{" @punctuation.definition.block.begin.bracket.curly.kotlin
("}" @punctuation.definition.block.end.bracket.curly.kotlin
	(#is-not? test.childOfType string_literal))

"." @punctuation.separator.property.kotlin
"," @punctuation.separator.comma.kotlin
";" @punctuation.terminator.statement.kotlin
":" @punctuation.separator.type.kotlin
"::" @punctuation.separator.reference.kotlin
