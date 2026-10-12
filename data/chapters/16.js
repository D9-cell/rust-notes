window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['16'] = {
  lede: 'Concurrency bugs (data races, use-after-free across threads) are the hardest to find because they show up one run in a thousand. Rust\'s answer is that the ownership rules you already know also make most of them compile errors, hence "fearless".',
  sections: [
    { h: 'Threads', b: [
      { p: '`thread::spawn` runs a closure on a new OS thread and returns a `JoinHandle`. The main thread does not wait automatically: when `main` returns, the program ends and spawned threads are killed. Call `.join()` to wait.' },
      { code: R`use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        let mut total = 0;
        for i in 1..=100 {
            total += i;
        }
        total
    });
    let result = handle.join().unwrap();
    println!("{result}");
}`, out: "5050" },
      { p: 'A spawned closure may outlive the function that created it, so it cannot borrow local variables. Use `move` to give it ownership.' },
      { code: R`use std::thread;

fn main() {
    let v = vec![1, 2, 3];
    let handle = thread::spawn(|| {
        println!("{v:?}");
    });
    handle.join().unwrap();
}`, err: "error[E0373]: closure may outlive the current function, but it borrows `v`, which is owned by the current function\n --> src/main.rs:5:32\n  |\n5 |     let handle = thread::spawn(|| {\n  |                                ^^ may outlive borrowed value `v`\n6 |         println!(\"{v:?}\");\n  |                    - `v` is borrowed here\n  |\nnote: function requires argument type to outlive `'static`\n --> src/main.rs:5:18\n  |\n5 |       let handle = thread::spawn(|| {\n  |  __________________^\n6 | |         println!(\"{v:?}\");\n7 | |     });\n  | |______^\nhelp: to force the closure to take ownership of `v` (and any other referenced variables), use the `move` keyword\n  |\n5 |     let handle = thread::spawn(move || {\n  |                                ++++" }
    ]},
    { h: 'Message passing', b: [
      { p: '"Do not communicate by sharing memory; share memory by communicating." A channel has a sender and a receiver. `mpsc` stands for multiple producer, single consumer: clone the sender for more producers. Sending **moves** the value, so the sending thread cannot use it afterwards, which prevents it from being changed while the receiver reads it.' },
      { code: R`use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    let tx2 = tx.clone();

    thread::spawn(move || {
        for n in 1..=3 {
            tx.send(n).unwrap();
        }
    });
    thread::spawn(move || {
        for n in 100..=102 {
            tx2.send(n).unwrap();
        }
    });

    let mut got: Vec<i32> = rx.iter().collect();
    got.sort();
    println!("{got:?}");
}`, out: "[1, 2, 3, 100, 101, 102]" },
      { p: '`rx.iter()` ends when every sender has been dropped; that is how a receiver knows no more messages are coming. `recv()` blocks, `try_recv()` returns immediately.' }
    ]},
    { h: 'Shared state: Mutex and Arc', b: [
      { p: 'A `Mutex<T>` allows one thread at a time. `lock()` blocks until it is your turn and returns a guard; the lock is released when the guard is dropped. The data lives inside the mutex, so you cannot touch it without locking.' },
      { code: R`use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);
    {
        let mut num = m.lock().unwrap();
        *num = 6;
    }
    println!("m = {m:?}");
}`, out: "m = Mutex { data: 6, poisoned: false, .. }" },
      { p: 'To share it between threads each needs an owner, and `Rc` is not allowed across threads (its counter is not atomic). `Arc<T>` is the atomic version of `Rc<T>`: same API, slower counter, thread safe. `Arc<Mutex<T>>` is the standard pattern for shared mutable state.' },
      { code: R`use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                *counter.lock().unwrap() += 1;
            }
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    println!("Result: {}", *counter.lock().unwrap());
}`, out: "Result: 10000" },
      { code: R`use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Rc::new(Mutex::new(0));
    let c = Rc::clone(&counter);
    let h = thread::spawn(move || {
        *c.lock().unwrap() += 1;
    });
    h.join().unwrap();
}`, err: "error[E0277]: `Rc<std::sync::Mutex<i32>>` cannot be sent between threads safely\n   --> src/main.rs:8:27\n    |\n  8 |       let h = thread::spawn(move || {\n    |               ------------- ^------\n    |               |             |\n    |  _____________|_____________within this `{closure@src/main.rs:8:27: 8:34}`\n    | |             |\n    | |             required by a bound introduced by this call\n  9 | |         *c.lock().unwrap() += 1;\n 10 | |     });\n    | |_____^ `Rc<std::sync::Mutex<i32>>` cannot be sent between threads safely\n    |\n    = help: within `{closure@src/main.rs:8:27: 8:34}`, the trait `Send` is not implemented for `Rc<std::sync::Mutex<i32>>`" },
      { note: 'Deadlock is still possible: two threads each holding a lock the other wants. Rust does not prevent it. Always take multiple locks in the same order, and keep the guard\'s scope small.', kind: 'warn' }
    ]},
    { h: 'Send and Sync', b: [
      { p: 'Two marker traits, with no methods, are the reason the previous error appears. `Send` means a value can be moved to another thread. `Sync` means `&T` can be shared between threads (equivalently, `T` is `Sync` if `&T` is `Send`). The compiler implements them automatically for types made of safe parts, and `Rc`, raw pointers and `RefCell` opt out. `thread::spawn` requires the closure to be `Send`, so unsafe sharing fails to compile. The Send and Sync lab walks through this.' },
      { table: [
        ['Type', 'Send', 'Sync', 'Why'],
        ['`i32`, `String`, `Vec<T>`', 'yes', 'yes', 'plain data'],
        ['`Rc<T>`', 'no', 'no', 'non-atomic counter'],
        ['`Arc<T>`', 'yes (if T is Send + Sync)', 'yes (same)', 'atomic counter'],
        ['`RefCell<T>`', 'yes', 'no', 'runtime check is not thread safe'],
        ['`Mutex<T>`', 'yes', 'yes', 'serialises access']
      ]},
      { p: 'You almost never implement these yourself. Doing so is `unsafe`, because you are promising something the compiler cannot check.' }
    ]}
  ],
  recap: [
    '`spawn` takes a closure; `join` waits; use `move` to hand it data.',
    'Channels move values between threads, so there is nothing shared to race on.',
    '`Arc<Mutex<T>>` is shared mutable state; the lock guard releases on drop.',
    '`Send` and `Sync` are why `Rc` and `RefCell` are rejected across threads at compile time.',
    'Rust prevents data races, not deadlocks.'
  ]
};
})();
