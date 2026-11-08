// Bóng bay: 🎈 chơi tự do (nổ bóng, bóng có con vật/quả thì đọc tên) · 🎯 nổ bóng đúng màu theo yêu cầu
import { makeScreen, makeModePills, el, onTap, pick } from '../ui.js';
import { speak, sfx } from '../audio.js';
import { burst, confetti, shake } from '../fx.js';
import { animals, fruits } from '../data.js';

const COLORS = [
  { c: '#ef233c', n: 'Màu đỏ' },
  { c: '#ffca3a', n: 'Màu vàng' },
  { c: '#38b000', n: 'Màu xanh lá' },
  { c: '#1e88e5', n: 'Màu xanh dương' },
  { c: '#fb8500', n: 'Màu cam' },
  { c: '#8e44ad', n: 'Màu tím' },
  { c: '#ff70a6', n: 'Màu hồng' },
];
const MAX = 9;
const NEED = 3; // số bóng đúng màu cần nổ mỗi lượt

export function bubblesScreen(root, go) {
  let mode = 'free';
  const scoreEl = el('div', 'stars', '🎈 0');
  const pills = makeModePills(
    [
      { id: 'free', icon: '🎈', label: 'Chơi tự do' },
      { id: 'target', icon: '🎯', label: 'Nổ bóng đúng màu' },
    ],
    mode,
    (m) => {
      mode = m;
      reset();
    }
  );
  const holder = el('div', 'right-row');
  holder.append(scoreEl);
  const { stage } = makeScreen(root, go, { center: pills, right: holder });
  const area = el('div', 'bubbles');
  const banner = el('div', 'target-banner hidden');
  stage.append(area, banner);

  let score = 0;
  let target = null;
  let got = 0;
  let iv = null;
  const timers = [];

  function newTarget() {
    let t;
    do t = pick(COLORS);
    while (t === target);
    target = t;
    got = 0;
    banner.className = 'target-banner';
    banner.innerHTML = `<span class="dot" style="background:${t.c}"></span><span>0/${NEED}</span>`;
    speak(`Bé nổ ${NEED} quả bóng ${t.n.toLowerCase()} nhé!`, { force: true });
  }

  function reset() {
    area.innerHTML = '';
    score = 0;
    scoreEl.textContent = '🎈 0';
    clearInterval(iv);
    timers.forEach(clearTimeout);
    if (mode === 'target') newTarget();
    else {
      banner.className = 'target-banner hidden';
      target = null;
    }
    for (let i = 0; i < 3; i++) timers.push(setTimeout(spawn, i * 400));
    iv = setInterval(spawn, mode === 'target' ? 900 : 1100);
  }

  function spawn() {
    if (area.childElementCount >= MAX) return;
    const r = area.getBoundingClientRect();
    if (!r.width) return;
    const size = Math.min(r.width, r.height) * (0.2 + Math.random() * 0.1) + 40;
    // chế độ nhắm màu: ~45% bóng đúng màu cần tìm
    const col = mode === 'target' && Math.random() < 0.45 ? target : pick(COLORS);
    const thing = mode === 'free' && Math.random() < 0.6 ? pick(Math.random() < 0.5 ? animals : fruits) : null;
    const b = el('div', 'bubble', thing ? `<span>${thing.e}</span>` : '');
    b.style.width = b.style.height = size + 'px';
    b.style.left = Math.random() * (r.width - size) + 'px';
    b.style.setProperty('--c', col.c);
    area.append(b);

    const sway = (Math.random() - 0.5) * 80;
    const anim = b.animate(
      [
        { transform: `translate(0, ${size}px)` },
        { transform: `translate(${sway}px, ${-(r.height * 0.5)}px)`, offset: 0.5 },
        { transform: `translate(${-sway / 2}px, ${-(r.height + size * 1.2)}px)` },
      ],
      { duration: 6500 + Math.random() * 4000, easing: 'linear' }
    );
    anim.onfinish = () => b.remove();

    let lastWrong = 0;
    b.addEventListener('pointerdown', (e) => {
      if (b.dataset.popped) return;
      if (mode === 'target' && col !== target) {
        // sai màu: bóng lắc nhẹ, không nổ
        const now = performance.now();
        if (now - lastWrong < 1500) return;
        lastWrong = now;
        sfx.wrong();
        shake(b);
        speak(`Đây là bóng ${col.n.toLowerCase()}. Mình tìm bóng ${target.n.toLowerCase()} nhé!`);
        return;
      }
      b.dataset.popped = '1';
      anim.pause();
      sfx.pop(0.8 + Math.random() * 0.6);
      burst(e.clientX, e.clientY, 12);
      score++;
      scoreEl.textContent = `🎈 ${score}`;
      if (thing) speak(thing.n);
      if (mode === 'target' && got >= 0) {
        got++;
        banner.lastChild.textContent = `${got}/${NEED}`;
        if (got >= NEED) {
          sfx.fanfare();
          confetti(60);
          speak('Hoan hô! Bé giỏi quá!', { force: true });
          timers.push(setTimeout(newTarget, 2400));
          got = -99; // tạm khóa đến khi đổi màu mới
        } else speak(['Một', 'Hai', 'Ba'][got - 1] + '!', { force: true });
      }
      const tr = getComputedStyle(b).transform;
      b.animate([{ transform: tr + ' scale(1)', opacity: 1 }, { transform: tr + ' scale(1.6)', opacity: 0 }], {
        duration: 220,
        easing: 'ease-out',
      }).onfinish = () => b.remove();
    });
  }

  reset();
  return () => {
    clearInterval(iv);
    timers.forEach(clearTimeout);
  };
}
