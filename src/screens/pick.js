// Màn Màu sắc & Hình khối: có chế độ Khám phá (mỗi lần chạm ra đồ vật mới) + chế độ Trò chơi phân loại/tìm kiếm
import { makeScreen, makeModePills, el, onTap, autoGrid, createSmartBag, visual, lower1, pick, shuffle } from '../ui.js';
import { speak, sfx } from '../audio.js';
import { bounce, shake, spin, confetti } from '../fx.js';
import { colors, shapes, praises } from '../data.js';

// ==================== MÀU SẮC ====================
export function colorsScreen(root, go) {
  let mode = 'explore';
  let subCleanup = null;

  const pills = makeModePills(
    [
      { id: 'explore', icon: '🎨', label: 'Khám phá màu' },
      { id: 'find', icon: '🕵️', label: 'Tìm đồ vật theo màu' },
    ],
    mode,
    (m) => {
      mode = m;
      mount();
    }
  );

  const replayBtn = el('button', 'btn-round', '🔊');
  const { stage, screen } = makeScreen(root, go, { center: pills, right: replayBtn });
  const colorBag = createSmartBag(colors);
  let promptFn = () => speak('Bé chạm vào màu sắc nhé!');

  onTap(
    replayBtn,
    () => {
      sfx.tap();
      bounce(replayBtn);
      promptFn();
    },
    { cooldown: 1100 }
  );

  function mount() {
    subCleanup?.();
    stage.innerHTML = '';
    if (mode === 'explore') subCleanup = renderExplore();
    else subCleanup = renderColorGame();
  }

  function renderExplore() {
    const grid = el('div', 'grid-pick');
    promptFn = () => speak('Bé chạm vào chấm màu để xem có đồ vật gì nhé!');

    colors.forEach((c) => {
      let itemIdx = 0;
      const cell = el('button', 'cell', visual(c, 'color'));
      cell.setAttribute('aria-label', c.n);

      // Cooldown 1.1s chống bấm liên hồi kêu "Màu... Màu... Màu..."
      // Mỗi lần chạm vào cùng 1 màu sẽ xoay vòng qua các đồ vật khác nhau của màu đó!
      onTap(
        cell,
        () => {
          const blob = cell.querySelector('.blob');
          const ex = c.items[itemIdx % c.items.length];
          itemIdx++;
          sfx.tap();
          bounce(blob);
          blob.innerHTML = `<span class="blob-emoji">${ex.e}</span>`;
          blob.firstChild.animate(
            [{ transform: 'scale(0)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }],
            { duration: 380, easing: 'ease-out' }
          );
          screen.style.background = c.c + '28';
          speak(`${c.n}! ${ex.o} ${lower1(c.n)}.`);
        },
        { cooldown: 1100 }
      );
      grid.append(cell);
    });

    stage.append(grid);
    return autoGrid(grid, colors.length);
  }

  function renderColorGame() {
    const grid = el('div', 'grid-pick quiz-grid');
    stage.append(grid);
    const stopFit = autoGrid(grid, 3);
    let timers = [];
    let locked = false;

    function nextRound() {
      locked = false;
      grid.innerHTML = '';
      const targetColor = colorBag.next();
      const targetItem = pick(targetColor.items);
      const otherColors = shuffle(colors.filter((c) => c !== targetColor)).slice(0, 2);
      const opts = shuffle([
        { color: targetColor, item: targetItem, correct: true },
        ...otherColors.map((c) => ({ color: c, item: pick(c.items), correct: false })),
      ]);

      screen.style.background = targetColor.c + '26';
      promptFn = () =>
        speak(`Đồ vật nào có ${lower1(targetColor.n)} nhỉ? Bé tìm ${lower1(targetColor.n)} nhé!`);

      opts.forEach((opt, i) => {
        const cell = el('button', 'cell', `<span class="item">${opt.item.e}</span>`);
        cell.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
          duration: 340,
          delay: i * 80,
          easing: 'cubic-bezier(.2,1.4,.4,1)',
          fill: 'backwards',
        });

        onTap(
          cell,
          () => {
            if (locked || cell.classList.contains('dim')) return;
            if (opt.correct) {
              locked = true;
              cell.classList.add('right');
              [...grid.children].forEach((c) => c !== cell && c.classList.add('dim'));
              sfx.success();
              confetti(40);
              speak(`${pick(praises)} ${opt.item.o} có ${lower1(targetColor.n)}!`, { force: true });
              timers.push(setTimeout(nextRound, 2600));
            } else {
              sfx.wrong();
              shake(cell);
              cell.classList.add('dim');
              speak(`${opt.item.o} là ${lower1(opt.color.n)}. Mình tìm ${lower1(targetColor.n)} nhé!`);
            }
          },
          { cooldown: 850 }
        );
        grid.append(cell);
      });

      promptFn();
    }

    nextRound();
    return () => {
      timers.forEach(clearTimeout);
      stopFit();
    };
  }

  mount();
  return () => subCleanup?.();
}

// ==================== HÌNH KHỐI ====================
export function shapesScreen(root, go) {
  let mode = 'explore';
  let subCleanup = null;

  const pills = makeModePills(
    [
      { id: 'explore', icon: '🔺', label: 'Khám phá hình' },
      { id: 'match', icon: '🧩', label: 'Đồ vật hình gì?' },
    ],
    mode,
    (m) => {
      mode = m;
      mount();
    }
  );

  const replayBtn = el('button', 'btn-round', '🔊');
  const { stage } = makeScreen(root, go, { center: pills, right: replayBtn });
  const shapeBag = createSmartBag(shapes);
  let promptFn = () => speak('Bé chạm vào hình khối nhé!');

  onTap(
    replayBtn,
    () => {
      sfx.tap();
      bounce(replayBtn);
      promptFn();
    },
    { cooldown: 1100 }
  );

  function mount() {
    subCleanup?.();
    stage.innerHTML = '';
    if (mode === 'explore') subCleanup = renderExplore();
    else subCleanup = renderShapeMatch();
  }

  function renderExplore() {
    const grid = el('div', 'grid-pick');
    promptFn = () => speak('Bé chạm vào các hình để xem điều kỳ diệu nhé!');

    shapes.forEach((s) => {
      let showReal = false;
      let realIdx = 0;
      const cell = el('button', 'cell', visual(s, 'shape'));
      cell.setAttribute('aria-label', s.n);

      // Lần chạm 1: xoay hình & đọc tên hình. Lần chạm 2: biến thành đồ vật ngoài đời có hình đó!
      onTap(
        cell,
        () => {
          sfx.tap();
          if (!showReal) {
            showReal = true;
            spin(cell.querySelector('svg'));
            speak(s.n);
          } else {
            showReal = false;
            const r = s.real[realIdx % s.real.length];
            realIdx++;
            cell.innerHTML = `<span class="item">${r.e}</span>`;
            bounce(cell.firstChild);
            speak(`${r.o} có dạng ${lower1(s.n)} đấy!`);
            setTimeout(() => {
              if (cell.isConnected) cell.innerHTML = visual(s, 'shape');
            }, 2200);
          }
        },
        { cooldown: 1150 }
      );
      grid.append(cell);
    });

    stage.append(grid);
    return autoGrid(grid, shapes.length);
  }

  function renderShapeMatch() {
    const wrap = el('div', 'num-quiz-stage');
    stage.append(wrap);
    let timers = [];
    let locked = false;

    function nextRound() {
      locked = false;
      wrap.innerHTML = '';
      const target = shapeBag.next();
      const realItem = pick(target.real);
      const others = shuffle(shapes.filter((s) => s !== target)).slice(0, 2);
      const opts = shuffle([target, ...others]);

      promptFn = () => speak(`${realItem.o} giống hình nào ở dưới nhỉ? Bé tìm ${lower1(target.n)} nhé!`);

      const topCard = el(
        'div',
        'shape-real-card',
        `<span class="show-item">${realItem.e}</span><span class="shape-real-label">${realItem.o}</span>`
      );
      onTap(topCard, () => {
        sfx.tap();
        bounce(topCard.querySelector('.show-item'));
        promptFn();
      });

      const choicesRow = el('div', 'num-choices');
      opts.forEach((opt) => {
        const btn = el('button', 'cell quiz-shape-cell', visual(opt, 'shape'));
        onTap(
          btn,
          () => {
            if (locked || btn.classList.contains('dim')) return;
            if (opt === target) {
              locked = true;
              btn.classList.add('right');
              [...choicesRow.children].forEach((c) => c !== btn && c.classList.add('dim'));
              sfx.success();
              confetti(40);
              speak(`${pick(praises)} ${realItem.o} là ${lower1(target.n)}!`, { force: true });
              timers.push(setTimeout(nextRound, 2600));
            } else {
              sfx.wrong();
              shake(btn);
              btn.classList.add('dim');
              speak(`Đây là ${lower1(opt.n)}. Mình tìm ${lower1(target.n)} nhé!`);
            }
          },
          { cooldown: 850 }
        );
        choicesRow.append(btn);
      });

      wrap.append(topCard, choicesRow);
      promptFn();
    }

    nextRound();
    return () => timers.forEach(clearTimeout);
  }

  mount();
  return () => subCleanup?.();
}
