(class_declaration "class" (type_identifier) @name
  (#is-not? test.typeAt "parent.lastNamedChild enum_class_body")) @definition.class
(class_declaration "interface" (type_identifier) @name) @definition.interface
(class_declaration (type_identifier) @name (enum_class_body)) @definition.enum
(object_declaration (type_identifier) @name) @definition.class
(function_declaration (simple_identifier) @name) @definition.function
(property_declaration (variable_declaration (simple_identifier) @name)) @definition.property
(property_declaration (multi_variable_declaration (variable_declaration (simple_identifier) @name @definition.variable)))
(type_alias . (type_identifier) @name) @definition.type
(enum_entry . (simple_identifier) @name) @definition.constant
