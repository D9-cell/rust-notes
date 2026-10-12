RUSTLAB.modules['vec-growth'] = {
  id: 'vec-growth',
  chapter: 8,
  title: 'Vec growth',
  headline: 'Why you cannot hold a reference into a Vec while you push',
  intro: 'A Vec keeps its items in one block on the heap. When the block is full, push allocates a bigger block, copies everything over and frees the old one. Anything that still points at the old block is left pointing at freed memory.',
  play: {
    intro: 'Only push, no outstanding reference. Watch the capacity and where the data lives.',
    code: [
      'fn main() {',
      '    let mut v = vec![1, 2, 3, 4];',
      '    v.push(5);',
      '    v.push(6);',
      '    println!("{v:?}");',
      '}'
    ],
    steps: [
      { line: 2, note: 'v is a three-word header on the stack: pointer, length, capacity. Four items fill the block exactly.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h1'], ['len', '4'], ['cap', '4']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1 (4 slots)', text: '1 2 3 4' }] },
      { line: 3, note: 'len equals cap, so there is no room. push asks for a new block twice as big, copies the four items, writes 5, and frees the old block.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h2'], ['len', '5'], ['cap', '8']] }], heap: [{ id: 'h1', label: 'block 1', text: '1 2 3 4', status: 'freed' }, { id: 'h2', label: 'block 2 (8 slots)', text: '1 2 3 4 5 _ _ _', status: 'new' }] },
      { line: 4, note: 'There is spare capacity now, so push just writes into the next slot. No allocation, no copy.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h2'], ['len', '6'], ['cap', '8']] }], heap: [{ id: 'h2', label: 'block 2 (8 slots)', text: '1 2 3 4 5 6 _ _' }],
        verdict: { kind: 'ok', text: 'Doubling the capacity means each item is copied only a few times on average, so push is cheap in the long run.' } }
    ]
  },
  breakIt: {
    label: 'hold a reference to the first element across a push',
    intro: 'The same program with one extra line: a reference into the block, kept alive past the push.',
    code: [
      'fn main() {',
      '    let mut v = vec![1, 2, 3, 4];',
      '    let first = &v[0];',
      '    v.push(5);',
      '    println!("{first}");',
      '}'
    ],
    steps: [
      { line: 3, note: 'first points at slot 0 of block 1.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h1'], ['len', '4'], ['cap', '4']] }, { id: 'first', label: 'first (&i32)', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: '1 2 3 4' }] },
      { line: 4, note: 'If this were allowed: push reallocates, block 1 is freed, and first still points at it.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h2'], ['len', '5'], ['cap', '8']] }, { id: 'first', label: 'first (&i32)', fields: [['ptr', '→ h1']] }], heap: [{ id: 'h1', label: 'block 1', text: '1 2 3 4', status: 'freed' }, { id: 'h2', label: 'block 2', text: '1 2 3 4 5 _ _ _' }] },
      { line: 5, note: 'Reading first now would read freed memory. In C++ this is iterator invalidation. In Rust the compiler rejects line 4 because first is still used on line 5.',
        stack: [{ id: 'v', label: 'v', fields: [['ptr', '→ h2'], ['len', '5'], ['cap', '8']] }, { id: 'first', label: 'first (&i32)', fields: [['ptr', '→ h1']] }], heap: [{ id: 'h1', label: 'block 1', text: '1 2 3 4', status: 'freed' }, { id: 'h2', label: 'block 2', text: '1 2 3 4 5 _ _ _' }],
        verdict: { kind: 'error', text: 'error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable' } }
    ],
    lesson: 'It does not matter that this particular Vec might have had spare room. The compiler cannot know that, so the rule is: no push while any reference into the Vec is alive.'
  },
  whyNot: {
    question: 'Why not just let the program run and handle the reallocation?',
    rows: [
      ['C++ std::vector', 'push_back may reallocate. Old iterators and pointers become invalid.', 'Silent undefined behaviour. A classic source of crashes that only appear when the vector is exactly full.'],
      ['Java ArrayList', 'References are to objects, not to slots, so reallocation is invisible.', 'Every element is a separate heap object (for non-primitives), costing memory and cache misses.'],
      ['Never reallocate (fixed array)', 'References stay valid.', 'You must know the maximum size up front.'],
      ['Rust', 'Vec reallocates, and the borrow checker proves no reference into it is alive during a push.', 'You restructure code (take the index, not a reference) or clone what you need. No runtime cost.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98.',
    text: "error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable\n --> src/main.rs:4:5\n  |\n3 |     let first = &v[0];\n  |                  - immutable borrow occurs here\n4 |     v.push(5);\n  |     ^^^^^^^^^ mutable borrow occurs here\n5 |     println!(\"{first}\");\n  |                ----- immutable borrow later used here",
    decode: [
      ['let first = &v[0]', 'A shared borrow of v starts here. The reference points into the heap block.'],
      ['v.push(5)', 'push takes &mut self, which requires that nothing else is borrowing v.'],
      ['immutable borrow later used here', 'first is used on the next line, so the shared borrow is still alive when push runs. If first were never used again, this would compile.']
    ]
  },
  tryIt: 'Run the doubling-capacity program from the chapter 8 notes yourself with Vec::new() and 20 pushes, printing capacity whenever it changes. Then make it fast with Vec::with_capacity(20) and confirm capacity never changes. Finally, fix the broken version by reading the value (let first = v[0];) instead of borrowing it. Why does that compile?'
};
