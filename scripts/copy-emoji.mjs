// Sao chép các icon emoji (Twemoji SVG) mà app dùng sang public/emoji để hiển thị đẹp & giống nhau trên mọi thiết bị.
// Tự chạy trước `dev` và `build`; chạy tay: `npm run emoji`
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('src');
const SVG = path.resolve('node_modules/@twemoji/svg');
const OUT = path.resolve('public/emoji');
fs.mkdirSync(OUT, { recursive: true });

const RE = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?|[\u{1F3FB}-\u{1F3FF}])*/gu;
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(js|html|css)$/.test(f.name)) files.push(p);
  }
})(SRC);
files.push(path.resolve('index.html'));

// Cùng quy tắc đặt tên với src/emoji.js
const codeOf = (s) => [...s].map((c) => c.codePointAt(0).toString(16)).join('-');
const stripFe0f = (s) => s.replace(/\uFE0F/g, '');

const found = new Set();
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(RE)) found.add(m[0]);

let ok = 0;
const missing = [];
for (const e of found) {
  const names = [codeOf(stripFe0f(e)), codeOf(e)];
  const hit = names.find((n) => fs.existsSync(path.join(SVG, n + '.svg')));
  if (hit) {
    fs.copyFileSync(path.join(SVG, hit + '.svg'), path.join(OUT, codeOf(stripFe0f(e)) + '.svg'));
    ok++;
  } else missing.push(e);
}
console.log(`emoji: ${ok} icon đã sao chép` + (missing.length ? `, thiếu: ${missing.join(' ')} (sẽ dùng emoji hệ thống)` : ''));
