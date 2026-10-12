window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['08'] = {
  lede: 'Collections hold many values on the heap, so they can grow and shrink while the program runs. Three cover most needs: `Vec<T>`, `String` and `HashMap<K, V>`. Each one has a surprise that comes from ownership.',
  sections: [
    { h: 'Vec<T>', b: [
      { p: 'A vector stores values of one type next to each other in memory. It is a stack struct of pointer, length and capacity, pointing at a heap buffer, exactly like `String` (which is in fact a `Vec<u8>` underneath).' },
      { code: R`fn main() {
    let mut v: Vec<i32> = Vec::new();
    v.push(5);
    v.push(6);
    let w = vec![1, 2, 3];

    let third: &i32 = &w[2];
    println!("third is {third}");

    match w.get(10) {
        Some(x) => println!("tenth is {x}"),
        None => println!("no tenth element"),
    }

    for x in &mut v {
        *x += 50;
    }
    println!("{v:?}");
}`, out: "third is 3\nno tenth element\n[55, 56]" },
      { list: [
        '`&w[2]` panics if the index is out of range. `w.get(2)` returns an `Option` instead. Use `[]` when a bad index is a bug, `get` when it is an expected case.',
        'To change elements while looping, iterate over `&mut v` and use `*x` to write through the reference.',
        'To store different types in one vector, use an enum whose variants are those types.'
      ]},
      { h: 'Why you cannot push while holding a reference' },
      { p: 'Growing a vector may move its whole buffer to a new, bigger allocation. A reference to the first element would then point at freed memory. The borrow checker sees this coming:' },
      { code: R`fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    let first = &v[0];
    v.push(6);
    println!("The first element is: {first}");
}`, err: "error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable\n --> src/main.rs:4:5\n  |\n3 |     let first = &v[0];\n  |                  - immutable borrow occurs here\n4 |     v.push(6);\n  |     ^^^^^^^^^ mutable borrow occurs here\n5 |     println!(\"The first element is: {first}\");\n  |                                      ----- immutable borrow later used here" },
      { p: 'The Vec growth lab shows capacity doubling and the old buffer being freed, which is what the error is protecting you from. If you know the final size, `Vec::with_capacity(n)` allocates once up front.' },
      { code: R`fn main() {
    let mut v: Vec<i32> = Vec::new();
    let mut last_cap = v.capacity();
    println!("len 0 cap {last_cap}");
    for i in 1..=20 {
        v.push(i);
        if v.capacity() != last_cap {
            last_cap = v.capacity();
            println!("len {} cap {}", v.len(), last_cap);
        }
    }
}`, out: "len 0 cap 0\nlen 1 cap 4\nlen 5 cap 8\nlen 9 cap 16\nlen 17 cap 32" },
      { note: 'The exact growth sequence is an implementation detail and may differ between Rust versions; the shape (geometric growth, so pushes are cheap on average) is the guarantee.', kind: 'tip' }
    ]},
    { h: 'String and UTF-8', b: [
      { p: 'Two string types confuse newcomers. `&str` is a borrowed slice of UTF-8 text (literals are `&\'static str`). `String` is an owned, growable buffer of UTF-8 text. Both are always valid UTF-8, never "one byte per char".' },
      { code: R`fn main() {
    let mut s = String::from("foo");
    s.push_str("bar");
    s.push('!');
    let a = String::from("tic");
    let b = String::from("tac");
    let c = a + "-" + &b;
    println!("{s} {c}");
    println!("{}", format!("{b}-{b}-{b}"));
}`, out: "foobar! tic-tac\ntac-tac-tac" },
      { p: '`a + "-"` takes ownership of `a` (the `+` operator is a method taking `self`) and reuses its buffer. That is why `a` is gone afterwards but `b` is only borrowed. For anything more than two pieces, `format!` is clearer and does not move.' },
      { h: 'You cannot index a String' },
      { code: R`fn main() {
    let s = String::from("hello");
    let h = s[0];
    println!("{h}");
}`, err: "error[E0277]: the type `str` cannot be indexed by `{integer}`\n   --> src/main.rs:3:15\n    |\n  3 |     let h = s[0];\n    |               ^ string indices are ranges of `usize`\n    |\n    = help: the trait `SliceIndex<str>` is not implemented for `{integer}`\n    = note: you can use `.chars().nth()` or `.bytes().nth()`\n            for more information, see chapter 8 in The Book: <https://doc.rust-lang.org/book/ch08-02-strings.html#indexing-into-strings>" },
      { p: 'Indexing would promise O(1) and a meaningful result, and UTF-8 breaks both. A character can take 1 to 4 bytes, so byte 0 is not necessarily a whole character and finding the n-th character means scanning. Rust offers three honest views of the same data:' },
      { code: R`fn main() {
    let word = "नमस्ते";
    println!("bytes: {}", word.len());
    println!("chars: {}", word.chars().count());
    println!("{:?}", word.chars().collect::<Vec<char>>());
    println!("{:?}", &word[0..3]);
    let s = "héllo";
    println!("{}", s.len());
    println!("{:?}", s.char_indices().nth(2));
}`, out: "bytes: 18\nchars: 6\n['न', 'म', 'स', '\\u{94d}', 'त', '\\u{947}']\n\"न\"\n6\nSome((3, 'l'))" },
      { p: 'Slicing by byte range works only if both ends fall on character boundaries; otherwise it panics at runtime. The UTF-8 lab shows the bytes of a Devanagari word being cut mid-character. Real "what the user sees" characters are grapheme clusters, which need an external crate (`unicode-segmentation`).' }
    ]},
    { h: 'HashMap<K, V>', b: [
      { p: 'A hash map stores key-value pairs and looks values up by key in about constant time. Keys must be hashable and comparable; the default hasher is SipHash, which resists denial-of-service attacks at some speed cost. Ownership matters: inserting a `String` key or value moves it into the map. Types with `Copy` are copied.' },
      { code: R`use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    let blue = scores.get("Blue").copied().unwrap_or(0);
    println!("{blue}");

    scores.insert(String::from("Blue"), 25);
    scores.entry(String::from("Red")).or_insert(5);
    scores.entry(String::from("Blue")).or_insert(99);

    let mut pairs: Vec<_> = scores.iter().collect();
    pairs.sort();
    println!("{pairs:?}");
}`, out: "10\n[(\"Blue\", 25), (\"Red\", 5), (\"Yellow\", 50)]" },
      { p: '`entry` is the key idiom. It looks at a key once and lets you act on whether it is present. `or_insert` returns a mutable reference to the value, which is how you update in place:' },
      { code: R`use std::collections::HashMap;

fn main() {
    let text = "hello world wonderful world";
    let mut map = HashMap::new();
    for word in text.split_whitespace() {
        let count = map.entry(word).or_insert(0);
        *count += 1;
    }
    let mut counts: Vec<_> = map.into_iter().collect();
    counts.sort();
    println!("{counts:?}");
}`, out: "[(\"hello\", 1), (\"wonderful\", 1), (\"world\", 2)]" },
      { note: 'Iteration order of a `HashMap` is unspecified and can change between runs. Sort the output if you need a stable order, or use `BTreeMap`, which keeps keys sorted.', kind: 'warn' }
    ]}
  ],
  recap: [
    '`Vec` grows by reallocating, so holding a reference across `push` is rejected by the compiler.',
    '`v[i]` panics on a bad index; `v.get(i)` returns `Option`.',
    '`String` is UTF-8 bytes. No integer indexing; use `.chars()`, `.bytes()` or a range on character boundaries.',
    '`+` on strings moves the left side; use `format!` for several pieces.',
    '`HashMap` moves owned keys and values in. `entry().or_insert()` is the way to update.'
  ]
};
})();
