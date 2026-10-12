window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['12'] = {
  lede: 'minigrep is a small version of the `grep` command and the book\'s first real program: arguments, files, errors, tests and environment variables. The lessons here are about structure more than syntax.',
  sections: [
    { h: 'Read the arguments and the file', b: [
      { p: '`std::env::args()` gives an iterator over the command-line arguments; the first one is the program name. Collect it to a vector and index. `fs::read_to_string` reads a file into a `String`.' },
      { code: R`use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("usage: minigrep <query> <file>");
        return;
    }
    let query = &args[1];
    let path = &args[2];
    let text = fs::read_to_string(path).expect("could not read file");
    for line in text.lines() {
        if line.contains(query.as_str()) {
            println!("{line}");
        }
    }
}`, file: 'src/main.rs', skip: true },
      { p: 'It works, but `main` now does four jobs: parse arguments, read, search, print. Errors crash with `expect`. The rest of the chapter separates these.' }
    ]},
    { h: 'The structure that every CLI ends up with', b: [
      { list: [
        '`main.rs` only wires things up: read arguments, build a `Config`, call `run`, and on error print to stderr (`eprintln!`) and exit with a non-zero code.',
        '`lib.rs` holds the logic as plain functions, so it can be unit-tested without a terminal.',
        'Errors are `Result` values passed to `main`; only `main` decides to exit.'
      ]},
      { code: R`use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }
        Ok(Config {
            query: args[1].clone(),
            file_path: args[2].clone(),
            ignore_case: std::env::var("IGNORE_CASE").is_ok(),
        })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(&config.file_path)?;
    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };
    for line in results {
        println!("{line}");
    }
    Ok(())
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();
    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }
    results
}

pub fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();
    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }
    results
}`, file: 'src/lib.rs', skip: true },
      { code: R`use std::{env, process};
use minigrep::Config;

fn main() {
    let args: Vec<String> = env::args().collect();
    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });
    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}`, file: 'src/main.rs', skip: true },
      { p: 'The lifetime `\'a` on `search` is the one from chapter 10 in action: the returned lines are slices of `contents`, not of `query`, and the signature says so.' }
    ]},
    { h: 'Test first', b: [
      { code: R`#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "Rust:\nsafe, fast, productive.\nPick three.";
        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "Rust:\nTrust me.\nsafe";
        assert_eq!(vec!["Rust:", "Trust me."], search_case_insensitive(query, contents));
    }
}`, file: 'src/lib.rs (tests)', skip: true },
      { p: 'Write the failing test, then the function. A search function with no terminal in it is easy to test.' },
      { h: 'stdout vs stderr' },
      { p: 'Use `println!` for results and `eprintln!` for errors. When a user runs `minigrep a b > out.txt`, the output file gets the results and the errors still show on the screen. Mixing them is a common beginner mistake.' }
    ]}
  ],
  recap: [
    'Split binary and library: `main.rs` wires, `lib.rs` holds testable logic.',
    '`main` is the only place that exits; everything else returns `Result`.',
    'Write results to stdout, errors to stderr.',
    'Environment variables (`env::var`) are the simplest toggle for options like case-insensitivity.'
  ]
};
})();
