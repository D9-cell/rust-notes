RUSTLAB.modules['send-sync'] = {
  id: 'send-sync',
  chapter: 16,
  title: 'Send and Sync',
  headline: 'Why Rc is rejected across threads and Arc is accepted',
  intro: 'Two threads incrementing the same non-atomic counter lose updates. Rc has exactly such a counter. Rust marks types that are safe to move to another thread as Send, and thread::spawn demands it, so the mistake becomes a compile error instead of a one-in-a-million crash.',
  play: {
    intro: 'The correct version: Arc has an atomic counter, and Mutex lets one thread at a time change the value.',
    code: [
      'let counter = Arc::new(Mutex::new(0));',
      'let c1 = Arc::clone(&counter);',
      'let t1 = thread::spawn(move || {',
      '    *c1.lock().unwrap() += 1;',
      '});',
      't1.join().unwrap();'
    ],
    steps: [
      { line: 1, note: 'The Mutex-wrapped integer sits on the heap with an atomic owner count of 1.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'Arc block, strong = 1', text: 'Mutex { 0 }' }] },
      { line: 2, note: 'Arc::clone adds one with an atomic instruction, which is safe even if another thread does the same at that instant.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']] }, { id: 'c1', label: 'c1 (main)', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'Arc block, strong = 2', text: 'Mutex { 0 }' }] },
      { line: 3, note: 'move gives the thread its own pointer c1. Arc<Mutex<i32>> is Send, so spawn accepts the closure.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']] }, { id: 'c1', label: 'c1 (thread 1)', fields: [['ptr', '→ h1']] }], heap: [{ id: 'h1', label: 'Arc block, strong = 2', text: 'Mutex { 0 }' }] },
      { line: 4, note: 'lock() makes the thread wait its turn, hands back a guard, and the += happens while the lock is held.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']] }, { id: 'c1', label: 'c1 (thread 1)', fields: [['ptr', '→ h1']] }], heap: [{ id: 'h1', label: 'Arc block, strong = 2, LOCKED', text: 'Mutex { 1 }' }] },
      { line: 6, note: 'The thread finishes and drops c1: strong falls to 1. The value is 1 and nothing was lost.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']] }], heap: [{ id: 'h1', label: 'Arc block, strong = 1', text: 'Mutex { 1 }' }],
        verdict: { kind: 'ok', text: 'Atomic count for ownership, mutex for the data: both kinds of sharing are protected.' } }
    ]
  },
  breakIt: {
    label: 'send an Rc to another thread',
    intro: 'Swap Arc for Rc. Rc\'s counter is a plain integer, so two threads cloning or dropping at once could corrupt it.',
    code: [
      'let counter = Rc::new(0);',
      'let c = Rc::clone(&counter);',
      'let h = thread::spawn(move || {',
      '    println!("{c}");',
      '});',
      'h.join().unwrap();'
    ],
    steps: [
      { line: 1, note: 'Rc::new makes a block whose counter is a plain, non-atomic integer.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'Rc block, strong = 1 (plain int)', text: '0' }] },
      { line: 2, note: 'strong becomes 2 with an ordinary add. If another thread did the same add at the same moment, one increment could be lost: the count would be 2 instead of 3.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']] }, { id: 'c', label: 'c', fields: [['ptr', '→ h1']], status: 'new' }], heap: [{ id: 'h1', label: 'Rc block, strong = 2 (plain int)', text: '0' }] },
      { line: 3, note: 'Rc is marked !Send. spawn requires the closure to be Send, and a closure that captures an Rc is not. The compiler stops here.',
        stack: [{ id: 'counter', label: 'counter (main)', fields: [['ptr', '→ h1']] }, { id: 'c', label: 'c', fields: [['ptr', '→ h1']] }], heap: [{ id: 'h1', label: 'Rc block, strong = 2 (plain int)', text: '0' }],
        verdict: { kind: 'error', text: 'error[E0277]: `Rc<i32>` cannot be sent between threads safely' } }
    ],
    lesson: 'A miscounted Rc would free memory too early (use-after-free) or never. The marker trait Send turns that whole class of bug into a type error.'
  },
  whyNot: {
    question: 'Why not make everything thread-safe by default?',
    rows: [
      ['Everything atomic', 'Always safe to share.', 'Every Rc-like clone pays for atomic instructions and cache-line contention, even in single-threaded programs.'],
      ['Document it and trust the programmer (C++)', 'No overhead.', 'Data races are undefined behaviour and show up only under load.'],
      ['Global interpreter lock (Python)', 'Simple.', 'Threads cannot run Python code in parallel.'],
      ['Rust Send / Sync', 'Types declare whether they are safe to move (Send) or share (Sync). The compiler infers it from the fields.', 'You pick Rc or Arc, RefCell or Mutex on purpose, and the compiler checks the choice.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98, trimmed to the first two blocks (the tail repeats the bound in spawn).',
    text: "error[E0277]: `Rc<i32>` cannot be sent between threads safely\n   --> src/main.rs:7:27\n    |\n  7 |       let h = thread::spawn(move || {\n    |               ------------- ^------\n    |               |             |\n    |  _____________|_____________within this `{closure@src/main.rs:7:27: 7:34}`\n    | |             |\n    | |             required by a bound introduced by this call\n  8 | |         println!(\"{c}\");\n  9 | |     });\n    | |_____^ `Rc<i32>` cannot be sent between threads safely\n    |\n    = help: within `{closure@src/main.rs:7:27: 7:34}`, the trait `Send` is not implemented for `Rc<i32>`",
    decode: [
      ['`Rc<i32>` cannot be sent between threads safely', 'The headline: the closure captures an Rc, and Rc is not Send.'],
      ['required by a bound introduced by this call', 'thread::spawn requires F: Send + \'static. That bound is the gate.'],
      ['the trait `Send` is not implemented for `Rc<i32>`', 'The exact reason. The fix is Arc<i32>, or Arc<Mutex<i32>> if it must change.']
    ]
  },
  tryIt: 'Make the Arc<Mutex<i32>> counter from chapter 16 with ten threads each adding 1000, join them all and print the total. Then change Arc to Rc and read the error. Finally replace Mutex with RefCell inside the Arc and read that error too: which of Send or Sync is missing this time?'
};
