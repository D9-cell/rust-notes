RUSTLAB.modules['question-mark'] = {
  id: 'question-mark',
  chapter: 9,
  title: 'Result and the ? operator',
  headline: 'What the question mark expands to',
  intro: 'The ? operator looks like magic. It is a match with two arms: on Ok it hands you the value and the function continues, on Err it returns early from the whole function. Seeing both paths through the same code removes the mystery.',
  play: {
    intro: 'The happy path: the file exists and holds a number.',
    code: [
      'fn read_port(path: &str) -> Result<u16, ConfigError> {',
      '    let text = fs::read_to_string(path)?;',
      '    let port = text.trim().parse::<u16>()?;',
      '    Ok(port)',
      '}'
    ],
    steps: [
      { line: 1, note: 'The signature says this function can fail, and with what. Callers must deal with a Result; they cannot forget.',
        stack: [{ id: 'path', label: 'path', fields: [['val', '"port.txt"']], status: 'new' }], heap: [] },
      { line: 2, note: 'read_to_string returns Result<String, io::Error>. It is Ok, so ? unwraps it and text gets the contents.',
        stack: [{ id: 'path', label: 'path', fields: [['val', '"port.txt"']] }, { id: 'text', label: 'text', fields: [['ptr', '→ h1'], ['len', '5']], status: 'new' }], heap: [{ id: 'h1', label: 'file contents', text: '8080\\n' }] },
      { line: 3, note: 'parse returns Result<u16, ParseIntError>. "8080" is valid, so ? unwraps it and port is 8080.',
        stack: [{ id: 'path', label: 'path', fields: [['val', '"port.txt"']] }, { id: 'text', label: 'text', fields: [['ptr', '→ h1'], ['len', '5']] }, { id: 'port', label: 'port', fields: [['val', '8080']], status: 'new' }], heap: [{ id: 'h1', label: 'file contents', text: '8080\\n' }] },
      { line: 4, note: 'Wrap the answer back up as Ok so the caller sees a Result.',
        stack: [{ id: 'ret', label: 'return value', fields: [['tag', 'Ok'], ['payload', '8080']], status: 'new' }], heap: [],
        verdict: { kind: 'ok', text: 'Result<u16, ConfigError> = Ok(8080)' } }
    ]
  },
  breakIt: {
    label: 'the file is missing',
    intro: 'Same function, but read_to_string fails on the first ? and the function leaves immediately.',
    code: [
      'fn read_port(path: &str) -> Result<u16, ConfigError> {',
      '    let text = fs::read_to_string(path)?;',
      '    let port = text.trim().parse::<u16>()?;',
      '    Ok(port)',
      '}'
    ],
    steps: [
      { line: 2, note: 'read_to_string returns Err(NotFound). This is the Err arm of the hidden match.',
        stack: [{ id: 'path', label: 'path', fields: [['val', '"no-such-file"']] }, { id: 'res', label: 'read_to_string result', fields: [['tag', 'Err'], ['payload', 'NotFound']], status: 'new' }], heap: [] },
      { line: 2, note: '? now returns from read_port at once, converting the io::Error into a ConfigError with From. Lines 3 and 4 never run, so parse is never called on garbage.',
        stack: [{ id: 'ret', label: 'return value', fields: [['tag', 'Err'], ['payload', 'Io(NotFound)']], status: 'new' }], heap: [],
        verdict: { kind: 'bug', text: 'Result<u16, ConfigError> = Err(Io(NotFound)). The caller decides what to do: print, retry, or give up.' } }
    ],
    lesson: 'Every ? is a possible exit, but it costs one character and is visible on the page. Java hides the same exits in exceptions; C hides them in ignored return codes.'
  },
  whyNot: {
    question: 'Why not exceptions or error codes?',
    rows: [
      ['C: return -1 / errno', 'Cheap and simple.', 'Easy to ignore the return value. Nothing forces a check.'],
      ['Java / Python exceptions', 'Errors jump up the stack automatically.', 'Any call may throw, and the signature often does not say so (unchecked). The exit paths are invisible.'],
      ['Go: if err != nil { return err }', 'Explicit and visible.', 'Three lines of boilerplate per call, and the compiler does not insist you check.'],
      ['Rust', 'Result in the signature, ? to propagate in one character.', 'The error type must be convertible (From). The compiler warns if you ignore a Result.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98 for using ? in a main that returns ().',
    text: "error[E0277]: the `?` operator can only be used in a function that returns `Result` or `Option` (or another type that implements `FromResidual`)\n --> src/main.rs:4:46\n  |\n3 | fn main() {\n  | --------- this function should return `Result` or `Option` to accept `?`\n4 |     let text = fs::read_to_string(\"port.txt\")?;\n  |                                              ^ cannot use the `?` operator in a function that returns `()`\n  |\nhelp: consider adding return type\n  |\n3 ~ fn main() -> Result<(), Box<dyn std::error::Error>> {\n4 |     let text = fs::read_to_string(\"port.txt\")?;\n5 |     println!(\"{text}\");\n6 +     Ok(())\n  |",
    decode: [
      ['the `?` operator can only be used in a function that returns `Result` or `Option`', 'Because ? expands to an early return of an Err, the function must have a type to return it in.'],
      ['this function should return `Result` or `Option` to accept `?`', 'The compiler points at main\'s signature as the thing to change.'],
      ['consider adding return type', 'The suggested fix: main() -> Result<(), Box<dyn Error>> and Ok(()) at the end.']
    ]
  },
  tryIt: 'Write fn double_port(path: &str) -> Result<u32, Box<dyn std::error::Error>> that reads a file, parses it as u32 and returns twice the number, using ? twice. Call it from a main that returns Result<(), Box<dyn Error>>. Try a missing file and a file containing "abc" and compare the two error messages.'
};
