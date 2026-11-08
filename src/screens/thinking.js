// 2 chủ đề tư duy cho bé 3-4 tuổi, độ khó tự tăng/giảm theo từng trò và được nhớ lại lần sau:
// 🧠 Thử thách: 🙈 Cái gì biến mất? · 📏 Xếp nhỏ → to · 🔜 Trước - sau · 🧺 Phân loại
// 💡 Đố vui:    🤔 Nghe câu đố · 🔗 Cái gì đi với nhau?
import { makeScreen, makeModePills, el, onTap, pick, shuffle } from '../ui.js';
import { speak, sfx, prefetchVoice } from '../audio.js';
import { bounce, shake, confetti } from '../fx.js';
import {
  memoryItems, sizeItems, sequences, sortRules, riddles, pairs, T,
  missWin, sortWrong, riddleWin, seqWin,
} from '../thinking-data.js';

// ---------- Độ khó: ván không sai -> +1 điểm, sai nhiều -> -1; cứ 2 điểm lên 1 cấp ----------
const lvKey = (m) => `bhv.lv.${m}`;
const getScore = (m) => parseInt(localStorage.getItem(lvKey(m)) || '0', 10) || 0;
const levelOf = (m, max) => Math.min(max, Math.floor(getScore(m) / 2));
function record(m, mistakes, max) {
  const before = levelOf(m, max);
  const s = Math.max(0, Math.min(max * 2 + 1, getScore(m) + (mistakes === 0 ? 1 : mistakes >= 2 ? -1 : 0)));
  localStorage.setItem(lvKey(m), String(s));
  return levelOf(m, max) > before;
}

function makeThinkingScreen(root, go, modes, builders) {
  let mode = modes[0].id;
  let promptFn = () => {};
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let stars = 0;

  const pills = makeModePills(modes, mode, (m) => { mode = m; mount(); });
  const starsEl = el('div', 'stars', '⭐ 0');
  const replay = el('button', 'btn-round', '🔊');
  replay.setAttribute('aria-label', 'Nghe lại');
  const right = el('div', 'right-row');
  right.append(starsEl, replay);
  const { stage } = makeScreen(root, go, { center: pills, right });
  onTap(replay, () => { sfx.tap(); bounce(replay); promptFn(); }, { cooldown: 1100 });

  function mount() {
    timers.forEach(clearTimeout);
    timers.length = 0;
    stage.innerHTML = '';
    promptFn = () => {};
    const m = modes.find((x) => x.id === mode);
    builders[mode](api(m));
  }

  const api = (m) => ({
    stage,
    later,
    level: () => levelOf(m.id, m.max),
    setPrompt: (fn) => { promptFn = fn; },
    win(mistakes, msg, delay = 2800) {
      stars++;
      starsEl.textContent = `⭐ ${stars}`;
      bounce(starsEl);
      const up = record(m.id, mistakes, m.max);
      const milestone = stars % 5 === 0;
      milestone ? sfx.fanfare() : sfx.success();
      confetti(milestone || up ? 110 : 45);
      speak(msg, { force: true }).then(() => { if (up) speak(T.levelUp, { force: true }); });
      later(mount, delay + (up ? 2400 : 0));
    },
  });

  mount();
  return () => timers.forEach(clearTimeout);
}

/** Hàng lựa chọn dạng thẻ trắng (dùng chung). */
function choiceRow(opts, onPick, cls = '') {
  const row = el('div', `num-choices ${cls}`);
  row.style.gridTemplateColumns = `repeat(${opts.length}, 1fr)`;
  opts.forEach((opt) => {
    const b = el('button', 'cell quiz-shape-cell', `<span class="item">${opt.e}</span>`);
    onTap(b, () => { if (!b.classList.contains('dim')) onPick(opt, b, row); }, { cooldown: 850 });
    row.append(b);
  });
  return row;
}
const markRight = (b, row) => {
  b.classList.add('right');
  [...row.children].forEach((c) => c !== b && c.classList.add('dim'));
};
const markWrong = (b) => { sfx.wrong(); shake(b); b.classList.add('dim'); };

// =====================================================================================
// 🧠 THỬ THÁCH
// =====================================================================================
export function challengeScreen(root, go) {
  return makeThinkingScreen(
    root,
    go,
    [
      { id: 'missing', icon: '🙈', label: 'Cái gì biến mất', max: 3 },
      { id: 'size', icon: '📏', label: 'Xếp nhỏ đến to', max: 3 },
      { id: 'seq', icon: '🐣', label: 'Trước và sau', max: 2 },
      { id: 'sort', icon: '🧺', label: 'Phân loại', max: 2 },
    ],
    { missing, size, seq, sort }
  );
}

// ---------- 🙈 Cái gì biến mất? (trí nhớ ngắn hạn) ----------
// Cấp 0: 3 bạn, giữ chỗ trống · 1: 4 bạn · 2: 5 bạn · 3: 5 bạn và các bạn còn lại bị xáo chỗ
function missing({ stage, later, level, setPrompt, win }) {
  const lv = level();
  const n = [3, 4, 5, 5][lv];
  const set = shuffle(memoryItems).slice(0, n);
  const gone = pick(set);
  const others = shuffle(memoryItems.filter((x) => !set.includes(x))).slice(0, lv >= 2 ? 3 : 2);
  let mistakes = 0;
  let done = false;

  const wrap = el('div', 'num-quiz-stage');
  const box = el('div', 'num-showcase pattern-row mem-row');
  box.style.setProperty('--n', n);
  const curtain = el('div', 'curtain', '🙈');
  box.append(curtain);
  const spans = set.map((it) => el('span', 'show-item', it.e));
  spans.forEach((s) => box.append(s));
  const bottom = el('div', 'num-choices wait-row', '<span class="show-item">👀</span>');
  wrap.append(box, bottom);
  stage.append(wrap);
  prefetchVoice([T.missLook, T.missHide, T.missAsk, missWin(gone.n)]);

  setPrompt(() => speak(T.missLook));
  later(() => speak(T.missLook, { force: true }), 300);
  // Đọc tên từng bạn cho bé ghi nhớ (cấp dễ)
  if (lv === 0) set.forEach((it, i) => later(() => { bounce(spans[i]); speak(it.n, { force: true }); }, 3000 + i * 1300));
  const lookMs = lv === 0 ? 3000 + n * 1300 + 900 : 3200 + n * 900;

  later(() => {
    curtain.classList.add('on');
    sfx.swoosh();
    speak(T.missHide, { force: true });
  }, lookMs);

  later(() => {
    // Bạn biến mất, chỗ của bạn ấy thành ❓ (cấp 3: xáo chỗ và không còn ô trống)
    if (lv >= 3) {
      box.querySelectorAll('.show-item').forEach((s) => s.remove());
      shuffle(set.filter((x) => x !== gone)).forEach((it) => box.append(el('span', 'show-item', it.e)));
    } else {
      spans[set.indexOf(gone)].replaceWith(el('span', 'show-item slot', '❓'));
    }
    curtain.classList.remove('on');
    sfx.pop();
    const opts = shuffle([gone, ...others]);
    const row = choiceRow(opts, (opt, b, r) => {
      if (done) return;
      if (opt === gone) {
        done = true;
        markRight(b, r);
        const slot = box.querySelector('.slot');
        if (slot) { slot.classList.remove('slot'); slot.innerHTML = gone.e; bounce(slot); }
        win(mistakes, missWin(gone.n));
      } else {
        mistakes++;
        markWrong(b);
        speak(T.missNever);
      }
    });
    bottom.replaceWith(row);
    setPrompt(() => speak(T.missAsk));
    speak(T.missAsk, { force: true });
  }, lookMs + 2600);
}

// ---------- 📏 Xếp theo kích thước ----------
// Cấp 0: 3 cỡ · 1: 4 cỡ · 2: 5 cỡ · 3: 4 cỡ nhưng xếp từ TO đến NHỎ
function size({ stage, level, setPrompt, win }) {
  const lv = level();
  const n = [3, 4, 5, 4][lv];
  const bigFirst = lv === 3;
  const it = pick(sizeItems);
  const scales = Array.from({ length: n }, (_, i) => 0.34 + (0.66 * i) / (n - 1));
  const order = bigFirst ? [...scales].reverse() : scales;
  let idx = 0;
  let mistakes = 0;
  const msg = bigFirst ? T.sizeBig : T.sizeSmall;

  const wrap = el('div', 'num-quiz-stage');
  const field = el('div', 'num-showcase size-field');
  const tray = el('div', 'num-showcase tray');
  const slots = order.map(() => {
    const s = el('span', 'tray-slot', '');
    tray.append(s);
    return s;
  });
  shuffle(scales).forEach((sc) => {
    const b = el('button', 'size-btn', `<span class="show-item" style="transform:scale(${sc.toFixed(2)})">${it.e}</span>`);
    onTap(b, () => {
      if (b.classList.contains('used')) return;
      if (Math.abs(sc - order[idx]) < 0.001) {
        sfx.note(523 * 2 ** (idx / 6), 0.5);
        b.classList.add('used');
        slots[idx].innerHTML = `<span class="show-item" style="transform:scale(${sc.toFixed(2)})">${it.e}</span>`;
        bounce(slots[idx]);
        idx++;
        if (idx === n) win(mistakes, T.sizeWin);
      } else {
        mistakes++;
        sfx.wrong();
        shake(b);
        speak(bigFirst ? T.sizeWrongBig : T.sizeWrongSmall);
      }
    }, { cooldown: 500 });
    field.append(b);
  });
  wrap.append(field, tray);
  stage.append(wrap);
  setPrompt(() => speak(msg));
  speak(msg, { force: true });
}

// ---------- 🔜 Cái gì trước, cái gì sau? ----------
// Cấp 0-1: chuỗi 3 bước · 2: có cả chuỗi 4 bước
function seq({ stage, level, setPrompt, win }) {
  const lv = level();
  const pool = sequences.filter((s) => (lv >= 2 ? true : s.steps.length === 3));
  const s = pick(pool);
  let idx = 0;
  let mistakes = 0;

  const wrap = el('div', 'num-quiz-stage');
  const tray = el('div', 'num-showcase tray');
  const slots = s.steps.map((_, i) => {
    const sl = el('span', 'tray-slot num', String(i + 1));
    tray.append(sl);
    return sl;
  });
  const row = el('div', 'num-choices');
  row.style.gridTemplateColumns = `repeat(${s.steps.length}, 1fr)`;
  shuffle(s.steps).forEach((step) => {
    const b = el('button', 'cell quiz-shape-cell', `<span class="item">${step.e}</span>`);
    onTap(b, () => {
      if (b.classList.contains('used')) return;
      if (step === s.steps[idx]) {
        b.classList.add('used', 'dim');
        slots[idx].classList.remove('num');
        slots[idx].innerHTML = `<span class="show-item">${step.e}</span>`;
        bounce(slots[idx]);
        sfx.tap();
        idx++;
        if (idx === s.steps.length) win(mistakes, seqWin(s), 3600);
        else speak(step.n, { force: true });
      } else {
        mistakes++;
        sfx.wrong();
        shake(b);
        speak(T.seqWrong);
      }
    }, { cooldown: 700 });
    row.append(b);
  });
  wrap.append(tray, row);
  stage.append(wrap);
  prefetchVoice([T.seqAsk, ...s.steps.map((x) => x.n), seqWin(s)]);
  setPrompt(() => speak(T.seqAsk));
  speak(T.seqAsk, { force: true });
}

// ---------- 🧺 Phân loại vào 2 giỏ ----------
// Cấp 0: 4 món · 1: 6 món · 2: 8 món
function sort({ stage, later, level, setPrompt, win }) {
  const lv = level();
  const count = [4, 6, 8][lv];
  const r = pick(sortRules);
  const half = count / 2;
  const queue = shuffle([
    ...shuffle(r.a.items).slice(0, half).map((it) => ({ it, g: r.a })),
    ...shuffle(r.b.items).slice(0, half).map((it) => ({ it, g: r.b })),
  ]);
  let i = 0;
  let mistakes = 0;
  let busy = false;

  const wrap = el('div', 'num-quiz-stage sort-stage');
  const top = el('div', 'num-showcase');
  const cur = el('span', 'show-item', '');
  const left = el('span', 'sort-left', '');
  top.append(cur, left);
  const baskets = el('div', 'num-choices');
  baskets.style.gridTemplateColumns = 'repeat(2, 1fr)';
  [r.a, r.b].forEach((g) => {
    const b = el('button', 'cell basket', `<span class="basket-ico">${g.e}</span><span class="basket-label">${g.label}</span><span class="basket-got"></span>`);
    onTap(b, () => {
      if (busy || i >= queue.length) return;
      const q = queue[i];
      if (q.g === g) {
        busy = true;
        sfx.pop();
        b.querySelector('.basket-got').append(q.it.e);
        bounce(b.querySelector('.basket-ico'));
        cur.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(40%) scale(.3)', opacity: 0 }], { duration: 320 });
        i++;
        later(() => {
          busy = false;
          if (i === queue.length) win(mistakes, T.sortWin);
          else show();
        }, 360);
      } else {
        mistakes++;
        sfx.wrong();
        shake(b);
        speak(sortWrong(q.it, q.g), { force: true });
      }
    }, { cooldown: 500 });
    baskets.append(b);
  });

  function show() {
    const q = queue[i];
    cur.innerHTML = q.it.e;
    left.textContent = `${queue.length - i}`;
    cur.animate([{ transform: 'scale(0)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,1.5,.4,1)' });
    speak(q.it.n, { interrupt: false });
  }

  wrap.append(top, baskets);
  stage.append(wrap);
  prefetchVoice([r.prompt, ...queue.map((q) => q.it.n)]);
  setPrompt(() => speak(r.prompt));
  speak(r.prompt, { force: true });
  show();
}

// =====================================================================================
// 💡 ĐỐ VUI
// =====================================================================================
export function riddleScreen(root, go) {
  return makeThinkingScreen(
    root,
    go,
    [
      { id: 'riddle', icon: '🤔', label: 'Nghe câu đố', max: 1 },
      { id: 'pair', icon: '🔗', label: 'Cái gì đi với nhau', max: 1 },
    ],
    { riddle, pair }
  );
}

const riddleBag = [];
const pairBag = [];
const fromBag = (bag, all) => {
  if (!bag.length) bag.push(...shuffle(all));
  return bag.pop();
};

// ---------- 🤔 Nghe câu đố (không có chữ, bé phải nghe hiểu) ----------
// Cấp 0: 3 lựa chọn · 1: 4 lựa chọn
function riddle({ stage, later, level, setPrompt, win }) {
  const r = fromBag(riddleBag, riddles);
  const opts = shuffle([r.a, ...shuffle(r.w).slice(0, level() >= 1 ? 3 : 2)]);
  let mistakes = 0;
  let done = false;
  const wrap = el('div', 'num-quiz-stage');
  const ear = el('button', 'num-showcase ear', '<span class="show-item">🤔</span><span class="show-item small">👂</span>');
  const ask = () => speak(r.q, { force: true });
  onTap(ear, () => { bounce(ear.firstChild); ask(); }, { cooldown: 1500 });
  const row = choiceRow(opts, (opt, b, rw) => {
    if (done) return;
    if (opt === r.a) {
      done = true;
      markRight(b, rw);
      ear.firstChild.innerHTML = r.a.e;
      bounce(ear.firstChild);
      win(mistakes, riddleWin(r.a.n));
    } else {
      mistakes++;
      markWrong(b);
      speak(T.riddleWrong, { force: true }).then(() => !done && later(ask, 200));
    }
  });
  wrap.append(ear, row);
  stage.append(wrap);
  prefetchVoice([r.q, riddleWin(r.a.n)]);
  setPrompt(ask);
  later(ask, 300);
}

// ---------- 🔗 Cái gì đi với nhau? ----------
function pair({ stage, later, level, setPrompt, win }) {
  const p = fromBag(pairBag, pairs);
  const wrong = shuffle(pairs.filter((x) => x !== p)).slice(0, level() >= 1 ? 3 : 2).map((x) => x.b);
  const opts = shuffle([p.b, ...wrong]);
  let mistakes = 0;
  let done = false;
  const wrap = el('div', 'num-quiz-stage');
  const box = el('div', 'num-showcase pattern-row mem-row');
  box.style.setProperty('--n', 3);
  const a = el('span', 'show-item', p.a.e);
  const slot = el('span', 'show-item slot', '❓');
  box.append(a, el('span', 'show-item plus', '➕'), slot);
  const row = choiceRow(opts, (opt, b, rw) => {
    if (done) return;
    if (opt === p.b) {
      done = true;
      markRight(b, rw);
      slot.classList.remove('slot');
      slot.innerHTML = p.b.e;
      bounce(slot);
      win(mistakes, `Đúng rồi! ${p.ok}`);
    } else {
      mistakes++;
      markWrong(b);
      speak(T.pairWrong);
    }
  });
  wrap.append(box, row);
  stage.append(wrap);
  prefetchVoice([p.q, `Đúng rồi! ${p.ok}`]);
  setPrompt(() => speak(p.q));
  later(() => speak(p.q, { force: true }), 300);
}
