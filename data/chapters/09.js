window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['09'] = {
  lede: 'Rust has no exceptions. Failures that can be recovered from are values of type `Result`, and failures that mean a bug call `panic!`. The `?` operator makes propagating errors as short as an exception would be, without hiding them.',
  sections: [
    { h: 'Two kinds of failure', b: [
      { table: [
        ['', 'panic!', 'Result<T, E>'],
        ['Meaning', 'A bug or an impossible state.', 'An expected failure: bad input, missing file, timeout.'],
        ['What happens', 'Unwinds the stack and ends the thread (or the program, in `main`).', 'The caller receives an `Err` value and decides.'],
        ['Use for', 'Violated invariants, tests, quick prototypes.', 'Anything the caller could reasonably handle.']
      ]},
      { p: 'The compiler cannot see a `panic!` in a function signature, but it can see a `Result`. That is the point: recoverable errors are part of the type, so a caller cannot forget they exist.' },
      { code: R`fn main() {
    let v = vec![1, 2, 3];
    let i = v.len() + 7;
    println!("{}", v[i]);
}`, panic: "thread 'main' panicked at src/main.rs:4:21:\nindex out of bounds: the len is 3 but the index is 10" }
    ]},
    { h: 'Result', b: [
      { code: R`enum Result<T, E> {
    Ok(T),
    Err(E),
}`, file: 'std (simplified)', skip: true },
      { p: 'Opening a file can fail in many ways. The way to react differently to each is `match` on the error kind.' },
      { code: R`use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let result = File::open("definitely-missing.txt");
    match result {
        Ok(_) => println!("opened"),
        Err(e) => match e.kind() {
            ErrorKind::NotFound => println!("file not found"),
            other => println!("other problem: {other:?}"),
        },
    }
}`, out: "file not found" },
      { p: 'Shortcuts when you do not want to handle the error: `unwrap()` panics with a generic message, and `expect("why")` panics with your message. Use `expect` and say what you assumed, as a note to the future you reading the crash report.' },
      { code: R`fn main() {
    let n: i32 = "twelve".parse().expect("config value must be a number");
    println!("{n}");
}`, panic: "thread 'main' panicked at src/main.rs:2:35:\nconfig value must be a number: ParseIntError { kind: InvalidDigit }" }
    ]},
    { h: 'Propagating errors with ?', b: [
      { p: 'Instead of handling an error where it happens, a function can return it to its caller. The `?` operator after a `Result` does a `match` for you: on `Ok` it gives you the value, on `Err` it returns early from the whole function with that error. It also converts the error with `From::from`, so different error types can merge into one.' },
      { code: R`use std::fs;
use std::io;
use std::num::ParseIntError;

#[derive(Debug)]
enum ConfigError {
    Io(io::Error),
    BadNumber(ParseIntError),
}

impl From<io::Error> for ConfigError {
    fn from(e: io::Error) -> Self {
        ConfigError::Io(e)
    }
}

impl From<ParseIntError> for ConfigError {
    fn from(e: ParseIntError) -> Self {
        ConfigError::BadNumber(e)
    }
}

fn read_port(path: &str) -> Result<u16, ConfigError> {
    let text = fs::read_to_string(path)?;
    let port = text.trim().parse::<u16>()?;
    Ok(port)
}

fn main() {
    println!("{:?}", read_port("no-such-file"));
    println!("{:?}", "99999".parse::<u16>().map_err(ConfigError::from));
}`, out: "Err(Io(Os { code: 2, kind: NotFound, message: \"No such file or directory\" }))\nErr(BadNumber(ParseIntError { kind: PosOverflow }))" },
      { p: 'Each `?` is a possible early return, visible on the page but costing one character. The Result and ? lab traces the two paths through the same function. A few rules:' },
      { list: [
        '`?` works in a function that returns `Result` (or `Option`). In plain `main()` it is a compile error.',
        '`main` itself may return `Result<(), E>`; an `Err` makes the process exit with a non-zero code and print the error with `Debug`.',
        'On `Option`, `?` returns `None` early. You cannot mix the two in one function without converting (`ok_or`).',
        'Quick option for apps: `Box<dyn Error>` as the error type accepts anything with `?`. Libraries should define an enum like above so callers can match on it.'
      ]},
      { code: R`fn main() {
    let n: i32 = "12".parse()?;
    println!("{n}");
}`, err: "error[E0277]: the `?` operator can only be used in a function that returns `Result` or `Option` (or another type that implements `FromResidual`)\n --> src/main.rs:2:30\n  |\n1 | fn main() {\n  | --------- this function should return `Result` or `Option` to accept `?`\n2 |     let n: i32 = \"12\".parse()?;\n  |                              ^ cannot use the `?` operator in a function that returns `()`\n  |\nhelp: consider adding return type\n  |\n1 ~ fn main() -> Result<(), Box<dyn std::error::Error>> {\n2 |     let n: i32 = \"12\".parse()?;\n3 |     println!(\"{n}\");\n4 +     Ok(())\n  |" },
      { code: R`use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let n: i32 = "12".parse()?;
    println!("{}", n + 1);
    let bad: i32 = "x".parse()?;
    println!("{bad}");
    Ok(())
}`, out: "13\n\n[exit 1]" }
    ]},
    { h: 'When to panic vs return Result', b: [
      { list: [
        'Panic when continuing could be unsafe or would hide a bug: broken invariant, index you proved is in range, example and test code.',
        'Return `Result` when failure is a normal outcome you expect the caller to handle, even if only to print it.',
        'If a value must satisfy a rule (a guess between 1 and 100), make the rule a type. A `Guess::new` that rejects bad input means every function that takes a `Guess` is spared re-checking.'
      ]},
      { code: R`pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if !(1..=100).contains(&value) {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }
        Guess { value }
    }

    pub fn value(&self) -> i32 {
        self.value
    }
}

fn main() {
    let g = Guess::new(42);
    println!("{}", g.value());
    let _bad = Guess::new(500);
}`, panic: "thread 'main' panicked at src/main.rs:8:13:\nGuess value must be between 1 and 100, got 500." }
    ]}
  ],
  recap: [
    'Recoverable failure is a `Result` value; unrecoverable failure is `panic!`.',
    '`?` unwraps `Ok` or returns the `Err` early, converting it with `From`.',
    '`expect("why")` documents the assumption you are making when it panics.',
    'Libraries return typed errors; applications can use `Box<dyn Error>`.',
    'Encode rules in types (`Guess`) so validation happens once.'
  ]
};
})();
