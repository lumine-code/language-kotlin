// Assertions live in the comments: `<- scope` checks the marker's own column
// on the previous non-comment line, `^ scope` checks the caret's. Scopes
// match by prefix, so the trailing `.kotlin` segment is left off.

fun greet(name: String) {
// <- storage.type.function
//       ^ punctuation.definition.arguments.begin.bracket.round
//                      ^ punctuation.definition.block.begin.bracket.curly

    println("hi")
//           ^ string

}
// <- punctuation.definition.block.end.bracket.curly

// a comment
// <- comment
