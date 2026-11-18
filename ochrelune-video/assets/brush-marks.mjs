// 油画笔触：p5.brush 只画一次笔毛印模，之后用 Canvas 2D 按帧逐笔显现。
// 依赖页面里已加载 p5（2.x）和 p5.brush（2.2.x）。所有随机数都走固定种子。

export const palette = {paper: '#FAF9F5', oat: '#F0EEE6', clay: '#D97757', olive: '#788C5D'};
const clamp = t => Math.max(0, Math.min(1, t));

export function seeded(seed) {
  return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}
export function mix(a, b, t) {
  const c = [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t));
  return '#' + c.map(n => n.toString(16).padStart(2, '0')).join('');
}
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---- 1. 画 6 种平头笔的黑白样张 ----
const CELL_W = 352, CELL_H = 76, VARIANTS = 6;
function paintNibs(p, brush) {
  const rng = seeded(0xa65f241);
  p.background(255);
  p.translate(-CELL_W / 2, -CELL_H * VARIANTS / 2);   // WEBGL 原点在中心
  brush.noField(); brush.noFill();
  for (let i = 0; i < VARIANTS; i++) {
    const center = CELL_H * (i + .5), bristles = i < 3 ? 25 : 15, bend = [7, -5, 2, -7, 6, -3][i];
    for (let k = 0; k < bristles; k++) {
      const edge = 2 * (k + .5) / bristles - 1, y = center + edge * 19;
      const start = 18 + 27 * Math.abs(edge) + rng() * 14, end = 338 - 43 * Math.abs(edge) + rng() * 9;
      brush.set('2B', '#101010', 2.2 + rng() * 2.1);
      brush.spline([[start, y + 4 * Math.sin(edge * 3), .7], [83 + rng() * 12, y + bend - 2 + rng() * 3, 1],
        [173, y + bend * 1.45 + edge * 3, 1], [263, y + bend * .5 + edge * 3, 1], [end, y + edge * 4, .7]], .27);
    }
    for (let k = 0; k < 10; k++) {                    // 分叉细毛，打散平头的钝端
      const edge = rng() * 2 - 1, y = center + edge * 21;
      brush.set('HB', '#151515', 1.2 + rng() * 1.6);
      brush.spline([[11 + rng() * 48, y, .5], [112, y + bend + .6, 1], [241, y + bend * .8, 1], [317 + rng() * 25, y + edge * 4, .7]], .4);
    }
  }
}

// ---- 2. 读回像素，黑度 → 透明度 ----
function readNibs(source) {
  const copy = canvas(CELL_W, CELL_H * VARIANTS), ctx = copy.getContext('2d', {willReadFrequently: true});
  ctx.drawImage(source, 0, 0);
  return Array.from({length: VARIANTS}, (_, i) => {
    const px = ctx.getImageData(0, CELL_H * i, CELL_W, CELL_H);
    let density = 0;
    for (let j = 0; j < px.data.length; j += 4) {
      const a = Math.round(Math.min(1, (1 - px.data[j] / 255) * 1.55) * 255);
      density += a; px.data[j] = px.data[j + 1] = px.data[j + 2] = 255; px.data[j + 3] = a;
    }
    if (density < 8000 || density > CELL_W * CELL_H * 225) throw Error('p5.brush 没有画出笔毛');
    const stamp = canvas(CELL_W, CELL_H); stamp.getContext('2d').putImageData(px, 0, 0);
    return stamp;
  });
}

export function prepareNibs(P5 = window.p5, brush = window.brush, host = document.body) {
  return new Promise((resolve, reject) => {
    new P5(p => {
      brush.instance(p);
      p.setup = () => {
        try {
          p.pixelDensity(1); p.createCanvas(CELL_W, CELL_H * VARIANTS, p.WEBGL);
          brush.instance(p); p.randomSeed(0x701ca); p.noiseSeed(0x701ca); brush.load();
          paintNibs(p, brush);
        } catch (e) { reject(e); p.noLoop(); }
      };
      p.draw = () => {                                 // p5.brush 在 postsetup 后才把笔迹刷到画布
        p.noLoop();
        try { resolve({nibs: readNibs(p.canvas), tinted: new Map()}); }
        catch (e) { reject(e); }
        finally { setTimeout(() => p.remove(), 0); }
      };
    }, host);
  });
}

// ---- 3. 染色 + 4. 单笔逐步显现 ----
function tint(bundle, variant, color) {
  const key = variant + color;
  if (!bundle.tinted.has(key)) {
    const c = canvas(CELL_W, CELL_H), ctx = c.getContext('2d');
    ctx.drawImage(bundle.nibs[variant], 0, 0);
    ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = color; ctx.fillRect(0, 0, CELL_W, CELL_H);
    bundle.tinted.set(key, c);
  }
  return bundle.tinted.get(key);
}
export const mark = (x, y, dx, dy, width, color, alpha, variant, start, span) =>
  ({x, y, dx, dy, width, color, alpha, variant, start, span});

function drawMark(ctx, bundle, m, amount) {
  if (amount <= 0) return;
  const length = Math.hypot(m.dx, m.dy);
  ctx.save();
  ctx.translate(m.x, m.y); ctx.rotate(Math.atan2(m.dy, m.dx));
  ctx.globalAlpha *= m.alpha;
  if (amount < 1) {                                    // 不规则笔锋只露出已画的部分，不拉伸
    const end = length * amount, tip = Math.min(m.width * .28, length * .04);
    ctx.beginPath(); ctx.moveTo(-2, -m.width);
    ctx.lineTo(end - tip, -m.width); ctx.lineTo(end + tip, -m.width * .22); ctx.lineTo(end - tip * .45, 0);
    ctx.lineTo(end + tip * .4, m.width * .21); ctx.lineTo(end - tip, m.width); ctx.lineTo(-2, m.width);
    ctx.closePath(); ctx.clip();
  }
  ctx.drawImage(tint(bundle, m.variant, m.color), 0, -m.width / 2, length, m.width);
  ctx.restore();
}

// ---- 5. 一幅画 = 一组 mark，progress ∈ [0,1] 决定每笔画到哪里 ----
export function paintMarks(ctx, bundle, marks, progress) {
  for (const m of marks) drawMark(ctx, bundle, m, clamp((progress - m.start) / m.span));
}

// 例：智能体工作中的“加载”（200×132 画布，放大到约 300×198 贴进画面）
export function loaderMarks({olive, clay, paper} = palette) {
  const leaf = mix(olive, paper, .29);
  return [
    mark(32, 39, 104, -3, 18, leaf, .94, 4, .015, .27),
    mark(23, 65, 132, 2, 18, olive, .98, 1, .25, .27),
    mark(38, 92, 83, -4, 16, leaf, .93, 3, .49, .25),
    mark(153, 68, 16, -6, 21, clay, .99, 0, .78, .16),   // 最后陶土色点一下“选中”
  ];
}

// ---- 6. 章节转场：一条不规则边缘横扫，左侧露出下一镜，边缘贴细笔毛 ----
export function makeTransition(bundle, {paper, oat, olive} = palette, W = 1920, H = 1080) {
  const fringe = mix(olive, paper, .55);
  const hairs = Array.from({length: 45}, (_, i) => ({
    y: 12 + i * 24 + Math.sin(i * 2.1) * 9,
    color: i === 10 || i === 33 ? fringe : [oat, paper, '#DFDDD1', '#D7D4C7', '#EBE8DE'][i % 5],
    variant: i % 6, dx: 128 + ((i * 61) % 265), dy: 5 + ((i * 7) % 13), offset: 38 * Math.sin(i * .52),
    alpha: i === 10 || i === 33 ? .53 : .42 + (i % 3) * .085,
  }));
  // t ∈ [0,1]；drawNext(ctx) 画下一镜（会被裁剪到边缘左侧）
  return (ctx, t, drawNext) => {
    const s = clamp(t), e = s * s * (3 - 2 * s), head = -152 + 2560 * e;
    const edge = y => head + 25 * Math.sin(y / 245) + 12 * Math.cos(y / 84);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-600, -8);
    for (let y = -8; y <= H + 8; y += 8) ctx.lineTo(edge(y), y);
    ctx.lineTo(-600, H + 8); ctx.closePath(); ctx.clip();
    drawNext(ctx); ctx.restore();
    if (s > 0 && s < 1) for (const h of hairs) {
      ctx.globalAlpha = h.alpha;
      ctx.drawImage(tint(bundle, h.variant, h.color), edge(h.y) + h.offset - h.dx, h.y - h.dy / 2, h.dx, h.dy);
    }
    ctx.globalAlpha = 1;
  };
}
