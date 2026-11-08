// Nội dung cho 2 chủ đề tư duy: "Thử thách" 🧠 và "Đố vui" 💡
// Không dùng DOM để script tải sẵn giọng (scripts/prewarm-voice.mjs) cũng đọc được.

// ---------- 🙈 Cái gì biến mất? (dùng đồ vật quen thuộc, dễ gọi tên) ----------
export const memoryItems = [
  { e: '🐶', n: 'Con chó' }, { e: '🐱', n: 'Con mèo' }, { e: '🐸', n: 'Con ếch' }, { e: '🐘', n: 'Con voi' },
  { e: '🐟', n: 'Con cá' }, { e: '🐢', n: 'Con rùa' }, { e: '🦋', n: 'Con bướm' }, { e: '🐔', n: 'Con gà' },
  { e: '🍎', n: 'Quả táo' }, { e: '🍌', n: 'Quả chuối' }, { e: '🍉', n: 'Quả dưa hấu' }, { e: '🍓', n: 'Quả dâu tây' },
  { e: '🚗', n: 'Xe ô tô' }, { e: '✈️', n: 'Máy bay' }, { e: '🚲', n: 'Xe đạp' }, { e: '⚽', n: 'Quả bóng' },
  { e: '🎈', n: 'Bóng bay' }, { e: '⭐', n: 'Ngôi sao' }, { e: '🌸', n: 'Bông hoa' }, { e: '🧸', n: 'Gấu bông' },
];

// ---------- 📏 Xếp từ nhỏ đến to ----------
export const sizeItems = [
  { e: '🐘', n: 'bạn voi' }, { e: '🍎', n: 'quả táo' }, { e: '⭐', n: 'ngôi sao' }, { e: '🐟', n: 'bạn cá' },
  { e: '🎈', n: 'quả bóng bay' }, { e: '🌳', n: 'cái cây' }, { e: '🐻', n: 'bạn gấu' }, { e: '🚗', n: 'chiếc xe' },
];

// ---------- 🔜 Cái gì trước, cái gì sau? ----------
// steps: theo đúng thứ tự; story: câu kể lại khi bé xếp đúng
export const sequences = [
  { steps: [{ e: '🥚', n: 'Quả trứng' }, { e: '🐣', n: 'Gà con nở ra' }, { e: '🐥', n: 'Gà con lớn lên' }], story: 'Quả trứng nở ra gà con, rồi gà con lớn lên!' },
  { steps: [{ e: '🌱', n: 'Cây mầm' }, { e: '🌿', n: 'Cây non' }, { e: '🌳', n: 'Cây to' }], story: 'Hạt nảy mầm, lớn thành cây non, rồi thành cây to!' },
  { steps: [{ e: '☁️', n: 'Mây kéo đến' }, { e: '🌧️', n: 'Trời mưa' }, { e: '🌈', n: 'Cầu vồng' }], story: 'Mây kéo đến, trời đổ mưa, rồi cầu vồng hiện ra!' },
  { steps: [{ e: '🌸', n: 'Hoa nở' }, { e: '🍏', n: 'Quả xanh' }, { e: '🍎', n: 'Quả chín' }], story: 'Hoa nở, kết thành quả xanh, rồi quả chín đỏ!' },
  { steps: [{ e: '🌅', n: 'Buổi sáng' }, { e: '☀️', n: 'Buổi trưa' }, { e: '🌙', n: 'Buổi tối' }], story: 'Buổi sáng mặt trời mọc, buổi trưa nắng to, buổi tối có trăng!' },
  { steps: [{ e: '🪥', n: 'Đánh răng' }, { e: '📖', n: 'Đọc truyện' }, { e: '😴', n: 'Đi ngủ' }], story: 'Đánh răng, nghe đọc truyện, rồi đi ngủ thôi!' },
  { steps: [{ e: '🧼', n: 'Rửa tay' }, { e: '🍚', n: 'Ăn cơm' }, { e: '😋', n: 'No bụng' }], story: 'Rửa tay sạch, ăn cơm ngon, rồi no căng bụng!' },
  { steps: [{ e: '👶', n: 'Em bé' }, { e: '🧒', n: 'Bạn nhỏ' }, { e: '🧑', n: 'Người lớn' }, { e: '👴', n: 'Ông già' }], story: 'Em bé lớn lên thành bạn nhỏ, rồi thành người lớn, rồi thành ông!' },
  { steps: [{ e: '🥚', n: 'Quả trứng' }, { e: '🐣', n: 'Gà con nở ra' }, { e: '🐥', n: 'Gà con' }, { e: '🐔', n: 'Gà mẹ' }], story: 'Quả trứng nở ra gà con, gà con lớn thành gà mẹ!' },
  { steps: [{ e: '🌱', n: 'Cây mầm' }, { e: '🌿', n: 'Cây non' }, { e: '🌳', n: 'Cây to' }, { e: '🍎', n: 'Có quả' }], story: 'Cây mầm lớn dần thành cây to, rồi cho ta quả ngọt!' },
];

// ---------- 🧺 Phân loại vào 2 giỏ ----------
// a/b: 2 nhóm; say: câu nói khi bé xếp sai (tên + say), prompt: câu hướng dẫn
export const sortRules = [
  {
    prompt: 'Bạn nào sống dưới nước, bạn nào bay trên trời? Bé xếp vào đúng chỗ nhé!',
    a: { e: '🌊', label: 'Dưới nước', say: 'sống dưới nước', items: [{ e: '🐟', n: 'Con cá' }, { e: '🐳', n: 'Cá voi' }, { e: '🐙', n: 'Bạch tuộc' }, { e: '🦀', n: 'Con cua' }, { e: '🐬', n: 'Cá heo' }, { e: '🦐', n: 'Con tôm' }] },
    b: { e: '☁️', label: 'Trên trời', say: 'bay trên trời', items: [{ e: '🐦', n: 'Con chim' }, { e: '✈️', n: 'Máy bay' }, { e: '🦋', n: 'Con bướm' }, { e: '🐝', n: 'Con ong' }, { e: '🚁', n: 'Trực thăng' }, { e: '🎈', n: 'Bóng bay' }] },
  },
  {
    prompt: 'Cái nào ăn được, cái nào là đồ chơi? Bé xếp vào đúng chỗ nhé!',
    a: { e: '🍽️', label: 'Ăn được', say: 'ăn được', items: [{ e: '🍎', n: 'Quả táo' }, { e: '🍌', n: 'Quả chuối' }, { e: '🥕', n: 'Củ cà rốt' }, { e: '🍞', n: 'Bánh mì' }, { e: '🍉', n: 'Dưa hấu' }, { e: '🍚', n: 'Bát cơm' }] },
    b: { e: '🧸', label: 'Đồ chơi', say: 'là đồ chơi', items: [{ e: '⚽', n: 'Quả bóng' }, { e: '🪁', n: 'Con diều' }, { e: '🧩', n: 'Miếng ghép' }, { e: '🪀', n: 'Con quay' }, { e: '🎲', n: 'Xúc xắc' }, { e: '🪆', n: 'Búp bê' }] },
  },
  {
    prompt: 'Cái nào nóng, cái nào lạnh? Bé xếp vào đúng chỗ nhé!',
    a: { e: '🔥', label: 'Nóng', say: 'nóng lắm', items: [{ e: '☀️', n: 'Mặt trời' }, { e: '☕', n: 'Cốc trà nóng' }, { e: '🍲', n: 'Nồi canh nóng' }, { e: '🌋', n: 'Núi lửa' }, { e: '🕯️', n: 'Ngọn nến' }] },
    b: { e: '❄️', label: 'Lạnh', say: 'lạnh lắm', items: [{ e: '🍦', n: 'Kem' }, { e: '⛄', n: 'Người tuyết' }, { e: '🧊', n: 'Cục đá' }, { e: '🐧', n: 'Chim cánh cụt' }, { e: '🧤', n: 'Găng tay mùa đông' }] },
  },
  {
    prompt: 'Con vật nào to, con vật nào nhỏ? Bé xếp vào đúng chỗ nhé!',
    a: { e: '🐘', label: 'To', say: 'to lắm', items: [{ e: '🦒', n: 'Hươu cao cổ' }, { e: '🐋', n: 'Cá voi' }, { e: '🦏', n: 'Tê giác' }, { e: '🐄', n: 'Con bò' }, { e: '🐴', n: 'Con ngựa' }] },
    b: { e: '🐭', label: 'Nhỏ', say: 'nhỏ xíu', items: [{ e: '🐜', n: 'Con kiến' }, { e: '🐝', n: 'Con ong' }, { e: '🐌', n: 'Con ốc sên' }, { e: '🐞', n: 'Bọ rùa' }, { e: '🐛', n: 'Sâu con' }] },
  },
];

// ---------- 🤔 Câu đố (bé chỉ nghe, không có chữ) ----------
// w: các lựa chọn sai đã chọn sẵn để không bị đáp án mơ hồ
export const riddles = [
  { q: 'Con gì có cái vòi thật dài, và đôi tai to như cái quạt?', a: { e: '🐘', n: 'Con voi' }, w: [{ e: '🐶', n: 'Con chó' }, { e: '🐟', n: 'Con cá' }, { e: '🐔', n: 'Con gà' }] },
  { q: 'Con gì có cái cổ cao thật là cao?', a: { e: '🦒', n: 'Hươu cao cổ' }, w: [{ e: '🐷', n: 'Con heo' }, { e: '🐸', n: 'Con ếch' }, { e: '🐢', n: 'Con rùa' }] },
  { q: 'Con gì chăm chỉ đi tìm hoa, làm ra mật ngọt?', a: { e: '🐝', n: 'Con ong' }, w: [{ e: '🐱', n: 'Con mèo' }, { e: '🐟', n: 'Con cá' }, { e: '🐴', n: 'Con ngựa' }] },
  { q: 'Con gì cho chúng mình sữa để uống?', a: { e: '🐄', n: 'Con bò' }, w: [{ e: '🐸', n: 'Con ếch' }, { e: '🐝', n: 'Con ong' }, { e: '🦋', n: 'Con bướm' }] },
  { q: 'Con gì bò thật chậm, mang ngôi nhà trên lưng?', a: { e: '🐢', n: 'Con rùa' }, w: [{ e: '🐰', n: 'Con thỏ' }, { e: '🐦', n: 'Con chim' }, { e: '🐴', n: 'Con ngựa' }] },
  { q: 'Con gì nhảy lò cò, có cái túi trước bụng để địu con?', a: { e: '🦘', n: 'Con chuột túi' }, w: [{ e: '🐘', n: 'Con voi' }, { e: '🐟', n: 'Con cá' }, { e: '🐔', n: 'Con gà' }] },
  { q: 'Con gì có tám cái chân, sống dưới biển?', a: { e: '🐙', n: 'Bạch tuộc' }, w: [{ e: '🐶', n: 'Con chó' }, { e: '🐦', n: 'Con chim' }, { e: '🐱', n: 'Con mèo' }] },
  { q: 'Con gì sáng nào cũng gáy ò ó o gọi mọi người dậy?', a: { e: '🐓', n: 'Gà trống' }, w: [{ e: '🐷', n: 'Con heo' }, { e: '🐟', n: 'Con cá' }, { e: '🐘', n: 'Con voi' }] },
  { q: 'Quả gì vỏ xanh, ruột đỏ, có nhiều hạt đen?', a: { e: '🍉', n: 'Quả dưa hấu' }, w: [{ e: '🍌', n: 'Quả chuối' }, { e: '🍊', n: 'Quả cam' }, { e: '🍇', n: 'Chùm nho' }] },
  { q: 'Quả gì dài dài, vỏ màu vàng, bạn khỉ thích nhất?', a: { e: '🍌', n: 'Quả chuối' }, w: [{ e: '🍎', n: 'Quả táo' }, { e: '🍉', n: 'Quả dưa hấu' }, { e: '🍇', n: 'Chùm nho' }] },
  { q: 'Quả gì đội vương miện lá xanh, vỏ có nhiều mắt?', a: { e: '🍍', n: 'Quả dứa' }, w: [{ e: '🍎', n: 'Quả táo' }, { e: '🍌', n: 'Quả chuối' }, { e: '🍓', n: 'Quả dâu tây' }] },
  { q: 'Xe gì màu đỏ, kêu í o, đi dập lửa?', a: { e: '🚒', n: 'Xe cứu hỏa' }, w: [{ e: '🚲', n: 'Xe đạp' }, { e: '🚌', n: 'Xe buýt' }, { e: '⛵', n: 'Thuyền buồm' }] },
  { q: 'Cái gì bay trên trời, chở được rất nhiều người?', a: { e: '✈️', n: 'Máy bay' }, w: [{ e: '🚲', n: 'Xe đạp' }, { e: '🚜', n: 'Máy cày' }, { e: '⛵', n: 'Thuyền buồm' }] },
  { q: 'Cái gì chạy trên đường ray, kêu xình xịch?', a: { e: '🚂', n: 'Tàu hỏa' }, w: [{ e: '✈️', n: 'Máy bay' }, { e: '⛵', n: 'Thuyền buồm' }, { e: '🚁', n: 'Trực thăng' }] },
  { q: 'Bé dùng cái gì để đánh răng?', a: { e: '🪥', n: 'Bàn chải đánh răng' }, w: [{ e: '🥄', n: 'Cái thìa' }, { e: '🧦', n: 'Đôi tất' }, { e: '⚽', n: 'Quả bóng' }] },
  { q: 'Trời mưa, bé cần mang cái gì để khỏi ướt?', a: { e: '☂️', n: 'Cái ô' }, w: [{ e: '🕶️', n: 'Kính râm' }, { e: '🍦', n: 'Cây kem' }, { e: '🎈', n: 'Bóng bay' }] },
  { q: 'Bé mang cái gì vào chân trước khi đi chơi?', a: { e: '👟', n: 'Đôi giày' }, w: [{ e: '🧢', n: 'Cái mũ' }, { e: '🧤', n: 'Đôi găng tay' }, { e: '🕶️', n: 'Kính râm' }] },
  { q: 'Cái gì dùng để cắt giấy?', a: { e: '✂️', n: 'Cái kéo' }, w: [{ e: '🥄', n: 'Cái thìa' }, { e: '🪥', n: 'Bàn chải' }, { e: '🧸', n: 'Gấu bông' }] },
  { q: 'Cái gì dùng để gọi điện cho bà?', a: { e: '📱', n: 'Điện thoại' }, w: [{ e: '📖', n: 'Quyển sách' }, { e: '⚽', n: 'Quả bóng' }, { e: '🥄', n: 'Cái thìa' }] },
  { q: 'Cái gì sáng rực trên trời vào ban ngày, làm cho trời nắng?', a: { e: '☀️', n: 'Mặt trời' }, w: [{ e: '🌙', n: 'Mặt trăng' }, { e: '🌧️', n: 'Mưa' }, { e: '⛄', n: 'Người tuyết' }] },
  { q: 'Buổi tối, cái gì sáng trên trời cùng các ngôi sao?', a: { e: '🌙', n: 'Mặt trăng' }, w: [{ e: '☀️', n: 'Mặt trời' }, { e: '🌈', n: 'Cầu vồng' }, { e: '🌧️', n: 'Mưa' }] },
  { q: 'Trời lạnh, bé mặc cái gì cho ấm?', a: { e: '🧥', n: 'Áo khoác' }, w: [{ e: '🩳', n: 'Quần đùi' }, { e: '🕶️', n: 'Kính râm' }, { e: '🍦', n: 'Cây kem' }] },
  { q: 'Bé ăn cơm bằng cái gì?', a: { e: '🥢', n: 'Đôi đũa' }, w: [{ e: '✂️', n: 'Cái kéo' }, { e: '🪥', n: 'Bàn chải' }, { e: '🧦', n: 'Đôi tất' }] },
  { q: 'Ai chữa bệnh cho bé khi bé bị ốm?', a: { e: '🧑‍⚕️', n: 'Bác sĩ' }, w: [{ e: '🧑‍🚒', n: 'Chú lính cứu hỏa' }, { e: '🧑‍🌾', n: 'Bác nông dân' }, { e: '🧑‍🍳', n: 'Đầu bếp' }] },
];

// ---------- 🔗 Cái gì đi với nhau? ----------
export const pairs = [
  { a: { e: '🐰', n: 'Bạn thỏ' }, b: { e: '🥕', n: 'Củ cà rốt' }, q: 'Bạn thỏ thích ăn gì nhỉ?', ok: 'Thỏ thích ăn cà rốt!' },
  { a: { e: '🐵', n: 'Bạn khỉ' }, b: { e: '🍌', n: 'Quả chuối' }, q: 'Bạn khỉ thích ăn gì nhỉ?', ok: 'Khỉ thích ăn chuối!' },
  { a: { e: '🐶', n: 'Bạn cún' }, b: { e: '🦴', n: 'Khúc xương' }, q: 'Bạn cún thích gặm gì nhỉ?', ok: 'Cún thích gặm xương!' },
  { a: { e: '🐼', n: 'Gấu trúc' }, b: { e: '🎋', n: 'Cây tre' }, q: 'Gấu trúc thích ăn gì nhỉ?', ok: 'Gấu trúc thích ăn lá tre!' },
  { a: { e: '🐝', n: 'Con ong' }, b: { e: '🌸', n: 'Bông hoa' }, q: 'Con ong bay đến đâu để hút mật?', ok: 'Ong bay đến bông hoa để hút mật!' },
  { a: { e: '🐔', n: 'Gà mẹ' }, b: { e: '🥚', n: 'Quả trứng' }, q: 'Gà mẹ đẻ ra cái gì nhỉ?', ok: 'Gà mẹ đẻ ra quả trứng!' },
  { a: { e: '🐦', n: 'Con chim' }, b: { e: '🪺', n: 'Cái tổ' }, q: 'Con chim ngủ ở đâu nhỉ?', ok: 'Chim ngủ trong cái tổ!' },
  { a: { e: '🐟', n: 'Con cá' }, b: { e: '🌊', n: 'Nước' }, q: 'Con cá sống ở đâu nhỉ?', ok: 'Cá sống dưới nước!' },
  { a: { e: '🕷️', n: 'Con nhện' }, b: { e: '🕸️', n: 'Mạng nhện' }, q: 'Con nhện giăng cái gì nhỉ?', ok: 'Nhện giăng mạng nhện!' },
  { a: { e: '🔒', n: 'Ổ khóa' }, b: { e: '🔑', n: 'Chìa khóa' }, q: 'Muốn mở ổ khóa thì cần cái gì?', ok: 'Cần chìa khóa để mở ổ khóa!' },
  { a: { e: '🌧️', n: 'Trời mưa' }, b: { e: '☂️', n: 'Cái ô' }, q: 'Trời mưa thì cần cái gì?', ok: 'Trời mưa cần mang ô!' },
  { a: { e: '🦷', n: 'Hàm răng' }, b: { e: '🪥', n: 'Bàn chải' }, q: 'Muốn răng trắng sạch thì cần cái gì?', ok: 'Cần bàn chải để đánh răng!' },
  { a: { e: '⚽', n: 'Quả bóng' }, b: { e: '🥅', n: 'Khung thành' }, q: 'Đá quả bóng vào đâu nhỉ?', ok: 'Đá bóng vào khung thành! Vào!' },
  { a: { e: '🚗', n: 'Ô tô' }, b: { e: '⛽', n: 'Cây xăng' }, q: 'Ô tô hết xăng thì đi đến đâu?', ok: 'Ô tô đến cây xăng để đổ xăng!' },
  { a: { e: '🎂', n: 'Bánh sinh nhật' }, b: { e: '🕯️', n: 'Ngọn nến' }, q: 'Trên bánh sinh nhật có cái gì để thổi?', ok: 'Có ngọn nến để thổi! Phù!' },
  { a: { e: '🐿️', n: 'Con sóc' }, b: { e: '🌰', n: 'Hạt dẻ' }, q: 'Con sóc thích ăn gì nhỉ?', ok: 'Sóc thích ăn hạt dẻ!' },
  { a: { e: '🧦', n: 'Đôi tất' }, b: { e: '👟', n: 'Đôi giày' }, q: 'Đi tất xong thì đi tiếp cái gì?', ok: 'Đi tất rồi đi giày!' },
  { a: { e: '✏️', n: 'Bút chì' }, b: { e: '📄', n: 'Tờ giấy' }, q: 'Bút chì dùng để vẽ lên cái gì?', ok: 'Bút chì vẽ lên tờ giấy!' },
];

// ---------- Câu nói dùng chung ----------
export const T = {
  missLook: 'Bé nhìn thật kỹ, và nhớ các bạn này nhé!',
  missHide: 'Nhắm mắt lại nào! Một, hai, ba!',
  missAsk: 'Bạn nào vừa trốn đi mất rồi? Bé chọn nhé!',
  missNever: 'Bạn này không có ở đây từ đầu. Bé nghĩ lại nhé!',
  sizeSmall: 'Bé chạm từ bạn nhỏ nhất, đến bạn to nhất nhé!',
  sizeBig: 'Lần này khó hơn! Bé chạm từ bạn to nhất, đến bạn nhỏ nhất nhé!',
  sizeWrongSmall: 'Chưa phải đâu. Bé tìm bạn nhỏ nhất còn lại nhé!',
  sizeWrongBig: 'Chưa phải đâu. Bé tìm bạn to nhất còn lại nhé!',
  sizeWin: 'Giỏi quá! Bé xếp đúng thứ tự rồi!',
  seqAsk: 'Cái gì có trước, cái gì có sau? Bé chạm theo thứ tự nhé!',
  seqWrong: 'Chưa đúng rồi. Bé nghĩ xem cái gì có trước nhé!',
  sortWin: 'Hoan hô! Bé xếp đúng hết rồi!',
  riddleWrong: 'Chưa đúng rồi. Bé nghe lại câu đố nhé!',
  pairWrong: 'Chưa đúng rồi. Bé nghĩ lại nhé!',
  levelUp: 'Bé giỏi quá! Mình chơi khó hơn một chút nhé!',
};

const low = (s) => s.charAt(0).toLowerCase() + s.slice(1);
export const missWin = (n) => `Đúng rồi! ${n} đã trốn đi!`;
export const sortWrong = (it, grp) => `${it.n} ${grp.say} bé ạ!`;
export const seqWin = (s) => `Đúng rồi! ${s.story}`;
export const riddleWin = (n) => `Đúng rồi! Là ${low(n)}!`;

/** Tất cả câu có thể được đọc trong 2 chủ đề này (để tải sẵn giọng đọc). */
export function thinkingPhrases() {
  const out = new Set(Object.values(T));
  memoryItems.forEach((it) => { out.add(it.n); out.add(missWin(it.n)); });
  sequences.forEach((s) => { out.add(seqWin(s)); s.steps.forEach((x) => out.add(x.n)); });
  sortRules.forEach((r) => {
    out.add(r.prompt);
    [r.a, r.b].forEach((g) => { out.add(g.label); g.items.forEach((it) => { out.add(it.n); out.add(sortWrong(it, g)); }); });
  });
  riddles.forEach((r) => { out.add(r.q); out.add(riddleWin(r.a.n)); });
  pairs.forEach((p) => { out.add(p.q); out.add(`Đúng rồi! ${p.ok}`); });
  return [...out];
}
