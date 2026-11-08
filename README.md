# ☀️ Bé Học Vui

Web app học và chơi cho bé 3 tuổi. Chạy trong mạng LAN ở nhà, hoặc đưa lên mạng miễn phí (GitHub Pages).

## Chạy ở nhà
- Nhấp đúp `start.bat` (bản build, cổng **4173**), hoặc `npm run dev` (cổng **5173**).
- Terminal in ra `Network: http://192.168.x.x:PORT` → mở trên iPad.

## Chủ đề mới (v1.2) — cho bé phải suy nghĩ
| Chủ đề | Trò | Rèn kỹ năng |
|---|---|---|
| 🧠 Thử thách | 🙈 Cái gì biến mất? | Trí nhớ: nhìn 3–5 bạn, che lại, một bạn trốn mất |
| | 📏 Xếp nhỏ → to | So sánh kích thước, thứ tự (cấp cao: xếp to → nhỏ) |
| | 🐣 Trước – sau | Trình tự nhân quả: trứng → gà con, mây → mưa → cầu vồng… |
| | 🧺 Phân loại | Xếp vào 2 giỏ: dưới nước / trên trời, ăn được / đồ chơi, nóng / lạnh, to / nhỏ |
| 💡 Đố vui | 🤔 Nghe câu đố | Nghe hiểu: chỉ có lời đố, không có chữ hay hình gợi ý |
| | 🔗 Cái gì đi với nhau | Liên tưởng: thỏ – cà rốt, ổ khóa – chìa khóa… |

Độ khó tự tăng khi bé làm đúng không sai (và tự giảm nếu bé sai nhiều), được nhớ trên từng máy.
Thêm nội dung: sửa `src/thinking-data.js`.

## Giọng đọc
Mặc định dùng **Hoài My** — giọng tiếng Việt bản địa của Microsoft, miễn phí, không cần key.
Đổi trong `.env` (xem `.env.example`): `TTS_VOICE=edge:vi-VN-NamMinhNeural` (nam) hoặc `gemini:Leda`…
Trên iPad: nhấn giữ logo ở trang chủ ~1 giây để mở cài đặt và nghe thử các giọng.

Mỗi câu chỉ tạo 1 lần rồi lưu trong `.tts-cache`. Để tạo sẵn toàn bộ câu (nên làm trước khi đưa lên mạng):
```
npm run dev          (cửa sổ 1, để chạy)
npm run voice        (cửa sổ 2)
```

## Đưa lên mạng miễn phí (GitHub Pages, không cần mua tên miền)
Link sẽ có dạng `https://nguyenvule1112.github.io/kidLearning/`.

**Lần đầu:**
1. Tạo tài khoản https://github.com và cài Git: https://git-scm.com/download/win
2. Trên GitHub bấm **New repository**, đặt tên `be-hoc-vui`, chọn **Public**, bấm Create.
3. Mở cmd trong thư mục project, chạy (thay TEN-GITHUB):
   ```
   git init
   git add .
   git commit -m "Be Hoc Vui"
   git branch -M main
   git remote add origin https://github.com/TEN-GITHUB/be-hoc-vui.git
   git push -u origin main
   ```
   (`.env` chứa API key đã nằm trong `.gitignore`, không bị đẩy lên.)
4. Tạo sẵn giọng đọc (mục trên), rồi nhấp đúp `dua-len-mang.bat`.
5. Trên GitHub: **Settings › Pages › Branch: `gh-pages` / root › Save**. Đợi 1–2 phút là có link.

**Những lần sau:** chỉ cần nhấp đúp `dua-len-mang.bat`.

Bản online là web tĩnh: giọng "cô giáo" lấy từ các file đã tạo sẵn, câu nào chưa có thì dùng giọng của thiết bị.
API key không bao giờ bị đưa lên mạng.

*Cách khác không cần Git:* chạy `npm run build`, rồi kéo thả thư mục `dist` vào https://app.netlify.com/drop → được link dạng `xxx.netlify.app`.

## Thêm vào màn hình chính của iPad
Safari → nút Chia sẻ → **Thêm vào MH chính**.

## Cấu trúc
- `src/main.js` – điều hướng, khóa cuộn/zoom, màn hình chào
- `src/audio.js` – giọng đọc (file đóng gói → server → trình duyệt) + hiệu ứng âm thanh
- `vite.config.js` – tạo giọng (Microsoft / Gemini), đóng gói giọng vào `dist/voice` khi build
- `src/screens/*` – từng chủ đề; `src/screens/thinking.js` – Thử thách & Đố vui
