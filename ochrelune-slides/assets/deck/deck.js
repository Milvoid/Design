// Ochrelune Slides 放映脚本：缩放、翻页、分步、描边生长、跨页平滑移动、讲者备注、总览。
// 键位：→ / 空格 / PageDown / Enter 下一步；← / PageUp / Backspace 上一步；Home / End；
//       N 讲者备注；O 总览（点击跳页）；F 全屏。URL #/页码 记住位置。
const deck = document.getElementById('deck');
const slides = [...deck.querySelectorAll('.slide')];
const shortTitle = document.body.dataset.shortTitle || '';
const noFooter = /\blayout-(cover|section|closing)\b/;
let index = 0, step = 0;

// 页脚、步骤数、描边准备
slides.forEach((slide, i) => {
  if (!noFooter.test(slide.className)) {
    const f = document.createElement('div');
    f.className = 'slide-footer';
    f.innerHTML = `<span>${shortTitle}</span><span class="page">${i + 1}</span>`;
    slide.appendChild(f);
  }
  slide._steps = Math.max(0, ...[...slide.querySelectorAll('[data-step]')].map(e => +e.dataset.step || 0));
  // 描边生长：带描边的路径按顺序画出，带填色的路径在描边过半后淡入（见插画设计语言 §6）
  slide.querySelectorAll('svg.art.draw path, svg.art.draw rect').forEach((p, k) => {
    const stroke = p.getAttribute('stroke'), fill = p.getAttribute('fill');
    if (p.classList.contains('ink') || (stroke && stroke !== 'none')) { p.setAttribute('pathLength', '1'); p.dataset.ink = ''; }
    if (p.classList.contains('fill') || (fill && fill !== 'none')) p.dataset.fill = '';
    p.style.setProperty('--i', k);
  });
});

const panel = document.createElement('div');
panel.id = 'notes-panel';
document.body.appendChild(panel);

function fit() {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.documentElement.style.setProperty('--scale', s);
}

function morphNames(slide, on) {
  slide.querySelectorAll('[data-morph]').forEach(el => { el.style.viewTransitionName = on ? 'm-' + el.dataset.morph : ''; });
}

function render() {
  const slide = slides[index];
  slides.forEach(s => s.classList.toggle('is-active', s === slide));
  slide.querySelectorAll('[data-step]').forEach(el => el.classList.toggle('is-shown', +el.dataset.step <= step));
  drawArt(slide);
  const notes = slide.querySelector('.notes');
  panel.innerHTML = `<b>${index + 1} / ${slides.length}</b>　步骤 ${step}/${slide._steps}<br>` + (notes ? notes.innerHTML : '');
  history.replaceState(null, '', '#/' + (index + 1));
}

function drawArt(slide) {
  slide.querySelectorAll('svg.art.draw').forEach(svg => {
    const hiddenStep = () => svg.closest('[data-step]:not(.is-shown)');
    if (hiddenStep()) svg.classList.remove('is-drawn');
    else if (!svg.classList.contains('is-drawn')) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (slide.classList.contains('is-active') && !hiddenStep()) svg.classList.add('is-drawn');
      }));
    }
  });
}

function go(next, nextStep = 0) {
  next = Math.max(0, Math.min(slides.length - 1, next));
  if (next === index) { step = nextStep; render(); return; }
  const from = slides[index], to = slides[next];
  const swap = () => {
    morphNames(from, false);
    from.querySelectorAll('.art.is-drawn').forEach(svg => svg.classList.remove('is-drawn'));
    index = next; step = nextStep; morphNames(to, true); render();
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    morphNames(from, true);
    document.startViewTransition(swap);
  } else swap();
}

function forward() { const s = slides[index]; if (step < s._steps) { step++; render(); } else go(index + 1, 0); }
function back() { if (step > 0) { step--; render(); } else go(index - 1, slides[Math.max(0, index - 1)]._steps); }

addEventListener('keydown', e => {
  if (document.body.classList.contains('overview') && e.key !== 'o' && e.key !== 'O' && e.key !== 'Escape') return;
  const k = e.key;
  if ([' ', 'ArrowRight', 'ArrowDown', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); forward(); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); back(); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(slides.length - 1, slides.at(-1)._steps);
  else if (k === 'n' || k === 'N') document.body.classList.toggle('show-notes');
  else if (k === 'f' || k === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  else if (k === 'o' || k === 'O' || (k === 'Escape' && document.body.classList.contains('overview'))) document.body.classList.toggle('overview');
});
deck.addEventListener('click', e => {
  const s = e.target.closest('.slide');
  if (document.body.classList.contains('overview') && s) { document.body.classList.remove('overview'); go(slides.indexOf(s)); }
});
addEventListener('resize', fit);
addEventListener('hashchange', () => {
  const n = +(location.hash.match(/#\/(\d+)/)?.[1] || 1) - 1;
  if (n !== index) go(n);
});

fit();
const start = +(location.hash.match(/#\/(\d+)/)?.[1] || 1) - 1;
index = Math.max(0, Math.min(slides.length - 1, start));
morphNames(slides[index], true);
render();
document.fonts.ready.then(() => document.body.classList.add('fonts-ready'));
