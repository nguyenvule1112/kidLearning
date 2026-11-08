// Biến mọi ký tự emoji trong giao diện thành ảnh SVG (Twemoji) đẹp, đồng nhất, sắc nét ở mọi cỡ.
// Chạy tự động bằng MutationObserver nên các màn hình không cần sửa gì.
const RE = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?|[\u{1F3FB}-\u{1F3FF}])*/gu;
const codeOf = (s) => [...s.replace(/\uFE0F/g, '')].map((c) => c.codePointAt(0).toString(16)).join('-');

function makeImg(ch) {
  const img = new Image();
  img.className = 'emo';
  img.alt = ch;
  img.draggable = false;
  img.decoding = 'async';
  img.src = `${import.meta.env.BASE_URL}emoji/${codeOf(ch)}.svg`;
  img.onerror = () => img.replaceWith(document.createTextNode(ch)); // thiếu icon -> dùng emoji hệ thống
  return img;
}

function convert(node) {
  if (node.nodeType === 3) {
    const t = node.nodeValue;
    RE.lastIndex = 0;
    if (!RE.test(t)) return;
    RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of t.matchAll(RE)) {
      if (m.index > last) frag.append(t.slice(last, m.index));
      frag.append(makeImg(m[0]));
      last = m.index + m[0].length;
    }
    if (last < t.length) frag.append(t.slice(last));
    node.replaceWith(frag);
  } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE', 'IMG', 'SVG', 'svg'].includes(node.tagName)) {
    [...node.childNodes].forEach(convert);
  }
}

export function startEmoji(root = document.body) {
  convert(root);
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'characterData') convert(m.target);
      else m.addedNodes.forEach(convert);
    }
  }).observe(root, { childList: true, subtree: true, characterData: true });
}
