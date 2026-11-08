// Đàn piano 8 phím cầu vồng: hỗ trợ nhiều ngón cùng lúc + vuốt ngang để lướt phím
import { makeScreen, el, onTap } from '../ui.js';
import { sfx } from '../audio.js';

const KEYS = [
  { f: 261.63, c: '#ef233c', e: '🐱' },
  { f: 293.66, c: '#fb8500', e: '🐶' },
  { f: 329.63, c: '#ffd60a', e: '🐥' },
  { f: 349.23, c: '#38b000', e: '🐸' },
  { f: 392.0, c: '#00b4d8', e: '🐳' },
  { f: 440.0, c: '#1e88e5', e: '🐦' },
  { f: 493.88, c: '#8e44ad', e: '🦄' },
  { f: 523.25, c: '#ff70a6', e: '🐷' },
];
const LOW_G = 196.0;

// "Kìa con bướm vàng" — [phím, số phách]; 'g' = Sol trầm
const SONG = [
  [0, 1], [1, 1], [2, 1], [0, 1], [0, 1], [1, 1], [2, 1], [0, 1],
  [2, 1], [3, 1], [4, 2], [2, 1], [3, 1], [4, 2],
  [4, 0.5], [5, 0.5], [4, 0.5], [3, 0.5], [2, 1], [0, 1],
  [4, 0.5], [5, 0.5], [4, 0.5], [3, 0.5], [2, 1], [0, 1],
  [0, 1], ['g', 1], [0, 2], [0, 1], ['g', 1], [0, 2],
];

export function pianoScreen(root, go) {
  const songBtn = el('button', 'btn-round', '🎶');
  songBtn.setAttribute('aria-label', 'Phát bài hát');
  const { stage } = makeScreen(root, go, { center: '<span class="title-emoji">🎹</span>', right: songBtn });
  const piano = el('div', 'piano');
  const keyEls = KEYS.map((k, i) => {
    const key = el('div', 'key', `<span>${k.e}</span>`);
    key.style.background = k.c;
    key.dataset.i = i;
    piano.append(key);
    return key;
  });
  stage.append(piano);

  function play(i) {
    const key = keyEls[i];
    sfx.note(KEYS[i].f);
    key.classList.add('on');
    setTimeout(() => key.classList.remove('on'), 180);
    const note = el('div', 'float-note', ['🎵', '🎶', '⭐'][i % 3]);
    key.append(note);
    note.animate(
      [{ transform: 'translate(-50%,0) scale(.6)', opacity: 1 }, { transform: 'translate(-50%,-30vmin) scale(1.4)', opacity: 0 }],
      { duration: 900, easing: 'ease-out' }
    ).onfinish = () => note.remove();
  }

  // Theo dõi từng ngón tay: chạm hoặc lướt sang phím mới thì phát nốt
  const lastKey = new Map();
  const keyAt = (x, y) => document.elementFromPoint(x, y)?.closest('.key');
  const handle = (e) => {
    const key = keyAt(e.clientX, e.clientY);
    const idx = key ? +key.dataset.i : -1;
    if (idx >= 0 && lastKey.get(e.pointerId) !== idx) play(idx);
    lastKey.set(e.pointerId, idx);
  };
  piano.addEventListener('pointerdown', handle);
  piano.addEventListener('pointermove', (e) => lastKey.has(e.pointerId) && handle(e));
  const end = (e) => lastKey.delete(e.pointerId);
  piano.addEventListener('pointerup', end);
  piano.addEventListener('pointercancel', end);

  let songTimers = [];
  const stopSong = () => {
    songTimers.forEach(clearTimeout);
    songTimers = [];
    songBtn.classList.remove('pulse');
  };
  onTap(songBtn, () => {
    if (songTimers.length) return stopSong();
    songBtn.classList.add('pulse');
    let t = 0;
    const beat = 450;
    SONG.forEach(([k, b]) => {
      songTimers.push(setTimeout(() => (k === 'g' ? sfx.note(LOW_G) : play(k)), t));
      t += b * beat;
    });
    songTimers.push(setTimeout(stopSong, t));
  });

  return stopSong;
}
