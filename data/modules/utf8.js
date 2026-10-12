RUSTLAB.modules['utf8'] = {
  id: 'utf8',
  chapter: 8,
  title: 'Strings are UTF-8',
  headline: 'Why you cannot write s[0] on a String',
  intro: 'A Rust string is a block of bytes that is always valid UTF-8. A character can take one to four bytes, so a position in bytes is not a position in characters. Rust refuses to pretend otherwise.',
  play: {
    intro: 'Same text, three views: bytes, characters, and a byte-range slice.',
    code: [
      'fn main() {',
      '    let s = String::from("héllo");',
      '    println!("{}", s.len());',
      '    println!("{}", s.chars().count());',
      '    println!("{}", &s[0..1]);',
      '}'
    ],
    steps: [
      { line: 2, note: 'The text is five characters, but é takes two bytes (c3 a9). The heap block holds six bytes.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '6'], ['cap', '6']], status: 'new' }], heap: [{ id: 'h1', label: 'bytes', text: '68 | c3 a9 | 6c | 6c | 6f' }] },
      { line: 3, note: 'len() counts bytes, not characters: 6.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '6'], ['cap', '6']] }], heap: [{ id: 'h1', label: 'bytes', text: '68 | c3 a9 | 6c | 6c | 6f' }], out: ['6'] },
      { line: 4, note: 'chars() decodes the bytes into characters, walking from the start. The result is 5. Finding the 3rd character means scanning, so there is no O(1) indexing.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '6'], ['cap', '6']] }], heap: [{ id: 'h1', label: 'bytes', text: 'h | é | l | l | o' }], out: ['6', '5'] },
      { line: 5, note: 'A range 0..1 is bytes 0 and up to (not including) 1: the single byte 68, which is a whole character, h. It is fine because both ends sit on character boundaries.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '6'], ['cap', '6']] }, { id: 'sl', label: '&s[0..1]', fields: [['ptr', '→ h1'], ['len', '1']], status: 'new' }], heap: [{ id: 'h1', label: 'bytes', text: '68 | c3 a9 | 6c | 6c | 6f' }], out: ['6', '5', 'h'],
        verdict: { kind: 'ok', text: 'Byte ranges are allowed when they start and end on character boundaries.' } }
    ]
  },
  breakIt: {
    label: 'slice through the middle of a character',
    intro: 'Cut after byte 2, which is halfway through the two-byte é.',
    code: [
      'fn main() {',
      '    let s = String::from("héllo");',
      '    println!("{}", &s[0..2]);',
      '}'
    ],
    steps: [
      { line: 2, note: 'Bytes: 68 c3 a9 6c 6c 6f. Byte 1 and byte 2 together form é.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '6'], ['cap', '6']], status: 'new' }], heap: [{ id: 'h1', label: 'bytes', text: '68 | c3 a9 | 6c | 6c | 6f' }] },
      { line: 3, note: 'The slice would end after c3 and before a9: half a character. That is not valid UTF-8, so Rust panics instead of handing you broken text.',
        stack: [{ id: 's', label: 's', fields: [['ptr', '→ h1'], ['len', '6'], ['cap', '6']] }], heap: [{ id: 'h1', label: 'bytes', text: '68 | c3 | a9 | 6c | 6c | 6f' }],
        verdict: { kind: 'bug', text: 'thread \'main\' panicked: end byte index 2 is not a char boundary; it is inside \'é\' (bytes 1..3 of string)' } }
    ],
    lesson: 'Because slicing by bytes can panic at runtime, prefer methods that work on characters or substrings: chars(), split, find, trim, strip_prefix. Use is_char_boundary(i) when you must cut by index.'
  },
  whyNot: {
    question: 'Why not make s[i] return the i-th character?',
    rows: [
      ['Store every char as 4 bytes (UTF-32)', 'Indexing is O(1) and exact.', 'Four times the memory for ASCII text, and "character" still is not what users see (accents, emoji sequences).'],
      ['Index by byte, return a byte', 'Fast.', 'Returns half a character for any non-ASCII text, a silent bug.'],
      ['Index by character, scan each time', 'Always meaningful.', 'Hides an O(n) loop behind something that looks like O(1).'],
      ['Java / JavaScript (UTF-16)', 'charAt(i) is O(1).', 'Returns half a character for emoji and other characters outside the basic range.'],
      ['Rust', 'No integer indexing. Choose .bytes(), .chars(), or a checked byte range.', 'You say which one you mean. Grapheme clusters need an external crate.']
    ]
  },
  error: {
    intro: 'Exact output from rustc 1.98 for s[0] on a String, trimmed to the first part. The message links back to the book chapter.',
    text: "error[E0277]: the type `str` cannot be indexed by `{integer}`\n   --> src/main.rs:3:15\n    |\n  3 |     let h = s[0];\n    |               ^ string indices are ranges of `usize`\n    |\n    = help: the trait `SliceIndex<str>` is not implemented for `{integer}`\n    = note: you can use `.chars().nth()` or `.bytes().nth()`\n            for more information, see chapter 8 in The Book: <https://doc.rust-lang.org/book/ch08-02-strings.html#indexing-into-strings>",
    decode: [
      ['the type `str` cannot be indexed by `{integer}`', 'There is no Index<integer> for strings, by design.'],
      ['string indices are ranges of `usize`', 'A range such as s[0..1] is allowed; a single position is not.'],
      ['you can use `.chars().nth()` or `.bytes().nth()`', 'The honest alternatives: nth character (a scan) or nth byte.']
    ]
  },
  tryIt: 'Take the string "नमस्ते". Print its len() and chars().count(). Collect chars into a Vec<char> and print it. Then write a function that returns the first character of a &str as Option<char> using chars().next(), and test it on "" and on "éa".'
};
