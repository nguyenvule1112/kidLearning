// Hiệu ứng chuyển động phản hồi ngay khi chạm
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff924c', '#ff70a6'];
const rand = (a, b) => a + Math.random() * (b - a);

export function burst(x, y, count = 7) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'spark';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = COLORS[i % COLORS.length];
    document.body.append(p);
    const a = rand(0, Math.PI * 2);
    const d = rand(40, 100);
    p.animate(
      [
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(0)`, opacity: 0.2 },
      ],
      { duration: rand(450, 750), easing: 'cubic-bezier(.2,.8,.4,1)' }
    ).onfinish = () => p.remove();
  }
}

export function confetti(n = 60) {
  const W = innerWidth;
  const H = innerHeight;
  const emojis = ['⭐', '🎉', '💖', '🌟'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    if (i % 5 === 0) {
      p.textContent = emojis[i % emojis.length];
      p.classList.add('emoji');
    } else {
      p.style.background = COLORS[i % COLORS.length];
    }
    p.style.left = rand(0, W) + 'px';
    document.body.append(p);
    p.animate(
      [
        { transform: `translate(0, -40px) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${rand(-80, 80)}px, ${H + 60}px) rotate(${rand(-720, 720)}deg)`, opacity: 1 },
      ],
      { duration: rand(1600, 2800), delay: rand(0, 400), easing: 'cubic-bezier(.3,.2,.6,1)', fill: 'backwards' }
    ).onfinish = () => p.remove();
  }
}

export function bounce(el) {
  el?.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }],
    { duration: 450, easing: 'ease-out' }
  );
}

export function shake(el) {
  el?.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-8%) rotate(-5deg)' },
      { transform: 'translateX(8%) rotate(5deg)' },
      { transform: 'translateX(-5%) rotate(-3deg)' },
      { transform: 'translateX(0)' },
    ],
    { duration: 450 }
  );
}

export function spin(el) {
  el?.animate(
    [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(200deg) scale(1.2)' }, { transform: 'rotate(360deg) scale(1)' }],
    { duration: 650, easing: 'ease-in-out' }
  );
}
