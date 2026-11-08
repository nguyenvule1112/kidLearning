// Chủ đề "Trò chơi trí tuệ": 4 trò chơi đan xen, độ khó tự tăng theo bé
// 🃏 Lật thẻ trí nhớ · 👤 Bóng đen bí ẩn · 🎭 Ai khác biệt? · 🔁 Tiếp theo là gì?
import { makeScreen, makeModePills, el, onTap, autoGrid, createSmartBag, pick, shuffle, lower1 } from '../ui.js';
import { speak, sfx } from '../audio.js';
import { bounce, shake, confetti } from '../fx.js';
import { animals, fruits, vehicles, praises } from '../data.js';

const GROUPS = [
  { items: animals, name: 'những con vật' },
  { items: fruits, name: 'những loại trái cây' },
  { items: vehicles, name: 'những phương tiện' },
];
const ALL = [...animals, ...fruits, ...vehicles];

export function gamesScreen(root, go) {
  let mode = 'memory';
  let sub = null;
  let promptFn = () => {};
  let wins = 0; // số ván thắng -> tăng độ khó

  const pills = makeModePills(
    [
      { id: 'memory', icon: '🃏', label: 'Lật thẻ' },
      { id: 'shadow', icon: '👤', label: 'Bóng đen' },
      { id: 'odd', icon: '🎭', label: 'Ai khác biệt' },
      { id: 'pattern', icon: '🔁', label: 'Tiếp theo là gì' },
    ],
    mode,
    (m) => {
      mode = m;
      mount();
    }
  );
  const replay = el('button', 'btn-round', '🔊');
  replay.setAttribute('aria-label', 'Nghe lại');
  const { stage } = makeScreen(root, go, { center: pills, right: replay });
  onTap(replay, () => { sfx.tap(); bounce(replay); promptFn(); }, { cooldown: 1100 });

  const bag = createSmartBag(ALL);
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function mount() {
    sub?.();
    timers.forEach(clearTimeout);
    timers.length = 0;
    stage.innerHTML = '';
    sub = { memory, shadow, odd, pattern }[mode]();
  }

  const win = (cell, msg, delay = 2600) => {
    wins++;
    sfx.success();
    confetti(wins % 4 === 0 ? 100 : 45);
    speak(msg, { force: true });
    later(() => ROUND(), delay);
  };
  let ROUND = () => {};

  // ---------- 🃏 Lật thẻ trí nhớ ----------
  function memory() {
    const pairs = Math.min(2 + Math.floor(wins / 2), 5); // 2 → 5 cặp
    const pool = shuffle(ALL).slice(0, pairs);
    const cards = shuffle([...pool, ...pool]);
    const grid = el('div', 'grid-pick mem-grid');
    stage.append(grid);
    const stop = autoGrid(grid, cards.length);
    let first = null;
    let lock = false;
    let matched = 0;
    promptFn = () => speak('Bé lật hai thẻ giống nhau nhé!');
    ROUND = mount;

    const show = (c) => {
      c.cell.classList.add('flipped');
      c.cell.innerHTML = `<span class="item">${c.it.e}</span>`;
      c.cell.animate([{ transform: 'rotateY(90deg) scale(.8)' }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
    };
    const hide = (c) => {
      c.cell.classList.remove('flipped');
      c.cell.innerHTML = '<span class="item">🌟</span>';
      c.cell.animate([{ transform: 'rotateY(90deg)' }, { transform: 'none' }], { duration: 220 });
    };

    cards.forEach((it) => {
      const cell = el('button', 'cell mem-card', '<span class="item">🌟</span>');
      const c = { it, cell, open: false };
      onTap(
        cell,
        () => {
          if (lock || c.open) return;
          c.open = true;
          sfx.tap();
          show(c);
          speak(it.n, { force: true });
          if (!first) { first = c; return; }
          if (first.it === it) {
            const pair = [first, c];
            first = null;
            matched++;
            pair.forEach((p) => p.cell.classList.add('right'));
            if (matched === pairs) win(cell, `${pick(praises)} Bé tìm đủ các cặp rồi!`, 3200);
            else later(() => { sfx.success(); speak(`Đúng rồi! Hai ${lower1(it.n)} giống nhau!`, { force: true }); }, 500);
          } else {
            const pair = [first, c];
            first = null;
            lock = true;
            later(() => {
              sfx.wrong();
              pair.forEach((p) => { p.open = false; hide(p); });
              lock = false;
            }, 1100);
          }
        },
        { cooldown: 250, bounceOnSpam: false }
      );
      grid.append(cell);
    });
    later(promptFn, 300);
    return stop;
  }

  // ---------- 👤 Bóng đen bí ẩn ----------
  function shadow() {
    const target = bag.next();
    const opts = shuffle([target, ...shuffle(ALL.filter((x) => x !== target)).slice(0, wins < 3 ? 1 : 2)]);
    let locked = false;
    const wrap = el('div', 'num-quiz-stage');
    const box = el('div', 'num-showcase', `<span class="show-item sil">${target.e}</span>`);
    const row = el('div', 'num-choices');
    row.style.gridTemplateColumns = `repeat(${opts.length}, 1fr)`;
    promptFn = () => speak('Ai đang trốn trong bóng đen thế nhỉ? Bé chọn nhé!');
    ROUND = mount;
    opts.forEach((opt) => {
      const b = el('button', 'cell quiz-shape-cell', `<span class="item">${opt.e}</span>`);
      onTap(
        b,
        () => {
          if (locked || b.classList.contains('dim')) return;
          if (opt === target) {
            locked = true;
            box.firstChild.classList.remove('sil');
            bounce(box.firstChild);
            b.classList.add('right');
            [...row.children].forEach((c) => c !== b && c.classList.add('dim'));
            win(b, `${pick(praises)} Là ${lower1(target.n)}!`);
          } else {
            sfx.wrong();
            shake(b);
            b.classList.add('dim');
            speak(`Không phải ${lower1(opt.n)}. Bé thử lại nhé!`);
          }
        },
        { cooldown: 850 }
      );
      row.append(b);
    });
    wrap.append(box, row);
    stage.append(wrap);
    later(promptFn, 300);
  }

  // ---------- 🎭 Ai khác biệt? ----------
  function odd() {
    const [ga, gb] = shuffle(GROUPS).slice(0, 2);
    const same = shuffle(ga.items).slice(0, wins < 3 ? 2 : 3);
    const diff = pick(gb.items);
    const opts = shuffle([...same, diff]);
    const grid = el('div', 'grid-pick quiz-grid');
    stage.append(grid);
    const stop = autoGrid(grid, opts.length);
    let locked = false;
    promptFn = () => speak('Có một bạn không giống các bạn còn lại! Bé tìm bạn khác biệt nhé!');
    ROUND = mount;
    opts.forEach((it, i) => {
      const cell = el('button', 'cell', `<span class="item">${it.e}</span>`);
      cell.animate([{ transform: 'scale(0)' }, { transform: 'none' }], { duration: 340, delay: i * 80, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'backwards' });
      onTap(
        cell,
        () => {
          if (locked || cell.classList.contains('dim')) return;
          if (it === diff) {
            locked = true;
            cell.classList.add('right');
            [...grid.children].forEach((c) => c !== cell && c.classList.add('dim'));
            win(cell, `${pick(praises)} ${it.n} khác với ${ga.name}!`);
          } else {
            sfx.wrong();
            shake(cell);
            cell.classList.add('dim');
            speak(`${it.n} giống các bạn kia. Bé tìm bạn khác nhé!`);
          }
        },
        { cooldown: 850 }
      );
      grid.append(cell);
    });
    later(promptFn, 300);
    return stop;
  }

  // ---------- 🔁 Tiếp theo là gì? ----------
  function pattern() {
    const k = wins < 3 ? 2 : 3; // ABAB → ABCABC
    const kinds = shuffle(pick(GROUPS).items).slice(0, k);
    const shape = k === 2 && Math.random() < 0.4 ? [0, 0, 1] : Array.from({ length: k }, (_, i) => i);
    const seq = [...shape, ...shape, ...shape];
    const shown = seq.slice(0, seq.length - 1);
    const answer = kinds[seq[seq.length - 1]];
    const opts = shuffle([answer, ...shuffle(ALL.filter((x) => x !== answer)).slice(0, 2)]);
    let locked = false;
    const wrap = el('div', 'num-quiz-stage');
    const box = el('div', 'num-showcase pattern-row');
    shown.forEach((i) => box.append(el('span', 'show-item', kinds[i].e)));
    const slot = el('span', 'show-item slot', '❓');
    box.append(slot);
    const row = el('div', 'num-choices');
    promptFn = () => speak(`${shown.map((i) => lower1(kinds[i].n)).join(', ')}, rồi đến gì nhỉ? Bé chọn nhé!`);
    ROUND = mount;
    opts.forEach((opt) => {
      const b = el('button', 'cell quiz-shape-cell', `<span class="item">${opt.e}</span>`);
      onTap(
        b,
        () => {
          if (locked || b.classList.contains('dim')) return;
          if (opt === answer) {
            locked = true;
            slot.innerHTML = opt.e;
            bounce(slot);
            b.classList.add('right');
            [...row.children].forEach((c) => c !== b && c.classList.add('dim'));
            win(b, `${pick(praises)} Tiếp theo là ${lower1(opt.n)}!`);
          } else {
            sfx.wrong();
            shake(b);
            b.classList.add('dim');
            speak('Chưa đúng rồi. Bé nhìn lại thứ tự nhé!');
          }
        },
        { cooldown: 850 }
      );
      row.append(b);
    });
    wrap.append(box, row);
    stage.append(wrap);
    later(promptFn, 300);
  }

  mount();
  return () => {
    sub?.();
    timers.forEach(clearTimeout);
  };
}
