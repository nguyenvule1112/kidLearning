// Tạo icon PNG (180/192/512) không cần thư viện ngoài: `npm run icons`
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function encodePNG(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const inC = (u, v, cx, cy, r) => (u - cx) ** 2 + (v - cy) ** 2 <= r * r;

function shade(u, v) {
  // Mặt trời cười trên nền trời xanh
  if (inC(u, v, 0.4, 0.45, 0.045) || inC(u, v, 0.6, 0.45, 0.045)) return hex('#2b2d42');
  const d = Math.hypot(u - 0.5, v - 0.5);
  if (v > 0.55 && Math.abs(d - 0.15) < 0.018 && Math.abs(u - 0.5) < 0.12) return hex('#2b2d42');
  if (inC(u, v, 0.33, 0.6, 0.05) || inC(u, v, 0.67, 0.6, 0.05)) return hex('#ff8fab');
  if (inC(u, v, 0.5, 0.52, 0.34)) return hex('#ffd60a');
  return lerp(hex('#4cc9f0'), hex('#4361ee'), v);
}

function draw(size) {
  const ss = 4;
  const out = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let acc = [0, 0, 0];
      for (let sy = 0; sy < ss; sy++)
        for (let sx = 0; sx < ss; sx++) {
          const c = shade((x + (sx + 0.5) / ss) / size, (y + (sy + 0.5) / ss) / size);
          acc = acc.map((a, i) => a + c[i]);
        }
      const o = (y * size + x) * 3;
      acc.forEach((a, i) => (out[o + i] = Math.round(a / (ss * ss))));
    }
  return encodePNG(size, size, out);
}

const dir = path.resolve('public/icons');
fs.mkdirSync(dir, { recursive: true });
for (const s of [180, 192, 512]) {
  fs.writeFileSync(path.join(dir, `icon-${s}.png`), draw(s));
  console.log(`icon-${s}.png`);
}
