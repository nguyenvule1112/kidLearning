import { defineConfig, loadEnv } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { detectStyle } from './src/voice-style.js';

/**
 * Giọng đọc "cô giáo" cho bé — 2 nguồn, chọn trong .env hoặc bảng phụ huynh:
 *  - edge:   giọng tiếng Việt bản địa của Microsoft (HoaiMy, NamMinh). MIỄN PHÍ, không cần key.
 *  - gemini: giọng Google Gemini (cần GEMINI_API_KEY). Có thêm lời dặn phong cách để bớt "giọng AI".
 * Mỗi câu chỉ tạo 1 lần rồi lưu trong .tts-cache (+ .tts-cache/index.json).
 * Khi `npm run build`, các câu của giọng mặc định được chép vào dist/voice/ để chạy online không cần server.
 */
const EDGE_VOICES = [
  { id: 'edge:vi-VN-HoaiMyNeural', name: '🌸 Hoài My (nữ, giọng Việt tự nhiên)' },
  { id: 'edge:vi-VN-NamMinhNeural', name: '🐻 Nam Minh (nam, giọng Việt tự nhiên)' },
];
const GEMINI_VOICES = [
  { id: 'gemini:Aoede', name: '✨ Gemini Aoede (nữ tươi vui)' },
  { id: 'gemini:Kore', name: '✨ Gemini Kore (nữ dịu dàng)' },
  { id: 'gemini:Leda', name: '✨ Gemini Leda (nữ trẻ trung)' },
  { id: 'gemini:Puck', name: '✨ Gemini Puck (nam vui nhộn)' },
];

// Lời dặn cho Gemini theo từng kiểu câu (Gemini TTS hiểu chỉ dẫn dạng "Say ...: <câu>")
const GEMINI_DIRECTIONS = {
  cheer: 'excited and proud, like praising a child',
  soft: 'gently and patiently, encouraging',
  animal: 'playfully, imitating the animal sound with fun',
  story: 'like telling a short bedtime story, warm and calm',
  friendly: 'warm and cheerful',
};
const geminiPrompt = (text) =>
  `Say this Vietnamese sentence with a natural Northern Vietnamese (Hanoi) accent, like a kind kindergarten teacher talking to a 3-year-old: slowly, clearly, ${GEMINI_DIRECTIONS[detectStyle(text)] || GEMINI_DIRECTIONS.friendly}. Say only the sentence: ${text}`;

const xml = (s) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);

function ttsPlugin(env) {
  const KEY = env.GEMINI_API_KEY;
  const MODEL = env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-lite-tts';
  const EDGE_RATE = env.EDGE_TTS_RATE || '-8%'; // chậm hơn một chút cho bé dễ nghe
  const VOICES = [...EDGE_VOICES, ...(KEY ? GEMINI_VOICES : [])];
  const normalize = (v) => (!v ? '' : v.includes(':') ? v : `gemini:${v}`);
  const DEFAULT_VOICE = normalize(env.TTS_VOICE) || 'edge:vi-VN-HoaiMyNeural';
  const CACHE = path.resolve('.tts-cache');
  const INDEX = path.join(CACHE, 'index.json');
  fs.mkdirSync(CACHE, { recursive: true });
  let index = {};
  try { index = JSON.parse(fs.readFileSync(INDEX, 'utf8')); } catch {}
  const inflight = new Map();

  const toWav = (buf) => {
    if (buf.subarray(0, 4).toString() === 'RIFF') return buf;
    const h = Buffer.alloc(44);
    h.write('RIFF', 0); h.writeUInt32LE(36 + buf.length, 4); h.write('WAVEfmt ', 8);
    h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
    h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
    h.write('data', 36); h.writeUInt32LE(buf.length, 40);
    return Buffer.concat([h, buf]);
  };

  async function edge(text, voice) {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(xml(text), { rate: EDGE_RATE });
      const chunks = [];
      for await (const c of audioStream) chunks.push(c);
      const buf = Buffer.concat(chunks);
      if (!buf.length) throw new Error('Edge: không có audio');
      return buf;
    } finally {
      tts.close();
    }
  }

  async function gemini(text, voice) {
    if (!KEY) throw new Error('Thiếu GEMINI_API_KEY');
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt(text) }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      }),
    });
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 150)}`);
    const j = await r.json();
    const b64 = j?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) throw new Error('Gemini: không có audio');
    return toWav(Buffer.from(b64, 'base64'));
  }

  async function generate(text, voiceId) {
    const known = index[voiceId]?.[text];
    if (known && fs.existsSync(path.join(CACHE, known))) return path.join(CACHE, known);
    const [provider, voice] = voiceId.split(':');
    const name = crypto.createHash('sha1').update(`${voiceId}|v2|${text}`).digest('hex') + (provider === 'edge' ? '.mp3' : '.wav');
    const file = path.join(CACHE, name);
    if (inflight.has(file)) return inflight.get(file);
    const job = (async () => {
      if (!fs.existsSync(file)) {
        const buf = provider === 'edge' ? await edge(text, voice) : await gemini(text, voice);
        fs.writeFileSync(file, buf);
      }
      (index[voiceId] ||= {})[text] = name;
      fs.writeFileSync(INDEX, JSON.stringify(index));
      return file;
    })().finally(() => inflight.delete(file));
    inflight.set(file, job);
    return job;
  }

  const handler = async (req, res, next) => {
    const url = new URL(req.url, 'http://x');
    const p = url.pathname.replace(/^.*\/api\//, '/api/');
    if (p === '/api/tts-status') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ enabled: true, voice: DEFAULT_VOICE, voices: VOICES }));
    }
    if (p !== '/api/tts') return next();
    const text = (url.searchParams.get('text') || '').slice(0, 300);
    const voiceId = normalize(url.searchParams.get('voice')) || DEFAULT_VOICE;
    if (!text || !VOICES.some((v) => v.id === voiceId)) { res.statusCode = 400; return res.end(); }
    try {
      const file = await generate(text, voiceId);
      res.setHeader('Content-Type', file.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      fs.createReadStream(file).pipe(res);
    } catch (e) {
      res.statusCode = 502;
      res.end(String(e.message));
    }
  };

  let outDir = 'dist';
  return {
    name: 'be-hoc-vui-tts',
    configResolved(c) { outDir = c.build.outDir; },
    configureServer(s) { s.middlewares.use(handler); },
    configurePreviewServer(s) { s.middlewares.use(handler); },
    // Đóng gói giọng mặc định vào dist/voice để chạy online (GitHub Pages / Netlify) không cần server
    writeBundle() {
      const map = index[DEFAULT_VOICE] || {};
      const dir = path.resolve(outDir, 'voice');
      fs.mkdirSync(dir, { recursive: true });
      const files = {};
      for (const [text, name] of Object.entries(map)) {
        const src = path.join(CACHE, name);
        if (!fs.existsSync(src)) continue;
        fs.copyFileSync(src, path.join(dir, name));
        files[text] = name;
      }
      fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ voice: DEFAULT_VOICE, files }));
      console.log(`giọng đọc: đóng gói ${Object.keys(files).length} câu (${DEFAULT_VOICE}) vào ${outDir}/voice`);
    },
  };
}

// base './' => chạy được ở mọi địa chỉ: LAN, https://<tên>.github.io/be-hoc-vui/, Netlify...
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    plugins: [ttsPlugin(env)],
    server: { host: true, port: 5173 },
    preview: { host: true, port: 4173 },
  };
});
