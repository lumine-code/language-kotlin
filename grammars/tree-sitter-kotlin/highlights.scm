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

(class_body
	(property_declaration
		(variable_declaration
			(simple_identifier) @variable.other.member.kotlin)))

; id_1.id_2.id_3: `id_2` and `id_3` are assumed as object properties
(_
	(navigation_suffix
		(simple_identifier) @variable.other.member.kotlin))

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
(lambda_literal
	(lambda_parameters
		(variable_declaration
			(simple_identifier) @variable.parameter.kotlin)))

;;; Function calls

; function()
(call_expression
	. (simple_identifier) @entity.name.function.kotlin)

; object.function() or object.property.function()
(call_expression
	(navigation_expression
		(navigation_suffix
			(simple_identifier) @entity.name.function.kotlin) . ))

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

[
	(line_comment)
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
(call_expression
	(navigation_expression
		((string_literal) @string.quoted.double.regex.kotlin)
		(navigation_suffix
			((simple_identifier) @_IGNORE_.function
			(#eq? @_IGNORE_.function "toRegex")))))

;    - Regex("[abc]?")
(call_expression
	((simple_identifier) @_IGNORE_.function
	(#eq? @_IGNORE_.function "Regex"))
	(call_suffix
		(value_arguments
			(value_argument
				(string_literal) @string.quoted.double.regex.kotlin))))

;   - Regex.fromLiteral("[abc]?")
(call_expression
	(navigation_expression
		((simple_identifier) @_IGNORE_.class
		(#eq? @_IGNORE_.class "Regex"))
		(navigation_suffix
			((simple_identifier) @_IGNORE_.function
			(#eq? @_IGNORE_.function "fromLiteral"))))
	(call_suffix
		(value_arguments
			(value_argument
				(string_literal) @string.quoted.double.regex.kotlin))))

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

"(" @punctuation.definition.arguments.begin.bracket.round.kotlin
")" @punctuation.definition.arguments.end.bracket.round.kotlin
"[" @punctuation.definition.index.begin.bracket.square.kotlin
"]" @punctuation.definition.index.end.bracket.square.kotlin
"{" @punctuation.definition.block.begin.bracket.curly.kotlin
"}" @punctuation.definition.block.end.bracket.curly.kotlin

"." @punctuation.separator.property.kotlin
"," @punctuation.separator.comma.kotlin
";" @punctuation.terminator.statement.kotlin
":" @punctuation.separator.type.kotlin
"::" @punctuation.separator.reference.kotlin

; NOTE: `interpolated_identifier`s can be highlighted in any way
; `$name` and `${expr}` splice into a string literal.
(string_literal
	"$" @punctuation.definition.template-expression.begin.kotlin)
(string_literal
	"${" @punctuation.definition.template-expression.begin.kotlin
	"}" @punctuation.definition.template-expression.end.kotlin)
