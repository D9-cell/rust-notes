window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['10'] = {
  lede: 'Generics remove duplication, traits describe shared behaviour, and lifetimes tell the compiler how long references stay valid. All three cost nothing at runtime. This is the hardest chapter after ownership, because it is ownership\'s vocabulary for functions and types.',
  sections: [
    { h: 'Generic types and functions', b: [
      { p: 'Write the code once with a placeholder type `T`, and the compiler produces a specialised copy for each real type you use (monomorphization). The result runs as fast as hand-written code for each type, at the cost of a larger binary. This differs from Java generics, which erase the type at runtime.' },
      { code: R`fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

impl Point<f64> {
    fn distance_from_origin(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    println!("{}", largest(&[34, 50, 25, 100, 65]));
    println!("{}", largest(&['y', 'm', 'a', 'q']));
    let p = Point { x: 3.0, y: 4.0 };
    println!("{} {}", p.x(), p.distance_from_origin());
}`, out: "100\ny\n3 5" },
      { p: '`T: PartialOrd` is a trait bound: "T can be any type that supports comparison". Without it the compiler refuses `item > largest`, because it cannot know every possible `T` has a `>`. The `impl Point<f64>` block shows a method that only exists for one concrete type.' },
      { code: R`fn largest<T>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    println!("{}", largest(&[1, 2, 3]));
}`, err: "error[E0369]: binary operation `>` cannot be applied to type `&T`\n --> src/main.rs:4:17\n  |\n4 |         if item > largest {\n  |            ---- ^ ------- &T\n  |            |\n  |            &T\n  |\nhelp: consider restricting type parameter `T` with trait `PartialOrd`\n  |\n1 | fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> &T {\n  |             ++++++++++++++++++++++" }
    ]},
    { h: 'Traits', b: [
      { p: 'A trait is a set of method signatures a type promises to provide. It is closest to an interface in Java, with two differences: you can implement your own trait for a foreign type (such as `Vec`), and traits can supply default method bodies.' },
      { code: R`trait Summary {
    fn author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.author())
    }
}

struct Tweet {
    username: String,
    content: String,
}

struct Article {
    title: String,
}

impl Summary for Tweet {
    fn author(&self) -> String {
        format!("@{}", self.username)
    }

    fn summarize(&self) -> String {
        format!("{}: {}", self.author(), self.content)
    }
}

impl Summary for Article {
    fn author(&self) -> String {
        String::from("staff")
    }
}

fn notify(item: &impl Summary) {
    println!("Breaking: {}", item.summarize());
}

fn main() {
    let t = Tweet { username: "rustlang".into(), content: "2024 edition".into() };
    let a = Article { title: "News".into() };
    notify(&t);
    notify(&a);
    println!("{}", a.title);
}`, out: "Breaking: @rustlang: 2024 edition\nBreaking: (Read more from staff...)\nNews" },
      { list: [
        '**Orphan rule**: you may implement a trait for a type only if you own the trait or the type. This stops two crates from giving conflicting implementations.',
        '`impl Summary` in a parameter is shorthand for `<T: Summary>`. Use the long form when two parameters must be the same type or when you need several bounds: `T: Summary + Display`, or a `where` clause for readability.',
        'A function can return `impl Trait` to hide the concrete type, but it must be a single type; returning a `Tweet` in one branch and an `Article` in another does not compile (use `Box<dyn Trait>`, chapter 18).',
        '`#[derive(...)]` generates trait implementations for common traits: `Debug`, `Clone`, `Copy`, `PartialEq`, `Eq`, `PartialOrd`, `Ord`, `Hash`, `Default`.'
      ]},
      { code: R`use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}

fn main() {
    Pair::new(3, 9).cmp_display();
}`, out: "The largest member is y = 9" },
      { p: 'The second `impl` block gives `cmp_display` only to pairs whose element type can be printed and compared. This is called a blanket or conditional implementation, and the standard library uses it everywhere (`ToString` for anything that is `Display`).' }
    ]},
    { h: 'Lifetimes', b: [
      { p: 'Every reference has a lifetime: the stretch of code where it is valid. Most of the time the compiler infers it. When a function takes references and returns one, it cannot tell which input the result borrows from, so you say so with an annotation.' },
      { code: R`fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    println!("{}", longest("abcd", "xyz"));
}`, err: "error[E0106]: missing lifetime specifier\n --> src/main.rs:1:33\n  |\n1 | fn longest(x: &str, y: &str) -> &str {\n  |               ----     ----     ^ expected named lifetime parameter\n  |\n  = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `x` or `y`\nhelp: consider introducing a named lifetime parameter\n  |\n1 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n  |           ++++     ++          ++          ++" },
      { p: 'The annotation `\'a` is a name for "some region". Writing `longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str` says: the result is valid only as long as both inputs are. It does not change any lifetime; it describes the relationship so the caller can be checked.' },
      { code: R`fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
        println!("{result}");
    }
}`, out: "long string is long" },
      { p: 'Move the `println!` out of the inner block and the program stops compiling, because `result` might borrow from `string2`, which is gone. The Lifetime annotations lab shows exactly this. Structs that hold references need annotations too:' },
      { code: R`struct Excerpt<'a> {
    part: &'a str,
}

impl<'a> Excerpt<'a> {
    fn level(&self) -> i32 {
        3
    }

    fn announce(&self, announcement: &str) -> &str {
        println!("Attention: {announcement}");
        self.part
    }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first = novel.split('.').next().unwrap();
    let e = Excerpt { part: first };
    println!("{} {}", e.level(), e.announce("hi"));
}`, out: "Attention: hi\n3 Call me Ishmael" },
      { h: 'Elision rules' },
      { p: 'You rarely write lifetimes because three rules fill them in. 1) Each reference parameter gets its own lifetime. 2) If there is exactly one input lifetime, it goes to all outputs. 3) If one input is `&self` or `&mut self`, its lifetime goes to all outputs. If the rules cannot decide, as with `longest`, you annotate.' },
      { p: '`\'static` means the reference may live for the whole program. String literals are `&\'static str` because they are baked into the binary. If an error message suggests `\'static`, think twice: it usually means the real problem is a dangling reference.' }
    ]}
  ],
  recap: [
    'Generics are compiled per concrete type: no runtime cost.',
    'Trait bounds say what a generic type must be able to do. Without the bound, you cannot use the capability.',
    'Traits have default methods; you can implement your trait for any type, or any trait for your type, but not a foreign trait for a foreign type.',
    'A lifetime annotation describes how input and output borrows relate. It never extends a lifetime.',
    'Elision handles most cases; annotate when the compiler cannot choose the source of an output reference.'
  ]
};
})();
