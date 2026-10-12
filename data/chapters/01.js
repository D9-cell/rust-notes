window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['01'] = {
  lede: 'Install the toolchain, compile a program by hand once, then let Cargo do it for you from then on. Everything else in the book assumes this chapter.',
  sections: [
    { h: 'Installing with rustup', b: [
      { p: 'Rust is installed and updated through `rustup`, a small tool that manages compiler versions. One command installs the compiler (`rustc`), the build tool (`cargo`) and the standard library docs.' },
      { code: R`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`, file: 'terminal', skip: true },
      { p: 'Check it worked, and keep it current with `rustup update`. Rust ships a new stable release every six weeks, and old code keeps compiling because of editions (2015, 2018, 2021, 2024). An edition is an opt-in switch for small breaking changes; crates on different editions can depend on each other.' },
      { code: R`rustc --version
cargo --version
rustup update`, file: 'terminal', skip: true },
      { note: 'On Linux you also need a C linker (`gcc` or `clang`). Rust compiles to machine code and hands the last step to the system linker.', kind: 'tip' }
    ]},
    { h: 'Hello, world', b: [
      { p: 'Rust is an ahead-of-time compiled language. You compile first, then run the produced binary, and the binary does not need Rust installed. Save this as `main.rs`:' },
      { code: R`fn main() {
    println!("Hello, world!");
}`, file: 'main.rs', out: "Hello, world!" },
      { list: [
        '`fn main()` is where every executable starts. The body sits in curly braces.',
        'Indentation is four spaces, not a tab. `rustfmt` formats code for you, so you never argue about style.',
        '`println!` ends with `!`, which means it is a macro, not a function. Macros can take a variable number of arguments, which a normal function cannot.',
        'Statements end in `;`.'
      ]},
      { code: R`rustc main.rs
./main`, file: 'terminal', skip: true }
    ]},
    { h: 'Cargo: the tool you will actually use', b: [
      { p: '`rustc` is fine for one file. Real projects use Cargo, which creates the layout, fetches dependencies, builds and runs. You will never call `rustc` directly after this chapter.' },
      { code: R`cargo new hello_cargo
cd hello_cargo
cargo run`, file: 'terminal', skip: true },
      { p: '`cargo new` makes a folder with `Cargo.toml` (the manifest: name, version, edition, dependencies), `src/main.rs`, and a fresh git repository. The commands you will use daily:' },
      { table: [
        ['Command', 'What it does'],
        ['`cargo build`', 'Compiles into `target/debug/`. Fast to build, slow to run.'],
        ['`cargo run`', 'Builds if needed, then runs.'],
        ['`cargo check`', 'Type-checks only, no binary. Much faster; use it while editing.'],
        ['`cargo build --release`', 'Compiles with optimizations into `target/release/`. Use this when measuring speed.'],
        ['`cargo test`', 'Builds and runs the tests.'],
        ['`cargo doc --open`', 'Builds HTML docs for your code and every dependency.']
      ]},
      { note: 'If a program feels slow, you probably ran the debug build. Debug builds skip optimizations on purpose so that compiling stays fast.', kind: 'warn' }
    ]}
  ],
  recap: [
    'Install and update with `rustup`; the toolchain is `rustc` plus `cargo`.',
    'Rust compiles ahead of time. The binary runs without Rust installed.',
    '`println!` is a macro because of the `!`.',
    'Use `cargo check` while editing, `cargo run` to try, `cargo build --release` to measure.'
  ]
};
})();
