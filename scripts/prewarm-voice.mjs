// Tạo sẵn giọng "cô giáo" cho các câu thường gặp (cần server đang chạy: npm run dev hoặc start.bat).
// Chạy: npm run voice                     -> giọng mặc định trong .env (TTS_VOICE)
//       npm run voice -- edge:vi-VN-NamMinhNeural
// Có thể ngắt giữa chừng, chạy lại sẽ bỏ qua câu đã có. Sau đó `npm run build` sẽ đóng gói các câu này vào dist/voice.
import { animals, fruits, vehicles, colors, shapes, numberWords, praises } from '../src/data.js';
import { thinkingPhrases } from '../src/thinking-data.js';
const TOPICS_NAMES = ['Thử thách', 'Đố vui', 'Động vật', 'Trái cây', 'Xe cộ', 'Màu sắc', 'Đếm số', 'Hình khối', 'Trò chơi', 'Tìm đúng', 'Đàn piano', 'Bóng bay'];

const BASE = process.env.BASE || 'http://localhost:5173';
const VOICE = process.argv[2] || '';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const low = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const phrases = new Set([
  'Xin chào bé! Cùng học nào!', 'Từ từ thôi bé ơi!', 'Bé cùng đếm nào!', 'Hoan hô! Bé giỏi quá!',
  'Xin chào bé yêu! Hôm nay mình cùng học bài nào!', 'Con mèo. Meo meo! Hoan hô bé giỏi quá!',
  'Bé lật hai thẻ giống nhau nhé!', 'Ai đang trốn trong bóng đen thế nhỉ? Bé chọn nhé!',
  'Có một bạn không giống các bạn còn lại! Bé tìm bạn khác biệt nhé!', 'Chưa đúng rồi. Bé nhìn lại thứ tự nhé!',
  'Bé chạm vào màu sắc nhé!', 'Bé chạm vào hình khối nhé!', 'Bé chạm vào chấm màu để xem có đồ vật gì nhé!',
  'Bé chạm vào các hình để xem điều kỳ diệu nhé!',
  ...praises, ...numberWords.map(cap), ...TOPICS_NAMES, ...thinkingPhrases(),
]);
for (const p of praises) phrases.add(`${p} Bé tìm đủ các cặp rồi!`);
for (const it of [...animals, ...fruits, ...vehicles]) {
  phrases.add(it.n);
  if (it.s) { phrases.add(`${it.n}. ${it.s}!`); phrases.add(`${it.n} kêu thế nào nhỉ? ${it.s}!`); }
  if (it.f) phrases.add(it.f);
  phrases.add(`${it.n} đâu nhỉ? Bé chạm vào ${low(it.n)} nhé!`);
  phrases.add(`Ú òa! Là ${low(it.n)}! ${it.s ? it.s + '!' : it.f || ''}`);
  phrases.add(`Đây là ${low(it.n)}. Thử lại nhé!`);
}
for (const c of colors) for (const x of c.items) phrases.add(`${c.n}! ${x.o} ${low(c.n)}.`);
for (const s of shapes) { phrases.add(s.n); for (const r of s.real) phrases.add(`${r.o} có dạng ${low(s.n)} đấy!`); }

const list = [...phrases].filter(Boolean);
const status = await fetch(`${BASE}/api/tts-status`).then((r) => r.json()).catch(() => null);
if (!status?.enabled) { console.log(`Không kết nối được ${BASE}. Hãy chạy "npm run dev" trước rồi chạy lại.`); process.exit(1); }
const voice = VOICE || status.voice;
console.log(`Tạo sẵn ${list.length} câu bằng giọng ${voice} ...`);

let ok = 0;
const failed = [];
for (const [i, t] of list.entries()) {
  let good = false;
  for (let attempt = 0; attempt < 4 && !good; attempt++) {
    const r = await fetch(`${BASE}/api/tts?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(t)}`).catch(() => null);
    if (r?.ok) { await r.arrayBuffer(); ok++; good = true; }
    else await new Promise((res) => setTimeout(res, 2500));
  }
  if (!good) failed.push(t);
  process.stdout.write(`\r${i + 1}/${list.length} (thành công ${ok})`);
  await new Promise((res) => setTimeout(res, voice.startsWith('gemini') ? 700 : 150));
}
console.log(`\nXong! ${failed.length ? `Lỗi ${failed.length} câu, chạy lại để thử tiếp.` : ''}`);
