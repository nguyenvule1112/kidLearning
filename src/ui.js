// Tiện ích giao diện dùng chung + bộ chống spam chạm cho trẻ 3 tuổi
import { sfx, speak } from './audio.js';
import { bounce } from './fx.js';

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const lower1 = (s) => s.charAt(0).toLowerCase() + s.slice(1);
export const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Túi rút ngẫu nhiên có trọng số (không đơn điệu như tuần tự, cũng không bị trùng liên tiếp):
 * - Không bao giờ rút trùng phần tử vừa ra trước đó (trừ khi chỉ có 1 phần tử).
 * - Phần tử nào vừa xuất hiện sẽ giảm xác suất, lâu chưa xuất hiện sẽ tăng xác suất.
 * - Có thể cho phép lặp lại ngẫu nhiên sau 1-2 lượt để bé ôn lại.
 */
export function createSmartBag(items) {
  const counts = new Map(items.map((it) => [it, 0]));
  let last = null;
  let secondLast = null;

  return {
    next(filterFn = null) {
      const pool = (filterFn ? items.filter(filterFn) : items).filter((it) => it !== last);
      const candidates = pool.length ? pool : items;
      const maxCount = Math.max(1, ...candidates.map((it) => counts.get(it) || 0));
      const weights = candidates.map((it) => {
        const c = counts.get(it) || 0;
        let w = (maxCount - c + 1.5) ** 1.6;
        if (it === secondLast && candidates.length > 2) w *= 0.45; // ít lặp lại kiểu A-B-A nhưng vẫn có thể xảy ra
        return w;
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let chosen = candidates[0];
      for (let i = 0; i < candidates.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          chosen = candidates[i];
          break;
        }
      }
      secondLast = last;
      last = chosen;
      counts.set(chosen, (counts.get(chosen) || 0) + 1);
      return chosen;
    },
    current() {
      return last;
    },
  };
}

export const ARROW_L =
  '<svg viewBox="0 0 24 24" class="ico"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const ARROW_R =
  '<svg viewBox="0 0 24 24" class="ico"><path d="m9 4 8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ---------- Phát hiện bé vỗ/đập liên hồi lên màn hình -> hiện 🐢 "Từ từ thôi nào" ----------
const tapTimestamps = [];
let calmOverlay = null;
let calmUntil = 0;

export function registerGlobalTapGuard() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      const now = performance.now();
      if (now < calmUntil) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      // Miễn cho màn hình Đàn piano & Bóng bay (vốn khuyến khích chạm nhanh)
      if (e.target.closest?.('.piano, .bubbles, .splash')) return;

      tapTimestamps.push(now);
      while (tapTimestamps.length && now - tapTimestamps[0] > 1700) tapTimestamps.shift();

      if (tapTimestamps.length >= 9) {
        tapTimestamps.length = 0;
        showCalmTurtle();
        e.stopPropagation();
        e.preventDefault();
      }
    },
    { capture: true }
  );
}

function showCalmTurtle() {
  if (calmOverlay) return;
  calmUntil = performance.now() + 1500;
  calmOverlay = el(
    'div',
    'calm-overlay',
    '<div class="calm-card"><div class="calm-turtle">🐢</div><div class="calm-text">Từ từ thôi bé ơi!</div></div>'
  );
  document.body.append(calmOverlay);
  speak('Từ từ thôi bé ơi!', { force: true });
  setTimeout(() => {
    calmOverlay?.classList.add('hide');
    setTimeout(() => {
      calmOverlay?.remove();
      calmOverlay = null;
    }, 280);
  }, 1350);
}

/**
 * Gắn sự kiện chạm có chống spam:
 * - `cooldown`: thời gian tối thiểu (ms) giữa 2 lần kích hoạt đầy đủ (âm thanh/đọc/chuyển bài).
 * - Trong thời gian chờ, nếu bé vẫn bấm liên tục vào cùng chủ thể: chỉ nảy nhẹ hình + kêu tiếng "boing" nhỏ,
 *   KHÔNG gọi lại callback để tránh lặp tiếng "quả... quả... quả..." hoặc nhảy bài loạn xạ.
 * - `lockVisual`: thêm class `.cooling` lên nút trong lúc chờ (dùng cho nút chuyển trang/câu tiếp theo).
 */
export function onTap(target, fn, { cooldown = 650, lockVisual = false, bounceOnSpam = true } = {}) {
  let lastTrigger = 0;
  let coolTimer = null;

  target.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (performance.now() < calmUntil) return;

    const now = performance.now();
    if (now - lastTrigger < cooldown) {
      if (bounceOnSpam) {
        sfx.boing();
        bounce(target.querySelector('.big, .item, .emoji, .blob, svg') || target);
      }
      return;
    }

    lastTrigger = now;
    if (lockVisual) {
      target.classList.add('cooling');
      clearTimeout(coolTimer);
      coolTimer = setTimeout(() => target.classList.remove('cooling'), cooldown);
    }
    fn(e);
  });
}

/**
 * Nút cần giữ nhẹ (0.45s) hoặc bấm 2 nhịp có chủ đích để tránh bé vô tình chạm văng về trang chủ.
 */
export function onHoldOrDoubleTap(target, fn) {
  let holdTimer = null;
  let lastTap = 0;

  const clearHold = () => {
    clearTimeout(holdTimer);
    holdTimer = null;
    target.classList.remove('holding');
  };

  target.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const now = performance.now();
    // Bấm đúp có chủ đích trong khoảng 220ms - 900ms cũng cho qua
    if (now - lastTap > 220 && now - lastTap < 900) {
      clearHold();
      lastTap = 0;
      fn(e);
      return;
    }
    lastTap = now;
    sfx.tap();
    target.classList.add('holding');
    holdTimer = setTimeout(() => {
      clearHold();
      fn(e);
    }, 420);
  });

  target.addEventListener('pointerup', clearHold);
  target.addEventListener('pointercancel', clearHold);
  target.addEventListener('pointerleave', clearHold);
}

/** Chọn số cột tối ưu để n ô vuông lấp đầy khung lớn nhất có thể (tự thích ứng dọc/ngang). */
export function bestCols(n, w, h, gap = 0) {
  let best = 1;
  let bestSize = 0;
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c);
    const s = Math.min((w - gap * (c - 1)) / c, (h - gap * (r - 1)) / r);
    if (s > bestSize) {
      bestSize = s;
      best = c;
    }
  }
  return best;
}

export function autoGrid(gridEl, n) {
  const fit = () => {
    const r = gridEl.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const gap = parseFloat(getComputedStyle(gridEl).columnGap) || 0;
    gridEl.style.setProperty('--cols', bestCols(n, r.width, r.height, gap));
  };
  const ro = new ResizeObserver(fit);
  ro.observe(gridEl);
  fit();
  return () => ro.disconnect();
}

/** Khung màn hình chuẩn: nút Home to ở góc trái + vùng giữa + vùng phải. */
export function makeScreen(root, go, { center = '', right = null, cls = '' } = {}) {
  const screen = el('div', `screen ${cls}`);
  const bar = el('div', 'topbar');
  const home = el('button', 'btn-round home', '🏠<span class="hold-ring"></span>');
  home.setAttribute('aria-label', 'Về trang chủ (nhấn giữ hoặc chạm 2 lần)');
  onHoldOrDoubleTap(home, () => {
    sfx.back();
    go('home');
  });
  const mid = el('div', 'bar-center');
  if (typeof center === 'string') mid.innerHTML = center;
  else if (center) mid.append(center);
  const rightBox = el('div', 'bar-right');
  if (right) rightBox.append(right);
  bar.append(home, mid, rightBox);
  const stage = el('div', 'stage');
  screen.append(bar, stage);
  root.append(screen);
  return { screen, bar, mid, right: rightBox, stage };
}

/** Thanh nút chuyển chế độ chơi ngay trong mỗi chủ đề để bé không chán. */
export function makeModePills(modes, activeId, onSelect) {
  const wrap = el('div', 'mode-pills');
  modes.forEach((m) => {
    const b = el('button', `pill ${m.id === activeId ? 'active' : ''}`, m.icon);
    b.setAttribute('aria-label', m.label);
    onTap(
      b,
      () => {
        if (b.classList.contains('active')) return;
        [...wrap.children].forEach((c) => c.classList.remove('active'));
        b.classList.add('active');
        sfx.tap();
        onSelect(m.id);
      },
      { cooldown: 700 }
    );
    wrap.append(b);
  });
  return wrap;
}

/** Vẽ một mục học (emoji / màu / hình) thành HTML. */
export function visual(item, kind) {
  if (kind === 'color') {
    const border = item.c === '#ffffff' ? 'outline: 0.8cqmin solid #ccc;' : '';
    return `<div class="blob" style="background:${item.c};${border}"></div>`;
  }
  if (kind === 'shape') {
    return `<svg class="shape" viewBox="0 0 100 100" fill="${item.c}">${item.svg}</svg>`;
  }
  return `<span class="item">${item.e}</span>`;
}
