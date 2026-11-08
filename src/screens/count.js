// Đếm số 1 → 10: KHÔNG đếm tuần tự 1→10 đơn điệu nữa!
// - Rút số ngẫu nhiên thông minh theo bậc (khởi đầu 1–4, quen dần mở tới 10; một số có thể lặp lại sau 1–2 ván để ôn).
// - Xoay vòng 3 kiểu chơi:
//   1. 👆 Chạm đếm từng đồ vật (có khóa nhịp 520ms để bé đếm từng tiếng "Một... Hai... Ba", không bấm 1 giây xong 10 cái).
//   2. 🧺 Cho bạn ăn đủ số lượng (bấm vào rổ thức ăn để đút từng miếng cho Thỏ/Khỉ/Gấu).
//   3. 🔢 Có mấy bạn nhỉ? (nhìn nhóm đồ vật và chọn con số đúng trong 3 thẻ số lớn).

import { makeScreen, makeModePills, el, onTap, autoGrid, createSmartBag, pick, shuffle, cap1, ARROW_R } from '../ui.js';
import { speak, sfx } from '../audio.js';
import { bounce, shake, confetti } from '../fx.js';
import { countables, feeders, numberWords, praises } from '../data.js';

const SCALE = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
const ALL_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function countScreen(root, go) {
  let mode = 'mix'; // 'mix' tự động đổi kiểu chơi mỗi ván, hoặc chọn cố định
  let subCleanup = null;
  let roundsPlayed = 0;

  const pills = makeModePills(
    [
      { id: 'mix', icon: '🎲', label: 'Đổi kiểu tự động' },
      { id: 'touch', icon: '👆', label: 'Chạm đếm' },
      { id: 'feed', icon: '🧺', label: 'Cho bạn ăn' },
      { id: 'pickNum', icon: '🔢', label: 'Chọn số' },
      { id: 'more', icon: '⚖️', label: 'Nhiều hơn / ít hơn' },
    ],
    mode,
    (m) => {
      mode = m;
      nextRound();
    }
  );

  const badgeEl = el('div', 'count-num', '');
  const nextBtn = el('button', 'btn-round next-btn', ARROW_R);
  nextBtn.setAttribute('aria-label', 'Bài khác');
  const rightWrap = el('div', 'right-row');
  rightWrap.append(badgeEl, nextBtn);

  const { stage } = makeScreen(root, go, { center: pills, right: rightWrap });

  const numBag = createSmartBag(ALL_NUMS);
  const objBag = createSmartBag(countables);
  const feedBag = createSmartBag(feeders);

  // Rút số ngẫu nhiên thông minh: mấy ván đầu ưu tiên 1-5 cho bé 3 tuổi dễ làm quen,
  // sau đó mở rộng lên 1-10 và đôi khi lặp lại số vừa học cách 1 ván.
  function pickRandomNumber(maxLimit = 10) {
    const cap = Math.min(maxLimit, roundsPlayed < 2 ? 4 : roundsPlayed < 5 ? 6 : 10);
    return numBag.next((x) => x <= cap);
  }

  onTap(
    nextBtn,
    () => {
      sfx.swoosh();
      nextRound();
    },
    { cooldown: 1100, lockVisual: true }
  );

  function nextRound() {
    subCleanup?.();
    stage.innerHTML = '';
    nextBtn.classList.remove('pulse');
    roundsPlayed++;

    const MIX = ['touch', 'feed', 'more', 'pickNum', 'touch', 'more', 'feed', 'pickNum'];
    const actualMode = mode !== 'mix' ? mode : MIX[(roundsPlayed - 1) % MIX.length];

    if (actualMode === 'touch') subCleanup = renderTouchCount();
    else if (actualMode === 'feed') subCleanup = renderFeedCount();
    else if (actualMode === 'more') subCleanup = renderCompare();
    else subCleanup = renderPickNumber();
  }

  // ---------- Kiểu 1: Chạm đếm từng đồ vật (có khóa nhịp toàn cục 520ms) ----------
  function renderTouchCount() {
    const n = pickRandomNumber(10);
    const obj = objBag.next();
    let counted = 0;
    let lastCountAt = 0; // Khóa nhịp: bắt buộc cách nhau >= 520ms giữa 2 số đếm

    badgeEl.textContent = `0/${n}`;
    const grid = el('div', 'grid-pick count-grid');
    stage.append(grid);
    const stopFit = autoGrid(grid, n);
    const timers = [];

    for (let k = 0; k < n; k++) {
      const cell = el('button', 'cell', `<span class="item">${obj.e}</span>`);
      cell.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
        duration: 320,
        delay: k * 55,
        easing: 'cubic-bezier(.2,1.4,.4,1)',
        fill: 'backwards',
      });

      cell.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const item = cell.querySelector('.item');
        bounce(item);

        // Ô đã đếm rồi -> chỉ kêu tiếng nhẹ, không đọc lại làm loạn
        if (cell.classList.contains('counted')) {
          sfx.boing();
          return;
        }

        // Chống bé quẹt/đập 5 ngón tay cùng lúc đếm vèo từ 1 lên 5:
        const now = performance.now();
        if (now - lastCountAt < 520) {
          sfx.boing();
          return;
        }
        lastCountAt = now;

        counted++;
        cell.classList.add('counted');
        cell.append(el('span', 'badge', String(counted)));
        sfx.note(SCALE[counted - 1], 0.5);
        badgeEl.textContent = `${counted}/${n}`;
        bounce(badgeEl);

        if (counted === n) {
          speak(`${cap1(numberWords[n])}! Tất cả có ${numberWords[n]} ${obj.n}. ${pick(praises)}`, { force: true });
          timers.push(
            setTimeout(() => {
              sfx.success();
              confetti(n * 5 + 25);
              nextBtn.classList.add('pulse');
            }, 250)
          );
          timers.push(setTimeout(nextRound, 3600));
        } else {
          speak(cap1(numberWords[counted]), { force: true });
        }
      });

      grid.append(cell);
    }

    timers.push(setTimeout(() => speak(`Mình cùng đếm xem có mấy ${obj.n} nhé!`), 250));
    return () => {
      timers.forEach(clearTimeout);
      stopFit();
    };
  }

  // ---------- Kiểu 2: Đút cho bạn ăn đủ số lượng (1–6) ----------
  function renderFeedCount() {
    const n = pickRandomNumber(6);
    const pair = feedBag.next();
    let fed = 0;

    badgeEl.textContent = `0/${n}`;
    const wrap = el(
      'div',
      'feed-stage',
      `<div class="feed-char-card">
         <div class="feed-target-hint">Cần <b>${n}</b> ${pair.food}</div>
         <div class="feed-char">${pair.char}</div>
         <div class="feed-plate"></div>
       </div>
       <button class="feed-basket">
         <span class="basket-food">${pair.food}</span>
         <span class="basket-label">Chạm cho ăn</span>
       </button>`
    );
    stage.append(wrap);

    const charEl = wrap.querySelector('.feed-char');
    const plateEl = wrap.querySelector('.feed-plate');
    const basketBtn = wrap.querySelector('.feed-basket');
    const timers = [];

    // Khóa 680ms giữa 2 lần đút thức ăn để bé nghe rõ từng số đếm
    onTap(
      basketBtn,
      () => {
        if (fed >= n) return;
        fed++;
        sfx.note(SCALE[fed - 1], 0.45);
        bounce(charEl);
        bounce(basketBtn.querySelector('.basket-food'));

        const piece = el('span', 'plate-item', pair.food);
        plateEl.append(piece);
        badgeEl.textContent = `${fed}/${n}`;
        bounce(badgeEl);

        if (fed === n) {
          basketBtn.classList.add('cooling');
          speak(`${cap1(numberWords[n])}! Đủ ${numberWords[n]} ${pair.foodName} cho ${pair.charName} rồi! ${pick(praises)}`, {
            force: true,
          });
          timers.push(
            setTimeout(() => {
              sfx.fanfare();
              confetti(45);
              nextBtn.classList.add('pulse');
            }, 250)
          );
          timers.push(setTimeout(nextRound, 3600));
        } else {
          speak(cap1(numberWords[fed]), { force: true });
        }
      },
      { cooldown: 680 }
    );

    timers.push(
      setTimeout(() => speak(`Cho ${pair.charName} ăn ${numberWords[n]} ${pair.foodName} nhé!`), 250)
    );
    return () => timers.forEach(clearTimeout);
  }

  // ---------- Kiểu 3: Nhìn nhóm đồ vật và chọn con số đúng (1–6) ----------
  function renderPickNumber() {
    const n = pickRandomNumber(6);
    const obj = objBag.next();
    let locked = false;
    const timers = [];

    badgeEl.textContent = '?';
    const wrap = el('div', 'num-quiz-stage');
    const showcase = el('div', 'num-showcase');
    for (let i = 0; i < n; i++) {
      const sp = el('span', 'show-item', obj.e);
      sp.style.animationDelay = `${i * 70}ms`;
      onTap(
        sp,
        () => {
          sfx.tap();
          bounce(sp);
        },
        { cooldown: 400 }
      );
      showcase.append(sp);
    }

    const choicesRow = el('div', 'num-choices');
    const wrongPool = ALL_NUMS.slice(0, 7).filter((x) => x !== n);
    const options = shuffle([n, ...shuffle(wrongPool).slice(0, 2)]);

    options.forEach((val) => {
      const btn = el('button', 'num-card', String(val));
      onTap(
        btn,
        () => {
          if (locked || btn.classList.contains('dim')) return;
          if (val === n) {
            locked = true;
            badgeEl.textContent = String(n);
            btn.classList.add('right');
            [...choicesRow.children].forEach((c) => c !== btn && c.classList.add('dim'));
            sfx.success();
            confetti(40);
            speak(`Đúng rồi! Số ${numberWords[n]}! Có ${numberWords[n]} ${obj.n}!`, { force: true });
            nextBtn.classList.add('pulse');
            timers.push(setTimeout(nextRound, 3200));
          } else {
            sfx.wrong();
            shake(btn);
            btn.classList.add('dim');
            speak(`Đây là số ${numberWords[val]}. Mình đếm lại xem có mấy ${obj.n} nhé!`);
          }
        },
        { cooldown: 800 }
      );
      choicesRow.append(btn);
    });

    wrap.append(showcase, choicesRow);
    stage.append(wrap);

    timers.push(setTimeout(() => speak(`Có mấy ${obj.n} ở đây nhỉ? Bé chọn số đúng nhé!`), 250));
    return () => timers.forEach(clearTimeout);
  }

  // ---------- Kiểu 4: Bên nào nhiều hơn / ít hơn? (so sánh hai nhóm) ----------
  function renderCompare() {
    const hi = Math.max(2, pickRandomNumber(8));
    const lo = Math.max(1, hi - 1 - Math.floor(Math.random() * Math.min(3, hi - 1 || 1)));
    const wantMore = Math.random() < 0.6;
    const left = Math.random() < 0.5;
    const nums = left ? [hi, lo] : [lo, hi];
    const obj = objBag.next();
    const answerIdx = wantMore === (hi >= lo) ? nums.indexOf(hi) : nums.indexOf(lo);
    const timers = [];
    let locked = false;
    badgeEl.textContent = '?';

    const wrap = el('div', 'compare-stage');
    const q = `Bên nào có ${wantMore ? 'nhiều' : 'ít'} ${obj.n} hơn nhỉ? Bé chạm vào nhé!`;
    nums.forEach((n, i) => {
      const side = el('button', 'cmp-side', `<div class="cmp-items">${`<span class="cmp-item">${obj.e}</span>`.repeat(n)}</div>`);
      onTap(
        side,
        () => {
          if (locked || side.classList.contains('dim')) return;
          if (i === answerIdx) {
            locked = true;
            side.classList.add('right');
            wrap.querySelectorAll('.cmp-side').forEach((s) => s !== side && s.classList.add('dim'));
            badgeEl.textContent = `${nums[0]} - ${nums[1]}`;
            sfx.success();
            confetti(40);
            speak(`${pick(praises)} Bên này có ${numberWords[nums[i]]}, ${wantMore ? 'nhiều' : 'ít'} hơn bên kia!`, { force: true });
            nextBtn.classList.add('pulse');
            timers.push(setTimeout(nextRound, 3400));
          } else {
            sfx.wrong();
            shake(side);
            side.classList.add('dim');
            speak(`Bên này có ${numberWords[nums[i]]}. Bé đếm lại xem nhé!`);
          }
        },
        { cooldown: 850 }
      );
      wrap.append(side);
    });
    stage.append(wrap);
    timers.push(setTimeout(() => speak(q), 250));
    return () => timers.forEach(clearTimeout);
  }

  nextRound();
  return () => subCleanup?.();
}
