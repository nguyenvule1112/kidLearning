// Bảng điều khiển của phụ huynh: nhấn giữ logo ở trang chủ ~1.2 giây để mở.
// Chọn giọng đọc, tốc độ, nghe thử; xem trạng thái giọng "cô giáo" Gemini.
import { el } from './ui.js';
import {
  listViVoices,
  getVoicePref,
  setVoicePref,
  getSpeed,
  setSpeed,
  speak,
  isServerEnabled,
  listCloudVoices,
  getPackedVoice,
  getGeminiVoice,
  setGeminiVoice,
  sfx,
} from './audio.js';

export function openParentPanel() {
  if (document.querySelector('.parent-overlay')) return;
  const voices = listViVoices();
  const cloud = isServerEnabled();
  const packed = getPackedVoice();
  const ov = el('div', 'parent-overlay');
  const box = el('div', 'parent-box');
  box.innerHTML = `
    <h2>⚙️ Cài đặt giọng đọc cho bé</h2>
    <p class="p-note">${
      cloud
        ? '✨ <b>Đang dùng giọng "cô giáo" từ máy tính.</b> Khuyên dùng Hoài My / Nam Minh (giọng Việt bản địa, miễn phí):'
        : packed
          ? '✨ <b>Đang dùng giọng "cô giáo" đã đóng gói sẵn.</b> Câu nào chưa có sẽ dùng giọng của thiết bị.'
          : 'Chưa có giọng "cô giáo". Đang dùng giọng của thiết bị.'
    }</p>
    ${cloud ? `<label>Giọng "cô giáo":</label><div class="p-gemini-voices"></div>` : ''}
    <label>Giọng đọc thiết bị (dự phòng):</label>
    <div class="p-voices"></div>
    <label>Tốc độ đọc</label>
    <div class="p-speeds"></div>
    <div class="p-actions"><button class="p-test">🔊 Nghe thử</button><button class="p-close">Xong</button></div>`;

  if (cloud) {
    const gList = box.querySelector('.p-gemini-voices');
    const curG = getGeminiVoice();
    listCloudVoices().forEach((gv) => {
      const b = el('button', 'p-voice' + (gv.id === curG ? ' on' : ''), gv.name);
      b.addEventListener('click', () => {
        setGeminiVoice(gv.id);
        gList.querySelectorAll('.p-voice').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        speak('Xin chào bé yêu! Hôm nay mình cùng học bài nào!', { force: true });
      });
      gList.append(b);
    });
  }

  const list = box.querySelector('.p-voices');
  if (!voices.length) {
    list.innerHTML =
      '<p class="p-note">Thiết bị chưa có giọng Tiếng Việt. Mở bằng Edge hoặc Safari để có giọng tốt nhất.</p>';
  }
  voices.slice(0, 6).forEach((v) => {
    const b = el('button', 'p-voice' + (v.name === getVoicePref() ? ' on' : ''), `${v.natural ? '⭐ ' : ''}${v.name}`);
    b.addEventListener('click', () => {
      setVoicePref(v.name);
      list.querySelectorAll('.p-voice').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      speak('Xin chào bé yêu! Hôm nay mình cùng học nhé!', { force: true });
    });
    list.append(b);
  });

  const speeds = [['🐢 Chậm', 0.8], ['🙂 Vừa', 1], ['🐇 Nhanh', 1.15]];
  const sp = box.querySelector('.p-speeds');
  speeds.forEach(([label, v]) => {
    const b = el('button', 'p-voice' + (Math.abs(getSpeed() - v) < 0.06 ? ' on' : ''), label);
    b.addEventListener('click', () => {
      setSpeed(v);
      sp.querySelectorAll('.p-voice').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      speak('Con mèo. Meo meo!', { force: true });
    });
    sp.append(b);
  });

  box.querySelector('.p-test').addEventListener('click', () => {
    speak('Con mèo. Meo meo! Hoan hô bé giỏi quá!', { force: true });
  });

  box.querySelector('.p-close').addEventListener('click', () => {
    sfx.back();
    ov.remove();
  });

  ov.append(box);
  document.body.append(ov);
}

/** Nhấn giữ một phần tử để mở bảng phụ huynh (trẻ 3 tuổi khó vô tình chạm 1.2 giây ở logo). */
export function attachParentGate(target) {
  let t = null;
  const clear = () => clearTimeout(t);
  target.addEventListener('pointerdown', () => {
    clear();
    t = setTimeout(openParentPanel, 1200);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((e) => target.addEventListener(e, clear));
}
