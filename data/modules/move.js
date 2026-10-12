RUSTLAB.modules['move'] = {
  id: 'move',
  chapter: 4,
  title: 'Move semantics',
  headline: 'Why let s2 = s1 breaks s1',
  intro: 'Assigning a String to a new variable copies only the 3-word handle. If both variables stayed valid, the heap block would be freed twice. So Rust invalidates the first one. That is a move.',
  play: {
    intro: 'Step through. The dashed, struck-through cell is a variable the compiler no longer lets you use.',
    code: [
      'fn main() {',
      '    let s1 = String::from("hello");',
      '    let s2 = s1;',
      '    println!("{s1}, world!");',
      '}'
    ],
    steps: [
      { line: 2, note: 's1 owns the block.',
        stack: [{ id: 's1', label: 's1', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }] },
      { line: 3, note: 'The handle is copied to s2 and s1 is marked moved. Still one block, now with exactly one owner: s2. Nothing was copied on the heap, so this is as cheap as copying 3 numbers.',
        stack: [{ id: 's1', label: 's1', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']], status: 'moved' }, { id: 's2', label: 's2', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }] },
      { line: 4, note: 'Using s1 now is a compile error. The compiler knows at build time that s1 was moved, so there is no check at runtime.',
        stack: [{ id: 's1', label: 's1', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']], status: 'moved' }, { id: 's2', label: 's2', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']] }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }],
        verdict: { kind: 'error', text: 'error[E0382]: borrow of moved value: `s1`' } }
    ]
  },
  breakIt: {
    label: 'keep both s1 and s2 valid',
    intro: 'Pretend the compiler allowed this. Both stay usable, and each is dropped at the closing brace.',
    code: [
      'fn main() {',
      '    let s1 = String::from("hello");',
      '    let s2 = s1;',
      '    println!("{s1}");',
      '}'
    ],
    steps: [
      { line: 2, note: 's1 owns block 1.',
        stack: [{ id: 's1', label: 's1', fields: [['ptr', '→ h1'], ['len', '5']] }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }] },
      { line: 3, note: 'Shallow copy. s1 and s2 both point at block 1.',
        stack: [{ id: 's1', label: 's1', fields: [['ptr', '→ h1'], ['len', '5']] }, { id: 's2', label: 's2', fields: [['ptr', '→ h1'], ['len', '5']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }] },
      { line: 5, note: 's2 goes out of scope first (reverse order) and frees block 1.',
        stack: [{ id: 's1', label: 's1', fields: [['ptr', '→ h1'], ['len', '5']] }, { id: 's2', label: 's2', fields: [['ptr', '→ h1'], ['len', '5']], status: 'freed' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o', status: 'freed' }] },
      { line: 5, note: 'Then s1 goes out of scope and frees it again.',
        stack: [{ id: 's1', label: 's1', fields: [['ptr', '→ h1'], ['len', '5']], status: 'freed' }, { id: 's2', label: 's2', fields: [['ptr', '→ h1'], ['len', '5']], status: 'freed' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o', status: 'freed' }],
        verdict: { kind: 'bug', text: 'DOUBLE FREE. A move prevents this by making s1 unusable, so only s2 ever frees.' } }
    ],
    lesson: 'The rule is not about being strict. It is the cheapest rule that guarantees one free per allocation.'
  },
  whyNot: {
    question: 'Rust could have copied the heap data on assignment, or left both variables valid. Why did it choose neither?',
    rows: [
      ['Shallow copy, both valid (C)', 'Copies the pointer, programmer tracks who frees.', 'Double free, use-after-free, and leaks are the programmer’s problem.'],
      ['Deep copy by default (C++ copy constructor)', 'Assignment allocates and copies the text.', 'Hidden O(n) work and allocation on every assignment or pass-by-value.'],
      ['Garbage collector (Java, Go)', 'Both variables reference one object; a collector frees it when none remain.', 'Runtime cost, pauses, extra memory, and no deterministic moment when a file or lock is released.'],
      ['Rust', 'Move: copy the handle, invalidate the source.', 'You cannot use the old name. Call .clone() if you really want two copies.']
    ]
  },
  error: {
    intro: 'This is the exact output from compiling the program above with rustc 1.98 (edition 2024).',
    text: 'error[E0382]: borrow of moved value: `s1`\n --> move.rs:4:16\n  |\n2 |     let s1 = String::from("hello");\n  |         -- move occurs because `s1` has type `String`, which does not implement the `Copy` trait\n3 |     let s2 = s1;\n  |              -- value moved here\n4 |     println!("{s1}, world!");\n  |                ^^ value borrowed here after move\n  |\nhelp: consider cloning the value if the performance cost is acceptable\n  |\n3 |     let s2 = s1.clone();\n  |                ++++++++',
    decode: [
      ['borrow of moved value: `s1`', 'println! borrows its arguments to read them. s1 no longer owns anything, so there is nothing to borrow.'],
      ['which does not implement the `Copy` trait', 'The key reason. i32 is Copy, so `let b = a;` leaves a usable. String is not, because copying it would mean a heap allocation.'],
      ['value moved here', 'Points at the exact line where ownership transferred. Read this line first: it is almost always where the real mistake is.'],
      ['value borrowed here after move', 'The later use that conflicts with the move.'],
      ['help: consider cloning', 'One valid fix: pay for a second allocation. The other fix is to stop using s1 after the move.']
    ]
  },
  tryIt: 'Write this program and read the error word for word. Then fix it three different ways: use .clone(), reorder so s1 is printed first, and change the type of s1 to i32 to see the error disappear. Write down which fix you would pick for a 1 GB String.'
};
