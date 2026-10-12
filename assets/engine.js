window.RUSTLAB = window.RUSTLAB || { modules: {} };

// Reads saved progress from localStorage, tolerating blocked storage.
RUSTLAB.load = function () {
  try { return JSON.parse(localStorage.getItem('rustlab.v1')) || { modules: {}, projects: {} }; }
  catch (e) { return { modules: {}, projects: {} }; }
};

// Writes progress back to localStorage, ignoring storage errors.
RUSTLAB.save = function (state) {
  try { localStorage.setItem('rustlab.v1', JSON.stringify(state)); } catch (e) {}
};

// Builds an element with a class and optional text.
RUSTLAB.el = function (tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

// Draws one machine state: stack cells, heap cells and pointer arrows.
RUSTLAB.drawMachine = function (host, step) {
  var el = RUSTLAB.el;
  host.textContent = '';
  var stack = el('div', 'col'), heap = el('div', 'col');
  stack.appendChild(el('h4', null, 'STACK'));
  heap.appendChild(el('h4', null, 'HEAP'));
  var ptrs = [];
  (step.stack || []).forEach(function (c) {
    var cell = el('div', 'cell ' + (c.status || ''));
    cell.dataset.id = c.id;
    cell.appendChild(el('div', 'nm', c.label || c.id));
    (c.fields || []).forEach(function (f) {
      var row = el('div', 'f');
      row.appendChild(el('b', null, f[0]));
      var v = el('span', null, f[1]);
      row.appendChild(v);
      cell.appendChild(row);
      if (String(f[1]).charAt(0) === '→') ptrs.push({ from: v, to: String(f[1]).slice(1).trim() });
    });
    stack.appendChild(cell);
  });
  (step.heap || []).forEach(function (h) {
    var cell = el('div', 'cell ' + (h.status || ''));
    cell.dataset.id = h.id;
    cell.appendChild(el('div', 'nm', h.label || h.id));
    cell.appendChild(el('div', 'chars', h.text));
    heap.appendChild(cell);
  });
  if (!(step.bars && !(step.stack || []).length && !(step.heap || []).length)) {
    host.appendChild(stack);
    host.appendChild(heap);
  }
  if (step.bars) {
    var bars = el('div', 'bars');
    var total = step.total || 1;
    step.bars.forEach(function (b) {
      var r = el('div', 'bar');
      r.appendChild(el('span', null, b.label));
      var t = el('div', 'track');
      var f = el('div', 'fill');
      f.style.left = ((b.from - 1) / total * 100) + '%';
      f.style.width = ((b.to - b.from + 1) / total * 100) + '%';
      f.style.background = b.color || '#6b8ca3';
      t.appendChild(f);
      if (b.use) {
        var u = el('div', 'cur');
        u.style.left = ((b.use - 0.5) / total * 100) + '%';
        u.style.background = b.bad ? '#d08a74' : '#eee8df';
        t.appendChild(u);
      }
      r.appendChild(t);
      bars.appendChild(r);
    });
    host.appendChild(bars);
  }
  RUSTLAB.drawArrows(host, ptrs);
};

// Overlays SVG arrows from pointer fields to their target cells.
RUSTLAB.drawArrows = function (host, ptrs) {
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  host.appendChild(svg);
  var hb = host.getBoundingClientRect();
  ptrs.forEach(function (p) {
    var target = host.querySelector('[data-id="' + p.to + '"]');
    if (!target) return;
    var a = p.from.getBoundingClientRect(), b = target.getBoundingClientRect();
    var bad = target.classList.contains('freed');
    var x1 = a.right - hb.left + 4, y1 = a.top + a.height / 2 - hb.top;
    var onHeap = target.parentNode !== p.from.closest('.col');
    var x2 = (onHeap ? b.left : b.right) - hb.left, y2 = b.top + b.height / 2 - hb.top;
    var mid = onHeap ? (x1 + x2) / 2 : x1 + 40;
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + y2 + ' ' + (x2 + (onHeap ? -4 : 4)) + ' ' + y2);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', bad ? '#d08a74' : '#6b8ca3');
    path.setAttribute('stroke-width', '2');
    if (bad) path.setAttribute('stroke-dasharray', '5 4');
    svg.appendChild(path);
    var dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x2 + (onHeap ? -4 : 4));
    dot.setAttribute('cy', y2);
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', bad ? '#d08a74' : '#6b8ca3');
    svg.appendChild(dot);
  });
};

// Mounts a code panel, machine, controls and notes for one timeline.
RUSTLAB.mountPlayer = function (root, data) {
  var el = RUSTLAB.el;
  root.textContent = '';
  var i = 0, timer = null;
  var wrap = el('div', 'player');
  var codeBox = el('div', 'codebox');
  var lines = data.code.map(function (t, k) {
    var d = el('div');
    var n = el('span', 'ln', String(k + 1));
    d.appendChild(n);
    d.appendChild(document.createTextNode(t));
    codeBox.appendChild(d);
    return d;
  });
  var right = el('div'); right.style.cssText = 'display:flex;flex-direction:column;gap:14px';
  var machine = el('div', 'machine');
  var out = el('div', 'out');
  var note = el('div', 'note');
  var verdict = el('div');
  var ctl = el('div', 'ctl');
  var prev = el('button', 'b', '← back'), next = el('button', 'b', 'next →'), play = el('button', 'b', 'play'), reset = el('button', 'b', 'reset');
  var count = el('span', 'mono'); count.style.cssText = 'color:#8a8478;font-size:13px';
  [prev, next, play, reset, count].forEach(function (b) { ctl.appendChild(b); });
  right.appendChild(machine);
  if (data.steps.some(function (s) { return s.out; })) right.appendChild(out);
  right.appendChild(note);
  right.appendChild(verdict);
  right.appendChild(ctl);
  var left = el('div'); left.style.cssText = 'display:flex;flex-direction:column;gap:14px';
  left.appendChild(codeBox);
  wrap.appendChild(left);
  wrap.appendChild(right);
  root.appendChild(wrap);

  // Renders the step at the current index.
  function show() {
    var s = data.steps[i];
    lines.forEach(function (d, k) { d.className = (s.line === k + 1) ? 'on' : ''; });
    RUSTLAB.drawMachine(machine, s);
    out.textContent = (s.out || []).join('\n') || '(no output yet)';
    out.style.whiteSpace = 'pre';
    note.textContent = s.note || '';
    verdict.className = s.verdict ? 'verdict ' + s.verdict.kind : '';
    verdict.textContent = s.verdict ? s.verdict.text : '';
    prev.disabled = i === 0;
    next.disabled = i === data.steps.length - 1;
    count.textContent = 'step ' + (i + 1) + ' / ' + data.steps.length;
  }
  // Stops autoplay.
  function stop() { if (timer) { clearInterval(timer); timer = null; play.textContent = 'play'; } }
  prev.onclick = function () { stop(); if (i > 0) { i--; show(); } };
  next.onclick = function () { stop(); if (i < data.steps.length - 1) { i++; show(); } };
  reset.onclick = function () { stop(); i = 0; show(); };
  play.onclick = function () {
    if (timer) { stop(); return; }
    if (i >= data.steps.length - 1) i = 0;
    show();
    play.textContent = 'pause';
    timer = setInterval(function () {
      if (i >= data.steps.length - 1) { stop(); return; }
      i++; show();
    }, 2200);
  };
  window.addEventListener('resize', show);
  show();
};

// Renders the shared navigation bar with the active page highlighted.
RUSTLAB.nav = function (active) {
  var n = RUSTLAB.el('div', 'nav');
  if (!document.querySelector('link[rel=icon]')) {
    var ic = document.createElement('link'); ic.rel = 'icon'; ic.type = 'image/svg+xml'; ic.href = 'assets/logo.svg'; document.head.appendChild(ic);
  }
  var brand = RUSTLAB.el('a', 'brand'); brand.href = 'index.html';
  var img = document.createElement('img'); img.src = 'assets/logo.svg'; img.alt = ''; img.width = 28; img.height = 28;
  brand.appendChild(img); brand.appendChild(document.createTextNode('Rust Lab'));
  n.appendChild(brand);
  [['index.html', 'Roadmap'], ['chapters.html', 'Book Notes'], ['labs.html', 'Why Lab'], ['projects.html', 'Projects'], ['cheatsheet.html', 'Cheatsheet']].forEach(function (l) {
    var a = RUSTLAB.el('a', l[0] === active ? 'on' : '', l[1]); a.href = l[0]; n.appendChild(a);
  });
  return n;
};

// Appends text to a node, turning `backtick` spans into inline code.
RUSTLAB.inline = function (node, text) {
  String(text).split(/(`[^`]+`)/).forEach(function (part) {
    if (part.length > 2 && part.charAt(0) === '`' && part.charAt(part.length - 1) === '`') node.appendChild(RUSTLAB.el('code', null, part.slice(1, -1)));
    else if (part) node.appendChild(document.createTextNode(part));
  });
  return node;
};

// Builds a syntax-highlighted Rust code block.
RUSTLAB.codeBlock = function (src) {
  var kw = 'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while';
  var re = new RegExp('(\\/\\/[^\\n]*)|("(?:\\\\.|[^"\\\\])*")|(\\\'[a-z_]+\\b(?!\\\'))|(\\b\\d[\\d_.]*(?:u8|u16|u32|u64|usize|i8|i16|i32|i64|isize|f32|f64)?\\b)|(\\b[a-z_][a-z0-9_]*!)|(\\b(?:' + kw.split(' ').join('|') + ')\\b)|(\\b[A-Z][A-Za-z0-9_]*\\b)|(#!?\\[[^\\]]*\\])', 'g');
  var cls = ['hc', 'hs', 'hl', 'hn', 'hm', 'hk', 'ht', 'ha'];
  var pre = RUSTLAB.el('pre', 'rs');
  var last = 0, m;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) pre.appendChild(document.createTextNode(src.slice(last, m.index)));
    for (var g = 1; g <= 8; g++) if (m[g] !== undefined) { pre.appendChild(RUSTLAB.el('span', cls[g - 1], m[g])); break; }
    last = m.index + m[0].length;
  }
  if (last < src.length) pre.appendChild(document.createTextNode(src.slice(last)));
  return pre;
};

// Renders a list of content blocks (p, h, code, out, err, note, list, table) into a host.
RUSTLAB.blocks = function (host, blocks) {
  var el = RUSTLAB.el;
  blocks.forEach(function (b) {
    if (b.p) host.appendChild(RUSTLAB.inline(el('p', 'bp'), b.p));
    else if (b.h) host.appendChild(el('h3', 'bh', b.h));
    else if (b.code) {
      var w = el('div', 'cw');
      if (b.file) w.appendChild(el('div', 'cf', b.file));
      w.appendChild(RUSTLAB.codeBlock(b.code));
      if (b.out) { w.appendChild(el('div', 'co', 'output')); w.appendChild(el('pre', 'ro', b.out)); }
      if (b.panic) { w.appendChild(el('div', 'co er', 'runtime panic')); w.appendChild(el('pre', 'err', b.panic)); }
      if (b.err) { w.appendChild(el('div', 'co er', 'compiler error')); w.appendChild(el('pre', 'err', b.err)); }
      host.appendChild(w);
    }
    else if (b.note) host.appendChild(RUSTLAB.inline(el('div', 'callout ' + (b.kind || 'tip')), b.note));
    else if (b.list) {
      var ul = el('ul', 'bl');
      b.list.forEach(function (t) { ul.appendChild(RUSTLAB.inline(el('li'), t)); });
      host.appendChild(ul);
    }
    else if (b.table) {
      var t = el('table', 'w');
      var hr = el('tr');
      b.table[0].forEach(function (h) { hr.appendChild(el('th', null, h)); });
      t.appendChild(hr);
      b.table.slice(1).forEach(function (r) {
        var tr = el('tr');
        r.forEach(function (c) { tr.appendChild(RUSTLAB.inline(el('td'), c)); });
        t.appendChild(tr);
      });
      host.appendChild(t);
    }
  });
};
