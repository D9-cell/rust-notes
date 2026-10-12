RUSTLAB.modules['refcell'] = {
  id: 'refcell',
  chapter: 15,
  title: 'RefCell: rules at runtime',
  headline: 'The same borrow rule, checked while the program runs',
  intro: 'The compiler cannot prove every safe program safe. RefCell lets you mutate behind a shared reference by tracking borrows in a counter at runtime. The rule is the same one you know: one writer or many readers. Break it and the program panics instead of failing to compile.',
  play: {
    intro: 'A RefCell stores the value plus a borrow flag. Each borrow_mut() takes the flag, and dropping the guard gives it back.',
    code: [
      'use std::cell::RefCell;',
      'fn main() {',
      '    let cell = RefCell::new(String::from("hi"));',
      '    {',
      '        let mut w = cell.borrow_mut();',
      '        w.push_str(" there");',
      '    }',
      '    println!("{}", cell.borrow());',
      '}'
    ],
    steps: [
      { line: 3, note: 'cell holds the string and a borrow flag set to "free". Notice that cell is not mut, yet we are about to change it.',
        stack: [{ id: 'cell', label: 'cell', fields: [['value', '"hi"'], ['flag', 'free']], status: 'new' }], heap: [] },
      { line: 5, note: 'borrow_mut checks the flag, finds it free, sets it to "writing", and returns a guard w.',
        stack: [{ id: 'cell', label: 'cell', fields: [['value', '"hi"'], ['flag', 'writing']] }, { id: 'w', label: 'w (RefMut guard)', fields: [['to', 'cell']], status: 'new' }], heap: [] },
      { line: 6, note: 'Writing through the guard changes the value in place.',
        stack: [{ id: 'cell', label: 'cell', fields: [['value', '"hi there"'], ['flag', 'writing']] }, { id: 'w', label: 'w (RefMut guard)', fields: [['to', 'cell']] }], heap: [] },
      { line: 7, note: 'The block ends and the guard is dropped, which resets the flag to free.',
        stack: [{ id: 'cell', label: 'cell', fields: [['value', '"hi there"'], ['flag', 'free']] }], heap: [] },
      { line: 8, note: 'borrow() now succeeds: one reader.',
        stack: [{ id: 'cell', label: 'cell', fields: [['value', '"hi there"'], ['flag', 'reading ×1']] }], heap: [], out: ['hi there'],
        verdict: { kind: 'ok', text: 'The flag was always checked before use, so the one-writer-or-many-readers rule held.' } }
    ]
  },
  breakIt: {
    label: 'hold two mutable borrows at once',
    intro: 'Both guards are alive at the same time. The compiler does not notice, because it cannot see inside RefCell.',
    code: [
      'use std::cell::RefCell;',
      'fn main() {',
      '    let cell = RefCell::new(String::from("hi"));',
      '    let first = cell.borrow_mut();',
      '    let second = cell.borrow_mut();',
      '    println!("{first} {second}");',
      '}'
    ],
    steps: [
      { line: 4, note: 'first takes the flag: writing.',
        stack: [{ id: 'cell', label: 'cell', fields: [['value', '"hi"'], ['flag', 'writing']] }, { id: 'first', label: 'first (guard)', fields: [['to', 'cell']], status: 'new' }], heap: [] },
      { line: 5, note: 'second asks for the flag. It is already "writing", and a second writer would break the rule.',
        stack: [{ id: 'cell', label: 'cell', fields: [['value', '"hi"'], ['flag', 'writing']] }, { id: 'first', label: 'first (guard)', fields: [['to', 'cell']] }], heap: [],
        verdict: { kind: 'bug', text: 'thread \'main\' panicked: RefCell already borrowed' } }
    ],
    lesson: 'The program compiled, then crashed. The bug moved from compile time to run time. Use RefCell only where the compiler\'s conservative rules genuinely get in the way, and keep guards short.'
  },
  whyNot: {
    question: 'Why not just use &mut everywhere?',
    rows: [
      ['&mut T', 'Checked at compile time, free at runtime.', 'Needs exclusive access, so you cannot have several owners (Rc) each changing the value.'],
      ['Cell<T>', 'Replace the value through &T by copying in and out. No flag, no panic.', 'Only for small Copy values; you cannot take a reference into it.'],
      ['RefCell<T>', 'Mutate any value behind &T, checked at runtime.', 'A counter on every borrow, and a violation panics instead of failing to compile.'],
      ['Mutex<T>', 'The multi-thread version: blocks instead of panicking.', 'Costs a lock. RefCell is not Sync, so it cannot cross threads.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98 for the same mistake with plain &mut references. This is the compile-time version of the panic you just saw.',
    text: "error[E0499]: cannot borrow `s` as mutable more than once at a time\n --> src/main.rs:4:18\n  |\n3 |     let first = &mut s;\n  |                 ------ first mutable borrow occurs here\n4 |     let second = &mut s;\n  |                  ^^^^^^ second mutable borrow occurs here\n5 |     println!(\"{first} {second}\");\n  |                ----- first borrow later used here",
    decode: [
      ['first mutable borrow occurs here', 'Same event as the first borrow_mut() that took the flag.'],
      ['second mutable borrow occurs here', 'Same event as the second borrow_mut() that found it taken.'],
      ['first borrow later used here', 'The compiler proves a conflict only because first is used after. RefCell\'s check does not look ahead; it only checks the moment you ask.']
    ]
  },
  tryIt: 'Write Rc<RefCell<Vec<i32>>>. Clone the Rc into two variables, push through one with borrow_mut(), and read through the other with borrow(). Then hold a borrow() alive and call borrow_mut() to trigger the panic, and fix it by limiting the first guard to an inner block.'
};
