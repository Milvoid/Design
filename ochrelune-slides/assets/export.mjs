// 导出 PDF（每页 1920×1080，全部步骤显示，字体嵌入）、逐页 PNG 和缩略图总览。
// 用法：node export.mjs <deck 目录或 index.html> [输出目录]
// 依赖 playwright。没有自带 Chromium 时设 BROWSER=/path/to/chrome 或 BROWSER_CHANNEL=chrome / msedge。
import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve, dirname, join, basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {statSync} from 'node:fs';
import {serve} from './serve.mjs';

const input = resolve(process.argv[2] || '.');
const html = statSync(input).isDirectory() ? join(input, 'index.html') : input;
const out = resolve(process.argv[3] || join(dirname(html), 'export'));
await mkdir(join(out, 'pages'), {recursive: true});

const browser = await chromium.launch({
  executablePath: process.env.BROWSER || undefined,
  channel: process.env.BROWSER ? undefined : process.env.BROWSER_CHANNEL || undefined,
});
// 导出时通过内部服务器读取源工程的字体与原图。
const server = await serve(dirname(html));
const page = await browser.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1});
await page.goto(server.url + basename(html), {waitUntil: 'networkidle'});
await page.evaluate(async () => { await Promise.all([...document.fonts].map(f => f.load().catch(() => null))); await document.fonts.ready; });
await page.emulateMedia({media: 'print'});

// 字体是否真的加载了：标题、正文、数字三类各检查一次
const fonts = await page.evaluate(() => ['Ochrelune Serif', 'Ochrelune Sans', 'Ochrelune Numeral']
  .map(f => [f, [...document.fonts].some(face => face.family.replace(/"/g, '') === f && face.status === 'loaded')]));
for (const [f, ok] of fonts) if (!ok) console.warn('字体未加载，将退回系统字体：', f);

// 版面检查：内容区溢出（压到页脚或出画）、标题折行
const issues = await page.evaluate(() => [...document.querySelectorAll('.slide')].flatMap((slide, i) => {
  const out = [], n = i + 1, box = slide.getBoundingClientRect();
  const body = slide.querySelector('.body');
  if (body && body.scrollHeight > body.clientHeight + 2) out.push(`第 ${n} 页内容超出内容区 ${body.scrollHeight - body.clientHeight}px，拆页或删字`);
  for (const el of slide.querySelectorAll('.body *')) {
    const r = el.getBoundingClientRect();
    if (r.height && (r.bottom > box.bottom - 72 || r.right > box.right - 100)) { out.push(`第 ${n} 页有元素压到页脚或右边距：${el.tagName.toLowerCase()} ${el.textContent.trim().slice(0, 16)}`); break; }
  }
  const h1 = slide.querySelector(':scope > h1');
  if (h1 && !/layout-(cover|section|closing)/.test(slide.className)) {
    const lh = parseFloat(getComputedStyle(h1).lineHeight);
    if (h1.getBoundingClientRect().height > lh * 1.5) out.push(`第 ${n} 页标题折成了两行，缩短到一行`);
  }
  return out;
}));
issues.forEach(x => console.warn('版面：' + x));

const name = basename(dirname(html));
await page.pdf({path: join(out, `${name}.pdf`), width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true});

const count = await page.locator('.slide').count();
const files = [];
for (let i = 0; i < count; i++) {
  const file = join(out, 'pages', `${String(i + 1).padStart(2, '0')}.png`);
  await page.locator('.slide').nth(i).screenshot({path: file});
  files.push(file);
}

// 缩略图总览：4 列，每张 480×270
const sheet = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#E8E6DC;font:20px sans-serif">
<div style="display:grid;grid-template-columns:repeat(4,480px);gap:24px;padding:32px">
${files.map((f, i) => `<figure style="margin:0"><img src="${pathToFileURL(f).href}" style="width:480px;display:block;box-shadow:0 2px 8px rgba(0,0,0,.12)"><figcaption style="color:#5E5D59;margin-top:8px">${i + 1}</figcaption></figure>`).join('')}
</div></body>`;
const sheetFile = join(out, 'overview.html');
await writeFile(sheetFile, sheet);
const view = await browser.newPage({viewport: {width: 4 * 480 + 3 * 24 + 64, height: 400}});
await view.goto(pathToFileURL(sheetFile).href, {waitUntil: 'load'});
await view.screenshot({path: join(out, 'overview.png'), fullPage: true});

// 投影模拟：降低对比度和饱和度，检查浅色信息是否还看得见
await view.addStyleTag({content: 'img{filter:contrast(.7) saturate(.6) brightness(1.08)}'});
await view.screenshot({path: join(out, 'overview-projector.png'), fullPage: true});

await browser.close();
await server.close();
console.log(`ok · ${count} 页 → ${out}`);
