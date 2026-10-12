RUSTLAB.modules['dangling'] = {
  id: 'dangling',
  chapter: 4,
  title: 'Dangling references',
  headline: 'A reference cannot outlive what it points to',
  intro: 'Inner scopes free their variables at the closing brace. A reference that escapes the scope would point at memory that is gone.',
  play: {
    intro: 'Step through. The red dashed arrow is a reference to something already freed.',
    code: [
      'fn main() {',
      '    let r;',
      '    {',
      '        let x = 5;',
      '        r = &x;',
      '    }',
      '    println!("{r}");',
      '}'
    ],
    steps: [
      { line: 2, note: 'r is declared but holds nothing yet. Rust will not let you read it before it is set.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '(unset)']], status: 'new' }], heap: [] },
      { line: 4, note: 'The inner scope creates x.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '(unset)']] }, { id: 'x', label: 'x', fields: [['val', '5']], status: 'new' }], heap: [] },
      { line: 5, note: 'r now borrows x. The arrow goes to a stack slot this time.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '→ x']] }, { id: 'x', label: 'x', fields: [['val', '5']] }], heap: [] },
      { line: 6, note: 'The closing brace ends x. Its slot is released while r still points at it.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '→ x']] }, { id: 'x', label: 'x', fields: [['val', '5']], status: 'freed' }], heap: [] },
      { line: 7, note: 'Using r now would read a slot that is gone. The compiler rejects the program at the brace on line 6.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '→ x']] }, { id: 'x', label: 'x', fields: [['val', '5']], status: 'freed' }], heap: [],
        verdict: { kind: 'error', text: 'error[E0597]: `x` does not live long enough' } }
    ]
  },
  breakIt: {
    label: 'let the reference escape',
    intro: 'Same program with no check. What does line 7 print?',
    code: [
      'fn main() {',
      '    let r;',
      '    { let x = 5; r = &x; }',
      '    let y = 99;',
      '    println!("{r}");',
      '}'
    ],
    steps: [
      { line: 3, note: 'r points at x inside the inner scope.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '→ x']] }, { id: 'x', label: 'x', fields: [['val', '5']] }], heap: [] },
      { line: 4, note: 'x is gone. The compiler is free to reuse the slot, and y happens to land in the same place.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '→ y']] }, { id: 'y', label: 'y (reused slot)', fields: [['val', '99']], status: 'new' }], heap: [] },
      { line: 5, note: 'r reads that slot and prints 99, a value r was never given.',
        stack: [{ id: 'r', label: 'r (&i32)', fields: [['ref', '→ y']] }, { id: 'y', label: 'y (reused slot)', fields: [['val', '99']] }], heap: [],
        out: ['99'],
        verdict: { kind: 'bug', text: 'DANGLING POINTER. It prints the wrong value now, and could corrupt memory or leak a secret later. What it does depends on the compiler, which is the worst kind of bug.' } }
    ],
    lesson: 'In C you can return a pointer to a local variable and the compiler may only warn. Rust turns this entire class of bug into a compile error.'
  },
  whyNot: {
    question: 'Why not let the reference keep x alive, or make the check happen at runtime?',
    rows: [
      ['Return pointer to local (C)', 'Compiles, maybe with a warning.', 'Reads freed stack memory. Undefined behavior.'],
      ['Garbage collector (Java, Go)', 'Anything referenced stays alive.', 'The collector decides when memory is freed, so you give up deterministic cleanup and pay runtime cost.'],
      ['Runtime reference check', 'Each deref verifies the target is still alive.', 'Cost on every access, and failures show up only when the code path runs.'],
      ['Rust', 'The compiler compares scopes: a reference may not outlive its target.', 'You must structure code so owners outlive borrowers, or use an owning type instead.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98.',
    text: 'error[E0597]: `x` does not live long enough\n --> dangling.rs:5:13\n  |\n4 |         let x = 5;\n  |             - binding `x` declared here\n5 |         r = &x;\n  |             ^^ borrowed value does not live long enough\n6 |     }\n  |     - `x` dropped here while still borrowed\n7 |     println!("{r}");\n  |                - borrow later used here',
    decode: [
      ['binding `x` declared here', 'Where the target begins to exist.'],
      ['borrowed value does not live long enough', 'The reference is created here.'],
      ['`x` dropped here while still borrowed', 'The closing brace that ends x. This line is the cause, read it first.'],
      ['borrow later used here', 'The later use of r that needs x to still exist. Together the four lines form a timeline: declared, borrowed, dropped, used.']
    ]
  },
  tryIt: 'Write it and read the four labelled lines as a timeline. Then fix it by moving `let x = 5;` above the inner block. Why is that enough?'
};
