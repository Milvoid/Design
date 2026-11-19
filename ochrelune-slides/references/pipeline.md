# HTML 工程、放映与导出

## 结构

```
my-deck/
  index.html     每页一个 <section class="slide ...">，讲稿写在页内 <aside class="notes">
  deck.css       色板、字体角色、网格、版式库、分步与打印样式（来自 assets/deck/）
  deck.js        缩放、翻页、分步、描边生长、跨页平滑移动、讲者备注、总览
  fonts.css      三个字体角色的 @font-face
  fonts/         title / body / number 三个字体文件（建议子集化成 woff2）
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

## 放映

浏览器出于安全限制不允许 `file://` 页面加载字体文件，所以要用本地服务器打开：

```bash
node serve.mjs my-deck        # 打印放映地址，浏览器打开后按 F 全屏
```

键位：→ / 空格 / PageDown / Enter 下一步，← / PageUp 上一步，Home / End 首尾页，N 讲者备注，O 缩略图总览（点击跳页），F 全屏。翻页笔发送的是 PageDown / PageUp，可以直接用。地址栏 `#/页码` 记住位置。

建议用自己的电脑接投影放映，提前在投影上走一遍，确认字体、分步和平滑移动都正常。

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

## 字体

- 字体文件放进 `fonts/`。正式交付前用 ochrelune-video 的 `font-subset.py` 按全篇用字子集化为 `title.woff2`、`body.woff2`、`number.woff2`，体积从几十 MB 降到几百 KB；改文案后重跑并检查缺字。
- 没有 woff2 时 `fonts.css` 会依次尝试原始的 otf / ttf，再退回系统字体。

## 插画与笔触

- 插画 SVG 直接放进页面（便于描边生长），或从配套视频工程复用同一份源文件。
- 笔触（封面、章节页、结尾）用 ochrelune-video 的笔毛印模渲染成透明 PNG 放进 `img/`；只在放映时需要动态画出时才引入 p5 和 p5.brush。

## 依赖

只用浏览器原生能力（CSS、ES Module、View Transitions API）。导出需要 Node 和 Playwright。不引入框架、CDN 或在线字体，整个文件夹可以离线拷走放映。
