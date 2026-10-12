window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['03'] = {
  lede: 'Variables, types, functions, comments and control flow. Most of this reads like any other language; the notes below only slow down at the places where Rust differs.',
  sections: [
    { h: 'Variables, mutability, constants, shadowing', b: [
      { p: 'A `let` binding cannot be reassigned unless you write `let mut`. Immutability by default makes it obvious which values can change, which also helps the compiler reason about borrowing later.' },
      { code: R`fn main() {
    let x = 5;
    x = 6;
    println!("{x}");
}`, err: "error[E0384]: cannot assign twice to immutable variable `x`\n --> src/main.rs:3:5\n  |\n2 |     let x = 5;\n  |         - first assignment to `x`\n3 |     x = 6;\n  |     ^^^^^ cannot assign twice to immutable variable\n  |\nhelp: consider making this binding mutable\n  |\n2 |     let mut x = 5;\n  |         +++" },
      { p: 'Constants use `const`, need an explicit type, can never be `mut`, and must be computed at compile time. By convention they are `SCREAMING_SNAKE_CASE`.' },
      { code: R`const SECONDS_IN_HOUR: u32 = 60 * 60;

fn main() {
    println!("{SECONDS_IN_HOUR}");
}`, out: "3600" },
      { p: 'Shadowing declares a new variable with the same name. It differs from `mut` in two ways: it can change the type, and the new value is still immutable afterwards.' },
      { code: R`fn main() {
    let spaces = "   ";
    let spaces = spaces.len();
    println!("{spaces}");
}`, out: "3" }
    ]},
    { h: 'Scalar types', b: [
      { p: 'Rust is statically typed and infers most types, but numbers need to know their size. Integer types are `i8 i16 i32 i64 i128 isize` (signed) and `u8 u16 u32 u64 u128 usize` (unsigned). `isize` and `usize` match the pointer width, and `usize` is what you use for indexes and lengths. The default integer is `i32`, the default float is `f64`.' },
      { table: [
        ['Type', 'Notes'],
        ['integers', 'Literals can use `_` (`1_000_000`), prefixes `0x 0o 0b`, byte literal `b\'A\'`, and type suffixes (`57u8`).'],
        ['`f32`, `f64`', 'IEEE-754 floats. `f64` is the default.'],
        ['`bool`', '`true` or `false`, one byte.'],
        ['`char`', 'A Unicode scalar value, four bytes, written with single quotes: `\'z\'`, `\'😻\'`.']
      ]},
      { note: 'Integer overflow panics in a debug build and wraps silently in a release build. When you mean wrapping, say so: `wrapping_add`, `checked_add` (returns `Option`), `saturating_add`, `overflowing_add`.', kind: 'warn' },
      { code: R`fn main() {
    let a: u8 = 250;
    println!("{:?}", a.checked_add(10));
    println!("{}", a.wrapping_add(10));
    println!("{}", a.saturating_add(10));
    println!("{}", 7 / 2);
    println!("{}", -7 % 3);
    println!("{}", 7.0 / 2.0);
}`, out: "None\n4\n255\n3\n-1\n3.5" }
    ]},
    { h: 'Compound types: tuples and arrays', b: [
      { p: 'A tuple groups values of different types and has a fixed length. Read fields by destructuring or by index (`t.0`). The empty tuple `()` is called unit and is what functions return when they return nothing.' },
      { p: 'An array has a fixed length known at compile time and holds one type. It lives on the stack. For a growable list use `Vec`, covered in chapter 8.' },
      { code: R`fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    let (x, y, z) = tup;
    println!("{x} {y} {z} {}", tup.0);

    let a = [1, 2, 3, 4, 5];
    let zeros = [0; 3];
    println!("{} {:?} {}", a[0], zeros, a.len());
}`, out: "500 6.4 1 500\n1 [0, 0, 0] 5" },
      { p: 'Indexing past the end is checked at runtime. Rust panics instead of reading memory that is not yours, which is the bug that causes buffer overflows in C.' },
      { code: R`fn main() {
    let a = [1, 2, 3];
    let i = a.len() + 2;
    println!("{}", a[i]);
}`, panic: "thread 'main' panicked at src/main.rs:4:20:\nindex out of bounds: the len is 3 but the index is 5" }
    ]},
    { h: 'Functions', b: [
      { p: 'Functions use `snake_case`, and every parameter needs a type. The return type goes after `->`. The most important idea in this section: Rust is expression-based.' },
      { list: [
        'A **statement** performs an action and returns nothing, such as `let y = 6;`.',
        'An **expression** evaluates to a value. A block `{ ... }` is an expression whose value is its last line, if that line has no semicolon.',
        'Adding a `;` to the last line turns it into a statement, so the function returns `()` instead and the compiler complains.'
      ]},
      { code: R`fn plus_one(x: i32) -> i32 {
    x + 1
}

fn main() {
    let y = {
        let x = 3;
        x + 1
    };
    println!("{y} {}", plus_one(5));
}`, out: "4 6" },
      { code: R`fn plus_one(x: i32) -> i32 {
    x + 1;
}

fn main() {
    println!("{}", plus_one(5));
}`, err: "error[E0308]: mismatched types\n --> src/main.rs:1:24\n  |\n1 | fn plus_one(x: i32) -> i32 {\n  |    --------            ^^^ expected `i32`, found `()`\n  |    |\n  |    implicitly returns `()` as its body has no tail or `return` expression\n2 |     x + 1;\n  |          - help: remove this semicolon to return this value" },
      { p: 'You can still use `return` for an early exit; the last-expression style is just the usual way to finish.' }
    ]},
    { h: 'Comments', b: [
      { p: '`//` starts a comment that runs to the end of the line. Doc comments use `///` before an item and become HTML documentation with `cargo doc`. Rust has no `/* */` convention in common use, though it exists.' }
    ]},
    { h: 'Control flow', b: [
      { p: '`if` conditions must be a `bool`. There is no truthiness: `if number {}` with an integer is a compile error. Because `if` is an expression, it can sit on the right of a `let`, as long as every branch produces the same type.' },
      { code: R`fn main() {
    let n = 7;
    let size = if n < 10 { "small" } else { "large" };
    println!("{size}");
}`, out: "small" },
      { p: 'There are three loops. `loop` runs until `break`, and `break value` returns a value from it. `while` runs on a condition. `for` iterates over anything iterable and is the one you should reach for, because it cannot go out of bounds the way a manual index can.' },
      { code: R`fn main() {
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;
        }
    };
    println!("{result}");

    for n in (1..4).rev() {
        println!("{n}!");
    }

    'outer: for i in 0..3 {
        for j in 0..3 {
            if i * j == 2 {
                break 'outer;
            }
            println!("{i},{j}");
        }
    }
}`, out: "20\n3!\n2!\n1!\n0,0\n0,1\n0,2\n1,0\n1,1" },
      { p: 'A label such as `\'outer` lets `break` or `continue` target an outer loop.' }
    ]}
  ],
  recap: [
    '`let` is immutable; `mut` opts in to change. Shadowing makes a new variable and may change the type.',
    'Integer overflow panics in debug and wraps in release; use `checked_*`, `wrapping_*` or `saturating_*` to say what you mean.',
    'Array indexing is bounds-checked at runtime.',
    'The last expression without a semicolon is the return value. Add a `;` and it becomes `()`.',
    '`if` is an expression and needs a `bool`. Prefer `for` over index-based `while`.'
  ]
};
})();
