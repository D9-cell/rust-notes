window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.roadmap = [
  { id: '01', n: '01', t: 'Getting Started', d: 'Install, Hello World, Cargo basics.', tags: ['read'] },
  { id: '02', n: '02', t: 'Programming a Guessing Game', d: 'The book’s first project. Do it by hand, then extend it with a try counter and a loss state.', tags: ['read', 'build'], project: 'ch02-guessing' },
  { id: '03', n: '03', t: 'Common Programming Concepts', d: 'Variables, mutability, types, functions, control flow.', tags: ['read'] },
  { id: '04', n: '04', t: 'Understanding Ownership', d: 'Move semantics, borrowing, references, slices. The chapter that breaks most learners on text alone.', tags: ['read', 'vis', 'build'], labs: ['stack-heap', 'move', 'borrow', 'dangling', 'slice', 'drop-order'], project: 'ch04-drill' },
  { id: '05', n: '05', t: 'Using Structs', d: 'Struct syntax, methods, associated functions.', tags: ['read', 'build'], project: 'ch05-rectangle' },
  { id: '06', n: '06', t: 'Enums and Pattern Matching', d: 'Option, match, if let. Build a small state machine.', tags: ['read', 'vis', 'build'], labs: ['option-match'], project: 'ch06-machine' },
  { id: '07', n: '07', t: 'Packages, Crates, Modules', d: 'Project layout and visibility rules.', tags: ['read'] },
  { id: '08', n: '08', t: 'Common Collections', d: 'Vec, String, HashMap. Build a word-frequency counter.', tags: ['read', 'vis', 'build'], labs: ['vec-growth', 'utf8'], project: 'ch08-wordfreq' },
  { id: '09', n: '09', t: 'Error Handling', d: 'panic!, Result, the ? operator.', tags: ['read', 'vis', 'build'], labs: ['question-mark'], project: 'ch09-parser' },
  { id: '10', n: '10', t: 'Generics, Traits, Lifetimes', d: 'Generic functions, trait bounds, lifetime annotations. The second hardest chapter.', tags: ['read', 'vis', 'build'], labs: ['lifetimes'], project: 'ch10-generics' },
  { id: '11', n: '11', t: 'Writing Automated Tests', d: '#[test], assert!, cargo test, unit vs integration.', tags: ['read', 'build'], project: 'ch11-tests' },
  { id: '12', n: '12', t: 'An I/O Project: minigrep', d: 'The book’s CLI project, plus a --count and a line-number flag.', tags: ['read', 'build'], project: 'ch12-minigrep' },
  { id: '13', n: '13', t: 'Iterators and Closures', d: 'Closures capture, iterators are lazy. Rewrite minigrep’s search.', tags: ['read', 'build'], project: 'ch13-iterators' },
  { id: '14', n: '14', t: 'More about Cargo and Crates.io', d: 'Release profiles, workspaces, publishing.', tags: ['read'] },
  { id: '15', n: '15', t: 'Smart Pointers', d: 'Box, Deref, Drop, Rc, RefCell, reference cycles.', tags: ['read', 'vis', 'build'], labs: ['rc-count', 'refcell'], project: 'ch15-tree' },
  { id: '16', n: '16', t: 'Fearless Concurrency', d: 'Threads, message passing, Mutex, Arc, Send and Sync.', tags: ['read', 'vis', 'build'], labs: ['send-sync'], project: 'ch16-parallel' },
  { id: '17', n: '17', t: 'Async and Await', d: 'Futures, async fn, executors, streams. Optional on a first pass.', tags: ['read'] },
  { id: '18', n: '18', t: 'Object-Oriented Features', d: 'Encapsulation, trait objects, the state pattern.', tags: ['read', 'vis', 'build'], labs: ['dyn-vtable'], project: 'ch18-shapes' },
  { id: '19', n: '19', t: 'Patterns and Matching', d: 'Every place a pattern can appear, and every shape one can take.', tags: ['read', 'build'], project: 'ch19-commands' },
  { id: '20', n: '20', t: 'Advanced Features', d: 'Unsafe, advanced traits and types, function pointers, macros.', tags: ['read', 'build'], project: 'ch20-macros' },
  { id: '21', n: '21', t: 'Final Project: Multithreaded Web Server', d: 'Ties ownership, traits, smart pointers and threads into one build.', tags: ['read', 'build'], project: 'ch21-server' }
];
