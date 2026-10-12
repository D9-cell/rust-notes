window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['02'] = {
  lede: 'The book builds a number-guessing game to show a dozen ideas at once. This chapter walks through it piece by piece so each idea has a name before the later chapters explain it properly.',
  sections: [
    { h: 'Reading input', b: [
      { p: 'Programs start with variables. In Rust a variable is immutable unless you say otherwise, and a `String` is a growable piece of text that you own.' },
      { code: R`use std::io;

fn main() {
    println!("Guess the number!");
    let mut guess = String::new();
    io::stdin().read_line(&mut guess).expect("Failed to read line");
    println!("You guessed: {guess}");
}`, file: 'src/main.rs', skip: true },
      { list: [
        '`let mut guess` makes a mutable variable. Without `mut` you could not append the input to it.',
        '`String::new()` calls an associated function (like a static method) that returns an empty string.',
        '`&mut guess` lends `read_line` a mutable reference so it can fill your string without taking ownership. References are the topic of chapter 4.',
        '`read_line` returns a `Result`: either `Ok` or `Err`. `.expect("...")` crashes with your message on `Err`. If you ignore the `Result` the compiler warns you. Chapter 9 covers it.',
        '`{guess}` inside a format string prints the variable with that name. For an expression use `{}` and pass it after: `println!("{}", a + b)`.'
      ]}
    ]},
    { h: 'A secret number and a dependency', b: [
      { p: 'The standard library has no random numbers. You add the `rand` crate with Cargo, which downloads it from crates.io and records the exact version in `Cargo.lock` so every build is reproducible.' },
      { code: R`cargo add rand`, file: 'terminal', skip: true },
      { code: R`use rand::Rng;

fn main() {
    let secret_number = rand::rng().random_range(1..=100);
    println!("The secret number is: {secret_number}");
}`, file: 'src/main.rs', skip: true },
      { p: '`1..=100` is an inclusive range. `use rand::Rng` brings the `Rng` trait into scope; the `random_range` method only exists if the trait is imported. Traits are chapter 10.' }
    ]},
    { h: 'Comparing with match', b: [
      { p: '`cmp` compares two values and returns an `Ordering`, an enum with the variants `Less`, `Greater` and `Equal`. `match` takes one value and runs the first arm whose pattern fits. The compiler checks you covered every case.' },
      { code: R`use std::cmp::Ordering;

fn main() {
    let secret = 42;
    let guess = 30;
    match guess.cmp(&secret) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}`, file: 'src/main.rs', out: "Too small!" },
      { p: 'The input is a `String` but `secret` is a number, and Rust refuses to compare different types. You must convert, and you can reuse the name by shadowing:' },
      { code: R`fn main() {
    let guess = String::from("42\n");
    let guess: u32 = guess.trim().parse().expect("Please type a number!");
    println!("{}", guess + 1);
}`, file: 'src/main.rs', out: "43" },
      { p: 'Shadowing (`let guess` twice) makes a new variable with the same name, so you do not need `guess_str` and `guess_num`. `trim` removes the newline Enter adds. `parse` needs to know the target type, which the `: u32` annotation provides.' }
    ]},
    { h: 'Looping and handling bad input', b: [
      { p: '`loop` repeats forever until `break`. To survive input like `abc`, replace `expect` with a `match` on the `Result`, and `continue` to ask again.' },
      { code: R`fn parse_guess(text: &str) -> Option<u32> {
    match text.trim().parse() {
        Ok(num) => Some(num),
        Err(_) => None,
    }
}

fn main() {
    for input in ["50", "abc", " 7 "] {
        match parse_guess(input) {
            Some(n) => println!("number: {n}"),
            None => println!("not a number: {input:?}"),
        }
    }
}`, file: 'src/main.rs', out: "number: 50\nnot a number: \"abc\"\nnumber: 7" },
      { p: 'The `_` in `Err(_)` is a catch-all pattern that ignores the error value. Splitting `parse_guess` out of `main` is also the first step toward testable code, which is what the project for this chapter makes you practice.' }
    ]}
  ],
  recap: [
    'Variables are immutable by default; add `mut` to change them.',
    '`&mut x` lends something for mutation without giving it away.',
    '`Result` and `Option` are enums you handle with `match`; `match` must cover every case.',
    'Shadowing re-uses a name with a new value or type. `parse` needs a type to parse into.',
    'Dependencies come from `cargo add`; `Cargo.lock` pins versions.'
  ]
};
})();
