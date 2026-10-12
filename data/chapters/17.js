window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['17'] = {
  lede: 'Async lets one thread juggle thousands of tasks that mostly wait: network sockets, timers, disk. Optional on a first pass, but you will meet it the moment you use a web framework. The standard library gives you the pieces (`Future`, `async`, `await`); a runtime crate such as `tokio` provides the executor.',
  sections: [
    { h: 'Threads vs async', b: [
      { table: [
        ['', 'OS threads', 'Async tasks'],
        ['Cost each', 'Megabytes of stack, kernel scheduling.', 'A few hundred bytes, scheduled in user space.'],
        ['Good at', 'CPU-heavy parallel work.', 'Waiting on many I/O operations at once.'],
        ['Blocking', 'A blocked thread just sleeps.', 'A blocked task stalls every task on its thread, so never block.'],
        ['Mental model', 'Straight-line code, preemptive.', 'Straight-line code that yields at each `.await`.']
      ]},
      { p: 'They combine: runtimes like tokio run many tasks across a small pool of threads. Concurrency (many things in progress) is not parallelism (many things running at the same instant).' }
    ]},
    { h: 'Futures', b: [
      { p: 'A **future** is a value that represents work that may not be finished. Its trait has one method, `poll`, which returns `Poll::Ready(value)` or `Poll::Pending`. Futures are lazy: nothing happens until something polls them, which is the job of the executor.' },
      { p: 'An `async fn` is sugar. It returns an anonymous type that implements `Future`; the compiler turns the body into a state machine with one state per `.await` point. `.await` suspends the current function, lets the executor run other tasks, and resumes when the awaited future is ready.' },
      { code: R`use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll, Waker};

struct CountDown(u32);

impl Future for CountDown {
    type Output = &'static str;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        if self.0 == 0 {
            Poll::Ready("liftoff")
        } else {
            println!("polled with {} left", self.0);
            self.0 -= 1;
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}

async fn launch() -> &'static str {
    let msg = CountDown(2).await;
    msg
}

fn main() {
    let mut fut = Box::pin(launch());
    let mut cx = Context::from_waker(Waker::noop());
    loop {
        match fut.as_mut().poll(&mut cx) {
            Poll::Ready(v) => {
                println!("{v}");
                break;
            }
            Poll::Pending => println!("pending"),
        }
    }
}`, out: "polled with 2 left\npending\npolled with 1 left\npending\nliftoff" },
      { p: 'That is a miniature executor: a loop that polls a future until it is ready. A real one parks the thread until the **waker** says progress is possible, instead of spinning. You never write this by hand; it shows what `.await` means.' }
    ]},
    { h: 'Using a runtime', b: [
      { p: 'Rust deliberately keeps the runtime out of the standard library, so you pick one. In practice that is `tokio` (or `async-std`/`smol`). Add it with `cargo add tokio --features full`.' },
      { code: R`use std::time::Duration;

#[tokio::main]
async fn main() {
    let a = async {
        tokio::time::sleep(Duration::from_millis(200)).await;
        "slow"
    };
    let b = async {
        tokio::time::sleep(Duration::from_millis(50)).await;
        "fast"
    };
    let (x, y) = tokio::join!(a, b);
    println!("{x} {y}");

    let handle = tokio::spawn(async { 21 * 2 });
    println!("{}", handle.await.unwrap());
}`, file: 'src/main.rs (needs tokio)', skip: true },
      { list: [
        '`tokio::join!` runs futures concurrently and waits for all; `tokio::select!` waits for the first.',
        '`tokio::spawn` starts an independent task, like `thread::spawn` but cheap. The task must own its data (`move` / `Arc`).',
        'Channels exist in async form: `tokio::sync::mpsc`. Use `tokio::sync::Mutex` only if you must hold the lock across an `.await`.',
        'Never call a blocking function (`std::thread::sleep`, heavy CPU work, blocking file reads) in an async task; use `spawn_blocking`.'
      ]},
      { note: 'Async functions can only be awaited from other async functions. This colours your program: once a function is `async`, its callers must be too. It is the main cost of the model.', kind: 'warn' }
    ]},
    { h: 'Pin, and streams in one paragraph each', b: [
      { p: 'A compiled future may hold references into itself (a local and a pointer to that local, kept across an `.await`). Moving it would leave the pointer dangling, so such futures are **pinned**: wrapped in `Pin<&mut T>`, a promise that the value stays at its address. You meet `Pin` in signatures and with `Box::pin`, and rarely need more.' },
      { p: 'A **stream** is the async version of an iterator: a sequence whose next item arrives later. Use `StreamExt::next().await` in a `while let` loop. The `futures` and `tokio-stream` crates provide it.' }
    ]}
  ],
  recap: [
    'A future is a lazy state machine polled by an executor; `.await` suspends the caller until it is ready.',
    'Use async for lots of waiting (I/O), threads for heavy computing.',
    'The runtime (tokio) is a crate, not std.',
    'Never block inside an async task; `join!` for concurrency, `spawn` for independent tasks.',
    '`Pin` keeps self-referential futures from moving.'
  ]
};
})();
