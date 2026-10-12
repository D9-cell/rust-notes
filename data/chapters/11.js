window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['11'] = {
  lede: 'The type system proves some things, tests prove the rest. Rust has testing built into the language and Cargo: no framework to install.',
  sections: [
    { h: 'Writing a test', b: [
      { p: 'A test is an ordinary function marked `#[test]`. `cargo test` builds a special binary that runs each one in its own thread, then reports which passed. A test passes when it returns and fails when it panics.' },
      { code: R`pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

pub fn greeting(name: &str) -> String {
    format!("Hello, {name}!")
}

pub fn divide(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("division by zero");
    }
    a / b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_adds() {
        assert_eq!(add(2, 2), 4);
    }

    #[test]
    fn greeting_contains_name() {
        let result = greeting("Carol");
        assert!(result.contains("Carol"), "greeting did not contain name, it was {result}");
    }

    #[test]
    #[should_panic(expected = "division by zero")]
    fn dividing_by_zero_panics() {
        divide(1, 0);
    }

    #[test]
    fn works_with_result() -> Result<(), String> {
        if add(2, 2) == 4 {
            Ok(())
        } else {
            Err(String::from("two plus two does not equal four"))
        }
    }
}`, file: 'src/lib.rs', skip: true },
      { list: [
        '`assert!(cond)`, `assert_eq!(left, right)` and `assert_ne!` are the workhorses. `assert_eq!` prints both values on failure; the types need `Debug` and `PartialEq`. Add your own message as extra arguments.',
        '`#[should_panic(expected = "...")]` passes only if the code panics and the message contains the text.',
        'A test may return `Result<(), E>` so you can use `?` inside it.',
        '`#[cfg(test)]` compiles the `tests` module only under `cargo test`, so tests add nothing to the release binary.'
      ]}
    ]},
    { h: 'Controlling cargo test', b: [
      { table: [
        ['Command', 'Effect'],
        ['`cargo test name`', 'Run tests whose name contains `name`.'],
        ['`cargo test -- --test-threads=1`', 'Run serially, for tests that share a resource.'],
        ['`cargo test -- --nocapture`', 'Show `println!` output of passing tests as well.'],
        ['`cargo test -- --ignored`', 'Run tests marked `#[ignore]` (slow ones).'],
        ['`cargo test -p crate-name`', 'Run for one crate in a workspace.']
      ]},
      { p: 'Tests run in parallel threads by default, so tests must not depend on shared state or order. Output from passing tests is hidden; failing tests show what they printed.' }
    ]},
    { h: 'Unit tests vs integration tests', b: [
      { table: [
        ['', 'Unit tests', 'Integration tests'],
        ['Location', 'In the same file as the code, inside `mod tests`.', 'Files in a top-level `tests/` directory.'],
        ['Can see', 'Private functions too, via `use super::*`.', 'Only the public API, like a user of your crate.'],
        ['Purpose', 'One piece in isolation.', 'Several pieces working together.']
      ]},
      { p: 'Each file in `tests/` is compiled as its own crate. Shared helper code goes in `tests/common/mod.rs` (the subdirectory form keeps it from being treated as a test file). A binary-only crate (just `main.rs`) cannot be imported by `tests/`, which is why the usual structure is a thin `main.rs` that calls into `lib.rs`: the library is testable.' },
      { code: R`use adder::add;

#[test]
fn it_adds_two() {
    assert_eq!(add(2, 2), 4);
}`, file: 'tests/integration_test.rs', skip: true },
      { note: 'Doc tests: code blocks inside `///` comments are compiled and run by `cargo test`, so your documentation examples cannot go stale.', kind: 'tip' }
    ]}
  ],
  recap: [
    'A test is a function with `#[test]` that passes unless it panics.',
    'Use `assert_eq!` for values, `should_panic` for expected panics, `Result` return for `?`.',
    'Unit tests sit beside code and can test private functions; integration tests live in `tests/` and use the public API.',
    'Put logic in `lib.rs` so it can be tested; keep `main.rs` thin.'
  ]
};
})();
