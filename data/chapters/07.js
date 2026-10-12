window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['07'] = {
  lede: 'Rust\'s module system controls two things: how code is organised into files, and what is visible to whom. The vocabulary is unfamiliar at first but the rules are few. Everything is private by default.',
  sections: [
    { h: 'The vocabulary', b: [
      { table: [
        ['Term', 'Meaning'],
        ['package', 'What Cargo builds: a `Cargo.toml` and one or more crates. Holds at most one library crate and any number of binary crates.'],
        ['crate', 'A compilation unit. Either a binary (has `main`) or a library. `src/main.rs` and `src/lib.rs` are the crate roots.'],
        ['module', 'A named scope inside a crate that groups items and controls privacy.'],
        ['path', 'The name that identifies an item, like `crate::garden::vegetables::Asparagus`.']
      ]},
      { p: 'The compiler starts at the crate root and follows `mod` declarations to find the rest of the code. Nothing is picked up automatically just because a file exists. If you create `src/garden.rs` and never write `mod garden;`, it is not part of the program.' }
    ]},
    { h: 'Modules and visibility', b: [
      { p: 'A module is declared with `mod name { ... }`. Items inside are private to that module, but code can always see items in its own ancestors. Mark an item `pub` to expose it to the outside. Making a module `pub` does not make its contents `pub`; each item needs its own marker.' },
      { code: R`mod kitchen {
    pub struct Breakfast {
        pub toast: String,
        seasonal_fruit: String,
    }

    impl Breakfast {
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }

        pub fn fruit(&self) -> &str {
            &self.seasonal_fruit
        }
    }

    pub mod prep {
        pub fn chop() -> &'static str {
            super::wash()
        }
    }

    fn wash() -> &'static str {
        "washed, then chopped"
    }
}

fn main() {
    let mut meal = kitchen::Breakfast::summer("Rye");
    meal.toast = String::from("Wheat");
    println!("{} with {}", meal.toast, meal.fruit());
    println!("{}", kitchen::prep::chop());
}`, out: "Wheat with peaches\nwashed, then chopped" },
      { list: [
        'Paths can be **absolute** (`crate::kitchen::prep::chop`) or **relative** (`kitchen::prep::chop`, `self::...`, `super::...`).',
        '`super::` goes to the parent module, like `..` in a file path.',
        'A `pub struct` with a private field cannot be built from outside with literal syntax. It needs a public constructor, which is how a type keeps its invariants.',
        'A `pub enum` makes all its variants public, because an enum with hidden variants is not useful.'
      ]},
      { code: R`mod kitchen {
    pub struct Breakfast {
        pub toast: String,
        seasonal_fruit: String,
    }
}

fn main() {
    let b = kitchen::Breakfast {
        toast: String::from("Rye"),
        seasonal_fruit: String::from("peaches"),
    };
    println!("{}", b.toast);
}`, err: "error[E0451]: field `seasonal_fruit` of struct `Breakfast` is private\n  --> src/main.rs:11:9\n   |\n 9 |     let b = kitchen::Breakfast {\n   |             ------------------ in this type\n10 |         toast: String::from(\"Rye\"),\n11 |         seasonal_fruit: String::from(\"peaches\"),\n   |         ^^^^^^^^^^^^^^ private field" }
    ]},
    { h: 'use, as, and re-exporting', b: [
      { p: '`use` brings a path into scope so you do not repeat it. Idiom: import the parent module for functions (`use crate::kitchen::prep;` then `prep::chop()`) so the origin stays visible, and import the item itself for structs, enums and traits.' },
      { code: R`mod shapes {
    pub mod round {
        pub fn describe() -> &'static str { "round" }
    }
    pub mod flat {
        pub fn describe() -> &'static str { "flat" }
    }
}

use shapes::flat as boxy;
use shapes::round;
use std::collections::{HashMap, HashSet};

fn main() {
    let mut seen: HashSet<&str> = HashSet::new();
    seen.insert(round::describe());
    seen.insert(boxy::describe());
    let mut m: HashMap<&str, usize> = HashMap::new();
    m.insert("shapes", seen.len());
    println!("{:?}", m);
}`, out: "{\"shapes\": 2}" },
      { p: '`as` renames an import to avoid clashes. Nested paths (`std::collections::{HashMap, HashSet}`) shorten repeated prefixes, and `use std::io::*;` is the glob form, used mainly in tests. `pub use` re-exports an item, letting you present a tidy public API that differs from your internal layout.' }
    ]},
    { h: 'Splitting into files', b: [
      { p: 'Declare `mod garden;` in the crate root and the compiler looks for the body in `src/garden.rs` (or `src/garden/mod.rs`, the older style). A submodule `vegetables` of `garden` lives in `src/garden/vegetables.rs`. The `mod` keyword is a declaration, not an include: you write it once, in the parent.' },
      { code: R`my_project/
├── Cargo.toml
└── src/
    ├── main.rs            (mod garden;)
    ├── garden.rs          (pub mod vegetables;)
    └── garden/
        └── vegetables.rs  (pub struct Asparagus;)`, file: 'layout', skip: true },
      { note: 'Moving a module to its own file changes no paths in your code. Only the place the compiler reads it from changes.', kind: 'tip' }
    ]}
  ],
  recap: [
    'Package contains crates; a crate is a tree of modules starting at `main.rs` or `lib.rs`.',
    'Everything is private. `pub` opens one item at a time; children can see ancestors, not vice versa.',
    'Public struct fields are opt-in, so a type can protect its invariants.',
    'Use `use` to shorten paths, `as` to rename, `pub use` to reshape your API.',
    '`mod x;` in the parent finds `x.rs` or `x/mod.rs`. Files are not modules until declared.'
  ]
};
})();
