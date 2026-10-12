window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['14'] = {
  lede: 'Cargo is more than a compiler wrapper. This chapter covers the settings and conventions that matter once a project grows past one crate or you want to share it.',
  sections: [
    { h: 'Release profiles', b: [
      { p: 'Cargo has two built-in profiles. `dev` (used by `cargo build`) favours fast compiling; `release` (`cargo build --release`) favours fast running. You can tune either in `Cargo.toml`.' },
      { code: R`[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"`, file: 'Cargo.toml', skip: true },
      { list: [
        '`opt-level` runs from 0 (none) to 3 (max). Higher means slower compiles.',
        '`lto = true` enables link-time optimization across crates: a smaller, faster binary and a longer build.',
        '`panic = "abort"` skips stack unwinding on panic, shrinking the binary.'
      ]}
    ]},
    { h: 'Documentation', b: [
      { p: 'Three slashes document the item below; `//!` documents the enclosing item (the crate or module). Markdown works, and code blocks in a `# Examples` section are compiled and run as tests by `cargo test`.' },
      { code: R`/// Adds one to the number given.
///
/// # Examples
///
/// ~~~
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// ~~~
pub fn add_one(x: i32) -> i32 {
    x + 1
}`, file: 'src/lib.rs', skip: true },
      { p: '`cargo doc --open` builds the HTML. Common sections: `# Panics`, `# Errors`, `# Safety`. Re-export with `pub use` so users see a simple path rather than your internal module tree.' }
    ]},
    { h: 'Publishing to crates.io', b: [
      { list: [
        'Create an account, then `cargo login` with your API token.',
        'Add metadata to `Cargo.toml`: a unique `name`, `description`, `license`, and a `version`.',
        '`cargo publish` uploads it. **Publishing is permanent**: a version can never be overwritten or deleted, only yanked.',
        '`cargo yank --vers 1.0.1` stops new projects from depending on a broken version without breaking existing lockfiles.',
        'Version numbers follow semantic versioning: patch for fixes, minor for compatible additions, major for breaking changes.'
      ]}
    ]},
    { h: 'Workspaces', b: [
      { p: 'A workspace is several packages that share one `Cargo.lock` and one `target/` directory. It is the way to split a growing project, and it is how this very repository organises its practice projects.' },
      { code: R`[workspace]
resolver = "3"
members = ["adder", "add_one"]`, file: 'Cargo.toml (workspace root)', skip: true },
      { code: R`[dependencies]
add_one = { path = "../add_one" }`, file: 'adder/Cargo.toml', skip: true },
      { list: [
        'Internal dependencies are declared by `path`; Cargo does not assume packages in a workspace depend on each other.',
        'A single lockfile means every member uses the same version of each external crate.',
        '`cargo run -p adder` and `cargo test -p add_one` pick a member; plain `cargo test` runs all.'
      ]}
    ]},
    { h: 'Installing tools and extending Cargo', b: [
      { p: '`cargo install ripgrep` downloads, builds and puts a binary in `~/.cargo/bin`. Any executable named `cargo-something` on your `PATH` becomes the subcommand `cargo something`. Useful ones: `cargo fmt`, `cargo clippy` (a linter with hundreds of checks), `cargo add`, `cargo tree`.' }
    ]}
  ],
  recap: [
    'Profiles trade compile time against runtime speed; measure with `--release`.',
    '`///` and `//!` write docs, and the examples in them are tested.',
    'Publishing is permanent; use `yank` to retire a version.',
    'A workspace shares one lockfile and one build directory across member packages.'
  ]
};
})();
