const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const os = require('os');

const dir = path.join(__dirname, '..', 'site', 'data', 'chapters');
const only = process.argv.slice(2);
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'bake-'));
fs.mkdirSync(path.join(work, 'src'));

// Compiles one program and returns the result with captured output.
function compile(code, lib) {
  fs.writeFileSync(path.join(work, 'src', 'main.rs'), code);
  const args = lib ? ['--edition', '2024', '--crate-type', 'lib', '-A', 'warnings', 'src/main.rs', '-o', 'out.rlib'] : ['--edition', '2024', '-A', 'warnings', 'src/main.rs', '-o', 'bin'];
  return cp.spawnSync('rustc', args, { cwd: work, encoding: 'utf8' });
}

// Replaces the value of one output field in a block with fresh text.
function swap(whole, kind, text) {
  return whole.replace(new RegExp(kind + ': (?:\'[^\']*\'|"(?:[^"\\\\]|\\\\.)*")'), () => kind + ': ' + JSON.stringify(text));
}

// Keeps only the first error block of rustc stderr.
function firstError(stderr) {
  const cut = stderr.split(/\nerror: aborting|\nFor more information|\nhelp: the following other types|\nhelp: `usize` implements|\nnote: required because it's used within this closure/)[0];
  return cut.replace(/\/[^\s]*\/lib\/rustlib\/src\/rust\//g, '').trim();
}

const report = [];
fs.readdirSync(dir).filter((f) => f.endsWith('.js') && (!only.length || only.includes(f.replace('.js', '')))).forEach((f) => {
  const file = path.join(dir, f);
  let src = fs.readFileSync(file, 'utf8');
  const block = /code: R`([\s\S]*?)`((?:, (?:file|skip|out|err|panic): (?:'[^']*'|true|"(?:[^"\\]|\\.)*"))*) ?\}/g;
  src = src.replace(block, (whole, code, meta) => {
    const km = /(out|err|panic): (?:'[^']*'|"(?:[^"\\]|\\.)*")/.exec(meta);
    const kind = km && km[1];
    if (/skip: true/.test(meta)) return whole;
    const hasMain = /fn main\s*\(/.test(code);
    if (!hasMain) {
      const r = compile(code, true);
      if (r.status !== 0) report.push(`${f}: fragment does not compile as lib:\n${code.split('\n')[0]}\n${firstError(r.stderr)}`);
      return whole;
    }
    const r = compile(code, false);
    if (kind === 'err') {
      if (r.status === 0) { report.push(`${f}: expected error but compiled:\n${code.split('\n')[0]}`); return whole; }
      return swap(whole, 'err', firstError(r.stderr));
    }
    if (r.status !== 0) { report.push(`${f}: failed to compile:\n${code.split('\n').slice(0, 3).join('\n')}\n${firstError(r.stderr)}`); return whole; }
    if (kind === 'panic') {
      const run = cp.spawnSync(path.join(work, 'bin'), { encoding: 'utf8', timeout: 10000 });
      const msg = run.stderr.split('\n').filter((l) => !/RUST_BACKTRACE/.test(l)).join('\n').replace(/ \(\d+\) panicked/, ' panicked').trim();
      return swap(whole, 'panic', msg);
    }
    if (kind === 'out') {
      const run = cp.spawnSync(path.join(work, 'bin'), { encoding: 'utf8', timeout: 10000 });
      return swap(whole, 'out', (run.stdout + (run.status ? '\n[exit ' + run.status + ']' : '')).replace(/\n+$/, ''));
    }
    return whole;
  });
  fs.writeFileSync(file, src);
});
fs.rmSync(work, { recursive: true, force: true });
console.log(report.length ? report.join('\n\n') : 'all blocks ok');
