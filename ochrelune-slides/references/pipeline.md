# HTML 工程、放映与导出

## 结构

```
my-deck/
  index.html     每页一个 <section class="slide ...">，讲稿写在页内 <aside class="notes">
  deck.css       色板、字体角色、网格、版式库、分步与打印样式（来自 assets/deck/）
  deck.js        缩放、翻页、分步、描边生长、跨页平滑移动、讲者备注、总览
  fonts.css      三个字体角色的 @font-face
  fonts/         title / body / number 三个角色的原字库，或已覆盖本篇文字的 WOFF2
  img/           截图（2x）、插画 SVG、预渲染的笔触 PNG
```

从 [assets/deck/](../assets/deck/) 复制起步。`index.html` 里的 9 页示例分别演示封面、标题写结论加分步要点、大数字、章节页、流程图（节点逐个画出）、截图标注加流程条（与上一页平滑衔接）、直标图表、并列三栏、结尾。

## 写一页

```html
<section class="slide">
  <h1>标题写结论（80 px，一行 ≤ 20 字）</h1>
  <p class="lede">一行口径或补充</p>
  <div class="body">
    <div class="split">
      <ul><li data-step="1">第一条</li><li data-step="2">第二条 <mark>关键词</mark></li></ul>
      <svg class="art draw" viewBox="…"><path class="ink" d="…"/><path class="fill" d="…" fill="#788C5D"/></svg>
    </div>
  </div>
  <aside class="notes">讲稿：先说……，再指向……，过渡到下一页。</aside>
</section>
```

- 版式类：`layout-cover`、`layout-section`、`layout-closing` 写在 section 上；内容页在 `.body` 里用 `split`、`split reverse`、`columns`（`--n` 设列数）、`figures`、`flow`、`shot`。
- 分步：`data-step="n"`；描边生长：`svg.art.draw`，墨线用 `.ink`，色块用 `.fill`；跨页平滑移动：两页上同一事物写相同的 `data-morph`。
- 页脚自动生成（`<body data-short-title="…">` 设短题名），封面、章节、结尾不显示。
- 流程条：`<div class="progress">`，当前步骤加 `class="on"`。

## 打包（制作机）

在 [assets/](../assets/) 目录下运行以下命令。首次配置时安装 Node 依赖，字体子集由 HarfBuzz 生成。

```bash
npm install
node bundle.mjs my-deck 交付/index.html
```

通用用法为 `node bundle.mjs my-deck 输出.html`。路径相对于当前工作目录，成品与源 `my-deck/index.html` 分开存放。脚本内联样式、放映脚本、本地模块和图片，把全篇文字、备注、页脚与步骤提示用到的字符打进 WOFF2，再通过 data URI 嵌入字体。改文案后重新打包。

- 按 `fonts.css` 的文件名将字库放入 `my-deck/fonts/`。仓库样例只带字体声明，可以用 `OCHRELUNE_FONTS=/path/to/fonts node bundle.mjs deck 示例.html` 指向制作机上的三个原字库（`ChillJinshuSongMedium.otf`、`LXGWNeoXiHei.ttf`、`SourceSerif4.ttf`）。复用旧 WOFF2 前确认它覆盖新文案，新增汉字时优先用原字库重新生成。
- 图片用 `<img src="…">` 或 CSS 的 `url(…)` 引用本地文件。需逐笔绘制的 SVG 保留在 HTML 中。放映脚本从页内读取数据，把运行时请求的内容在制作阶段写入课件。
- 体积可参考两份实包：9 页样例约 0.44 MiB；17 页课程 Pre 含一张 3840×2160 总结图，约 1.69 MiB。长边至少 3840 像素且超过 512 KiB 的 PNG/JPEG 会尝试转为同分辨率 WebP，PNG 用无损压缩，仅在体积更小时采用。PDF 从原工程导出，使用原图。

## 教室放映与交付

交付 **单个 HTML 文件（双击即可放映）+ PDF**。把两份文件复制到教室电脑，双击 `index.html`，浏览器打开后按 F 全屏。PDF 用于分发和现场备用。

→ / 空格 / PageDown / Enter 前进一步，← / PageUp 退一步，Home / End 跳到首尾页。N 开关讲者备注，O 打开总览，点击缩略图跳页，F 开关全屏。翻页笔可直接发送 PageDown / PageUp；地址栏 `#/页码` 可定位到指定页。

## 导出

```bash
node export.mjs my-deck [输出目录]
# 没有 Playwright 自带的 Chromium 时：
BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node export.mjs my-deck
```

输出：

- `my-deck.pdf`：每页 1920×1080，全部步骤显示后的最终状态，字体嵌入，用来分发和备份放映。
- `pages/NN.png`：逐页原尺寸图。
- `overview.png`：4 列缩略图总览，用于缩小测试。
- `overview-projector.png`：降低对比度和饱和度的投影模拟，用来检查浅色信息还看不看得见。

导出时会检查三个字体角色是否真的加载，没加载会提示（PDF 会退回系统字体）。

## 插画与笔触

- 插画 SVG 直接放进页面（便于描边生长），或从配套视频工程复用同一份源文件。
- 笔触（封面、章节页、结尾）用 ochrelune-video 的笔毛印模渲染成透明 PNG 放进 `img/`；只在放映时需要动态画出时才引入 p5 和 p5.brush。

## 开发预览

在制作机上可用 `node serve.mjs my-deck` 预览多文件源工程。PDF 导出工具使用同一内部服务器并通过 Playwright 渲染。
