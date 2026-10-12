window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.projects = [
  {
    id: 'ch02-guessing', ch: '02', title: 'Guessing game, extended',
    drills: 'Reading stdin, parsing, match on an enum, a loop with a counter.',
    what: 'A number-guessing game split into testable logic (Game) and a thin main.rs that talks to the terminal. It adds what the book leaves out: a try limit and a loss state.',
    run: '$ cargo run -p ch02-guessing\nGuess (4 tries left): 50\nToo high\nGuess (3 tries left): abc\nPlease type a whole number\nGuess (3 tries left): 25\nToo low\n...\nGuess (1 tries left): 31\nOut of tries! The number was 33.',
    real: 'The same split (pure logic in lib.rs, I/O in main.rs) is how every well-structured Rust CLI is written, because logic you can call from a test is logic you can trust.',
    siblings: 'Hangman, a quiz game with a score, a hot/cold distance game.',
    files: 'projects/ch02-guessing/src/lib.rs (fill in the todo!s), src/main.rs (you write the loop), tests/game.rs (the spec, do not edit).',
    start: 'cd projects && cargo test -p ch02-guessing',
    labs: [],
    notes: 'main.rs needs a random secret. The book uses the rand crate. Either add it with `cargo add rand` while online, or derive a number from std::time::SystemTime to stay dependency-free. Pick one and tell me why.'
  },
  {
    id: 'ch04-drill', ch: '04', title: 'Move-or-borrow drill',
    drills: 'Reading a test and deciding the right signature: owned, shared reference, mutable reference, or Copy.',
    what: 'Five functions with no signatures given. Each test calls one the way a real caller would, and from how it is called you decide whether the parameter is T, &T or &mut T. First write your prediction in predictions.md, then the function.',
    run: '$ cargo test -p ch04-drill\nrunning 1 test\ntest first_word_accepts_a_string_and_a_literal ... ok\n...\ntest result: ok. 5 test files, all passing',
    real: 'Choosing between taking ownership and borrowing is the first decision in every Rust API you will ever design. This is the decision made fast and repeatedly.',
    siblings: 'Try writing each function the wrong way on purpose (take String where &String is needed) and read the error. That is the point.',
    files: 'projects/ch04-drill/src/lib.rs (starts empty), predictions.md (fill first), tests/t1..t5 (specs, do not edit).',
    start: 'cd projects && cargo test -p ch04-drill',
    labs: ['move', 'borrow', 'slice'],
    notes: 'The five names are length, shout, take_and_give_back, double and first_word. The unresolved import errors are the test asking you to create them.'
  },
  {
    id: 'ch05-rectangle', ch: '05', title: 'Rectangle toolkit',
    drills: 'Structs, impl blocks, methods taking &self vs associated functions with no self.',
    what: 'A Rectangle struct with new, square, area, perimeter, can_hold and is_square. The signatures are provided; the bodies are yours.',
    run: '$ cargo run -p ch05-rectangle\nrect1 = Rectangle { width: 30, height: 50 }\narea = 1500, perimeter = 160\nrect1 can hold rect2 (10x40): true\nsquare(5).is_square(): true',
    real: 'Every domain type in a real codebase (Money, Point, Invoice) is a struct with methods like these. Getting comfortable with &self now pays off in every later chapter.',
    siblings: 'Circle, Triangle, then a Shape enum that holds all of them (you will redo this in chapter 6).',
    files: 'projects/ch05-rectangle/src/lib.rs (fill in the todo!s), src/main.rs (you write it), tests/rect.rs (spec, do not edit).',
    start: 'cd projects && cargo test -p ch05-rectangle',
    labs: [],
    notes: 'Add #[derive(Debug)] output with {:#?} in main.rs and compare it to {:?}.'
  },
  {
    "id": "ch06-machine",
    "ch": "06",
    "title": "Traffic light state machine",
    "drills": "Enums with data, match, Option, impl blocks on an enum.",
    "what": "A Light enum that cycles Red, Green, Yellow, plus a Command enum (Go, Stop, Wait(n), Say(text)) with a parser from text and a function that applies commands to the light.",
    "run": "$ cargo test -p ch06-machine\ntest parses_commands_with_arguments ... ok\ntest light_cycles_through_three_states ... ok\ntest result: ok. 7 passed",
    "real": "Every protocol, UI and game loop is a state machine with commands as input. Representing the state and the commands as enums means the compiler tells you when you forget one.",
    "siblings": "A vending machine (Idle, HasMoney(cents), Dispensing), a door lock (Locked, Unlocked, Open), an order lifecycle (Placed, Paid, Shipped).",
    "files": "projects/ch06-machine/src/lib.rs (fill in the todo!s), tests/machine.rs (the spec, do not edit).",
    "start": "cd projects && cargo test -p ch06-machine",
    "labs": [
      "option-match"
    ],
    "notes": "After the tests pass, add a main.rs with a loop that reads commands from stdin and prints the light after each. Then add a new Command variant and watch which matches stop compiling."
  },
  {
    "id": "ch08-wordfreq",
    "ch": "08",
    "title": "Word frequency and text toolkit",
    "drills": "HashMap and entry, sorting, String vs &str, chars vs bytes.",
    "what": "Five small functions: count words case-insensitively, take the top n by frequency, collect initials by character, convert to Pig Latin, and compute median and mode of numbers.",
    "run": "$ cargo test -p ch08-wordfreq\ntest counts_ignore_case_and_punctuation ... ok\ntest pig_latin_handles_multibyte_first_letter ... ok\ntest result: ok. 8 passed",
    "real": "Counting by key is the most common thing a HashMap does: log analysis, histograms, inverted indexes for search. The UTF-8 tests are what real user text looks like.",
    "siblings": "Anagram grouping, a log-line level counter, a two-column CSV summariser.",
    "files": "projects/ch08-wordfreq/src/lib.rs (fill in the todo!s), tests/words.rs (spec).",
    "start": "cd projects && cargo test -p ch08-wordfreq",
    "labs": [
      "vec-growth",
      "utf8"
    ],
    "notes": "Do not call .unwrap() on a first character. If the tests with accented letters fail, you indexed by bytes. Add a main.rs that reads a file path, then prints the top 10 words."
  },
  {
    "id": "ch09-parser",
    "ch": "09",
    "title": "Config parser with real errors",
    "drills": "Result, ?, custom error enums, map_err, Option to Result.",
    "what": "Parse \"key = number\" lines into a map. Every failure is a ParseError variant carrying the line number, and parse_config uses ? so no unwrap appears anywhere.",
    "run": "$ cargo test -p ch09-parser\ntest duplicate_keys_are_an_error ... ok\ntest config_error_carries_the_right_line_number ... ok\ntest result: ok. 9 passed",
    "real": "Every config loader, CSV reader and request validator returns precise errors with a location. Users fix problems faster when the message says \"line 3\".",
    "siblings": "An INI parser with sections, a .env loader, a tiny CSV with typed columns.",
    "files": "projects/ch09-parser/src/lib.rs (fill in the todo!s; ParseError is given), tests/config.rs (spec).",
    "start": "cd projects && cargo test -p ch09-parser",
    "labs": [
      "question-mark"
    ],
    "notes": "Use ok_or and map_err to convert Option and foreign errors, and the ? operator for the rest. Then write a main.rs that returns Result<(), Box<dyn Error>>."
  },
  {
    "id": "ch10-generics",
    "ch": "10",
    "title": "Generic stats and a Stack<T>",
    "drills": "Generic functions, trait bounds, impl blocks with bounds, lifetimes.",
    "what": "Write largest<T: PartialOrd>, a Stack<T> with push, pop, peek (returning Option<&T>), and a longest_line<'a>(text: &'a str) -> &'a str that borrows from its input.",
    "run": "$ cargo run -p ch10-generics\nlargest of [3, 9, 2] = 9\nlargest of [\"pear\", \"fig\"] = pear\nstack peek = Some(3), len = 3\nlongest line = \"the quick brown fox\"",
    "real": "Collections, caches and queues in every codebase are generic containers with bounds. Lifetimes appear the first time a function returns part of its input.",
    "siblings": "A generic Queue<T>, a Pair<T> with cmp_display, a function that finds the min and max of a slice.",
    "files": "Create projects/ch10-generics (cargo new --lib), add it to the workspace members, write src/lib.rs and tests/ yourself.",
    "start": "cd projects && cargo new --lib ch10-generics",
    "labs": [
      "lifetimes"
    ],
    "notes": "Write the tests first from the sample run, then the code. Try removing the PartialOrd bound and read the error. Try returning &str from a function with two inputs and no annotation."
  },
  {
    "id": "ch11-tests",
    "ch": "11",
    "title": "Test suite for every project",
    "drills": "assert macros, should_panic, Result tests, unit vs integration.",
    "what": "Go back to ch02, ch05, ch06, ch08, ch09 and add your own tests beyond the provided ones: edge cases, a should_panic test, a test that returns Result, and one integration test in tests/.",
    "run": "$ cargo test --workspace\n...\ntest result: ok. 60+ passed; 0 failed",
    "real": "A project without tests cannot be changed safely. The habit of writing the failing test first is what lets teams refactor.",
    "siblings": "Add a doc test to every public function, add property-style tests by looping over many inputs.",
    "files": "Your existing projects/ crates: add #[cfg(test)] mod tests blocks in src/ and new files in tests/.",
    "start": "cd projects && cargo test --workspace",
    "labs": [],
    "notes": "Find at least one bug in your own earlier code by writing a test you expected to pass."
  },
  {
    "id": "ch12-minigrep",
    "ch": "12",
    "title": "minigrep with extra flags",
    "drills": "Splitting main and lib, Config, env vars, stderr vs stdout, lifetimes in search.",
    "what": "Build the book's grep clone, then add --count (print only the number of matching lines) and --line-numbers (prefix each line with its number).",
    "run": "$ cargo run -p ch12-minigrep -- safe poem.txt --line-numbers\n2: safe, fast, productive.\n$ IGNORE_CASE=1 cargo run -p ch12-minigrep -- RUST poem.txt\nRust:\nTrust me.",
    "real": "Almost all command-line tools (grep, ripgrep, fd) have this structure. ripgrep started as exactly this program.",
    "siblings": "A word-count tool (wc), a head/tail clone, a file-size lister.",
    "files": "Create projects/ch12-minigrep (cargo new), put logic in lib.rs, keep main.rs thin, unit tests in lib.rs.",
    "start": "cd projects && cargo new ch12-minigrep",
    "labs": [],
    "notes": "Return Result from run. Print errors with eprintln! and exit with code 1. Test search() with strings, never with files."
  },
  {
    "id": "ch13-iterators",
    "ch": "13",
    "title": "minigrep with iterators",
    "drills": "Closures, iterator adaptors, impl Iterator, avoiding clones.",
    "what": "Rewrite ch12's search, search_case_insensitive and Config::build as iterator chains. Config::build takes impl Iterator<Item = String> so there are no clone calls. Add a lines_matching function returning impl Iterator.",
    "run": "$ cargo test -p ch13-iterators\ntest search_is_lazy ... ok\ntest config_from_iterator ... ok",
    "real": "Iterator chains are how most Rust code processes data: lines of a log, rows of a table, nodes of a tree.",
    "siblings": "A sum-of-squares of the even numbers, a word-length histogram, a custom Fibonacci iterator.",
    "files": "Copy ch12 to projects/ch13-iterators and refactor it. Keep the tests unchanged so they prove nothing broke.",
    "start": "cd projects && cp -r ch12-minigrep ch13-iterators",
    "labs": [],
    "notes": "Do not collect into a Vec until the caller needs one. Return impl Iterator<Item = &'a str> with a lifetime."
  },
  {
    "id": "ch15-tree",
    "ch": "15",
    "title": "Linked list and shared tree",
    "drills": "Box, Rc, RefCell, Weak, Drop.",
    "what": "First a singly linked list with Box (push, pop, peek, reverse). Then a tree with Rc<RefCell<Node>> children and Weak parent links, plus a Drop impl that prints so you can see the order.",
    "run": "$ cargo run -p ch15-tree\nlist: 3 -> 2 -> 1\nreversed: 1 -> 2 -> 3\nleaf parent = Some(\"root\")\nroot strong=1 weak=1\ndropping leaf\ndropping root",
    "real": "File-system trees, DOM trees, UI widget hierarchies and graph databases all need shared nodes with back-pointers.",
    "siblings": "A doubly linked list with Rc and Weak, a binary search tree with Option<Box<Node>>, a simple graph with adjacency lists.",
    "files": "Create projects/ch15-tree (cargo new --lib) with list.rs and tree.rs modules.",
    "start": "cd projects && cargo new --lib ch15-tree",
    "labs": [
      "rc-count",
      "refcell"
    ],
    "notes": "Print Rc::strong_count and weak_count after each operation and explain every number to yourself. Make a deliberate cycle, observe that Drop never prints, then fix it with Weak."
  },
  {
    "id": "ch16-parallel",
    "ch": "16",
    "title": "Parallel word counter",
    "drills": "Threads, move closures, channels, Arc<Mutex<T>>.",
    "what": "Count words in several files in parallel. First with one thread per file sending a HashMap back over a channel. Then with a shared Arc<Mutex<HashMap>>. Compare both and time them with Instant.",
    "run": "$ cargo run --release -p ch16-parallel -- a.txt b.txt c.txt\nchannel version: 1204 words in 3 files (2.1ms)\nmutex version:   1204 words in 3 files (2.4ms)",
    "real": "Parallel log processing, web crawlers and build tools use exactly this pattern: fan work out, merge results.",
    "siblings": "Parallel prime counter, a producer-consumer pipeline with two stages, a thread pool (this becomes chapter 21).",
    "files": "Create projects/ch16-parallel (cargo new). Reuse count_words from ch08 by adding it as a path dependency.",
    "start": "cd projects && cargo new ch16-parallel",
    "labs": [
      "send-sync"
    ],
    "notes": "Try Rc in place of Arc and read the error. Hold the lock across the whole loop and observe that the threads no longer run in parallel."
  },
  {
    "id": "ch18-shapes",
    "ch": "18",
    "title": "Shapes with trait objects",
    "drills": "Traits, dyn Trait, Box, the state pattern.",
    "what": "A Shape trait with area and name, implemented by Circle, Rect and Triangle. Hold them in a Vec<Box<dyn Shape>>, print the total area and the largest. Then implement the book's Post workflow (Draft, PendingReview, Published) using types.",
    "run": "$ cargo run -p ch18-shapes\ncircle: 78.54\nrect: 24.00\ntotal area: 102.54\nlargest: circle",
    "real": "GUI toolkits, plugin systems and game entities mix different types behind one interface.",
    "siblings": "An Animal zoo, a plugin registry of Box<dyn Plugin>, a payment processor trait with several providers.",
    "files": "Create projects/ch18-shapes (cargo new --lib).",
    "start": "cd projects && cargo new --lib ch18-shapes",
    "labs": [
      "dyn-vtable"
    ],
    "notes": "Add a method returning Self to the trait and read the dyn compatibility error. Then do the same job with an enum Shape and compare the two designs."
  },
  {
    "id": "ch19-commands",
    "ch": "19",
    "title": "Command interpreter with patterns",
    "drills": "Every pattern form, guards, @ bindings, slice patterns, let else.",
    "what": "A tiny command language over a stack of integers: \"push 5\", \"add\", \"dup\", \"jump if zero 3\". Parse a line into an enum with slice patterns on split_whitespace, then execute with a match full of guards and ranges.",
    "run": "$ cargo run -p ch19-commands\n> push 2\n> push 3\n> add\n5\n> pop\nstack empty\n> frob\nunknown command: frob",
    "real": "Interpreters, protocol decoders and routing tables are pattern matches over structured input.",
    "siblings": "A calculator with operator precedence, a robot-movement DSL, an HTTP request-line router.",
    "files": "Create projects/ch19-commands (cargo new --lib).",
    "start": "cd projects && cargo new --lib ch19-commands",
    "labs": [],
    "notes": "Parse with match on a slice: match words.as_slice() { [\"push\", n] => ..., [\"add\"] => ..., _ => ... }. Use let else for the number parse."
  },
  {
    "id": "ch20-macros",
    "ch": "20",
    "title": "A macro and a safe unsafe",
    "drills": "macro_rules!, unsafe wrappers, operator overloading, newtype.",
    "what": "Write a hashmap! macro (hashmap!{\"a\" => 1, \"b\" => 2}), a Vec2 type with Add, Sub and Mul<f64>, and a safe split_at_mut-style function that wraps one small unsafe block.",
    "run": "$ cargo test -p ch20-macros\ntest hashmap_macro_builds_a_map ... ok\ntest vec2_add ... ok\ntest split_halves_do_not_overlap ... ok",
    "real": "Crates like serde, clap and tokio are mostly macros. Safe wrappers around unsafe blocks are how the standard library itself is built.",
    "siblings": "A my_assert_eq! macro, a Matrix type with Mul, a small bump allocator.",
    "files": "Create projects/ch20-macros (cargo new --lib).",
    "start": "cd projects && cargo new --lib ch20-macros",
    "labs": [],
    "notes": "Run cargo expand (cargo install cargo-expand) on your macro to see what it generates. Write the safety argument for your unsafe block as a sentence in the README."
  },
  {
    "id": "ch21-server",
    "ch": "21",
    "title": "Multithreaded web server",
    "drills": "Everything: ownership, closures, Arc, Mutex, channels, Drop.",
    "what": "The book's final project: serve hello.html from a TcpListener, add a /sleep route, then build a ThreadPool with execute and a graceful-shutdown Drop impl. Extend with a /count route that reports requests served using an Arc<AtomicUsize>.",
    "run": "$ cargo run -p ch21-server\nWorker 0 got a job; executing.\nWorker 1 got a job; executing.\n$ curl localhost:7878/count\nrequests served: 7",
    "real": "This is the skeleton of every network server. Frameworks like axum and actix add routing and async on top of the same ideas.",
    "siblings": "A chat server with broadcast over channels, a key-value store with a simple text protocol, an async rewrite using tokio.",
    "files": "Create projects/ch21-server (cargo new) with src/lib.rs for ThreadPool and src/main.rs for the server.",
    "start": "cd projects && cargo new ch21-server",
    "labs": [],
    "notes": "Test the pool with a counter instead of a browser. Check that /sleep does not block / when the pool has 4 workers. Verify that Ctrl+C or .take(2) shuts the workers down cleanly."
  }
];
