RUSTLAB.modules['lifetimes'] = {
  id: 'lifetimes',
  chapter: 10,
  title: 'Lifetime annotations',
  headline: 'The tick-a is a promise about overlap, not a timer',
  intro: 'A lifetime annotation does not make anything live longer. It tells the compiler how the lifetimes of inputs and outputs relate, so it can check callers without looking inside the function.',
  play: {
    intro: 'The bars show how many lines each variable is alive. The vertical mark is a use. Step to line 9, where tick-a becomes the overlap of both inputs.',
    code: [
      "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {",
      '    if x.len() > y.len() { x } else { y }',
      '}',
      'fn main() {',
      '    let a = String::from("long string");',
      '    let result;',
      '    {',
      '        let b = String::from("xyz");',
      '        result = longest(a.as_str(), b.as_str());',
      '    }',
      '    println!("{result}");',
      '}'
    ],
    steps: [
      { line: 1, note: "The signature says: the returned reference is valid only while BOTH x and y are valid. 'a is the overlap of the two.", stack: [], heap: [], total: 12, bars: [] },
      { line: 5, note: 'a is born and lives to the end of main.', stack: [], heap: [], total: 12, bars: [{ label: 'a', from: 5, to: 12, color: '#6b8ca3' }] },
      { line: 8, note: 'b is born in the inner scope and dies at line 10.', stack: [], heap: [], total: 12, bars: [{ label: 'a', from: 5, to: 12, color: '#6b8ca3' }, { label: 'b', from: 8, to: 10, color: '#c7795a' }] },
      { line: 9, note: "The call ties result to 'a, the overlap of a and b, which is lines 8 to 10.", stack: [], heap: [], total: 12, bars: [{ label: 'a', from: 5, to: 12, color: '#6b8ca3' }, { label: 'b', from: 8, to: 10, color: '#c7795a' }, { label: "'a (overlap)", from: 8, to: 10, color: '#8a8478' }] },
      { line: 11, note: "result is used on line 11, outside 'a. That is the contradiction the compiler reports.", stack: [], heap: [], total: 12,
        bars: [{ label: 'a', from: 5, to: 12, color: '#6b8ca3' }, { label: 'b', from: 8, to: 10, color: '#c7795a' }, { label: "'a (overlap)", from: 8, to: 10, color: '#8a8478' }, { label: 'result used', from: 11, to: 11, color: '#d08a74', use: 11, bad: true }],
        verdict: { kind: 'error', text: 'error[E0597]: `b` does not live long enough' } }
    ]
  },
  breakIt: {
    label: 'let result outlive b with no check',
    intro: 'If the compiler trusted the code, result may point into b, which is freed at line 10.',
    code: [
      'let a = String::from("long string");',
      'let result;',
      '{',
      '    let b = String::from("xyz");',
      '    result = longest(a.as_str(), b.as_str());  // picks b',
      '}',
      'println!("{result}");'
    ],
    steps: [
      { line: 4, note: 'Two owners: a and b, each with a heap block.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '11']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h2'], ['len', '3']], status: 'new' }],
        heap: [{ id: 'h1', label: 'block a', text: 'long string' }, { id: 'h2', label: 'block b', text: 'x y z' }] },
      { line: 5, note: 'Say the function returned b (if the strings were swapped in length it would). result points into block b.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '11']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h2'], ['len', '3']] }, { id: 'result', label: 'result', fields: [['ref', '→ h2']], status: 'new' }],
        heap: [{ id: 'h1', label: 'block a', text: 'long string' }, { id: 'h2', label: 'block b', text: 'x y z' }] },
      { line: 6, note: 'b goes out of scope and frees block b.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '11']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h2'], ['len', '3']], status: 'freed' }, { id: 'result', label: 'result', fields: [['ref', '→ h2']] }],
        heap: [{ id: 'h1', label: 'block a', text: 'long string' }, { id: 'h2', label: 'block b', text: 'x y z', status: 'freed' }] },
      { line: 7, note: 'println reads the freed block.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '11']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h2'], ['len', '3']], status: 'freed' }, { id: 'result', label: 'result', fields: [['ref', '→ h2']] }],
        heap: [{ id: 'h1', label: 'block a', text: 'long string' }, { id: 'h2', label: 'block b', text: 'x y z', status: 'freed' }],
        verdict: { kind: 'bug', text: 'USE AFTER FREE through a returned reference.' } }
    ],
    lesson: "The function body cannot know which input is shorter-lived. The annotation lets the caller's compiler do the check using only the signature."
  },
  whyNot: {
    question: "Why can't the compiler just figure out lifetimes by itself, and why does the function need 'a at all?",
    rows: [
      ['Infer from the body', 'The body returns x or y, depending on runtime lengths.', 'Which one is returned cannot be known at compile time, so the compiler must assume either.'],
      ['Elision rules (what you usually get)', 'One input reference: output gets its lifetime. A &self method: output gets self’s.', 'Fails as soon as there are two possible sources, like longest. Then you must say which.'],
      ['Garbage collector', 'Keeps anything alive that is referenced.', 'Runtime cost and no control over when memory is released.'],
      ['Rust', "Annotate: 'a means the output is valid while both inputs are.", 'Extra syntax, checked entirely at compile time.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98 for the program in section 1.',
    text: 'error[E0597]: `b` does not live long enough\n  --> longest.rs:9:38\n   |\n 8 |         let b = String::from("xyz");\n   |             - binding `b` declared here\n 9 |         result = longest(a.as_str(), b.as_str());\n   |                                      ^ borrowed value does not live long enough\n10 |     }\n   |     - `b` dropped here while still borrowed\n11 |     println!("{result}");\n   |                ------ borrow later used here',
    decode: [
      ['binding `b` declared here', 'Start of the shorter lifetime.'],
      ['borrowed value does not live long enough', "b is passed in where 'a requires it to outlast result."],
      ['`b` dropped here while still borrowed', 'Line 10 is the end of the overlap.'],
      ['borrow later used here', "result used on line 11, past the end of 'a."]
    ]
  },
  tryIt: "Write longest() by hand without annotations and read the missing-lifetime error. Add 'a. Then move the println! inside the inner block so the program compiles. Finally, change the signature to -> &'a str with x: &'a str and y: &str and see which body still compiles."
};
