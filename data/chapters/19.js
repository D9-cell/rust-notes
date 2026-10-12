window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['19'] = {
  lede: 'Patterns are a mini-language for taking values apart. You already used them in `match`, `let` and `if let`. This chapter catalogues where they can appear and every shape they can take.',
  sections: [
    { h: 'Where patterns appear', b: [
      { table: [
        ['Place', 'Example', 'Must be irrefutable?'],
        ['`match` arms', '`Some(x) => ...`', 'No (arms may fail), but all together must be exhaustive.'],
        ['`if let` / `while let`', '`if let Some(x) = opt`', 'No.'],
        ['`let`', '`let (a, b) = pair;`', 'Yes.'],
        ['`for` loops', '`for (i, v) in it.enumerate()`', 'Yes.'],
        ['Function parameters', '`fn f(&(x, y): &(i32, i32))`', 'Yes.']
      ]},
      { p: 'An **irrefutable** pattern always matches (`x`, `(a, b)`). A **refutable** pattern might not (`Some(x)`). Places that cannot handle failure only accept irrefutable ones, and using a refutable one is an error:' },
      { code: R`fn main() {
    let some_option_value: Option<i32> = Some(3);
    let Some(x) = some_option_value;
    println!("{x}");
}`, err: "error[E0005]: refutable pattern in local binding\n --> src/main.rs:3:9\n  |\n3 |     let Some(x) = some_option_value;\n  |         ^^^^^^^ pattern `None` not covered\n  |\n  = note: `let` bindings require an \"irrefutable pattern\", like a `struct` or an `enum` with only one variant\n  = note: for more information, visit https://doc.rust-lang.org/book/ch19-02-refutability.html\n  = note: the matched value is of type `Option<i32>`\nhelp: you might want to use `let...else` to handle the variant that isn't matched\n  |\n3 |     let Some(x) = some_option_value else { todo!() };\n  |                                     ++++++++++++++++" },
      { code: R`fn main() {
    let mut stack = vec![1, 2, 3];
    while let Some(top) = stack.pop() {
        println!("{top}");
    }
}`, out: "3\n2\n1" }
    ]},
    { h: 'The pattern syntax, in one program', b: [
      { code: R`#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

enum Msg {
    Hello { id: i32 },
}

fn main() {
    let x = 1;
    match x {
        1 | 2 => println!("one or two"),
        3..=5 => println!("three to five"),
        _ => println!("anything"),
    }

    let c = 'k';
    match c {
        'a'..='j' => println!("early ASCII"),
        'k'..='z' => println!("late ASCII"),
        _ => println!("other"),
    }

    let p = Point { x: 0, y: 7 };
    match p {
        Point { x, y: 0 } => println!("on the x axis at {x}"),
        Point { x: 0, y } => println!("on the y axis at {y}"),
        Point { x, y } => println!("elsewhere {x},{y}"),
    }

    let num = Some(4);
    match num {
        Some(n) if n % 2 == 0 => println!("{n} is even"),
        Some(n) => println!("{n} is odd"),
        None => (),
    }

    let msg = Msg::Hello { id: 5 };
    match msg {
        Msg::Hello { id: id_var @ 3..=7 } => println!("id in range: {id_var}"),
        Msg::Hello { id: 10..=12 } => println!("another range"),
        Msg::Hello { id } => println!("other id {id}"),
    }

    let numbers = (2, 4, 8, 16, 32);
    match numbers {
        (first, .., last) => println!("{first} {last}"),
    }
}`, out: "one or two\nlate ASCII\non the y axis at 7\n4 is even\nid in range: 5\n2 32" },
      { list: [
        '`|` means or. `1..=5` is an inclusive range (numbers and chars only).',
        'A struct pattern can name fields, test some, and bind others. `Point { x, .. }` ignores the rest.',
        'A **match guard** (`if cond`) adds a boolean test the pattern cannot express. The compiler cannot see through a guard, so it does not count toward exhaustiveness.',
        '`name @ pattern` tests a value against a pattern while also binding it to a name.',
        '`_` ignores one value, `..` ignores the rest of a tuple, struct, or slice, and `_name` binds but silences the unused warning.'
      ]},
      { h: 'Binding modes and slices' },
      { code: R`fn main() {
    let robot = Some(String::from("robo"));
    if let Some(ref name) = robot {
        println!("borrowed {name}");
    }
    println!("still mine: {robot:?}");

    let list = [10, 20, 30, 40];
    match list {
        [first, .., last] => println!("{first}..{last}"),
    }
    match &list[..] {
        [] => println!("empty"),
        [one] => println!("one: {one}"),
        [head, rest @ ..] => println!("head {head}, rest {rest:?}"),
    }
}`, out: "borrowed robo\nstill mine: Some(\"robo\")\n10..40\nhead 10, rest [20, 30, 40]" },
      { p: 'Matching on a reference (`&robot` or a field of one) binds by reference automatically ("default binding modes"), so you often do not need `ref` anymore.' }
    ]}
  ],
  recap: [
    'Patterns appear in `match`, `if let`, `while let`, `let`, `for` and function parameters.',
    'Irrefutable patterns always match; `let` and `for` require them.',
    'Ranges, `|`, struct and tuple destructuring, `..`, guards and `@` cover nearly every need.',
    'Guards are not checked for exhaustiveness; a trailing catch-all keeps `match` complete.'
  ]
};
})();
