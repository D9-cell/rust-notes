RUSTLAB.modules['slice'] = {
  id: 'slice',
  chapter: 4,
  title: 'Slices',
  headline: 'Why first_word returns a slice and not a number',
  intro: 'The book first writes first_word returning an index, then replaces it with a string slice. The index version has a bug that nothing in the code can see. A slice ties the answer to the data it came from.',
  play: {
    intro: 'This is the slice version. A slice is a pointer into the middle of an existing block plus a length.',
    code: [
      'fn main() {',
      '    let mut s = String::from("hello world");',
      '    let word = first_word(&s);   // &str',
      '    s.clear();',
      '    println!("{word}");',
      '}'
    ],
    steps: [
      { line: 2, note: 's owns the text "hello world" (11 bytes).',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '11'], ['cap', '11']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: 'hello world' }] },
      { line: 3, note: 'word is a &str: a pointer to the start of the block and a length of 5. It owns nothing; it borrows from s.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '11'], ['cap', '11']] }, { id: 'word', label: 'word (&str)', fields: [['ptr', '→ h1'], ['len', '5']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: 'hello world' }] },
      { line: 4, note: 'clear() needs &mut s, which would empty the text under word. The shared borrow is still alive (used on the next line), so the compiler stops here.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '11'], ['cap', '11']] }, { id: 'word', label: 'word (&str)', fields: [['ptr', '→ h1'], ['len', '5']] }], heap: [{ id: 'h1', label: 'block 1', text: 'hello world' }],
        verdict: { kind: 'error', text: 'error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable' } }
    ]
  },
  breakIt: {
    label: 'return an index instead of a slice',
    intro: 'The chapter’s first attempt: first_word returns the position (5) where the first word ends.',
    code: [
      'fn main() {',
      '    let mut s = String::from("hello world");',
      '    let end = first_word(&s);   // usize',
      '    s.clear();',
      '    println!("{}", &s[..end]);',
      '}'
    ],
    steps: [
      { line: 3, note: 'end is just the number 5. It is a plain usize with no connection to s.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '11']] }, { id: 'end', label: 'end', fields: [['val', '5']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: 'hello world' }] },
      { line: 4, note: 'Nothing stops s.clear(). The string is now empty, but end still says 5.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '0']] }, { id: 'end', label: 'end', fields: [['val', '5']] }], heap: [{ id: 'h1', label: 'block 1', text: '(empty)' }] },
      { line: 5, note: 'Slicing an empty string up to 5 panics at runtime.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '0']] }, { id: 'end', label: 'end', fields: [['val', '5']] }], heap: [{ id: 'h1', label: 'block 1', text: '(empty)' }],
        verdict: { kind: 'bug', text: 'The number 5 silently became meaningless. Worse, if s had been refilled with other text, the code would run and return wrong data.' } }
    ],
    lesson: 'A usize cannot know what it is an index into. A &str is a borrow, so the compiler can see that clear() would invalidate it.'
  },
  whyNot: {
    question: 'Why not just return an index, or a copy of the word?',
    rows: [
      ['Return an index', 'Cheap and simple.', 'The index is detached from the string. Any later change to the string can leave it wrong with no warning.'],
      ['Return a copy (new String)', 'Safe, since it owns its own text.', 'Allocates and copies every time, even when the caller only wants to look.'],
      ['Substring view without checks (C char*)', 'Pointer plus manual length.', 'Nothing tells the program when the original is freed or edited.'],
      ['Rust', '&str: pointer plus length, tracked as a borrow of the original.', 'The original cannot be changed while the slice is alive. Zero copying.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98, with a first_word that takes &String and returns &str.',
    text: 'error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable\n --> slice.rs:7:5\n  |\n6 |     let word = first_word(&s);\n  |                           -- immutable borrow occurs here\n7 |     s.clear();\n  |     ^^^^^^^^^ mutable borrow occurs here\n8 |     println!("{word}");\n  |                ---- immutable borrow later used here',
    decode: [
      ['first_word(&s)', 'The borrow is passed into the function, and the returned &str inherits it. That connection is what the compiler tracks.'],
      ['s.clear()', 'Takes &mut self, so it needs sole access.'],
      ['immutable borrow later used here', 'word is used on line 8, so the borrow of s is still alive on line 7.']
    ]
  },
  tryIt: 'Write first_word(s: &String) -> &str by hand using s.as_bytes() and a loop looking for b\' \'. Then change the parameter to &str and call it with both a String and a string literal. Why does &str accept both?'
};
