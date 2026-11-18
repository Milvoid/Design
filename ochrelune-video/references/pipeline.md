# 工程与渲染

## 架构：Remotion 外壳 + iframe 舞台

Remotion 只负责逐帧调度和编码，画面由一个普通网页“舞台”按帧号画出来。这样 SVG 插画、Canvas 笔触、p5.brush 和 Web 字体都在浏览器里原样运行，Remotion 组件本身很薄。

```
render.mjs ──bundle──> Remotion Composition (1920×1080, 30 fps)
                         └─ <iframe src=stage.html>   每帧 postMessage {frame, token}
stage.html / stage.mjs
  #base   SVG：当前镜头（插画、文字、界面）
  #cover  SVG：上一镜的最后一帧，用于交叉淡化
  #effect Canvas：笔触层（加载、转场、片尾）
  回 postMessage {type:'presented'} 后 Remotion 才截这一帧
```

参考实现见 [assets/remotion-host.tsx](../assets/remotion-host.tsx)。要点：

- 每帧 `delayRender`，向 iframe 发 `{type, frame, token}`，收到同一 token 的 `presented` 才 `continueRender`；舞台出错时回 `error`，外壳 `cancelRender`。校验消息来源的 origin 和 window。
- 舞台在 `ready` Promise 里一次性准备好：取景 JSON 和截图、所有字体（`document.fonts.load` 每个角色 + `document.fonts.ready`）、笔触印模。之后 `draw(frame)` 纯函数式地按帧号画，同样的 markup 不重复写 DOM。
- 本地起一个只读静态服务器给舞台（只允许项目媒体目录、白名单 MIME），渲染完关闭。
- 渲染参数：`codec:'h264'`、`pixelFormat:'yuv420p'`、`crf:16`、`imageFormat:'png'`、`muted:true`（声音另混）、`chromiumOptions:{gl:'swangle'}`（WebGL 软渲染，p5.brush 可用）、`concurrency` 4 左右。

## 时间线

- 一个 `timing.mjs` 导出 `fps`、`cuts`（每镜起始帧，最后一项是总帧数）和片尾的定格、淡出帧数。分镜表、逐秒总览、混音的点击音时间都从它读。
- `draw(frame)` 里用 `cuts.findIndex(c => c > frame)` 找到镜号 `n` 和镜内帧 `f`，每个镜头是 `shot(n, f)` 返回 SVG 字符串的函数。

## 插画的“画出来”

- 插画是审过的静态 SVG。编译一次：遍历元素，记录每个元素的顺序、颜色、是否描边；按帧返回带 `pathLength="1" stroke-dasharray="1.002 2" stroke-dashoffset="1-q"`（描边）和 `fill-opacity="q"`（填色）的版本。
- 每个元素的开始帧和时长由一个调度函数决定（如陶土色元素最后画、前几条轮廓先画），这样同一张静帧可以有不同的画法。

## 录屏与取景

1. 原型换浅色主题后，用 Playwright 以 2x 截图关键页面（清单、详情、建议、确认弹窗等），同时用 `getBoundingClientRect` 记录关键元素的包围盒，写进 `取景.json`（截图宽高 + 各元素 `[x, y, w, h]`）。
2. 每个界面镜头定义：截图、标题、裁切框 `crop`、起始取景 `initial [x, y, w]`、最终取景 `final [x, y, w]`、聚焦框 `bounds`。镜头推近就是在 `initial` 和 `final` 之间插值。
3. 原型数据用合成样例，画面上标明“合成”。

## 字体子集

- 三个角色各出一份 WOFF2：title、body、number。用 fontTools 按“角色字符清单”（所有镜头文案按角色汇总的 UTF-8 字符集）子集化；可变字体先实例化到 wght 500 / opsz 48；保留 name 表里的版权和授权信息。参考 [assets/font-subset.py](../assets/font-subset.py)。
- CSS 里用 `@font-face` 绑定 `--title-font / --body-font / --number-font`，换字体只改这一处。
- 改文案后重跑子集化，并让舞台记录每镜实际用字，比对缺字。

## 配乐与混音

- 选曲：温暖的钢琴、木吉他或弦乐，节奏舒缓，CC BY 等可署名授权。交我创用的是 Chris Zabriskie《Preludes》（CC BY 4.0），三支片各用一首。来源、起止点和署名写进授权记录，片尾署名。
- 音效最多两三处（点击音音量约 0.16），不要旁白和字幕。
- 用 ffmpeg 把无声画面和音乐合成：`atrim` 截取段落 → 需要延长结尾时，把末乐句拆出来用 `atempo`（保持音高）放慢，再 `acrossfade=d=0.04` 接回 → `apad` + `atrim` 对齐总时长 → `afade` 开头 0.08 秒淡入、和画面同步 0.8 秒淡出 → `amix`（`normalize=0`）混入点击音。输出 AAC 256k、48 kHz、立体声，`-movflags +faststart`，视频流直接 copy。
- 交付前确认音画同长、完整解码。

## 目录约定

```
Media/video/
  src/                共用的主题、字体绑定
  0X/review/v2/       第一阶段分镜与样张
  0X/review/anim-720/ 动画小样（source/ 里是 stage、timing、render、overviews）
  0X/review/final-1080/rN/ 成片与本轮改动镜头的逐秒总览
  review/rN/index.html 每轮三片合一的审阅页
  audio/              配乐与音效
Media/brand/授权.md   所有素材来源
```

每轮改动放进新的 `rN/` 目录，旧版本保留，方便对照和回退。
