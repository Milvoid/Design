---
name: ochrelune-slides
description: 用 HTML 制作暖白纸面、宋体标题、线描插画的演示文稿（课程 Pre、答辩、项目路演、比赛 pitch book），可现场放映（键盘或翻页笔逐步呈现）并导出嵌字体的 PDF。重排版和页内信息组织，动画克制、由讲者触发；与 ochrelune-design 共用色板字体，与 ochrelune-video 共用插画与叙事。用户选择这个方向时使用，不要覆盖用户明确指定的其他品牌风格，需要可编辑 PPTX 时不要用。
---

# Ochrelune Slides · 纸面演示

演示文稿是讲者的辅助工具，不是展示设计的舞台。这个 skill 把 Milvoid 的 Slides 制作理念（《一份详细的 Pre 用 PPT 制作指南》，见 [references/provenance.md](references/provenance.md)）和 ochrelune 的视觉语言合在一起：暖白纸面、墨色文字、陶土色只做少量强调、线描插画可以随讲解“画出来”。输出是单个 HTML 文件（双击即可放映）和一份 PDF（分发与备用）。

视觉基础读 [ochrelune-design](../ochrelune-design/SKILL.md) §4–§5；插画和叙事的做法见 [ochrelune-video](../ochrelune-video/SKILL.md)。本 skill 只写 slides 和它们不同的部分。

## 三条核心原则

1. **以观众为中心**：按教室后排、对比度很差的投影仪、没兴趣读长文的观众来设计。
2. **一致性**：同一套网格、字号、颜色、图标、动画贯穿全篇，观众不需要每页重新适应。
3. **注意力导向**：每页只有一个最重要的东西；不能帮助它被看见的背景、线条、动画都是噪声。

## 和视频的区别

| | 视频 | Slides |
|---|---|---|
| 节奏 | 由时间轴和音乐控制 | 由讲者点击控制，观众可以停下来读 |
| 信息量 | 一镜一句，≤ 12 字标题 + 一行说明 | 一页是一个完整的论证单元：结论标题 + 1–3 个小主题块，正文约 120–260 字，单看这一页就能读懂 |
| 字号（1920×1080） | 说明 ≥ 28 px | 正文 40 px（20 pt），底线 36 px（18 pt）；注释 32 px，底线 28 px |
| 动画 | 全程有，按帧号 | 只用于分步呈现、引导视线、表现过程，点击触发 |
| 笔触层 | 加载、转场、片尾 | 只在封面、章节页、结尾页 |

## 核心规则

1. **标题写结论**：每页标题直接说出这页要点（“申请多、用得少的作业占了 1,435 核时”），不写“背景介绍”“实验结果”。
2. **一页是一个完整的论证单元**：结论标题 + 副标题 + 1–3 个小主题块（一段完整的解释，或“引导词：解释句”式的要点），内容铺满版心，不让右边空着。只剩关键词的页面讲完什么也留不下；超过约 300 字就拆页，不缩小字号。
3. **固定网格与少量版式**：12 列网格、统一安全边距；全篇只用版式库里的 5–7 种，标题区、页码、页脚位置固定。
4. **字号守底线**：见 [references/typography-color.md](references/typography-color.md)；正文默认 40 px（20 pt），底线 36 px，行高 1.5，段距 0.5 行。
5. **强调用高亮文本，不用加粗**：引导词和关键结论用深陶土色，同类信息全篇同一种强调方式。
6. **60-30-10 用色**：纸面 60%、墨色与次级文字 30%、陶土 10%；投影时浅色不承担信息。
7. **图必须有信息**：插画和图标都按 ochrelune 插画设计语言现画（[illustration.md](../ochrelune-video/references/illustration.md)），不用网上的线性图标；截图裁剪后加圆角和柔和阴影并标注；图表直接标注数据，不用图例。
8. **动画由讲者触发**：分步呈现、插画描边生长、同一元素跨页平滑移动；不自动播放，不用飞入、弹跳、旋转。
9. **单页可读、缩小可辨**：不听讲解单看一页能读懂；整套缩成缩略图后结构仍然清楚。
10. **能画成图就画成图**：资金流、时间轴、瀑布图、分界图、决策树代替文字块，细节放讲稿（[imagery.md](references/imagery.md)）。
11. **文字连贯、讲人话**：每页承接上一页，术语和符号第一次出现时讲清；学术汇报要有公式和方法细节（[narrative.md](references/narrative.md)）。
12. **结尾**：讨论问题在前，Apple Event 风格总结页永远是最后一页（[summary-page.md](references/summary-page.md)）。

## 按需读取

- **定结构和标题**：[references/narrative.md](references/narrative.md)
- **排版与信息量**：[references/layout.md](references/layout.md)
- **字体、字号、颜色、强调**：[references/typography-color.md](references/typography-color.md)
- **插画、截图、图表、图标**：[references/imagery.md](references/imagery.md)
- **分步与转场动画**：[references/motion.md](references/motion.md)
- **HTML 工程、放映、导出 PDF**：[references/pipeline.md](references/pipeline.md)
- **审阅与检查清单**：[references/review.md](references/review.md)
- **Apple Event 风格总结页**：[references/summary-page.md](references/summary-page.md)

## 制作流程

1. **提纲**：按 narrative.md 选结构，先写“标题即结论”的页标题列表，每页注明版式和要放的证据。标题连起来读应该就是整场演讲的摘要。
2. **样张**：从 [assets/deck/](assets/deck/) 模板起步，做封面、一张内容页、一张数据页、一张截图页、章节页，导出缩略图总览交审，确认网格和字号。
3. **全篇**：按提纲逐页做，同类页面复用同一版式。讲稿写进每页的 `<aside class="notes">`。
4. **动画**：只给需要分步讲的页面加 `data-step`，插画用描边生长，章节页加笔触。
5. **导出与检查**：`node export.mjs` 导出 PDF 和缩略图总览，按 review.md 的清单逐项过，再做投影模拟和缩小测试。
6. **交付**：在制作机上用 `node bundle.mjs my-deck 交付/index.html` 打包。交付单个 HTML 文件（教室电脑双击即可放映）+ PDF。

## 调用示例

- “使用 $ochrelune-slides 给开题报告做一份 8 分钟的匿名答辩 PPT，先交提纲和五张样张。”
- “使用 $ochrelune-slides 把这份设计书改成 10 页 pitch book，复用视频里的插画。”
- “使用 $ochrelune-slides 按检查清单审这套 slides，逐页给修改意见。”
