window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['13'] = {
  lede: 'Closures are anonymous functions that remember their surroundings. Iterators are lazy sequences you transform in steps. Both come from functional programming, and both compile down to the same machine code as a hand-written loop.',
  sections: [
    { h: 'Closures', b: [
      { p: 'A closure is written `|params| body`. Unlike a function it can use variables from the scope where it was created. Types are usually inferred, because a closure is used in one narrow place.' },
      { code: R`fn main() {
    let add_one = |x| x + 1;
    let verbose = |x: i32| -> i32 { x + 1 };
    println!("{} {}", add_one(5), verbose(5));

    let list = vec![1, 2, 3];
    let only_borrows = || println!("From closure: {list:?}");
    only_borrows();
    println!("Still usable: {list:?}");
}`, out: "6 6\nFrom closure: [1, 2, 3]\nStill usable: [1, 2, 3]" },
      { p: 'A closure captures each variable in the weakest way its body needs: by shared reference, by mutable reference, or by taking ownership. Add `move` before the bars to force ownership. You must do that when the closure outlives the current function, which is the case with threads.' },
      { code: R`use std::thread;

fn main() {
    let list = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("From thread: {list:?}");
    });
    handle.join().unwrap();
}`, out: "From thread: [1, 2, 3]" },
      { h: 'Fn, FnMut, FnOnce' },
      { p: 'How a closure uses its captures decides which trait it implements, which decides where you can pass it:' },
      { table: [
        ['Trait', 'The closure…', 'Can be called'],
        ['`FnOnce`', 'may move a captured value out of itself', 'once (all closures are at least this)'],
        ['`FnMut`', 'mutates captured state but does not move it out', 'many times, needs `mut`'],
        ['`Fn`', 'only reads captured state (or captures nothing)', 'many times, even concurrently']
      ]},
      { code: R`fn call_twice<F: FnMut()>(mut f: F) {
    f();
    f();
}

fn main() {
    let mut count = 0;
    call_twice(|| count += 1);
    println!("{count}");

    let mut names = vec!["bob", "alice", "carol"];
    names.sort_by_key(|n| n.len());
    println!("{names:?}");
}`, out: "2\n[\"bob\", \"alice\", \"carol\"]" }
    ]},
    { h: 'Iterators', b: [
      { p: 'An iterator is anything with a `next()` method that returns `Some(item)` until it returns `None`. Iterators are **lazy**: creating one does no work. Work happens only when something consumes it.' },
      { code: R`fn main() {
    let v = vec![1, 2, 3];
    let mut it = v.iter();
    println!("{:?} {:?} {:?} {:?}", it.next(), it.next(), it.next(), it.next());
}`, out: "Some(1) Some(2) Some(3) None" },
      { p: 'Three flavours matter: `iter()` yields `&T`, `iter_mut()` yields `&mut T`, and `into_iter()` yields owned `T` and consumes the collection.' },
      { p: '**Adaptors** return a new iterator (`map`, `filter`, `enumerate`, `zip`, `take`, `skip`, `rev`, `chain`, `flat_map`). **Consumers** drive it and produce a result (`sum`, `count`, `collect`, `fold`, `any`, `all`, `find`, `max`, `min`).' },
      { code: R`fn main() {
    let v = vec![1, 2, 3, 4, 5, 6];
    let total: i32 = v.iter().filter(|x| **x % 2 == 0).map(|x| x * x).sum();
    println!("{total}");

    let doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();
    println!("{doubled:?}");

    let names = ["a", "b", "c"];
    for (i, n) in names.iter().enumerate().skip(1) {
        println!("{i}: {n}");
    }
}`, out: "56\n[2, 4, 6, 8, 10, 12]\n1: b\n2: c" },
      { note: 'An adaptor with no consumer does nothing: the compiler warns that iterators are lazy and must be used.', kind: 'warn' },
      { p: 'Your own types can be iterated by implementing `Iterator` with one method:' },
      { code: R`struct Counter {
    count: u32,
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

fn main() {
    let sum: u32 = Counter { count: 0 }
        .zip(Counter { count: 0 }.skip(1))
        .map(|(a, b)| a * b)
        .filter(|x| x % 3 == 0)
        .sum();
    println!("{sum}");
}`, out: "18" }
    ]},
    { h: 'Rewriting minigrep, and the performance question', b: [
      { p: 'In minigrep, `search` shrinks to a pipeline with no mutable vector to push into. Taking `args` as an iterator lets `Config::build` avoid the `clone` calls too.' },
      { code: R`pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents
        .lines()
        .filter(|line| line.contains(query))
        .collect()
}

fn main() {
    println!("{:?}", search("ru", "rust\nsafe\ntrust"));
}`, out: "[\"rust\", \"trust\"]" },
      { p: 'Is it slower than the loop? No. Iterators are a zero-cost abstraction: the compiler inlines the closures and often unrolls the loop, and the book\'s benchmark shows the iterator version matching or beating the loop. Choose by clarity.' }
    ]}
  ],
  recap: [
    'A closure captures by reference, mutable reference or move, whichever its body needs. `move` forces ownership.',
    '`Fn` reads, `FnMut` mutates, `FnOnce` consumes. Accept the weakest trait that works.',
    'Iterators are lazy. Adaptors build a pipeline, consumers run it.',
    '`iter` borrows, `iter_mut` borrows mutably, `into_iter` consumes.',
    'Iterator chains compile to loops that are as fast as the hand-written version.'
  ]
};
})();
