RUSTLAB.modules['drop-order'] = {
  id: 'drop-order',
  chapter: 4,
  title: 'Drop order',
  headline: 'Why variables are freed in reverse order',
  intro: 'Rust runs a value’s drop code when its owner goes out of scope. Locals are dropped in the reverse of the order they were created. The reason is the same as everything else in this chapter: later values may borrow earlier ones.',
  play: {
    intro: 'Each Noisy prints when it is dropped. Watch the output panel.',
    code: [
      'fn main() {',
      '    let _a = Noisy("a");',
      '    let _b = Noisy("b");',
      '    {',
      '        let _c = Noisy("c");',
      '    }',
      '}'
    ],
    steps: [
      { line: 2, note: '_a is created.', out: [],
        stack: [{ id: 'a', label: '_a', fields: [['name', '"a"']], status: 'new' }], heap: [] },
      { line: 3, note: '_b is created on top of it.', out: [],
        stack: [{ id: 'a', label: '_a', fields: [['name', '"a"']] }, { id: 'b', label: '_b', fields: [['name', '"b"']], status: 'new' }], heap: [] },
      { line: 5, note: '_c is created in the inner scope.', out: [],
        stack: [{ id: 'a', label: '_a', fields: [['name', '"a"']] }, { id: 'b', label: '_b', fields: [['name', '"b"']] }, { id: 'c', label: '_c', fields: [['name', '"c"']], status: 'new' }], heap: [] },
      { line: 6, note: 'The inner brace closes, so _c is dropped first. This is the same push and pop as a stack.', out: ['drop c'],
        stack: [{ id: 'a', label: '_a', fields: [['name', '"a"']] }, { id: 'b', label: '_b', fields: [['name', '"b"']] }, { id: 'c', label: '_c', fields: [['name', '"c"']], status: 'freed' }], heap: [] },
      { line: 7, note: 'End of main: _b is dropped, then _a. Newest first.', out: ['drop c', 'drop b', 'drop a'],
        stack: [{ id: 'a', label: '_a', fields: [['name', '"a"']], status: 'freed' }, { id: 'b', label: '_b', fields: [['name', '"b"']], status: 'freed' }, { id: 'c', label: '_c', fields: [['name', '"c"']], status: 'freed' }], heap: [],
        verdict: { kind: 'ok', text: 'Output (real, from rustc 1.98): drop c, drop b, drop a' } }
    ]
  },
  breakIt: {
    label: 'drop in creation order instead',
    intro: 'Suppose b holds a reference to a and its drop code reads a. What if a were freed first?',
    code: [
      'fn main() {',
      '    let a = Owner("a");',
      '    let b = Borrower(&a);',
      '}   // drop a first, then b?'
    ],
    steps: [
      { line: 3, note: 'b keeps a reference to a.', out: [],
        stack: [{ id: 'a', label: 'a', fields: [['name', '"a"']] }, { id: 'b', label: 'b', fields: [['uses', '→ a']], status: 'new' }], heap: [] },
      { line: 4, note: 'Forward order frees a first.', out: [],
        stack: [{ id: 'a', label: 'a', fields: [['name', '"a"']], status: 'freed' }, { id: 'b', label: 'b', fields: [['uses', '→ a']] }], heap: [] },
      { line: 4, note: 'Now b’s drop code runs and reads through the reference to a.', out: ['b drop reads a ???'],
        stack: [{ id: 'a', label: 'a', fields: [['name', '"a"']], status: 'freed' }, { id: 'b', label: 'b', fields: [['uses', '→ a']], status: 'freed' }], heap: [],
        verdict: { kind: 'bug', text: 'b reads a freed value inside its own destructor.' } }
    ],
    lesson: 'Reverse order guarantees that whatever a later variable borrowed is still alive when the later variable is cleaned up.'
  },
  whyNot: {
    question: 'Why not free in creation order, in arbitrary order, or when a collector gets around to it?',
    rows: [
      ['Creation order', 'Looks natural.', 'A later value that borrows an earlier one would outlive it.'],
      ['Unspecified order (finalizers in Java)', 'Collector chooses.', 'Cannot rely on files closing or locks releasing at a known time.'],
      ['Manual cleanup (C)', 'You call close and free in the order you remember.', 'Forgotten calls leak; wrong order corrupts.'],
      ['Rust (and C++ RAII)', 'Strict reverse of declaration order.', 'Cleanup is automatic and predictable, and you can print from Drop to see it.']
    ]
  },
  error: {
    intro: 'Nothing fails here. The real run produced exactly this output.',
    text: '$ rustc --edition 2024 droporder.rs && ./droporder\ndrop c\ndrop b\ndrop a',
    decode: [
      ['impl Drop for Noisy', 'You write a drop(&mut self) method; Rust calls it. You never call it yourself.'],
      ['drop c first', 'c lived in the innermost scope, which ended first.'],
      ['drop b, then drop a', 'Same scope, so reverse of creation.']
    ]
  },
  tryIt: 'Write Noisy with a Drop impl that prints its name. Create three, then call `drop(b)` early on the middle one. What order do you predict, and what do you get? Try putting a Noisy in a struct with two Noisy fields too: struct fields are dropped in declaration order, which is the opposite rule.'
};
