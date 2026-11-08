import { el, onTap } from '../ui.js';
import { speak, sfx } from '../audio.js';
import { bounce } from '../fx.js';
import { attachParentGate } from '../settings.js';
import { animals, fruits, vehicles } from '../data.js';

export const TOPICS = [
  { e: '🧠', n: 'Thử thách', bg: '#2a9d8f', screen: 'challenge' },
  { e: '💡', n: 'Đố vui', bg: '#e76f51', screen: 'riddle' },
  { e: '🐶', n: 'Động vật', bg: '#ff8c42', screen: 'vocab', params: { items: animals, icon: '🐶' } },
  { e: '🍎', n: 'Trái cây', bg: '#ef476f', screen: 'vocab', params: { items: fruits, icon: '🍎' } },
  { e: '🚗', n: 'Xe cộ', bg: '#118ab2', screen: 'vocab', params: { items: vehicles, icon: '🚗' } },
  { e: '🎨', n: 'Màu sắc', bg: '#8e44ad', screen: 'colors' },
  { e: '🔢', n: 'Đếm số', bg: '#06d6a0', screen: 'count' },
  { e: '🔺', n: 'Hình khối', bg: '#f4a261', screen: 'shapes' },
  { e: '🧩', n: 'Trò chơi', bg: '#7b5cff', screen: 'games' },
  { e: '🎯', n: 'Tìm đúng', bg: '#e63946', screen: 'quiz' },
  { e: '🎹', n: 'Đàn piano', bg: '#3a86ff', screen: 'piano' },
  { e: '🎈', n: 'Bóng bay', bg: '#ff70a6', screen: 'bubbles' },
];

export function homeScreen(root, go) {
  const screen = el('div', 'screen home');
  const bar = el('div', 'topbar home-bar', '<div class="logo-sm">☀️ Bé Học Vui</div>');
  attachParentGate(bar.firstChild);
  const stage = el('div', 'stage');
  const grid = el('div', 'home-grid');

  let navigating = false;

  TOPICS.forEach((t, i) => {
    const tile = el('button', 'tile', `<span class="emoji">${t.e}</span><span class="label">${t.n}</span>`);
    tile.style.background = t.bg;
    tile.style.animationDelay = `${i * 40}ms`;
    tile.setAttribute('aria-label', t.n);
    onTap(
      tile,
      () => {
        if (navigating) return;
        navigating = true;
        sfx.tap();
        bounce(tile.querySelector('.emoji'));
        tile.classList.add('pressed');
        speak(t.n, { force: true });
        setTimeout(() => {
          go(t.screen, { ...(t.params || {}), title: t.n });
        }, 240);
      },
      { cooldown: 900 }
    );
    grid.append(tile);
  });

  stage.append(grid);
  screen.append(bar, stage);
  root.append(screen);
}
