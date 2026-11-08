// Chủ đề Từ vựng (Động vật / Trái cây / Xe cộ): 3 chế độ chơi đan xen để bé không chán
// 1. 🃏 Thẻ khám phá (rút ngẫu nhiên thông minh + mỗi lần chạm đổi câu nói/tiếng kêu/câu chuyện)
// 2. 🎁 Ú òa! Hộp quà bí ẩn (gõ vào hộp quà đang rung để mở bất ngờ)
// 3. 👂 Ai đang gọi? (nghe tiếng kêu / gợi ý rồi tìm đúng bạn trong 2-3 ô)

import { makeScreen, makeModePills, el, onTap, createSmartBag, autoGrid, shuffle, pick, lower1, ARROW_L, ARROW_R } from '../ui.js';
import { speak, sfx } from '../audio.js';
import { bounce, shake, confetti } from '../fx.js';
import { praises } from '../data.js';

const PASTELS = ['#ffd6e0', '#d0f4de', '#cde7ff', '#fff1b8', '#e4d4ff', '#ffe0c2'];
const BOXES = ['🎁', '📦', '🥚', '🎪'];

export function vocabScreen(root, go, { items, icon }) {
  let mode = 'card';
  let subCleanup = null;

  const pills = makeModePills(
    [
      { id: 'card', icon: '🃏', label: 'Thẻ học' },
      { id: 'peek', icon: '🎁', label: 'Ú òa' },
      { id: 'find', icon: '👂', label: 'Tìm bạn' },
    ],
    mode,
    (m) => {
      mode = m;
      mountMode();
    }
  );

  const replayBtn = el('button', 'btn-round', '🔊');
  replayBtn.setAttribute('aria-label', 'Nghe lại');
  const { stage } = makeScreen(root, go, { center: pills, right: replayBtn });

  const bag = createSmartBag(items);
  let currentPrompt = () => {};

  onTap(
    replayBtn,
    () => {
      sfx.tap();
      bounce(replayBtn);
      currentPrompt();
    },
    { cooldown: 1100 }
  );

  function mountMode() {
    subCleanup?.();
    stage.innerHTML = '';
    if (mode === 'card') subCleanup = renderCardMode();
    else if (mode === 'peek') subCleanup = renderPeekabooMode();
    else subCleanup = renderFindMode();
  }

  // ---------- Chế độ 1: Thẻ khám phá thông minh ----------
  function renderCardMode() {
    const wrap = el('div', 'vocab');
    const prev = el('button', 'arrow prev', ARROW_L);
    const next = el('button', 'arrow next', ARROW_R);
    const card = el('button', 'card');
    wrap.append(prev, card, next);
    stage.append(wrap);

    const history = [];
    let hIdx = -1;
    let tapStage = 0; // 0: tên + tiếng kêu, 1: câu chuyện vui, 2: câu hỏi tương tác

    function currentItem() {
      return history[hIdx];
    }

    function speakByStage(it, stageIdx, queue = false) {
      if (stageIdx === 0) {
        speak(it.s ? `${it.n}. ${it.s}!` : it.n, { interrupt: !queue });
      } else if (stageIdx === 1 && it.f) {
        speak(it.f);
      } else if (it.s) {
        speak(`${it.n} kêu thế nào nhỉ? ${it.s}!`);
      } else {
        speak(`Chào ${lower1(it.n)} nhé!`);
      }
    }

    currentPrompt = () => speakByStage(currentItem(), 0);

    function showCard(dir = 0) {
      const it = currentItem();
      tapStage = 0;
      card.style.background = PASTELS[Math.abs(hIdx) % PASTELS.length];
      card.innerHTML = `<span class="big">${it.e}</span><span class="label">${it.n}</span>`;
      if (dir) {
        card.animate(
          [{ transform: `translateX(${dir * 26}%) scale(.75)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 360, easing: 'cubic-bezier(.2,1.35,.4,1)' }
        );
      }
    }

    function goNext() {
      if (hIdx < history.length - 1) {
        hIdx++;
      } else {
        history.push(bag.next());
        hIdx = history.length - 1;
      }
      sfx.swoosh();
      showCard(1);
      speakByStage(currentItem(), 0);
    }

    function goPrev() {
      if (hIdx > 0) {
        hIdx--;
      } else {
        history.unshift(bag.next());
        hIdx = 0;
      }
      sfx.swoosh();
      showCard(-1);
      speakByStage(currentItem(), 0);
    }

    // Khi bé chạm vào thẻ: có cooldown 1.2s chống kêu "quả... quả... quả..."
    // và mỗi lần chạm hợp lệ sẽ đổi sang câu nói/hiệu ứng mới!
    onTap(
      card,
      () => {
        sfx.tap();
        const big = card.querySelector('.big');
        bounce(big);
        tapStage = (tapStage + 1) % 3;
        speakByStage(currentItem(), tapStage);
      },
      { cooldown: 1200 }
    );

    // Nút chuyển thẻ có khóa 950ms chống bấm lia lịa nhảy qua 10 thẻ
    onTap(prev, goPrev, { cooldown: 950, lockVisual: true });
    onTap(next, goNext, { cooldown: 950, lockVisual: true });

    history.push(bag.next());
    hIdx = 0;
    showCard(0);
    const t = setTimeout(() => speakByStage(currentItem(), 0, true), 450);
    return () => clearTimeout(t);
  }

  // ---------- Chế độ 2: Ú òa! Hộp quà bí ẩn ----------
  function renderPeekabooMode() {
    const wrap = el('div', 'peek-wrap');
    stage.append(wrap);
    let timers = [];

    function nextGift() {
      wrap.innerHTML = '';
      const it = bag.next();
      const boxEmoji = pick(BOXES);
      const box = el(
        'button',
        'card peek-box wobble',
        `<span class="big">${boxEmoji}</span><span class="label">Ú òa! Ai đây nhỉ?</span>`
      );
      box.style.background = pick(PASTELS);
      wrap.append(box);

      currentPrompt = () => speak(it.s ? `Nghe kìa: ${it.s}! Ai ở trong hộp thế nhỉ?` : 'Trong hộp có gì thế nhỉ? Bé chạm mở xem!');
      currentPrompt();

      let opened = false;
      onTap(
        box,
        () => {
          if (!opened) {
            opened = true;
            box.classList.remove('wobble');
            sfx.fanfare();
            confetti(35);
            box.innerHTML = `<span class="big">${it.e}</span><span class="label">${it.n}</span>`;
            bounce(box.querySelector('.big'));
            speak(`Ú òa! Là ${lower1(it.n)}! ${it.s ? it.s + '!' : it.f || ''}`, { force: true });
            timers.push(setTimeout(nextGift, 3600));
          } else {
            // Đã mở rồi mà chạm tiếp -> chuyển sang hộp quà mới (nhưng có cooldown)
            timers.forEach(clearTimeout);
            timers = [];
            sfx.swoosh();
            nextGift();
          }
        },
        { cooldown: 1100 }
      );
    }

    nextGift();
    return () => timers.forEach(clearTimeout);
  }

  // ---------- Chế độ 3: Ai đang gọi? (Nghe tiếng kêu / gợi ý tìm đúng) ----------
  function renderFindMode() {
    const grid = el('div', 'grid-pick quiz-grid');
    stage.append(grid);
    const stopFit = autoGrid(grid, 3);
    let timers = [];
    let locked = false;

    function nextRound() {
      locked = false;
      grid.innerHTML = '';
      const target = bag.next();
      const others = shuffle(items.filter((x) => x !== target)).slice(0, 2);
      const opts = shuffle([target, ...others]);

      currentPrompt = () => {
        if (target.s) speak(`${target.s}! Bạn nào kêu ${lower1(target.s)} thế nhỉ? Đâu là ${lower1(target.n)}?`);
        else speak(`${target.n} đâu nhỉ? Bé tìm giúp ${lower1(target.n)} nào!`);
      };

      opts.forEach((opt, idx) => {
        const cell = el('button', 'cell', `<span class="item">${opt.e}</span>`);
        cell.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
          duration: 340,
          delay: idx * 80,
          easing: 'cubic-bezier(.2,1.4,.4,1)',
          fill: 'backwards',
        });

        onTap(
          cell,
          () => {
            if (locked || cell.classList.contains('dim')) return;
            if (opt === target) {
              locked = true;
              cell.classList.add('right');
              [...grid.children].forEach((c) => c !== cell && c.classList.add('dim'));
              sfx.success();
              confetti(40);
              speak(`${pick(praises)} Đúng là ${lower1(target.n)} rồi!`, { force: true });
              timers.push(setTimeout(nextRound, 2500));
            } else {
              sfx.wrong();
              shake(cell);
              cell.classList.add('dim');
              speak(`Đây là ${lower1(opt.n)}. Mình tìm ${lower1(target.n)} cơ!`);
            }
          },
          { cooldown: 850 }
        );
        grid.append(cell);
      });

      currentPrompt();
    }

    nextRound();
    return () => {
      timers.forEach(clearTimeout);
      stopFit();
    };
  }

  mountMode();
  return () => subCleanup?.();
}
