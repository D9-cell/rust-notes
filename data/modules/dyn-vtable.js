RUSTLAB.modules['dyn-vtable'] = {
  id: 'dyn-vtable',
  chapter: 18,
  title: 'Trait objects',
  headline: 'How Box<dyn Draw> finds the right method at runtime',
  intro: 'A Vec<Box<dyn Draw>> holds different types in one list. Each element is a fat pointer: one address for the data and one for a table of that type\'s methods, the vtable. Calling draw() follows the second pointer. That is dynamic dispatch, and it explains why some traits cannot be used this way.',
  play: {
    intro: 'Two components of different types, one common interface.',
    code: [
      'let items: Vec<Box<dyn Draw>> = vec![',
      '    Box::new(Button { label: "OK" }),',
      '    Box::new(Label { text: "Hi" }),',
      '];',
      'for c in &items {',
      '    c.draw();',
      '}'
    ],
    steps: [
      { line: 2, note: 'The Button lives on the heap. The box on the stack stores two pointers: the data, and the vtable for Button.',
        stack: [{ id: 'i0', label: 'items[0]: Box<dyn Draw>', fields: [['data', '→ h1'], ['vtable', '→ v1']], status: 'new' }],
        heap: [{ id: 'h1', label: 'Button', text: 'label: "OK"' }, { id: 'v1', label: 'vtable for Button', text: 'drop · size · draw → Button::draw' }] },
      { line: 3, note: 'The Label is a different type with a different size, but the box is the same two-pointer shape, so both fit in one Vec.',
        stack: [{ id: 'i0', label: 'items[0]: Box<dyn Draw>', fields: [['data', '→ h1'], ['vtable', '→ v1']] }, { id: 'i1', label: 'items[1]: Box<dyn Draw>', fields: [['data', '→ h2'], ['vtable', '→ v2']], status: 'new' }],
        heap: [{ id: 'h1', label: 'Button', text: 'label: "OK"' }, { id: 'v1', label: 'vtable for Button', text: 'drop · size · draw → Button::draw' }, { id: 'h2', label: 'Label', text: 'text: "Hi"' }, { id: 'v2', label: 'vtable for Label', text: 'drop · size · draw → Label::draw' }] },
      { line: 6, note: 'c.draw() reads the vtable pointer, finds the draw slot, and calls whatever function is there, passing the data pointer. On items[0] that is Button::draw; on items[1], Label::draw.',
        stack: [{ id: 'i0', label: 'items[0]: Box<dyn Draw>', fields: [['data', '→ h1'], ['vtable', '→ v1']] }, { id: 'i1', label: 'items[1]: Box<dyn Draw>', fields: [['data', '→ h2'], ['vtable', '→ v2']] }],
        heap: [{ id: 'h1', label: 'Button', text: 'label: "OK"' }, { id: 'v1', label: 'vtable for Button', text: 'drop · size · draw → Button::draw', status: 'new' }, { id: 'h2', label: 'Label', text: 'text: "Hi"' }, { id: 'v2', label: 'vtable for Label', text: 'drop · size · draw → Label::draw' }],
        out: ['[ OK ]', 'Hi'], verdict: { kind: 'ok', text: 'One extra pointer hop per call. In exchange, the list can hold any type that implements Draw, including types added by other crates.' } }
    ]
  },
  breakIt: {
    label: 'a trait method that returns Self',
    intro: 'Add fn bigger(&self) -> Self to the trait and then try to box it as dyn. The compiler cannot build the table.',
    code: [
      'trait Shape {',
      '    fn bigger(&self) -> Self;',
      '}',
      'let v: Vec<Box<dyn Shape>> = vec![Box::new(Sq)];'
    ],
    steps: [
      { line: 2, note: 'bigger returns Self: whatever concrete type implements the trait. For Sq that is Sq; for Circle that is Circle, a different size.',
        stack: [], heap: [{ id: 'v1', label: 'vtable slot for bigger', text: 'returns ??? bytes' }] },
      { line: 4, note: 'Behind dyn Shape the concrete type is erased. The caller would not know how many bytes the result occupies, so there is no valid slot to put in the table.',
        stack: [{ id: 'i0', label: 'items[0]: Box<dyn Shape>', fields: [['data', '→ h1'], ['vtable', '→ v1']] }], heap: [{ id: 'h1', label: 'Sq', text: '(data)' }, { id: 'v1', label: 'vtable for Shape', text: 'bigger → return type unknown', status: 'freed' }],
        verdict: { kind: 'error', text: 'error[E0038]: the trait `Shape` is not dyn compatible' } }
    ],
    lesson: 'Methods that return Self, or that have their own generic type parameters, need the concrete type at the call site. Such traits work with generics (T: Shape) but not with dyn Shape.'
  },
  whyNot: {
    question: 'Why not generics, or an enum, or inheritance?',
    rows: [
      ['Generics (T: Draw)', 'Resolved at compile time, inlined, fastest.', 'A Vec<T> holds one type. Cannot mix Button and Label in one list.'],
      ['An enum of every type', 'No pointers, fully exhaustive match.', 'Closed set: adding a type means editing the enum and every match. Fine when you control all the types.'],
      ['Class inheritance (Java, C++)', 'A virtual call through a vtable, the same mechanism.', 'Brings the parent\'s fields and tangled hierarchy with it. Rust passes only behaviour.'],
      ['Rust dyn Trait', 'Open set of types, one box shape, one pointer hop per call.', 'Not every trait qualifies, and the compiler cannot inline across the call.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98.',
    text: "error[E0038]: the trait `Shape` is not dyn compatible\n  --> src/main.rs:14:24\n   |\n14 |     let v: Vec<Box<dyn Shape>> = vec![Box::new(Sq)];\n   |                        ^^^^^ `Shape` is not dyn compatible\n   |\nnote: for a trait to be dyn compatible it needs to allow building a vtable\n      for more information, visit <https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility>\n  --> src/main.rs:2:25\n   |\n 1 | trait Shape {\n   |       ----- this trait is not dyn compatible...\n 2 |     fn bigger(&self) -> Self;\n   |                         ^^^^ ...because method `bigger` references the `Self` type in its return type\n   = help: consider moving `bigger` to another trait\n   = help: only type `Sq` implements `Shape`; consider using it directly instead.",
    decode: [
      ['the trait `Shape` is not dyn compatible', 'Rust\'s current name for "object safe". It cannot be turned into a trait object.'],
      ['for a trait to be dyn compatible it needs to allow building a vtable', 'The reason in plain words: there must be a fixed-size slot for each method.'],
      ['method `bigger` references the `Self` type in its return type', 'The exact offender. Remove it, return a Box<dyn Shape> instead, or add where Self: Sized to opt that one method out.']
    ]
  },
  tryIt: 'Write a trait Animal { fn name(&self) -> String; fn speak(&self) -> String; } with Dog, Cat and Cow structs. Put one of each in a Vec<Box<dyn Animal>> and loop over it. Then add a new method fn clone_me(&self) -> Self and read the error.'
};
