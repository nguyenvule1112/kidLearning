// Chọn phong cách đọc theo nội dung câu (dùng chung cho trình duyệt và script tải sẵn giọng)
export function detectStyle(text) {
  if (/giỏi|hoan hô|tuyệt|đúng rồi|thông minh|xin chào/i.test(text)) return 'cheer';
  if (/thử lại|mình tìm|đây là|từ từ/i.test(text)) return 'soft';
  if (/kêu|gâu|meo|ò ó|cạc|ụt ịt|ùm bò|hí hí|be be|chít|ộp|chíp|vo ve|gừ|uổng|bim|bíp|vù|xình|kính coong|brừm|í o|phành|vèo/i.test(text)) return 'animal';
  if (/kìa|chú|bạn|đang|thích|nhé!?$/i.test(text) && text.length > 28) return 'story';
  return 'friendly';
}
