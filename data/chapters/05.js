window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['05'] = {
  lede: 'Structs bundle related data under names. Methods attach behaviour to them. Together they are how you model your own types in Rust, since there are no classes.',
  sections: [
    { h: 'Defining and creating structs', b: [
      { p: 'A struct names each field and its type. You make an instance by giving a value for every field, in any order. The whole instance is either mutable or not: Rust has no per-field `mut`.' },
      { code: R`struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}

fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}

fn main() {
    let mut user1 = build_user(String::from("a@example.com"), String::from("alice"));
    user1.email = String::from("new@example.com");

    let user2 = User {
        email: String::from("b@example.com"),
        ..user1
    };
    println!("{} {} {}", user2.username, user2.email, user2.sign_in_count);
}`, out: "alice b@example.com 1" },
      { list: [
        'When a variable has the same name as the field, write `username` instead of `username: username` (field init shorthand).',
        '`..user1` fills the remaining fields from another instance. It moves the non-`Copy` fields it uses, so `user1.username` is unusable afterwards while `user1.active` (a `bool`, `Copy`) still works.',
        'A **tuple struct** has unnamed fields: `struct Color(i32, i32, i32);`. Two tuple structs with the same shape are different types.',
        'A **unit-like struct** has no fields: `struct AlwaysEqual;`. It is useful when you only need a type to hang a trait on.'
      ]},
      { p: 'Structs should own their data (`String`, not `&str`) until you learn lifetimes in chapter 10. A struct that holds a reference needs a lifetime annotation.' }
    ]},
    { h: 'Printing a struct', b: [
      { p: 'The `{}` placeholder needs the `Display` trait, which you must implement yourself. For debugging, derive `Debug` and use `{:?}` or the multi-line `{:#?}`.' },
      { code: R`#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };
    println!("{rect:?}");
    println!("{rect:#?}");
    dbg!(&rect);
}`, out: "Rectangle { width: 30, height: 50 }\nRectangle {\n    width: 30,\n    height: 50,\n}" },
      { p: '`dbg!` prints to stderr (so the block above shows only stdout) with file and line, and returns the value, so it can wrap an expression without changing it.' }
    ]},
    { h: 'Methods', b: [
      { p: 'Methods live in an `impl` block for the type. Their first parameter is `self` in one of three forms, and the form is the whole contract with the caller:' },
      { table: [
        ['First parameter', 'Meaning', 'Typical use'],
        ['`&self`', 'Borrow the value to read it.', 'Getters, `area`, `len`.'],
        ['`&mut self`', 'Borrow it to change it.', 'Setters, `push`.'],
        ['`self`', 'Take ownership; the caller loses the value.', 'Converting into something else, builders.']
      ]},
      { code: R`#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }

    fn grow(&mut self, by: u32) {
        self.width += by;
        self.height += by;
    }
}

fn main() {
    let mut r = Rectangle { width: 30, height: 50 };
    let small = Rectangle { width: 10, height: 40 };
    println!("{} {}", r.area(), r.can_hold(&small));
    r.grow(5);
    println!("{:?}", r);
}`, out: "1500 true\nRectangle { width: 35, height: 55 }" },
      { p: 'Rust has no `->` operator. `r.area()` automatically borrows or dereferences `r` to match the method\'s `self` type (automatic referencing), so you never write `(&r).area()`.' }
    ]},
    { h: 'Associated functions', b: [
      { p: 'A function in an `impl` block without a `self` parameter is an associated function. You call it with `::`, like `String::from`. The usual job is a constructor, and by convention it is named `new`, though `new` is not a keyword.' },
      { code: R`struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn square(size: u32) -> Self {
        Self { width: size, height: size }
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let sq = Rectangle::square(3);
    println!("{}", sq.area());
}`, out: "9" },
      { p: '`Self` inside an `impl` means the type being implemented. A type can have several `impl` blocks; they are merged. This becomes useful with generics and traits in chapter 10.' }
    ]}
  ],
  recap: [
    'Fields are named and typed; the whole instance is mutable or not.',
    'Field init shorthand and `..other` struct update cut repetition. `..other` can move fields out of `other`.',
    'Derive `Debug` to print with `{:?}`; `Display` must be written by hand.',
    'Methods take `&self`, `&mut self` or `self`: read, change, or consume.',
    'No `self` means associated function, called with `Type::name()`. `Self` is the implementing type.'
  ]
};
})();
