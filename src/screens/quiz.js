// Trò chơi "Tìm đúng" tổng hợp: đa dạng câu hỏi để bé không nhàm chán
// - Hỏi theo tên ("Con mèo đâu?")
// - Hỏi theo tiếng kêu ("Bạn nào kêu Gâu gâu?")
// - Hỏi theo đặc điểm/câu đố vui ("Bạn nào có cái vòi thật dài?")
// - Tự động điều chỉnh số lựa chọn (2 → 3 → 4 ô) theo số sao bé đạt được!

import { makeScreen, el, onTap, autoGrid, createSmartBag, pick, shuffle, lower1, visual } from '../ui.js';
import { speak, sfx } from '../audio.js';
import { bounce, shake, confetti } from '../fx.js';
import { animals, fruits, vehicles, colors, shapes, praises } from '../data.js';

const CATS = [
  { items: animals, kind: 'emoji' },
  { items: fruits, kind: 'emoji' },
  { items: vehicles, kind: 'emoji' },
  { items: colors, kind: 'color' },
  { items: shapes, kind: 'shape' },
];

export function quizScreen(root, go) {
  const starsEl = el('div', 'stars', '⭐ 0');
  const replay = el('button', 'btn-round', '🔊');
  replay.setAttribute('aria-label', 'Nghe lại');
  const { stage } = makeScreen(root, go, { center: starsEl, right: replay });
  const grid = el('div', 'grid-pick quiz-grid');
  stage.append(grid);

  const catBags = CATS.map((c) => ({ ...c, bag: createSmartBag(c.items) }));
  const catPicker = createSmartBag(catBags);

  let stars = 0;
  let streak = 0;
  let answer = null;
  let questionText = '';
  let locked = false;
  let stopFit = null;
  const timers = [];

  function buildQuestion(item, kind) {
    // Đổi kiểu câu hỏi ngẫu nhiên dựa trên dữ liệu có sẵn
    if (kind === 'emoji' && item.s && Math.random() < 0.45) {
      return `Nghe kìa: ${item.s}! Đố bé biết đó là ai?`;
    }
    if (kind === 'emoji' && item.f && Math.random() < 0.35) {
      return `${item.f} Đố bé tìm đúng ${lower1(item.n)}!`;
    }
    return `${item.n} đâu nhỉ? Bé chạm vào ${lower1(item.n)} nhé!`;
  }

  function ask(first = false) {
    locked = false;
    grid.innerHTML = '';

    // Độ khó thích ứng: mới vào 2 ô lớn cho dễ, thắng liên tiếp tăng lên 3 rồi 4 ô
    const choiceCount = streak < 2 ? 2 : streak < 5 ? 3 : 4;
    stopFit?.();
    stopFit = autoGrid(grid, choiceCount);

    const cat = catPicker.next();
    answer = cat.bag.next();
    const distractors = shuffle(cat.items.filter((x) => x !== answer)).slice(0, choiceCount - 1);
    const opts = shuffle([answer, ...distractors]);
    questionText = buildQuestion(answer, cat.kind);

    opts.forEach((opt, idx) => {
      const cell = el('button', 'cell', visual(opt, cat.kind));
      cell.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
        duration: 350,
        delay: idx * 85,
        easing: 'cubic-bezier(.2,1.5,.4,1)',
        fill: 'backwards',
      });

      onTap(
        cell,
        () => {
          if (locked || cell.classList.contains('dim')) return;
          if (opt === answer) {
            locked = true;
            stars++;
            streak++;
            starsEl.textContent = `⭐ ${stars}`;
            bounce(starsEl);
            cell.classList.add('right');
            [...grid.children].forEach((c) => c !== cell && c.classList.add('dim'));

            const milestone = stars % 5 === 0;
            if (milestone) sfx.fanfare();
            else sfx.success();

            confetti(milestone ? 110 : 45);
            speak(
              milestone
                ? `Hoan hô! Bé được ${stars} ngôi sao rồi! Giỏi quá đi!`
                : `${pick(praises)} Đó là ${lower1(answer.n)}!`,
              { force: true }
            );
            timers.push(setTimeout(() => ask(), milestone ? 3300 : 2300));
          } else {
            streak = Math.max(0, streak - 1);
            sfx.wrong();
            shake(cell);
            cell.classList.add('dim');
            speak(`Đây là ${lower1(opt.n)}. Mình tìm ${lower1(answer.n)} nhé!`);
          }
        },
        { cooldown: 850 }
      );
      grid.append(cell);
    });

    speak(questionText, { interrupt: !first });
  }

  onTap(
    replay,
    () => {
      sfx.tap();
      bounce(replay);
      speak(questionText);
    },
    { cooldown: 1100 }
  );

  timers.push(setTimeout(() => ask(true), 300));
  return () => {
    timers.forEach(clearTimeout);
    stopFit?.();
  };
}
