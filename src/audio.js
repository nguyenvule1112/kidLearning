// Âm thanh: giọng đọc truyền cảm (giọng "cô giáo" Gemini nếu có, nếu không dùng giọng trình duyệt có tạo ngữ điệu) + hiệu ứng tổng hợp (Web Audio)
import { detectStyle } from './voice-style.js';

let ctx = null;
let master = null;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(comp).connect(ctx.destination);
  return ctx;
}

/** Phải gọi trong một sự kiện click (iOS chỉ cho phát âm thanh sau thao tác của người dùng). */
export function unlockAudio() {
  ensureCtx();
  if (ctx && ctx.state !== 'running') ctx.resume();
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}

function tone(freq, dur = 0.2, { type = 'sine', vol = 0.3, when = 0, slideTo = null } = {}) {
  if (!ensureCtx()) return;
  if (ctx.state !== 'running') ctx.resume();
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Chống spam tiếng động (SFX) quá dày
let lastSfxAt = 0;
function throttled(fn, minGap = 90) {
  return (...args) => {
    const now = performance.now();
    if (now - lastSfxAt < minGap) return;
    lastSfxAt = now;
    fn(...args);
  };
}

export const sfx = {
  tap: throttled(() => tone(660, 0.09, { type: 'triangle', vol: 0.2, slideTo: 990 }), 90),
  boing: throttled(() => tone(420, 0.14, { type: 'sine', vol: 0.22, slideTo: 780 }), 110),
  pop: throttled((p = 1) => tone(380 * p, 0.14, { slideTo: 1400 * p, vol: 0.35 }), 70),
  swoosh: throttled(() => tone(280, 0.18, { type: 'sine', vol: 0.18, slideTo: 720 }), 180),
  back: () => tone(700, 0.16, { type: 'triangle', vol: 0.18, slideTo: 350 }),
  wrong: throttled(() => {
    tone(330, 0.18, { type: 'triangle', vol: 0.18, slideTo: 260 });
    tone(260, 0.25, { type: 'triangle', vol: 0.18, slideTo: 200, when: 0.16 });
  }, 450),
  success: () =>
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.25, when: i * 0.09 })),
  fanfare: () =>
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      tone(f, i === 5 ? 0.45 : 0.18, { type: 'triangle', vol: 0.28, when: i * 0.11 })
    ),
  note: (freq, dur = 1.1) => {
    tone(freq, dur, { type: 'triangle', vol: 0.35 });
    tone(freq * 2, dur * 0.6, { type: 'sine', vol: 0.08 });
  },
};

// ====================== CHỌN GIỌNG TRÌNH DUYỆT ======================
const LS_VOICE = 'bhv.voice';
const LS_SPEED = 'bhv.speed';
let viVoices = [];
let viVoice = null;
let voicesReady = false;

const voiceScore = (v) => {
  const n = v.name;
  return (
    (/natural|online/i.test(n) ? 10 : 0) + // Microsoft HoaiMy / NamMinh (Edge, Windows 11)
    (/premium|enhanced|siri/i.test(n) ? 7 : 0) +
    (/linh/i.test(n) ? 5 : 0) + // iOS / macOS "Linh"
    (/google/i.test(n) ? 4 : 0) +
    (/hoaimy|female|nữ/i.test(n) ? 1 : 0) +
    (v.localService ? 0 : 1)
  );
};

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return;
  voicesReady = true;
  viVoices = vs
    .filter((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith('vi'))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
  const saved = localStorage.getItem(LS_VOICE);
  viVoice = viVoices.find((v) => v.name === saved) || viVoices[0] || null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function hasViVoice() {
  return new Promise((res) => {
    if (!('speechSynthesis' in window)) return res(false);
    if (voicesReady) return res(!!viVoice);
    setTimeout(() => {
      pickVoice();
      res(!!viVoice);
    }, 1200);
  });
}
export const listViVoices = () => viVoices.map((v) => ({ name: v.name, natural: voiceScore(v) >= 7 }));
export const getVoicePref = () => viVoice?.name || '';
export function setVoicePref(name) {
  localStorage.setItem(LS_VOICE, name);
  pickVoice();
}
export const getSpeed = () => parseFloat(localStorage.getItem(LS_SPEED)) || 1;
export const setSpeed = (v) => localStorage.setItem(LS_SPEED, String(v));

// ====================== GIỌNG "CÔ GIÁO" (file đóng gói sẵn hoặc server local) ======================
// Thứ tự ưu tiên: 1) file trong voice/ đã đóng gói khi build (chạy online) 2) server /api/tts (chạy ở nhà) 3) giọng trình duyệt
const BASE = import.meta.env.BASE_URL || './';
const LS_CLOUD_VOICE = 'bhv.voice2'; // đổi key để máy cũ chuyển sang giọng mặc định mới
const cloud = { enabled: false, voice: '', voices: [] };
const packed = { voice: '', files: {} };
const bufCache = new Map();
const norm = (v) => (!v ? '' : v.includes(':') ? v : `gemini:${v}`);

fetch(`${BASE}api/tts-status`)
  .then((r) => r.json())
  .then((j) => Object.assign(cloud, j))
  .catch(() => {});
fetch(`${BASE}voice/index.json`)
  .then((r) => r.json())
  .then((j) => Object.assign(packed, j))
  .catch(() => {});

export const isCloudEnabled = () => cloud.enabled || !!packed.voice;
export const isServerEnabled = () => cloud.enabled;
export const listCloudVoices = () => cloud.voices || [];
export const getPackedVoice = () => packed.voice;
export const getGeminiVoice = () => {
  const saved = norm(localStorage.getItem(LS_CLOUD_VOICE));
  if (saved && (!cloud.enabled || cloud.voices.some((v) => v.id === saved))) return saved;
  return cloud.voice || packed.voice;
};
export function setGeminiVoice(v) {
  localStorage.setItem(LS_CLOUD_VOICE, v);
}

function cloudBuffer(text) {
  const voice = getGeminiVoice();
  const file = packed.files[text];
  const usePacked = file && (voice === packed.voice || !cloud.enabled);
  const key = usePacked ? `packed|${text}` : `${voice}|${text}`;
  if (bufCache.has(key)) return bufCache.get(key);
  const p = (async () => {
    const url = usePacked
      ? `${BASE}voice/${file}`
      : cloud.enabled
        ? `${BASE}api/tts?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`
        : null;
    if (!url) throw new Error('no voice');
    const r = await fetch(url);
    if (!r.ok) throw new Error('tts ' + r.status);
    return ctx.decodeAudioData(await r.arrayBuffer());
  })();
  bufCache.set(key, p);
  p.catch(() => bufCache.delete(key));
  return p;
}

/** Tải sẵn giọng đọc để lần chạm sau phát ngay (gọi khi vào màn hình). */
export function prefetchVoice(texts) {
  if (!isCloudEnabled() || !ensureCtx()) return;
  texts.forEach((t) => cloudBuffer(t).catch(() => {}));
}

// ====================== NGỮ ĐIỆU / PHONG CÁCH ======================

// Mỗi câu một ngữ điệu: "!" hào hứng, "?" lên giọng, "." bình thản; có quãng nghỉ giữa các câu.
function segmentsOf(text, style) {
  const base = { friendly: [0.88, 1.15], cheer: [0.95, 1.35], animal: [0.92, 1.4], story: [0.84, 1.2], soft: [0.8, 1.05] }[style] || [0.88, 1.15];
  const parts = text.match(/[^.!?…]+[.!?…]*/g) || [text];
  return parts
    .map((raw) => {
      const seg = raw.trim();
      if (!seg) return null;
      const end = seg.slice(-1);
      let [rate, pitch] = base;
      let gap = 170;
      if (end === '!') { rate += 0.06; pitch += 0.18; gap = 120; }
      else if (end === '?') { rate -= 0.04; pitch += 0.28; gap = 300; }
      else { gap = 220; }
      return { text: seg.replace(/[!?…]+$/, end === '?' ? '?' : '!').replace(/\.$/, ','), rate, pitch: Math.min(pitch, 2), gap };
    })
    .filter(Boolean);
}

// ====================== PHÁT GIỌNG ĐỌC (chống spam + chống ngắt quãng) ======================
let token = 0;
let curSource = null;
let currentText = '';
let lastSpokenText = '';
let lastSpokenAt = 0;
let pendingTimer = null;
let doneResolve = null;

function stopPlaying() {
  token++;
  try {
    curSource?.stop();
  } catch {}
  curSource = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  doneResolve?.();
  doneResolve = null;
}

function browserSay(text, style, my, speed) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const segs = segmentsOf(text, style);
    let i = 0;
    const next = () => {
      if (my !== token || i >= segs.length) return resolve();
      const s = segs[i++];
      const u = new SpeechSynthesisUtterance(s.text);
      u.lang = 'vi-VN';
      if (viVoice) u.voice = viVoice;
      u.rate = s.rate * speed;
      u.pitch = s.pitch;
      let advanced = false;
      const adv = () => {
        if (advanced) return;
        advanced = true;
        setTimeout(next, s.gap);
      };
      u.onend = u.onerror = adv;
      speechSynthesis.speak(u);
      setTimeout(adv, 7000);
    };
    next();
  });
}

async function cloudSay(text, style, my) {
  if (!isCloudEnabled() || !ensureCtx()) return false;
  try {
    // Chờ tối đa 3.0s để Gemini TTS tạo âm thanh; nếu chưa kịp thì dùng giọng trình duyệt
    const buf = await Promise.race([cloudBuffer(text), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 3000))]);
    if (my !== token) return true;
    if (ctx.state !== 'running') await ctx.resume();
    await new Promise((resolve) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(master);
      src.onended = resolve;
      curSource = src;
      src.start();
    });
    return true;
  } catch {
    return false;
  }
}

async function flushSpeech(text, { style }) {
  if (!text) return;
  stopPlaying();
  const my = token;
  currentText = text;
  lastSpokenText = text;
  lastSpokenAt = performance.now();
  const st = style || detectStyle(text);
  const done = new Promise((r) => (doneResolve = r));
  (async () => {
    const ok = await cloudSay(text, st, my);
    if (!ok && my === token) await browserSay(text, st, my, getSpeed());
    if (my === token) {
      currentText = '';
      doneResolve?.();
      doneResolve = null;
    }
  })();
  return done;
}

/**
 * Đọc to một câu với cơ chế chống spam:
 * - Đang đọc đúng câu đó (hoặc vừa đọc < 1.15s): bỏ qua để không "quả... quả... quả...".
 * - Bé chuyển nhanh giữa các mục: debounce để chỉ đọc mục cuối.
 * - `force: true` cho câu khen/đếm số cần đọc ngay. `style`: friendly | cheer | animal | story | soft.
 */
export function speak(text, { interrupt = true, force = false, style = null } = {}) {
  if (!text) return Promise.resolve();
  const now = performance.now();
  const busy = currentText !== '';

  if (!force) {
    if (busy && currentText === text) return Promise.resolve();
    if (lastSpokenText === text && now - lastSpokenAt < 1150) return Promise.resolve();
  }
  clearTimeout(pendingTimer);

  if (!interrupt && busy) {
    return new Promise((resolve) => {
      pendingTimer = setTimeout(() => flushSpeech(text, { style }).then(resolve), 350);
    });
  }
  if (!force && busy && now - lastSpokenAt < 280) {
    return new Promise((resolve) => {
      pendingTimer = setTimeout(() => flushSpeech(text, { style }).then(resolve), 220);
    });
  }
  return flushSpeech(text, { style });
}

export const isSpeaking = () => currentText !== '';

export function stopSpeaking() {
  clearTimeout(pendingTimer);
  currentText = '';
  stopPlaying();
}
