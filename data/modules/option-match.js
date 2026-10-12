RUSTLAB.modules['option-match'] = {
  id: 'option-match',
  chapter: 6,
  title: 'Option vs null',
  headline: 'Why a value that might be missing gets its own type',
  intro: 'In most languages any reference can secretly be null, and nothing marks which ones. Rust has no null. A maybe-missing value is an Option, a different type from the value inside it, so the compiler can force you to handle the missing case.',
  play: {
    intro: 'An Option is a small stack value: a tag saying which variant it is, and room for the payload when the tag is Some.',
    code: [
      'fn main() {',
      '    let maybe: Option<i32> = Some(7);',
      '    match maybe {',
      '        Some(n) => println!("got {n}"),',
      '        None => println!("nothing"),',
      '    }',
      '}'
    ],
    steps: [
      { line: 2, note: 'maybe holds the tag Some and the payload 7, side by side. The tag is what match will read.',
        stack: [{ id: 'maybe', label: 'maybe: Option<i32>', fields: [['tag', 'Some'], ['payload', '7']], status: 'new' }], heap: [] },
      { line: 3, note: 'match reads the tag. It has two arms, Some and None, and the compiler has already checked that no variant is missing.',
        stack: [{ id: 'maybe', label: 'maybe: Option<i32>', fields: [['tag', 'Some'], ['payload', '7']] }], heap: [] },
      { line: 4, note: 'The Some arm fires. Its pattern binds n to the payload, so you can only touch the 7 inside the branch where it exists.',
        stack: [{ id: 'maybe', label: 'maybe: Option<i32>', fields: [['tag', 'Some'], ['payload', '7']] }, { id: 'n', label: 'n', fields: [['val', '7']], status: 'new' }], heap: [],
        out: ['got 7'] },
      { line: 5, note: 'Now imagine the value had been None. The tag says None, there is no payload to read, and only this arm can run. There is no n to misuse.',
        stack: [{ id: 'maybe', label: 'maybe: Option<i32> (None run)', fields: [['tag', 'None'], ['payload', '(unused)']] }], heap: [],
        out: ['nothing'], verdict: { kind: 'ok', text: 'Both cases are handled because match is exhaustive. Delete the None arm and the program no longer compiles.' } }
    ]
  },
  breakIt: {
    label: 'use the Option as if it were the number',
    intro: 'The code you would write in a language with null: assume the value is there and add to it.',
    code: [
      'fn main() {',
      '    let x: i8 = 5;',
      '    let y: Option<i8> = Some(5);',
      '    let sum = x + y;',
      '    println!("{sum}");',
      '}'
    ],
    steps: [
      { line: 2, note: 'x is a plain i8: always a number.',
        stack: [{ id: 'x', label: 'x: i8', fields: [['val', '5']], status: 'new' }], heap: [] },
      { line: 3, note: 'y is an Option<i8>: a tag plus maybe a number. It is a different type from i8.',
        stack: [{ id: 'x', label: 'x: i8', fields: [['val', '5']] }, { id: 'y', label: 'y: Option<i8>', fields: [['tag', 'Some'], ['payload', '5']], status: 'new' }], heap: [] },
      { line: 4, note: 'There is no way to add an i8 to something that might be absent. The compiler stops before the program runs.',
        stack: [{ id: 'x', label: 'x: i8', fields: [['val', '5']] }, { id: 'y', label: 'y: Option<i8>', fields: [['tag', 'Some'], ['payload', '5']] }], heap: [],
        verdict: { kind: 'error', text: 'error[E0277]: cannot add `Option<i8>` to `i8`' } }
    ],
    lesson: 'The missing-value check is not optional. To get the 5 out you must go through match, if let, unwrap_or or similar, and each of those says what happens when it is absent.'
  },
  whyNot: {
    question: 'Why not use null like most languages?',
    rows: [
      ['C / C++ pointer', 'A null pointer means "no value".', 'Any pointer may be null and nothing in the type says so. Dereferencing it is undefined behaviour or a segfault.'],
      ['Java / C# reference', 'null is allowed for every object type.', 'NullPointerException at runtime. The most common crash in the language.'],
      ['Java Optional', 'Wraps a maybe-missing value.', 'Optional itself can be null, and nothing forces you to use it, so it is advice rather than a rule.'],
      ['Kotlin / TypeScript T?', 'A nullable type checked by the compiler.', 'Close to Rust. Rust differs by making it a real enum you match on, with no special syntax and no null at all.'],
      ['Rust', 'Option<T>: Some(value) or None.', 'You must handle None before you can use the value. Types without Option are guaranteed present.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98, trimmed to the first block (the full message continues with a list of the integer types that do implement Add).',
    text: "error[E0277]: cannot add `Option<i8>` to `i8`\n   --> src/main.rs:4:17\n    |\n  4 |     let sum = x + y;\n    |                 ^ no implementation for `i8 + Option<i8>`\n    |\n    = help: the trait `Add<Option<i8>>` is not implemented for `i8`",
    decode: [
      ['cannot add `Option<i8>` to `i8`', 'Names both types. The problem is the type mismatch, not the value 5.'],
      ['no implementation for `i8 + Option<i8>`', 'The + operator is a trait. i8 implements Add for i8, not for Option<i8>.'],
      ['the trait `Add<Option<i8>>` is not implemented for `i8`', 'The precise rule that failed. The fix is to unwrap the Option first, e.g. x + y.unwrap_or(0).']
    ]
  },
  tryIt: 'Write fn halve(n: i32) -> Option<i32> that returns None for odd numbers and Some(n / 2) for even ones. Call it with 10 and 7 and print each result with a match. Then add a third Option function that uses and_then to halve twice. What would the same function look like if you returned -1 for "no result"?'
};
