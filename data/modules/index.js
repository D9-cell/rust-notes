window.RUSTLAB = window.RUSTLAB || { modules: {} };
RUSTLAB.index = [
  { id: 'stack-heap', chapter: 4, title: 'Stack vs heap', summary: 'Where a String really lives, and why copying it is never free.' },
  { id: 'move', chapter: 4, title: 'Move semantics', summary: 'Why let s2 = s1 kills s1, and what C would have done instead.' },
  { id: 'borrow', chapter: 4, title: 'Borrowing rules', summary: 'Why one writer or many readers, shown with a Vec that reallocates.' },
  { id: 'dangling', chapter: 4, title: 'Dangling references', summary: 'A reference to a variable that has already gone out of scope.' },
  { id: 'slice', chapter: 4, title: 'Slices', summary: 'Why first_word returns a slice and not an index.' },
  { id: 'drop-order', chapter: 4, title: 'Drop order', summary: 'Why variables are freed in reverse order of creation.' },
  { id: 'option-match', chapter: 6, title: 'Option vs null', summary: 'Why a maybe-missing value is its own type, and what match forces you to do.' },
  { id: 'vec-growth', chapter: 8, title: 'Vec growth', summary: 'Capacity doubling, and why a reference into a Vec blocks push.' },
  { id: 'utf8', chapter: 8, title: 'Strings are UTF-8', summary: 'Why s[0] does not exist and slicing can panic mid-character.' },
  { id: 'question-mark', chapter: 9, title: 'Result and ?', summary: 'The two paths through a function using the question mark.' },
  { id: 'lifetimes', chapter: 10, title: 'Lifetime annotations', summary: 'longest() and what the tick-a actually tells the compiler.' },
  { id: 'rc-count', chapter: 15, title: 'Rc counting', summary: 'Several owners with a counter, and the cycle that leaks.' },
  { id: 'refcell', chapter: 15, title: 'RefCell at runtime', summary: 'The borrow rule enforced by a flag, and the panic when it breaks.' },
  { id: 'send-sync', chapter: 16, title: 'Send and Sync', summary: 'Why Rc is rejected across threads and Arc<Mutex> is accepted.' },
  { id: 'dyn-vtable', chapter: 18, title: 'Trait objects', summary: 'Fat pointers, vtables, and why some traits cannot be dyn.' }
];
