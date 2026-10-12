window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['15'] = {
  lede: 'A pointer is an address; a smart pointer is an address plus extra behaviour, usually owning what it points to. This chapter covers the five you will actually use: `Box`, `Deref`, `Drop`, `Rc` and `RefCell`. It is where you learn how to bend the ownership rules safely.',
  sections: [
    { h: 'Box<T>: put a value on the heap', b: [
      { p: '`Box<T>` is the simplest smart pointer: one heap allocation that you own. Reasons to use it: 1) a type whose size is unknown at compile time, such as a recursive type; 2) moving a large value without copying it; 3) owning a value as "some type implementing a trait" (`Box<dyn Trait>`, chapter 18).' },
      { p: 'A recursive type has infinite size unless you put a pointer in the way:' },
      { code: R`enum List {
    Cons(i32, List),
    Nil,
}

fn main() {
    let _l = List::Cons(1, List::Nil);
}`, err: "error[E0072]: recursive type `List` has infinite size\n --> src/main.rs:1:1\n  |\n1 | enum List {\n  | ^^^^^^^^^\n2 |     Cons(i32, List),\n  |               ---- recursive without indirection\n  |\nhelp: insert some indirection (e.g., a `Box`, `Rc`, or `&`) to break the cycle\n  |\n2 |     Cons(i32, Box<List>),\n  |               ++++    +" },
      { code: R`#[derive(Debug)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn main() {
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    println!("{list:?}");
    println!("{}", std::mem::size_of::<List>());
}`, out: "Cons(1, Cons(2, Cons(3, Nil)))\n16" },
      { p: 'A `Box` is a single pointer wide, so the compiler knows the size of `Cons`. `Box` has no overhead beyond the allocation.' }
    ]},
    { h: 'Deref: treat a smart pointer like a reference', b: [
      { p: 'The `*` operator follows a pointer to its value. Implementing the `Deref` trait lets your type work with `*`, and also enables **deref coercion**: the compiler automatically turns `&Box<String>` into `&String` into `&str` when passing it where a `&str` is expected. This is why one `&str` parameter accepts so many things.' },
      { code: R`use std::ops::Deref;

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);
    assert_eq!(5, *y);
    let m = MyBox::new(String::from("Rust"));
    hello(&m);
}`, out: "Hello, Rust!" }
    ]},
    { h: 'Drop: run code at scope end', b: [
      { p: 'Implement `Drop` to release resources: close files, unlock mutexes, flush buffers. You cannot call `drop` as a method (it would double free), but `std::mem::drop(x)` moves the value into a function that ends immediately, releasing it early.' },
      { code: R`struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data {}!", self.data);
    }
}

fn main() {
    let a = CustomSmartPointer { data: String::from("early") };
    let _b = CustomSmartPointer { data: String::from("late") };
    drop(a);
    println!("end of main");
}`, out: "Dropping CustomSmartPointer with data early!\nend of main\nDropping CustomSmartPointer with data late!" }
    ]},
    { h: 'Rc<T>: shared ownership', b: [
      { p: 'Sometimes a value really has several owners: in a graph, two nodes can point to the same neighbour. `Rc<T>` (reference counted) keeps a count of owners and frees the value when the count reaches zero. It is for single-threaded code; threads use `Arc` (chapter 16). Use `Rc::clone(&a)`, which only bumps the count, not a deep copy.' },
      { code: R`use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared"));
    println!("count after creating a = {}", Rc::strong_count(&a));
    let b = Rc::clone(&a);
    println!("count after creating b = {}", Rc::strong_count(&a));
    {
        let _c = Rc::clone(&a);
        println!("count after creating c = {}", Rc::strong_count(&a));
    }
    println!("count after c goes out of scope = {}", Rc::strong_count(&a));
    println!("{b}");
}`, out: "count after creating a = 1\ncount after creating b = 2\ncount after creating c = 3\ncount after c goes out of scope = 2\nshared" },
      { p: '`Rc` hands out only shared references. That keeps it safe, and also means you cannot change what is inside. The Rc counting lab shows the count rise and fall. To mutate, combine it with `RefCell`.' }
    ]},
    { h: 'RefCell<T> and interior mutability', b: [
      { p: 'The borrow rules normally run at compile time. `RefCell<T>` moves the same rules to **runtime**: `borrow()` and `borrow_mut()` hand out guards, and breaking the rule (a writer while readers exist) panics instead of failing to compile. Use it only when you are sure your code is correct but the compiler cannot prove it. This is called interior mutability: changing a value behind a shared reference.' },
      { code: R`use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(vec![1, 2, 3]);
    cell.borrow_mut().push(4);
    println!("{:?}", cell.borrow());

    let _first = cell.borrow_mut();
    let _second = cell.borrow_mut();
}`, panic: "thread 'main' panicked at src/main.rs:9:24:\nRefCell already borrowed" },
      { p: 'The usual combination is `Rc<RefCell<T>>`: many owners, each able to mutate. The RefCell lab shows the runtime check refusing a second writer.' },
      { code: R`use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node { value: 3, children: RefCell::new(vec![]) });
    let branch = Rc::new(Node { value: 5, children: RefCell::new(vec![Rc::clone(&leaf)]) });
    println!("{} owns {} child", branch.value, branch.children.borrow().len());
    println!("leaf strong = {}", Rc::strong_count(&leaf));
}`, out: "5 owns 1 child\nleaf strong = 2" }
    ]},
    { h: 'Reference cycles and Weak<T>', b: [
      { p: 'If two `Rc` values point at each other, neither count ever reaches zero and the memory leaks. Rust\'s guarantees allow leaks (it is memory safe, not leak-proof). The fix is `Weak<T>`: a non-owning pointer created with `Rc::downgrade`. It does not keep the value alive; calling `upgrade()` gives `Option<Rc<T>>`, `None` if the value is already gone. A tree uses strong pointers parent-to-child and weak pointers child-to-parent.' },
      { code: R`use std::cell::RefCell;
use std::rc::{Rc, Weak};

struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });
    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade().map(|p| p.value));

    let branch = Rc::new(Node {
        value: 5,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });
    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);
    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade().map(|p| p.value));
    println!("branch strong={} weak={}", Rc::strong_count(&branch), Rc::weak_count(&branch));
    println!("children of branch = {}", branch.children.borrow().len());
    println!("leaf value = {}", leaf.value);
}`, out: "leaf parent = None\nleaf parent = Some(5)\nbranch strong=1 weak=1\nchildren of branch = 1\nleaf value = 3" }
    ]}
  ],
  recap: [
    '`Box<T>` owns one heap value; needed for recursive types and trait objects.',
    '`Deref` makes `*` and automatic `&Box<String>` → `&str` conversion work.',
    '`Drop` runs at scope end, in reverse order; `drop(x)` ends a value early.',
    '`Rc<T>` gives several owners (single-threaded), counted. `Rc::clone` is cheap.',
    '`RefCell<T>` checks borrow rules at runtime and panics on violation; `Rc<RefCell<T>>` is shared mutable state.',
    'Cycles of `Rc` leak. Break them with `Weak<T>`.'
  ]
};
})();
