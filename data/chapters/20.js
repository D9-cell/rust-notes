window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['20'] = {
  lede: 'A tour of the features you use less often: raw pointers and `unsafe`, traits with more machinery, type aliases, function pointers, and macros. Read it so these words stop being scary, then come back when you need them.',
  sections: [
    { h: 'Unsafe Rust', b: [
      { p: 'The compiler is conservative: some correct programs it cannot prove safe. `unsafe` is a block that switches off a short list of checks, and it is a promise from you that the rules hold. It does **not** turn off the borrow checker. Inside `unsafe` you may do five extra things:' },
      { list: [
        'Dereference a raw pointer (`*const T`, `*mut T`).',
        'Call an `unsafe` function or method.',
        'Access or modify a mutable `static` variable.',
        'Implement an `unsafe` trait (such as `Send` or `Sync`).',
        'Access fields of a `union`.'
      ]},
      { code: R`unsafe fn dangerous() -> i32 {
    42
}

unsafe extern "C" {
    fn abs(input: i32) -> i32;
}

static mut COUNTER: u32 = 0;

fn add_to_count(inc: u32) {
    unsafe {
        COUNTER += inc;
    }
}

fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();
    assert!(mid <= len);
    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut num = 5;
    let r1 = &raw const num;
    let r2 = &raw mut num;
    unsafe {
        *r2 += 1;
        println!("{} {}", *r1, dangerous());
        println!("{}", abs(-3));
    }
    add_to_count(3);
    let mut v = [1, 2, 3, 4, 5, 6];
    let (a, b) = split_at_mut(&mut v, 3);
    a[0] = 99;
    b[0] = 77;
    println!("{v:?}");
}`, out: "6 42\n3\n[99, 2, 3, 77, 5, 6]" },
      { p: 'The pattern to follow: keep the `unsafe` block as small as possible and wrap it in a safe function whose own checks (the `assert!` above) uphold the rules. Callers get a safe API, and an auditor has one small place to read. `split_at_mut` is the textbook case: the borrow checker cannot see that the two halves do not overlap.' }
    ]},
    { h: 'Advanced traits', b: [
      { p: '**Associated types** let a trait name a placeholder type that each implementation fills in (`Iterator::Item`). Unlike a generic parameter, an implementation has exactly one, so callers never annotate it.' },
      { p: '**Default generic parameters and operator overloading**: arithmetic operators are traits in `std::ops`. Implement `Add` to make `+` work on your type.' },
      { code: R`use std::fmt;
use std::ops::Add;

#[derive(Debug, Clone, Copy, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point { x: self.x + other.x, y: self.y + other.y }
    }
}

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

trait Pilot {
    fn fly(&self) -> &'static str;
}

trait Wizard {
    fn fly(&self) -> &'static str;
}

struct Human;

impl Pilot for Human {
    fn fly(&self) -> &'static str { "captain speaking" }
}

impl Wizard for Human {
    fn fly(&self) -> &'static str { "up!" }
}

impl Human {
    fn fly(&self) -> &'static str { "*waving arms*" }
}

fn main() {
    println!("{:?}", Point { x: 1, y: 0 } + Point { x: 2, y: 3 });
    println!("{}", Wrapper(vec!["a".into(), "b".into()]));
    let p = Human;
    println!("{} / {} / {}", p.fly(), Pilot::fly(&p), <Human as Wizard>::fly(&p));
}`, out: "Point { x: 3, y: 3 }\n[a, b]\n*waving arms* / captain speaking / up!" },
      { list: [
        'When two traits have a method with the same name, use fully qualified syntax: `<Type as Trait>::method(&x)`.',
        'A **supertrait** (`trait OutlinePrint: fmt::Display`) requires implementors to also implement another trait.',
        'The **newtype pattern** (`struct Wrapper(Vec<String>)`) lets you implement a foreign trait for a foreign type, working around the orphan rule at no runtime cost.'
      ]}
    ]},
    { h: 'Advanced types and functions', b: [
      { code: R`type Thunk = Box<dyn Fn() + Send + 'static>;

fn add_one(x: i32) -> i32 {
    x + 1
}

fn do_twice(f: fn(i32) -> i32, arg: i32) -> i32 {
    f(f(arg))
}

fn returns_closure() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}

fn main() {
    let t: Thunk = Box::new(|| println!("hi"));
    t();
    println!("{}", do_twice(add_one, 5));
    let words = vec![1, 2, 3];
    let strings: Vec<String> = words.iter().map(ToString::to_string).collect();
    println!("{strings:?} {}", returns_closure()(4));
}`, out: "hi\n7\n[\"1\", \"2\", \"3\"] 5" },
      { list: [
        'A **type alias** (`type Thunk = ...`) is a synonym, not a new type. Handy for long types like `io::Result<T>`.',
        'The **never type** `!` is for functions that never return (`panic!`, `loop {}`, `process::exit`). It coerces to any type, which is why `match` arms with `continue` or `panic!` fit beside value arms.',
        '`fn(i32) -> i32` (lowercase) is a function pointer type; it implements `Fn`, `FnMut` and `FnOnce`, so it can go anywhere a closure can. Pass a plain function when no capture is needed.',
        '**Dynamically sized types** like `str` and `[T]` and `dyn Trait` cannot be held by value; always behind a pointer. Generics assume `Sized` unless you write `T: ?Sized`.'
      ]}
    ]},
    { h: 'Macros', b: [
      { p: 'A macro writes code before the compiler checks it. That gives it powers functions lack: variable argument counts (`println!`), implementing traits, generating many items. Two families:' },
      { p: '**Declarative macros** (`macro_rules!`) match on the shape of the code you pass them, like a `match` for syntax.' },
      { code: R`macro_rules! my_vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp = Vec::new();
            $( temp.push($x); )*
            temp
        }
    };
}

fn main() {
    let v = my_vec![1, 2, 3];
    println!("{v:?}");
}`, out: "[1, 2, 3]" },
      { p: '`$x:expr` captures one expression and `$( ... ),*` repeats for each comma-separated item. **Procedural macros** are Rust functions that take a token stream and return one. There are three kinds: custom `#[derive(Name)]`, attribute-like (`#[route(GET, "/")]`), and function-like (`sql!(...)`). They must live in their own crate marked `proc-macro = true`, and in practice you use the `syn` and `quote` crates to parse and generate. You have already used them: every `#[derive(Debug)]` is one.' }
    ]}
  ],
  recap: [
    '`unsafe` unlocks five powers and trusts you for the rest; contain it in small, well-checked, safe wrappers.',
    'Associated types, supertraits, fully qualified syntax and the newtype pattern are the advanced trait tools.',
    '`fn` pointers are cheap and work wherever a closure is accepted; `!` never returns.',
    '`macro_rules!` matches syntax patterns; procedural macros transform token streams and power `derive`.'
  ]
};
})();
