window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['18'] = {
  lede: 'Is Rust object-oriented? It has objects (data plus methods) and encapsulation, but no inheritance. Behaviour is shared through traits, and values of different types are used together through trait objects.',
  sections: [
    { h: 'What Rust has and does not have', b: [
      { table: [
        ['OOP feature', 'In Rust'],
        ['Objects', 'Yes: structs and enums with `impl` blocks.'],
        ['Encapsulation', 'Yes: private fields, `pub` methods.'],
        ['Polymorphism', 'Yes: generics with trait bounds (static), trait objects (dynamic).'],
        ['Inheritance', 'No. You cannot inherit fields. Reuse code with default trait methods, composition, or generics.']
      ]},
      { p: 'Inheritance is dropped partly because it shares more than intended: a subclass gets every parent method, even ones that no longer make sense. Trait default methods share only what the trait declares.' },
      { code: R`pub struct AveragedCollection {
    list: Vec<i32>,
    average: f64,
}

impl AveragedCollection {
    pub fn new() -> Self {
        Self { list: Vec::new(), average: 0.0 }
    }

    pub fn add(&mut self, value: i32) {
        self.list.push(value);
        self.update_average();
    }

    pub fn average(&self) -> f64 {
        self.average
    }

    fn update_average(&mut self) {
        let total: i32 = self.list.iter().sum();
        self.average = total as f64 / self.list.len() as f64;
    }
}

fn main() {
    let mut c = AveragedCollection::new();
    c.add(2);
    c.add(4);
    println!("{}", c.average());
}`, out: "3" },
      { p: 'Because `list` and `average` are private, no outside code can add to the list without the average being updated. Encapsulation is what lets the implementation change later.' }
    ]},
    { h: 'Trait objects: dyn Trait', b: [
      { p: 'A generic `Vec<T>` holds one type. To hold a mix of types that share behaviour (buttons, labels and sliders, all drawable) use a trait object: `Box<dyn Draw>`. It is a fat pointer holding two addresses, one to the data and one to a table of that type\'s methods (the **vtable**). The right method is looked up at runtime, called dynamic dispatch. The Trait object lab shows the table.' },
      { code: R`trait Draw {
    fn draw(&self) -> String;
}

struct Button {
    label: String,
}

struct SelectBox {
    options: Vec<String>,
}

impl Draw for Button {
    fn draw(&self) -> String {
        format!("[ {} ]", self.label)
    }
}

impl Draw for SelectBox {
    fn draw(&self) -> String {
        format!("< {} >", self.options.join(" | "))
    }
}

struct Screen {
    components: Vec<Box<dyn Draw>>,
}

impl Screen {
    fn run(&self) {
        for c in &self.components {
            println!("{}", c.draw());
        }
    }
}

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox { options: vec!["yes".into(), "no".into()] }),
            Box::new(Button { label: "OK".into() }),
        ],
    };
    screen.run();
}`, out: "< yes | no >\n[ OK ]" },
      { table: [
        ['', 'Generics (`T: Draw`)', 'Trait objects (`dyn Draw`)'],
        ['Dispatch', 'Static: resolved at compile time.', 'Dynamic: one vtable lookup per call.'],
        ['Speed', 'Inlinable, fastest.', 'Small indirect-call cost.'],
        ['Collections', 'One concrete type per collection.', 'Mixed types in one collection.'],
        ['Binary size', 'A copy per type (monomorphization).', 'One copy.']
      ]},
      { p: 'Not every trait can be made into an object. It must be **dyn compatible**: methods cannot return `Self` and cannot have generic type parameters, because the concrete type is unknown at the call site.' },
      { code: R`trait Cloner {
    fn duplicate(&self) -> Self;
}

struct A;

impl Cloner for A {
    fn duplicate(&self) -> Self {
        A
    }
}

fn main() {
    let items: Vec<Box<dyn Cloner>> = vec![Box::new(A)];
    println!("{}", items.len());
}`, err: "error[E0038]: the trait `Cloner` is not dyn compatible\n  --> src/main.rs:14:28\n   |\n14 |     let items: Vec<Box<dyn Cloner>> = vec![Box::new(A)];\n   |                            ^^^^^^ `Cloner` is not dyn compatible\n   |\nnote: for a trait to be dyn compatible it needs to allow building a vtable\n      for more information, visit <https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility>\n  --> src/main.rs:2:28\n   |\n 1 | trait Cloner {\n   |       ------ this trait is not dyn compatible...\n 2 |     fn duplicate(&self) -> Self;\n   |                            ^^^^ ...because method `duplicate` references the `Self` type in its return type\n   = help: consider moving `duplicate` to another trait\n   = help: only type `A` implements `Cloner`; consider using it directly instead." }
    ]},
    { h: 'The state pattern, the Rust way', b: [
      { p: 'The book implements a blog post that moves from draft to review to published, first with the classic object-oriented state pattern (a `Box<dyn State>` that swaps itself), then in a more Rust style: encode the state in the type, so invalid transitions do not compile.' },
      { code: R`pub struct Post {
    content: String,
}

pub struct DraftPost {
    content: String,
}

pub struct PendingReviewPost {
    content: String,
}

impl Post {
    pub fn new() -> DraftPost {
        DraftPost { content: String::new() }
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

impl DraftPost {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn request_review(self) -> PendingReviewPost {
        PendingReviewPost { content: self.content }
    }
}

impl PendingReviewPost {
    pub fn approve(self) -> Post {
        Post { content: self.content }
    }
}

fn main() {
    let mut post = Post::new();
    post.add_text("I ate a salad for lunch today");
    let post = post.request_review();
    let post = post.approve();
    println!("{}", post.content());
}`, out: "I ate a salad for lunch today" },
      { p: '`request_review(self)` consumes the draft, so the old state cannot be reused. There is no way to call `content()` on an unreviewed post: the method simply does not exist on that type. This is the idea of making illegal states unrepresentable, and it is the Rust answer to "what do I use instead of inheritance and state objects".' }
    ]}
  ],
  recap: [
    'Rust has encapsulation and polymorphism but no inheritance.',
    '`dyn Trait` gives runtime polymorphism through a vtable; generics give compile-time polymorphism.',
    'Trait objects require dyn-compatible traits (no `Self` returns, no generic methods).',
    'Encode state transitions in types by consuming `self`, so invalid sequences do not compile.'
  ]
};
})();
