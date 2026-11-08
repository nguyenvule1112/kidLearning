import './style.css';
import { unlockAudio, speak, sfx, hasViVoice, stopSpeaking } from './audio.js';
import { burst } from './fx.js';
import { el, registerGlobalTapGuard } from './ui.js';
import { homeScreen } from './screens/home.js';
import { vocabScreen } from './screens/vocab.js';
import { colorsScreen, shapesScreen } from './screens/pick.js';
import { countScreen } from './screens/count.js';
import { quizScreen } from './screens/quiz.js';
import { pianoScreen } from './screens/piano.js';
import { bubblesScreen } from './screens/bubbles.js';
import { gamesScreen } from './screens/games.js';
import { challengeScreen, riddleScreen } from './screens/thinking.js';
import { startEmoji } from './emoji.js';

const SCREENS = {
  games: gamesScreen,
  challenge: challengeScreen,
  riddle: riddleScreen,
  home: homeScreen,
  vocab: vocabScreen,
  colors: colorsScreen,
  shapes: shapesScreen,
  count: countScreen,
  quiz: quizScreen,
  piano: pianoScreen,
  bubbles: bubblesScreen,
};

const app = document.getElementById('app');
let cleanup = null;
let lastNavAt = 0;

function go(name, params = {}) {
  const now = performance.now();
  if (now - lastNavAt < 350) return; // chống chuyển màn hình kép
  lastNavAt = now;

  try {
    cleanup?.();
  } catch {}
  stopSpeaking();
  app.innerHTML = '';
  cleanup = SCREENS[name](app, go, params) || null;
  app.firstElementChild?.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], {
    duration: 250,
    easing: 'ease-out',
  });
}

// ---------- Khóa cuộn / zoom / menu ngoài ý muốn ----------
const block = (e) => e.preventDefault();
document.addEventListener('touchmove', block, { passive: false });
document.addEventListener('gesturestart', block); // pinch-zoom trên iOS Safari
document.addEventListener('gesturechange', block);
document.addEventListener('dblclick', block);
document.addEventListener('contextmenu', block); // nhấn giữ không hiện menu
document.addEventListener('selectstart', block);
document.addEventListener('dragstart', block);
document.addEventListener('wheel', (e) => e.ctrlKey && e.preventDefault(), { passive: false }); // ctrl+cuộn trên laptop

// Kích hoạt bộ canh gác chống bé vỗ/bấm loạn xạ toàn màn hình
registerGlobalTapGuard();

// Hiệu ứng lấp lánh ở điểm chạm (có giới hạn tần suất để không ngốn pin khi bấm nhanh)
let lastSparkAt = 0;
document.addEventListener(
  'pointerdown',
  (e) => {
    const now = performance.now();
    if (now - lastSparkAt < 90) return;
    lastSparkAt = now;
    burst(e.clientX, e.clientY, 6);
  },
  { capture: true }
);

// ---------- Giữ màn hình luôn sáng khi bé đang chơi ----------
let wakeLock = null;
async function keepAwake() {
  try {
    wakeLock = await navigator.wakeLock?.request('screen');
  } catch {}
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wakeLock !== null) keepAwake();
});

// ---------- Màn hình chào: cần 1 lần chạm để mở khóa âm thanh (bắt buộc trên iOS) ----------
function splash() {
  const s = el(
    'div',
    'splash',
    `<div class="logo">☀️<br>Bé Học Vui</div>
     <button class="play" aria-label="Bắt đầu"><svg viewBox="0 0 24 24" width="60%" height="60%"><path d="M7 4.5v15l13-7.5z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg></button>
     <div class="hint"></div>`
  );
  app.append(s);
  const isStandalone =
    matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone;

  hasViVoice().then((ok) => {
    if (!ok)
      s.querySelector('.hint').textContent =
        'Thiết bị chưa có giọng đọc Tiếng Việt. iPad: Cài đặt › Trợ năng › Nội dung được đọc › Giọng nói › Tiếng Việt. Windows: dùng Microsoft Edge.';
  });

  s.querySelector('.play').addEventListener('click', () => {
    unlockAudio();
    sfx.success();
    keepAwake();
    if (!isStandalone && document.documentElement.requestFullscreen && matchMedia('(pointer: coarse)').matches) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    go('home');
    speak('Xin chào bé! Cùng học nào!', { interrupt: false });
  });
}

splash();
startEmoji(document.body);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
