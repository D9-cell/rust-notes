window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['06'] = {
  lede: 'An enum says "a value is exactly one of these shapes", and each shape can carry its own data. With `match`, the compiler then proves you handled every shape. This replaces null, error codes and half of what inheritance is used for.',
  sections: [
    { h: 'Defining enums', b: [
      { p: 'A struct says "this AND this". An enum says "this OR that". Each variant can hold different data, so you do not need a base class and a pile of subclasses to model alternatives.' },
      { code: R`#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

impl Message {
    fn describe(&self) -> String {
        match self {
            Message::Quit => String::from("quit"),
            Message::Move { x, y } => format!("move to {x},{y}"),
            Message::Write(text) => format!("write {text:?}"),
            Message::ChangeColor(r, g, b) => format!("color {r},{g},{b}"),
        }
    }
}

fn main() {
    let msgs = [
        Message::Quit,
        Message::Move { x: 3, y: -1 },
        Message::Write(String::from("hi")),
        Message::ChangeColor(0, 160, 255),
    ];
    for m in &msgs {
        println!("{}", m.describe());
    }
}`, out: "quit\nmove to 3,-1\nwrite \"hi\"\ncolor 0,160,255" },
      { p: 'Variants are namespaced under the enum (`Message::Quit`). The four variants above would need four separate structs if you wrote them that way, and a function taking "any of them" would need a trait. As an enum they are one type, and the size of the enum is the size of its largest variant plus a tag.' }
    ]},
    { h: 'Option instead of null', b: [
      { p: 'Tony Hoare called null his billion-dollar mistake: any reference might secretly be null, so any use might crash. Rust has no null. A value that might be absent is wrapped in the standard enum `Option<T>`:' },
      { code: R`enum Option<T> {
    None,
    Some(T),
}`, file: 'std (simplified)', skip: true },
      { p: 'An `Option<i32>` is a different type from an `i32`, so you cannot use it as a number until you handle the `None` case. The compiler makes the "might be missing" check unavoidable, and everywhere a type is not `Option`, you know it is present.' },
      { code: R`fn main() {
    let x: i8 = 5;
    let y: Option<i8> = Some(5);
    let sum = x + y;
    println!("{sum}");
}`, err: "error[E0277]: cannot add `Option<i8>` to `i8`\n   --> src/main.rs:4:17\n    |\n  4 |     let sum = x + y;\n    |                 ^ no implementation for `i8 + Option<i8>`\n    |\n    = help: the trait `Add<Option<i8>>` is not implemented for `i8`" },
      { p: 'See the Option vs null lab for the step-by-step picture. The usual ways to get the value out are `match`, `if let`, and helper methods:' },
      { table: [
        ['Method', 'Does'],
        ['`unwrap_or(d)`', 'The value, or the default `d`.'],
        ['`map(f)`', 'Apply `f` to the inside if `Some`, else stay `None`.'],
        ['`and_then(f)`', 'Chain a step that itself returns an `Option`.'],
        ['`ok_or(e)`', 'Turn into a `Result`, using `e` as the error for `None`.'],
        ['`unwrap()` / `expect()`', 'The value, or panic. Fine in tests and prototypes.']
      ]}
    ]},
    { h: 'match', b: [
      { p: '`match` compares a value against patterns top to bottom and runs the first arm that fits. Each arm is `pattern => expression`. Patterns can bind parts of the value to names, which is how you read data out of a variant.' },
      { code: R`#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
}

enum Coin {
    Penny,
    Nickel,
    Quarter(UsState),
}

fn value_in_cents(coin: &Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Quarter(state) => {
            println!("quarter from {state:?}");
            25
        }
    }
}

fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

fn main() {
    println!("{}", value_in_cents(&Coin::Penny));
    println!("{}", value_in_cents(&Coin::Quarter(UsState::Alaska)));
    println!("{:?} {:?}", plus_one(Some(5)), plus_one(None));
}`, out: "1\nquarter from Alaska\n25\nSome(6) None" },
      { note: 'Matches are exhaustive. Forget a variant and the code does not compile. Add a variant to the enum later and every `match` that lacks a catch-all stops compiling, which is exactly how you find every place that needs updating.', kind: 'key' },
      { code: R`fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    }
}

fn main() {
    println!("{:?}", plus_one(Some(1)));
}`, err: "error[E0004]: non-exhaustive patterns: `None` not covered\n   --> src/main.rs:2:11\n    |\n  2 |     match x {\n    |           ^ pattern `None` not covered\n    |\nnote: `Option<i32>` defined here\n   --> library/core/src/option.rs:598:1\n    |\n598 | pub enum Option<T> {\n    | ^^^^^^^^^^^^^^^^^^\n...\n602 |     None,\n    |     ---- not covered\n    = note: the matched value is of type `Option<i32>`\nhelp: ensure that all possible cases are being handled by adding a match arm with a wildcard pattern or an explicit pattern as shown\n    |\n  3 ~         Some(i) => Some(i + 1),\n  4 ~         None => todo!(),\n    |" },
      { p: 'For "everything else" use a name (`other => ...`) when you need the value, or `_` when you do not. Put it last, since arms are tried in order.' },
      { code: R`fn main() {
    for roll in [3, 7, 9] {
        match roll {
            3 => println!("three"),
            7 => println!("seven"),
            other => println!("{other} is something else"),
        }
    }
}`, out: "three\nseven\n9 is something else" }
    ]},
    { h: 'if let and let else', b: [
      { p: 'When you care about one pattern and want to ignore the rest, `if let` is a `match` with the boilerplate removed. The cost is that you lose the exhaustiveness check.' },
      { code: R`fn main() {
    let config_max = Some(3u8);

    if let Some(max) = config_max {
        println!("The maximum is {max}");
    }

    let words = ["apple", "", "cherry"];
    for w in words {
        let Some(first) = w.chars().next() else {
            println!("empty word");
            continue;
        };
        println!("starts with {first}");
    }
}`, out: "The maximum is 3\nstarts with a\nempty word\nstarts with c" },
      { p: '`let ... else` binds on success and must diverge (`return`, `continue`, `break`, `panic!`) on failure. It keeps the happy path flat instead of nesting it inside an `if let`.' }
    ]}
  ],
  recap: [
    'An enum value is exactly one variant, and each variant can carry different data.',
    'There is no null. `Option<T>` makes absence a type you must handle before using the value.',
    '`match` is exhaustive. Adding a variant breaks every match that needs updating, on purpose.',
    'Use `_` or a named catch-all for the rest; use `if let` when only one case matters; use `let ... else` for early exit.'
  ]
};
})();
