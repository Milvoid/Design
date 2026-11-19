// 制作机用法：node bundle.mjs my-deck 输出.html
import {existsSync} from 'node:fs';
import {mkdtemp, mkdir, readFile, realpath, rename, rm, writeFile} from 'node:fs/promises';
import {basename, dirname, extname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {load} from 'cheerio';
import {build} from 'esbuild';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import sharp from 'sharp';
import subsetFont from 'subset-font';

const mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif'};
const dataURI = (type, bytes) => 'data:' + type + ';base64,' + bytes.toString('base64');

function localFile(ref, dir) {
  const url = new URL(ref, pathToFileURL(dir + '/'));
  if (url.protocol !== 'file:' || ref.startsWith('//') || ref.startsWith('/')) {
    throw new Error('请将资源保存到课件内并使用相对路径：' + ref);
  }
  return fileURLToPath(url);
}

async function imageURI(file) {
  const bytes = await readFile(file);
  const ext = extname(file).toLowerCase();
  if (!mime[ext]) throw new Error('无法内联此图片：' + file);
  if (['.png', '.jpg', '.jpeg'].includes(ext) && bytes.length > 512 * 1024) {
    const img = sharp(bytes);
    const {width, height, pages} = await img.metadata();
    if (Math.max(width, height) >= 3840 && !(pages > 1)) {
      const webp = await img.autoOrient().webp({lossless: ext === '.png', quality: 92}).toBuffer();
      if (webp.length < bytes.length) return dataURI('image/webp', webp);
    }
  }
  return dataURI(mime[ext], bytes);
}

async function bundle(input, output) {
  const dir = await realpath(input);
  const entry = join(dir, 'index.html');
  if (existsSync(output) && await realpath(output) === await realpath(entry)) {
    throw new Error('请把成品写到源 index.html 以外的位置。');
  }
  const $ = load(await readFile(entry, 'utf8'));
  if ($('base[href], iframe[src], object[data], embed[src], [srcset]').length) {
    throw new Error('请使用相对路径、独立图片文件和 <img src>，再打包此课件。');
  }
  const images = new Map();
  const fontFiles = [];
  // 除页文与备注，还收集页脚、图片说明、CSS 生成内容和脚本生成的文字。
  const chars = new Set('步骤　–' + Array.from({length: 95}, (_, i) => String.fromCharCode(32 + i)).join(''));
  const collect = text => { for (const c of text) chars.add(c); };
  collect($('body').text());
  $('[alt], [data-short-title], [aria-label]').each((_, el) => {
    for (const attr of ['alt', 'data-short-title', 'aria-label']) collect($(el).attr(attr) || '');
  });

  async function image(ref, base) {
    if (/^(data:|#)/i.test(ref)) return ref;
    const file = localFile(ref, base);
    if (!images.has(file)) images.set(file, imageURI(file));
    const hash = new URL(ref, pathToFileURL(base + '/')).hash;
    return (await images.get(file)) + hash;
  }

  // CSS 可写 WOFF2、OTF/TTF 和 local() 等候选项，成品只留一份内嵌字体。
  function prepareCSS(css, base) {
    const root = postcss.parse(css);
    root.walkDecls('content', decl => {
      collect(decl.value.replace(/\\([0-9a-f]{1,6})\s?/gi, (_, n) =>
        String.fromCodePoint(Math.min(parseInt(n, 16), 0x10ffff))));
    });
    root.walkAtRules('font-face', face => face.walkDecls('src', decl => {
      const urls = valueParser(decl.value).nodes.filter(n => n.type === 'function' && n.value === 'url')
        .map(n => n.nodes[0].value);
      const paths = urls.map(u => u.startsWith('data:') ? u : localFile(u, base));
      const shared = process.env.OCHRELUNE_FONTS;
      const candidates = [...paths, ...(shared ? paths.filter(p => !p.startsWith('data:')).map(p => join(shared, basename(p))) : [])];
      // 改文案后，原字库可以补回旧 WOFF2 中没有的字。
      const file = candidates.find(p => !p.startsWith('data:') && /\.(otf|ttf)$/i.test(p) && existsSync(p))
        || candidates.find(p => /^data:[^,]*;base64,/i.test(p) || existsSync(p));
      if (!file) throw new Error('未找到字体，请提供 fonts/ 字库或设置 OCHRELUNE_FONTS：' + decl.value);
      if (!fontFiles.includes(file)) fontFiles.push(file);
      decl.value = 'url("data:font/woff2,ochrelune-' + fontFiles.indexOf(file) + '") format("woff2")';
    }));
    return root.toString();
  }

  async function stylesheet(css, base) {
    const result = await build({
      stdin: {contents: prepareCSS(css, base), resolveDir: base, loader: 'css'},
      bundle: true, write: false, logLevel: 'silent', charset: 'utf8',
      plugins: [{name: 'deck-assets', setup(b) {
        b.onResolve({filter: /.*/}, async args => {
          if (args.kind === 'url-token') return {path: await image(args.path, args.resolveDir), external: true};
          return {path: localFile(args.path, args.resolveDir)};
        });
        b.onLoad({filter: /\.css$/i}, async ({path}) => ({
          contents: prepareCSS(await readFile(path, 'utf8'), dirname(path)), loader: 'css', resolveDir: dirname(path),
        }));
      }}],
    });
    return result.outputFiles[0].text;
  }

  for (const el of $('link, style').toArray()) {
    const tag = $(el);
    if (el.name === 'style') tag.text(await stylesheet(tag.text(), dir));
    else if (tag.attr('rel') === 'stylesheet') {
      const file = localFile(tag.attr('href'), dir);
      const style = $('<style></style>').text(await stylesheet(await readFile(file, 'utf8'), dirname(file)));
      if (tag.attr('media')) style.attr('media', tag.attr('media'));
      tag.replaceWith(style);
    } else if (tag.attr('rel') === 'icon') tag.attr('href', await image(tag.attr('href'), dir));
    else throw new Error('请移除或内联此 link：' + tag.toString());
  }
  for (const el of $('[style]').toArray()) {
    const tag = $(el), style = tag.attr('style');
    if (/url\(/i.test(style)) {
      const css = await stylesheet('x{' + style + '}', dir);
      postcss.parse(css).walkRules(rule => tag.attr('style', rule.nodes.map(n => n.toString()).join(';')));
    }
  }
  for (const el of $('img[src], image, use').toArray()) {
    const tag = $(el);
    for (const attr of ['src', 'href', 'xlink:href']) {
      const ref = tag.attr(attr);
      if (!ref) continue;
      if (el.name === 'use' && !ref.startsWith('#')) throw new Error('请将 SVG symbol 放进页面，并用 #id 引用：' + ref);
      tag.attr(attr, await image(ref, dir));
    }
  }
  for (const el of $('script').toArray()) {
    const tag = $(el), src = tag.attr('src');
    const file = src ? localFile(src, dir) : entry;
    let js = src ? await readFile(file, 'utf8') : tag.text();
    if (tag.attr('type') === 'module') {
      const result = await build({stdin: {contents: js, resolveDir: dirname(file)}, bundle: true,
        format: 'esm', platform: 'browser', write: false, charset: 'utf8', logLevel: 'silent',
        plugins: [{name: 'local-modules', setup(b) {
          b.onResolve({filter: /^(https?:|\/\/)/}, ({path}) => { throw new Error('请使用本地模块：' + path); });
        }}]});
      js = result.outputFiles[0].text;
    } else if (src && tag.is('[defer]')) {
      $('body').append(tag);
    }
    collect(js);
    tag.removeAttr('src').removeAttr('defer').text(js.replace(/<\/script/gi, '<\\/script'));
  }
  if ($('[src]').toArray().some(el => !/^data:/i.test($(el).attr('src')))) {
    throw new Error('仍有未内联的 src 资源。');
  }

  const text = [...chars].join('');
  const uris = [];
  for (const file of fontFiles) {
    const bytes = file.startsWith('data:') ? Buffer.from(file.slice(file.indexOf(',') + 1), 'base64') : await readFile(file);
    const subset = await subsetFont(bytes, text, {targetFormat: 'woff2', preserveNameIds: [0, 7, 8, 9, 10, 11, 12, 13, 14]});
    uris.push(dataURI('font/woff2', subset));
  }
  $('style').each((_, el) => $(el).text($(el).text().replace(/data:font\/woff2,ochrelune-(\d+)/g, (_, i) => uris[i])));
  const html = $.html();
  await mkdir(dirname(output), {recursive: true});
  const staging = await mkdtemp(join(dirname(output), '.bundle-'));
  try {
    await writeFile(join(staging, 'index.html'), html);
    await rename(join(staging, 'index.html'), output);
  } finally { await rm(staging, {recursive: true, force: true}); }
  console.log(output + ' · ' + $('.slide').length + ' 页 · ' + Buffer.byteLength(html) + ' 字节');
}

if (process.argv.length !== 4) {
  console.error('用法：node bundle.mjs my-deck 输出.html');
  process.exitCode = 2;
} else {
  try { await bundle(process.argv[2], resolve(process.argv[3])); }
  catch (err) { console.error(err.message); process.exitCode = 1; }
}
