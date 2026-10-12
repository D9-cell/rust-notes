window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['04'] = {
  lede: 'Ownership is the idea that makes Rust different. It gives memory safety without a garbage collector and without manual `free`. Read this chapter slowly, then open the labs: the stack and heap diagrams do in seconds what paragraphs cannot.',
  sections: [
    { h: 'Why ownership exists', b: [
      { p: 'Every program must decide when memory is released. C and C++ leave it to you, which causes use-after-free, double free and leaks. Java, Go and Python run a garbage collector, which is safe but costs memory and unpredictable pauses. Rust picks a third way: the compiler works out when to free memory from a few rules, and rejects programs that break them.' },
      { p: 'It helps to know where values live. The **stack** holds fixed-size values in last-in-first-out order and is very fast: push and pop by moving a pointer. The **heap** holds data whose size is unknown or can change; you ask the allocator for space and get a pointer back, which is slower. A `String` is a small stack struct (pointer, length, capacity) that points at text on the heap. See the Stack vs heap lab.' },
      { note: 'The three rules. 1) Each value has exactly one owner. 2) There can only be one owner at a time. 3) When the owner goes out of scope, the value is dropped. Everything in this chapter follows from those three sentences.', kind: 'key' }
    ]},
    { h: 'Scope and drop', b: [
      { p: 'A variable is valid from its declaration to the end of its block. When the block ends Rust calls a special function, `drop`, which for a `String` returns the heap memory. This pattern is called RAII in C++; here the compiler inserts the call for you.' },
      { code: R`struct Noisy(&'static str);

impl Drop for Noisy {
    fn drop(&mut self) {
        println!("dropping {}", self.0);
    }
}

fn main() {
    let _a = Noisy("a");
    {
        let _b = Noisy("b");
        println!("inner scope ends");
    }
    let _c = Noisy("c");
    println!("main ends");
}`, out: "inner scope ends\ndropping b\nmain ends\ndropping c\ndropping a" },
      { p: 'Notice `b` is dropped at the closing brace, and at the end of `main` the variables drop in reverse order of creation (`c` before `a`). See the Drop order lab for why reverse is the only safe order.' }
    ]},
    { h: 'Move', b: [
      { p: 'Integers are copied by assignment because they are small and live entirely on the stack. A `String` is different: assigning it copies the three-word header, not the heap text. If both variables stayed valid, both would try to free the same memory at scope end (a double free). So Rust **moves** the value: the old variable becomes invalid.' },
      { code: R`fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
    println!("{s1}, world!");
}`, err: "error[E0382]: borrow of moved value: `s1`\n --> src/main.rs:4:16\n  |\n2 |     let s1 = String::from(\"hello\");\n  |         -- move occurs because `s1` has type `String`, which does not implement the `Copy` trait\n3 |     let s2 = s1;\n  |              -- value moved here\n4 |     println!(\"{s1}, world!\");\n  |                ^^ value borrowed here after move\n  |\nhelp: consider cloning the value if the performance cost is acceptable\n  |\n3 |     let s2 = s1.clone();\n  |                ++++++++" },
      { p: 'This is a shallow copy plus invalidating the source, which is what other languages call a move. When you do want two independent copies, say so with `clone`, which deep-copies the heap data. Expensive operations are always visible in the source.' },
      { code: R`fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();
    println!("{s1} {s2}");
}`, out: "hello hello" },
      { h: 'Copy types' },
      { p: 'Types whose whole value lives on the stack and which cannot own anything need no move: copying is cheap and harmless. They implement the `Copy` trait. These are integers, floats, `bool`, `char`, and tuples or arrays made only of `Copy` types. A type that implements `Drop` can never be `Copy`.' },
      { code: R`fn main() {
    let x = 5;
    let y = x;
    println!("{x} {y}");
}`, out: "5 5" }
    ]},
    { h: 'Ownership and functions', b: [
      { p: 'Passing a value to a function is an assignment, so it moves (or copies, for `Copy` types). Returning a value moves it back out. Threading ownership through every call by returning the parameter again is tedious, and that is what references fix.' },
      { code: R`fn takes_ownership(s: String) {
    println!("{s}");
}

fn makes_copy(n: i32) {
    println!("{n}");
}

fn main() {
    let s = String::from("hello");
    takes_ownership(s);
    let n = 5;
    makes_copy(n);
    println!("{n}");
}`, out: "hello\n5\n5" },
      { code: R`fn takes_ownership(s: String) {
    println!("{s}");
}

fn main() {
    let s = String::from("hello");
    takes_ownership(s);
    println!("{s}");
}`, err: "error[E0382]: borrow of moved value: `s`\n --> src/main.rs:8:16\n  |\n6 |     let s = String::from(\"hello\");\n  |         - move occurs because `s` has type `String`, which does not implement the `Copy` trait\n7 |     takes_ownership(s);\n  |                     - value moved here\n8 |     println!(\"{s}\");\n  |                ^ value borrowed here after move\n  |\nnote: consider changing this parameter type in function `takes_ownership` to borrow instead if owning the value isn't necessary\n --> src/main.rs:1:23\n  |\n1 | fn takes_ownership(s: String) {\n  |    ---------------    ^^^^^^ this parameter takes ownership of the value\n  |    |\n  |    in this function\nhelp: consider cloning the value if the performance cost is acceptable\n  |\n7 |     takes_ownership(s.clone());\n  |                      ++++++++" }
    ]},
    { h: 'References and borrowing', b: [
      { p: 'A reference (`&T`) lets you use a value without owning it. Creating one is called borrowing. The owner keeps responsibility for freeing the value, so the reference going out of scope frees nothing.' },
      { code: R`fn calculate_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("The length of '{s1}' is {len}.");
}`, out: "The length of 'hello' is 5." },
      { p: 'References are immutable by default. To modify a borrowed value you need `&mut`, and the owner must be declared `mut` too.' },
      { code: R`fn change(s: &mut String) {
    s.push_str(", world");
}

fn main() {
    let mut s = String::from("hello");
    change(&mut s);
    println!("{s}");
}`, out: "hello, world" },
      { h: 'The borrowing rule' },
      { note: 'At any moment you may have either one mutable reference or any number of shared references to the same value, never both. References must always be valid.', kind: 'key' },
      { p: 'That is the "readers-writer lock" idea applied at compile time. It prevents data races, and also the quieter bug where you hold a pointer into a collection while something else resizes it. The Borrowing rules lab shows the Vec-reallocation case.' },
      { code: R`fn main() {
    let mut s = String::from("hello");
    let r1 = &mut s;
    let r2 = &mut s;
    println!("{r1}, {r2}");
}`, err: "error[E0499]: cannot borrow `s` as mutable more than once at a time\n --> src/main.rs:4:14\n  |\n3 |     let r1 = &mut s;\n  |              ------ first mutable borrow occurs here\n4 |     let r2 = &mut s;\n  |              ^^^^^^ second mutable borrow occurs here\n5 |     println!(\"{r1}, {r2}\");\n  |                -- first borrow later used here" },
      { code: R`fn main() {
    let mut s = String::from("hello");
    let r1 = &s;
    let r2 = &s;
    println!("{r1} and {r2}");
    let r3 = &mut s;
    r3.push_str("!");
    println!("{r3}");
}`, out: "hello and hello\nhello!" },
      { p: 'The last program compiles even though `r1` and `r2` still exist in scope. A reference\'s lifetime ends after its **last use**, not at the closing brace. This is called non-lexical lifetimes, and it removes most false alarms.' },
      { h: 'Dangling references' },
      { p: 'In C you can return a pointer to a local variable and crash later. Rust refuses to compile it, because the referent would be dropped while the reference still exists.' },
      { code: R`fn dangle() -> &String {
    let s = String::from("hello");
    &s
}

fn main() {
    let r = dangle();
    println!("{r}");
}`, err: "error[E0106]: missing lifetime specifier\n --> src/main.rs:1:16\n  |\n1 | fn dangle() -> &String {\n  |                ^ expected named lifetime parameter\n  |\n  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from\nhelp: consider using the `'static` lifetime, but this is uncommon unless you're returning a borrowed value from a `const` or a `static`\n  |\n1 | fn dangle() -> &'static String {\n  |                 +++++++\nhelp: instead, you are more likely to want to return an owned value\n  |\n1 - fn dangle() -> &String {\n1 + fn dangle() -> String {\n  |" },
      { p: 'The fix is to return the `String` itself, moving ownership out to the caller.' }
    ]},
    { h: 'Slices', b: [
      { p: 'A slice is a reference to a contiguous part of a collection: a pointer plus a length, with no ownership. A string slice is `&str`, an array or vector slice is `&[T]`. Because a slice borrows, the compiler stops you from changing the original while the slice is alive.' },
      { code: R`fn first_word(s: &str) -> &str {
    for (i, &byte) in s.as_bytes().iter().enumerate() {
        if byte == b' ' {
            return &s[..i];
        }
    }
    s
}

fn main() {
    let sentence = String::from("hello world");
    let word = first_word(&sentence);
    println!("{word}");
    println!("{}", first_word("literal text"));
    let a = [1, 2, 3, 4, 5];
    let part: &[i32] = &a[1..3];
    println!("{part:?}");
}`, out: "hello\nliteral\n[2, 3]" },
      { code: R`fn first_word(s: &str) -> &str {
    s.split(' ').next().unwrap_or(s)
}

fn main() {
    let mut s = String::from("hello world");
    let word = first_word(&s);
    s.clear();
    println!("{word}");
}`, err: "error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable\n --> src/main.rs:8:5\n  |\n7 |     let word = first_word(&s);\n  |                           -- immutable borrow occurs here\n8 |     s.clear();\n  |     ^^^^^^^^^ mutable borrow occurs here\n9 |     println!(\"{word}\");\n  |                ---- immutable borrow later used here" },
      { note: 'Write function parameters as `&str` instead of `&String`. A `&String` automatically becomes a `&str`, and string literals are already `&str`, so one signature accepts everything.', kind: 'tip' },
      { note: 'String indexes are byte offsets. Slicing in the middle of a multi-byte character panics. Chapter 8 explains UTF-8.', kind: 'warn' }
    ]}
  ],
  recap: [
    'One owner per value; the value is dropped when the owner leaves scope.',
    'Assigning or passing a non-`Copy` value moves it; the source is unusable afterwards. `clone` makes a real copy.',
    'Many `&T` or one `&mut T`, never both at once. A borrow ends at its last use.',
    'You cannot return a reference to a local; return the owned value.',
    'Prefer `&str` and `&[T]` in parameters. Slices borrow, so the original is frozen while they live.'
  ]
};
})();
