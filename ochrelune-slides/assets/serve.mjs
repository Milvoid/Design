// 本地放映服务器。浏览器不允许 file:// 页面加载字体文件，所以演示要通过 http 打开。
// 用法：node serve.mjs <deck 目录> [端口=8765]，然后浏览器打开显示的地址并按 F 全屏。
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';

const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json',
  '.woff2': 'font/woff2', '.otf': 'font/otf', '.ttf': 'font/ttf', '.pdf': 'application/pdf'};

export function serve(dir, port = 0) {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = resolve(root, '.' + path);
      if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, {'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache'}).end(body);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise(done => server.listen(port, '127.0.0.1', () =>
    done({url: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise(r => server.close(r))})));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const {url} = await serve(process.argv[2] || '.', Number(process.argv[3] || 8765));
  console.log('放映地址：' + url + '  （Ctrl+C 结束）');
}
