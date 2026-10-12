RUSTLAB.modules['rc-count'] = {
  id: 'rc-count',
  chapter: 15,
  title: 'Rc counting',
  headline: 'Several owners, freed when the last one leaves',
  intro: 'Ownership says one owner per value. Rc relaxes that: the value lives on the heap next to a counter, and each owner increments it. When the counter reaches zero the value is dropped. It is how a graph node can have two parents.',
  play: {
    intro: 'Watch the strong count on the heap block as clones are made and dropped.',
    code: [
      'use std::rc::Rc;',
      'fn main() {',
      '    let a = Rc::new(String::from("shared"));',
      '    let b = Rc::clone(&a);',
      '    {',
      '        let c = Rc::clone(&a);',
      '    }',
      '}'
    ],
    steps: [
      { line: 3, note: 'Rc::new puts the string and a counter on the heap. The count starts at 1: a is the only owner.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'Rc block, strong = 1', text: 'shared' }] },
      { line: 4, note: 'Rc::clone copies only the pointer and adds one to the counter. The string is not copied, which is why it is cheap.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'Rc block, strong = 2', text: 'shared' }] },
      { line: 6, note: 'A third owner in an inner block: strong = 3.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h1']] }, { id: 'c', label: 'c', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'Rc block, strong = 3', text: 'shared' }] },
      { line: 7, note: 'c goes out of scope, so its Drop subtracts one. Back to 2. The block stays because a and b still own it.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h1']] }], heap: [{ id: 'h1', label: 'Rc block, strong = 2', text: 'shared' }] },
      { line: 8, note: 'End of main drops b, then a. The count falls to 0 and only then is the string freed.',
        stack: [], heap: [{ id: 'h1', label: 'Rc block, strong = 0', text: 'shared', status: 'freed' }],
        verdict: { kind: 'ok', text: 'The value lived exactly as long as its longest-lived owner.' } }
    ]
  },
  breakIt: {
    label: 'make two Rc values point at each other',
    intro: 'A reference cycle: each node owns the other. Neither count can reach zero.',
    code: [
      'fn main() {',
      '    let a = Rc::new(RefCell::new(None));',
      '    let b = Rc::new(RefCell::new(None));',
      '    *a.borrow_mut() = Some(Rc::clone(&b));',
      '    *b.borrow_mut() = Some(Rc::clone(&a));',
      '}'
    ],
    steps: [
      { line: 2, note: 'a and b each start with strong = 1 and an empty link.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1']], status: 'new' }, { id: 'b', label: 'b', fields: [['ptr', '→ h2']], status: 'new' }], heap: [{ id: 'h1', label: 'node A, strong = 1', text: 'link: none' }, { id: 'h2', label: 'node B, strong = 1', text: 'link: none' }] },
      { line: 5, note: 'A links to B and B links to A. Each node now has strong = 2: one from its variable, one from the other node.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h2']] }], heap: [{ id: 'h1', label: 'node A, strong = 2', text: 'link: B' }, { id: 'h2', label: 'node B, strong = 2', text: 'link: A' }] },
      { line: 6, note: 'main ends and drops a and b. Each count falls from 2 to 1, not 0. The nodes still own each other, so neither is ever freed.',
        stack: [], heap: [{ id: 'h1', label: 'node A, strong = 1', text: 'link: B', status: 'freed' }, { id: 'h2', label: 'node B, strong = 1', text: 'link: A', status: 'freed' }],
        verdict: { kind: 'bug', text: 'Memory leak: both blocks are unreachable from the program but still allocated. This is safe, just wasteful.' } }
    ],
    lesson: 'The fix is Weak<T>: a pointer that does not add to the strong count. Make the back-pointer (child to parent) weak and the cycle disappears.'
  },
  whyNot: {
    question: 'Why not copy the value, or use plain references?',
    rows: [
      ['Clone the value for each user', 'Each owner is independent.', 'Duplicated data, and changes are not shared.'],
      ['Plain references (&T)', 'Zero cost.', 'The owner must outlive every reference and the compiler must prove it. A graph with no single natural owner cannot.'],
      ['Garbage collector (Java, Go)', 'Any number of owners, cycles are collected.', 'Pauses and memory overhead, and you cannot say when a value is freed.'],
      ['C++ shared_ptr', 'Same idea as Rc, but atomic.', 'Always pays for atomic counting, even in single-threaded code.'],
      ['Rust Rc / Arc', 'Rc for one thread (cheap), Arc for many threads (atomic).', 'Cycles leak; use Weak. Rc gives only shared access, so combine with RefCell to mutate.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98. Rc hands out only shared access, so mutating through it is rejected at compile time.',
    text: "error[E0594]: cannot assign to data in an `Rc`\n --> src/main.rs:5:5\n  |\n5 |     *a += 1;\n  |     ^^^^^^^ cannot assign\n  |\n  = help: trait `DerefMut` is required to modify through a dereference, but it is not implemented for `Rc<i32>`",
    decode: [
      ['cannot assign to data in an `Rc`', 'Several owners may exist, so allowing a write could change data under another owner.'],
      ['trait `DerefMut` is required to modify through a dereference', 'Rc implements Deref (read) but deliberately not DerefMut (write).'],
      ['the way out', 'Wrap the value: Rc<RefCell<i32>>, and write through borrow_mut(). That is the next lab.']
    ]
  },
  tryIt: 'Create an Rc<String>, clone it twice, and print Rc::strong_count after each step including after one clone leaves an inner block. Then build the parent/child tree from the chapter 15 notes with Weak and print strong and weak counts before and after dropping the parent.'
};
