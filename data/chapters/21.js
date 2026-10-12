window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.chapters = RUSTLAB.chapters || {};
(function () {
var R = String.raw;
RUSTLAB.chapters['21'] = {
  lede: 'The book\'s last chapter builds a small web server from raw TCP sockets: first single-threaded, then with a thread pool and graceful shutdown. Nothing new is introduced; it is the chapters on ownership, traits, closures, `Arc`, `Mutex` and channels all working in one program.',
  sections: [
    { h: 'Step 1: listen and respond', b: [
      { p: 'HTTP is text over TCP. A request is a request line (`GET / HTTP/1.1`), headers, a blank line and an optional body. A response is a status line, headers, a blank line and the body. `Content-Length` tells the client where the body ends.' },
      { code: R`use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let reader = BufReader::new(&stream);
    let request_line = reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match request_line.as_str() {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };

    let contents = fs::read_to_string(filename).unwrap_or_else(|_| String::from("not found"));
    let length = contents.len();
    let response = format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");
    stream.write_all(response.as_bytes()).unwrap();
}`, file: 'src/main.rs', skip: true },
      { p: 'Run it, then open `http://127.0.0.1:7878` in a browser. The weakness: the loop handles one request at a time. While one handler is slow, every other visitor waits.' },
      { code: R`use std::{thread, time::Duration};

fn slow_branch(request_line: &str) {
    if request_line == "GET /sleep HTTP/1.1" {
        thread::sleep(Duration::from_secs(5));
    }
}`, file: 'simulate a slow request', skip: true }
    ]},
    { h: 'Step 2: why not a thread per request?', b: [
      { p: 'Spawning a thread for each connection fixes the waiting, but an attacker (or a traffic spike) can make you create thousands of threads and exhaust the machine. A **thread pool** creates a fixed number of workers up front and hands them jobs from a queue. Extra requests wait in line; the system stays bounded.' },
      { p: 'The API we want is `pool.execute(|| handle_connection(stream))`, mirroring `thread::spawn`.' },
      { list: [
        'A `Job` is a boxed closure: `Box<dyn FnOnce() + Send + \'static>`. `FnOnce` because it runs once; `Send` to cross to a worker thread; `\'static` because the worker may outlive the caller.',
        'Workers share one receiving end of a channel. A receiver cannot be cloned, so it is wrapped as `Arc<Mutex<Receiver<Job>>>`: shared across threads, one worker at a time takes the next job.',
        'Each worker is a thread running a loop: lock, receive, unlock, run the job.'
      ]}
    ]},
    { h: 'Step 3: the pool, with graceful shutdown', b: [
      { code: R`use std::sync::{mpsc, Arc, Mutex};
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);
        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));
        let mut workers = Vec::with_capacity(size);
        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }
        ThreadPool { workers, sender: Some(sender) }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);
            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let message = receiver.lock().unwrap().recv();
            match message {
                Ok(job) => {
                    println!("Worker {id} got a job; executing.");
                    job();
                }
                Err(_) => {
                    println!("Worker {id} disconnected; shutting down.");
                    break;
                }
            }
        });
        Worker { id, thread: Some(thread) }
    }
}

fn main() {
    let pool = ThreadPool::new(2);
    for i in 0..4 {
        pool.execute(move || println!("job {i} done"));
    }
}`, file: 'src/lib.rs (shown with a tiny main so it runs)' },
      { note: 'Output order varies between runs because the workers race. That is the nature of concurrency, and a good reason to test with sorted or counted results rather than exact order.', kind: 'tip' },
      { h: 'Why each piece is there' },
      { table: [
        ['Piece', 'Reason'],
        ['`Option<Sender>` in the pool', 'So `Drop` can `take()` it and close the channel. Closing makes every worker\'s `recv()` return `Err`, which ends its loop.'],
        ['`Option<JoinHandle>` in a worker', '`join` consumes the handle, and you only have `&mut` in `drop`, so `take()` moves it out safely.'],
        ['`let message = receiver.lock().unwrap().recv();`', 'The lock guard is a temporary dropped at the end of that statement, so the lock is released before the job runs. Writing `while let Ok(job) = receiver.lock().unwrap().recv()` would keep the guard alive for the whole job and silently serialise the pool.'],
        ['`move` on the worker closure', 'The thread needs ownership of `id` and its `Arc` clone.'],
        ['`assert!(size > 0)`', 'A pool of zero workers would hang forever; fail loudly at construction.']
      ]},
      { p: 'Put it together: in `main`, build `ThreadPool::new(4)`, call `pool.execute(|| handle_connection(stream))` inside the `incoming()` loop, and `.take(2)` on the listener to test shutdown. When `pool` goes out of scope, `Drop` closes the channel and joins every worker.' }
    ]},
    { h: 'Where to go from here', b: [
      { list: [
        'Parse more of HTTP yourself (headers, methods), then compare to a framework such as `axum` to see which problems it removes.',
        'Redo the server with `tokio` and `async`, and measure how many idle connections each version can hold.',
        'Replace `unwrap` with a `Result` flow and a proper error type, applying chapter 9.',
        'Read the standard library source for `mpsc` or `Mutex`; after chapters 15, 16 and 20 it is readable.'
      ]}
    ]}
  ],
  recap: [
    'A server loop that handles one request at a time makes everyone wait for the slowest.',
    'A fixed thread pool bounds resource use; a channel is the job queue.',
    '`Arc<Mutex<Receiver<Job>>>` lets many workers share one queue.',
    'Dropping the sender is the shutdown signal; `Option::take` moves the handles out of `&mut self` so they can be joined.',
    'Watch the lifetime of a lock guard: a temporary ends at the semicolon.'
  ]
};
})();
