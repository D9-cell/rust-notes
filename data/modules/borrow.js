RUSTLAB.modules['borrow'] = {
  id: 'borrow',
  chapter: 4,
  title: 'Borrowing rules',
  headline: 'One writer or many readers, never both',
  intro: 'The rule sounds arbitrary until you see what goes wrong without it. The classic victim: a reference into a Vec while the Vec grows.',
  play: {
    intro: 'Step through. The compiler stops the program at the push, before anything runs.',
    code: [
      'fn main() {',
      '    let mut v = vec![1, 2, 3];',
      '    let first = &v[0];',
      '    v.push(4);',
      '    println!("{first}");',
      '}'
    ],
    steps: [
      { line: 2, note: 'A Vec is also a handle on the stack (pointer, length, capacity) with the items on the heap. It is full: length 3, capacity 3.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h1'], ['len', '3'], ['cap', '3']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: '1  2  3' }] },
      { line: 3, note: '&v[0] is a shared borrow: first points straight at the first element inside block 1.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h1'], ['len', '3'], ['cap', '3']] }, { id: 'first', label: 'first (&i32)', fields: [['ref', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: '1  2  3' }] },
      { line: 4, note: 'push needs &mut v. But first, a shared borrow, is still used on line 5. The compiler sees that a mutable borrow would overlap a live shared borrow and rejects the program.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h1'], ['len', '3'], ['cap', '3']] }, { id: 'first', label: 'first (&i32)', fields: [['ref', '→ h1']] }], heap: [{ id: 'h1', label: 'block 1', text: '1  2  3' }],
        verdict: { kind: 'error', text: 'error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable' } }
    ]
  },
  breakIt: {
    label: 'turn the borrow checker off',
    intro: 'Same program, but suppose push were allowed. Remember the Vec is full, so adding a fourth item forces it to move to a bigger block.',
    code: [
      'fn main() {',
      '    let mut v = vec![1, 2, 3];',
      '    let first = &v[0];',
      '    v.push(4);',
      '    println!("{first}");',
      '}'
    ],
    steps: [
      { line: 3, note: 'Same start: first points into block 1.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h1'], ['len', '3'], ['cap', '3']] }, { id: 'first', label: 'first (&i32)', fields: [['ref', '→ h1']] }], heap: [{ id: 'h1', label: 'block 1', text: '1  2  3' }] },
      { line: 4, note: 'Full, so push allocates a bigger block 2, copies the items across, and frees block 1. v is updated to point at block 2. But nobody told first.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h2'], ['len', '4'], ['cap', '6']] }, { id: 'first', label: 'first (&i32)', fields: [['ref', '→ h1']] }],
        heap: [{ id: 'h1', label: 'block 1', text: '1  2  3', status: 'freed' }, { id: 'h2', label: 'block 2', text: '1  2  3  4', status: 'new' }] },
      { line: 5, note: 'first still points at the freed block. Reading it is use-after-free.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h2'], ['len', '4'], ['cap', '6']] }, { id: 'first', label: 'first (&i32)', fields: [['ref', '→ h1']] }],
        heap: [{ id: 'h1', label: 'block 1', text: '1  2  3', status: 'freed' }, { id: 'h2', label: 'block 2', text: '1  2  3  4' }],
        verdict: { kind: 'bug', text: 'USE AFTER FREE. Prints garbage, crashes, or silently leaks data. In C++ this is called iterator invalidation.' } }
    ],
    lesson: 'That is the whole reason. While anyone holds a reference into v, nobody may change v, because changing it may move the data.'
  },
  whyNot: {
    question: 'Why not simply allow &v and &mut v together and trust the programmer?',
    rows: [
      ['Allow it, document it (C++)', 'Invalidating references is undefined behavior.', 'Bugs show up only on some inputs (when the Vec happens to be full), often in production.'],
      ['Runtime check (Java collections)', 'ConcurrentModificationException when you mutate during iteration.', 'Only some collections check, only when the code path runs, and it costs time per access.'],
      ['Hide pointers entirely (Python)', 'You index into the list; no reference to an element exists.', 'No pointer-level control, and every access goes through the runtime.'],
      ['Rust', 'Compile-time rule: many shared borrows or one mutable borrow, never overlapping in use.', 'Some correct programs get rejected and need restructuring. Zero runtime cost.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98 for the program above.',
    text: 'error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable\n --> borrow.rs:4:5\n  |\n3 |     let first = &v[0];\n  |                  - immutable borrow occurs here\n4 |     v.push(4);\n  |     ^^^^^^^^^ mutable borrow occurs here\n5 |     println!("{first}");\n  |                ----- immutable borrow later used here',
    decode: [
      ['immutable borrow occurs here', 'The &v[0] on line 3. This is the reader that must be protected.'],
      ['mutable borrow occurs here', 'push takes &mut self, so it is a writer on line 4.'],
      ['immutable borrow later used here', 'The decisive line. A borrow only lasts until its last use, so if line 5 were deleted this would compile.'],
      ['E0502', 'Run `rustc --explain E0502` for the compiler’s own long explanation.']
    ]
  },
  tryIt: 'Write the program and confirm it fails. Then make it compile in two ways: move the println! above the push, and change first to a copied value with `let first = v[0];`. Why does the second one work? (Hint: what type is v[0]?)'
};
