RUSTLAB.modules['stack-heap'] = {
  id: 'stack-heap',
  chapter: 4,
  title: 'Stack vs heap',
  headline: 'Where a String actually lives',
  intro: 'A String is two things: a small fixed-size handle on the stack, and the text itself on the heap. Every ownership rule in the book exists because of that split.',
  play: {
    intro: 'Step through main(). Watch what goes on the stack, what goes on the heap, and what the arrow means.',
    code: [
      'fn main() {',
      '    let x = 5;',
      '    let s = String::from("hello");',
      '    let t = s.clone();',
      '}'
    ],
    steps: [
      { line: 1, note: 'main starts and gets a stack frame. Nothing has been allocated yet.', stack: [], heap: [] },
      { line: 2, note: 'An i32 has a size known at compile time, so x is just 5, stored directly on the stack. No heap involved.',
        stack: [{ id: 'x', label: 'x', fields: [['val', '5']], status: 'new' }], heap: [] },
      { line: 3, note: 'A String can grow, so its size is unknown at compile time. The text goes on the heap. The stack keeps a 3-word handle: pointer, length, capacity.',
        stack: [{ id: 'x', label: 'x', fields: [['val', '5']] }, { id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']], status: 'new' }],
        heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o', status: 'new' }] },
      { line: 4, note: 'clone() copies the heap text too: a second allocation. That is real work, which is why Rust makes you write .clone() instead of doing it behind your back.',
        stack: [{ id: 'x', label: 'x', fields: [['val', '5']] }, { id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']] }, { id: 't', label: 't', fields: [['ptr', '→ h2'], ['len', '5'], ['cap', '5']], status: 'new' }],
        heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }, { id: 'h2', label: 'block 2', text: 'h e l l o', status: 'new' }] },
      { line: 5, note: 'At the closing brace Rust drops the variables in reverse order: t frees block 2, s frees block 1, x is just popped. You never wrote a free call.',
        stack: [{ id: 'x', label: 'x', fields: [['val', '5']], status: 'freed' }, { id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '5'], ['cap', '5']], status: 'freed' }, { id: 't', label: 't', fields: [['ptr', '→ h2'], ['len', '5'], ['cap', '5']], status: 'freed' }],
        heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o', status: 'freed' }, { id: 'h2', label: 'block 2', text: 'h e l l o', status: 'freed' }],
        verdict: { kind: 'ok', text: 'Two allocations, two frees, inserted by the compiler.' } }
    ]
  },
  breakIt: {
    label: 'assign without the compiler tracking who frees',
    intro: 'Same program shape, but now imagine the language only copies the handle and never decides who owns the heap block. This is what plain C pointers do.',
    code: [
      'fn main() {',
      '    let a = String::from("hello");',
      '    let b = a;   // handle copied, no owner rule',
      '}'
    ],
    steps: [
      { line: 2, note: 'a owns block 1.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '5']] }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }] },
      { line: 3, note: 'Only the 3 words are copied. Now two stack variables point at one block, and nothing says which one is responsible for freeing it.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '5']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h1'], ['len', '5']], status: 'new' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o' }] },
      { line: 4, note: 'Scope ends. b is dropped and frees block 1.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '5']] }, { id: 'b', label: 'b', fields: [['ptr', '→ h1'], ['len', '5']], status: 'freed' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o', status: 'freed' }] },
      { line: 4, note: 'Then a is dropped and frees the same block again.',
        stack: [{ id: 'a', label: 'a', fields: [['ptr', '→ h1'], ['len', '5']], status: 'freed' }, { id: 'b', label: 'b', fields: [['ptr', '→ h1'], ['len', '5']], status: 'freed' }], heap: [{ id: 'h1', label: 'block 1', text: 'h e l l o', status: 'freed' }],
        verdict: { kind: 'bug', text: 'DOUBLE FREE. Heap corruption, crashes, and a classic security hole. Rust refuses to compile the shape that allows this.' } }
    ],
    lesson: 'Takeaway: the stack/heap split is not trivia. The stack handle is cheap to copy; the heap block must have exactly one owner. The next lab shows how Rust enforces that.'
  },
  whyNot: {
    question: 'Why does a String not just live entirely on the stack, or entirely on the heap like in Java?',
    rows: [
      ['All on the stack', 'Fixed size only, known at compile time.', 'Cannot grow. A String that reads user input would need a maximum length.'],
      ['Everything on the heap (Java, Python)', 'Every object is a heap allocation, reached by reference.', 'Each int or small struct pays for an allocation and a pointer hop, and a garbage collector must find and free it later.'],
      ['Manual malloc/free (C)', 'You decide when to allocate and free.', 'Forget to free: leak. Free twice or use after free: memory corruption.'],
      ['Rust', 'Fixed-size data on the stack, growable data on the heap, one owner frees it at scope end.', 'You must learn the ownership rules. Nothing at runtime: no collector, no counters.']
    ]
  },
  error: {
    intro: 'This lab has no error of its own. The next lab shows the compiler enforcing the single-owner rule. Predict the output of the program above before you run it.',
    text: 'fn main() {\n    let x = 5;\n    let s = String::from("hello");\n    let t = s.clone();\n}\n\n$ cargo run\n(compiles; warns that x, s and t are unused)',
    decode: [
      ['unused variable', 'Harmless here. Prefix names with _ to silence it. The point of the program is the memory pictured above.'],
      ['no free() anywhere', 'The compiler inserted three drop calls at the closing brace. You can watch them happen by implementing Drop on your own type (see the Drop order lab).']
    ]
  },
  tryIt: 'Create a file and print `std::mem::size_of::<String>()` and `std::mem::size_of::<i32>()`. Predict both before running. Then call `.as_ptr()` on two clones of the same String and print both. What do you notice?'
};
