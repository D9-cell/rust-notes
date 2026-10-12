# Rust Learning Lab

The whole of *The Rust Programming Language* as readable HTML notes, with visual labs and practice projects. Static pages, no server and no accounts: your progress is saved in your browser only.

**Read it:** https://d9-cell.github.io/rust-notes/

## What is inside

| Part | What it is |
| --- | --- |
| Book Notes | All 21 chapters rewritten as compact notes. Every code sample was compiled with rustc 1.98 (edition 2024) and every output and compiler error shown is the real one. |
| Why Lab | 15 step-through labs for the ideas text alone does not teach: stack and heap, move, borrowing, slices, Option, Vec growth, UTF-8, `?`, lifetimes, Rc, RefCell, Send and Sync, trait objects. |
| Projects | 16 projects, one per chapter. Chapters 2, 4, 5, 6, 8 and 9 ship as Cargo crates with stubs and tests; the rest are briefs to build yourself. |
| Cheatsheet | The choices you make over and over, in tables. |

## Run it locally

Open `index.html` in a browser, or serve the folder: `python3 -m http.server`.

## Practice projects

```
cd projects
cargo test -p ch06-machine
```

Each provided crate fails until you replace the `todo!()` bodies in `src/lib.rs`. The tests in `tests/` are the spec.

## Rebuilding the example output

`tools/bake.js` compiles every code block in `site/data/chapters/` and refreshes its captured output or compiler error. Run `node tools/bake.js` from the repo root (needs rustc).
