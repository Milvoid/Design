---
name: ochrelune-pdf
description: 用 XeLaTeX 排暖白纸面、宋体标题、陶土强调的 A4 PDF 总览和简报（委托进展 Overview、事项待办、答辩或作业要求整理、决策材料），给 Milvoid 本人阅读，用 iMessage 发送。与 ochrelune-design 共用色板字体，与 ochrelune-video、ochrelune-slides 同一套视觉语言。做给她看的 PDF 默认用这个；需要可编辑 Word 或对外正式公文时不用。
---

# Ochrelune PDF · 纸面简报

给 Milvoid 看的 PDF 是一份能在手机上快速读完、知道“现在到哪一步、我要做什么、你建议什么”的简报。版式来自 2026-11-18 午间那份 9 页《委托与待办总览》（她明确表示满意），视觉规范见 [ochrelune-design](../ochrelune-design/SKILL.md) §4–§5。

## 版式要点

- **纸面与颜色**：象牙白 `#FAF9F5` 纸面，墨色 `#141413` 文字，次级文字 `#5E5D59`，陶土 `#D97757` 只做编号、项目符号、竖线和链接这类少量强调；燕麦色 `#F0EEE6` 做待办卡片底。
- **字体**：标题寒蝉锦书宋 Pro Medium，大数字和章节编号 Source Serif 4，正文（中文、西文、数字）霞鹜新晰黑 Regular，代码路径用 Menlo。
- **封面**：小号眉题（只写主题，如 `毕设 · 开题答辩`）→ 两行宋体大标题 → 一句话现状 → 细线 → 一行最多四个大数字（倒计时、关键数量）→ 细线 → 首屏待办表。她只看第一页也要知道该做什么。
- **组件**：`todo` 卡片放需要她本人动手或拍板的事；`advice` 框放我的建议；表格只用三线（booktabs），表头用小号灰字；页脚左侧写 `主题 · 日期`，右侧页码。
- **署名**：全文只署一次，放在封面标题下的日期行或文末，例如 `from Fennelia · 2026-11-19`。眉题、页眉、页脚都不写 Fennelia（2026-11-19 Milvoid 明确要求：每页都标名字读起来别扭）。不写“中台”。

## 写法

- 先给结论和她要做的事，再给依据和细节；每段用完整的大白话，动宾清楚。
- 日期写成 `11-24 周二 12:30` 这种能直接对日历的格式；倒计时按当天日期算。
- 每件事写清“谁来做”：她、我、还是某个 Codex 会话。
- 建议要具体到做法和时间（“我派 Codex 做初稿，11-20 前给你”），不罗列选项。
- 文件位置给机器和完整路径；外部链接用 `\href`。
- 不写免责铺垫、不复述来源检索过程；出处细节留在原 Markdown，PDF 里给一个指向它的路径。

## 制作流程

1. 新建工作目录（Studio 上放 `~/Personal/Work/<主题>/`），复制 [assets/ochrelune-pdf.tex](assets/ochrelune-pdf.tex) 和 [assets/example.tex](assets/example.tex)，准备 `fonts/`：已有字体就软链或复制（Studio：`~/Personal/Work/overview-1118/fonts/`），没有就运行 [assets/fetch-fonts.sh](assets/fetch-fonts.sh)。
2. 在主文件开头定义 `\ochretitle` 和 `\ochrefooter`，`\input{ochrelune-pdf.tex}`，按“封面 → 待办卡片 → 分节正文 → 建议框”写内容。
3. `xelatex -interaction=nonstopmode main.tex` 跑两遍（目录和超链接要第二遍），检查日志里没有 `Missing character`。
4. 审图：`swift assets/raster.swift main.pdf png 1.3` 出每页 PNG，`swift assets/sheet.swift`（在含 `png/` 的目录运行）出总览拼图，用 Read 看图。
5. 按下面的清单改，直到通过；然后复制到 `~/Personal/Attachment/` 用 `imsg send` 发出。

## 审图清单

- 没有大半页空白：不要用 `\newpage` 硬切到只剩几行的页面，节标题前用 `\Needspace{14\baselineskip}` 防止标题落在页底。
- 封面一屏内有大数字和待办表；表格行不被拆到两页。
- 数字和中文之间有正常间距，标点前没有空格；`—` 等符号在大数字字体里能正常显示。
- 陶土色只出现在强调位置，没有整块陶土底；没有深色或冷色面板。
- 页数跟内容走：单件事 3–5 页，多件事总览 8–10 页。

## 调用示例

- “使用 $ochrelune-pdf 把毕设开题答辩要做的事整理成一份 Overview 发我。”
- “使用 $ochrelune-pdf 做今天所有委托的总览，每件事写清进展、我要做什么、你的建议。”
