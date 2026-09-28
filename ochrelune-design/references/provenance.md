# 来源、裁剪与案例证据

整理日期：2026-09-28。此包是独立整理的工作规范与新编写的 CSS 起点，不是 Anthropic 官方发布的设计系统，也不包含其商标、专有字体、图像或完整第三方代码。

## 1. 三个主要来源

### Duply-AI：审美骨架

来源：[design-md / Anthropic DESIGN.md](https://github.com/Duply-AI/design-md/blob/main/designs/anthropic/DESIGN.md)。本次基于 2026-09-28 已保存在本地的研究快照，不保证上游当前文件保持不变。

社区文档从 Anthropic 的营销页面分析暖纸面、墨色、陶土强调、衬线与无衬线分工及空间层次。本规范吸收这些角色关系；没有将该文中的 96px 展示标题、24px 正文和采样间距直接规定为应用界面的默认值。

### ndroussi：应用组件覆盖

来源：[design-md-for-ai / Anthropic DESIGN.md](https://github.com/ndroussi/design-md-for-ai/blob/main/design-md/anthropic/DESIGN.md)。同样基于 2026-09-28 本地快照。

参考价值在于把风格延伸到输入、按钮、侧栏、聊天、对话框、主题和状态。社区整理未逐项与实时官网核对。本规范重新统一 token、缩小默认圆角与装饰强度，不搬用 Claude 身份文案、专用品牌行为要求、弹窗 blur 或彩色粗侧边条。

### Impeccable：一致性与打磨

来源：[pbakaus/impeccable](https://github.com/pbakaus/impeccable)，本地检查提交 `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`。

重点参考固定版本的：

- [operate.md](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/operate.md)：工具界面的任务导向、统一控件、状态和短反馈。
- [quieter.md](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/quieter.md)：降低装饰强度同时保留层级。
- [craft-floor.md](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/craft-floor.md)：对比、内容、间距、控件状态及渲染检查。

本 Skill 采用方法，不把完整 Impeccable 工作流作为运行依赖。其默认审美和部分细则并不总与这里一致，例如某些圆角范围、品牌字体要求或标题标签限制；这里按页面用途、保真边界与用户选择统一裁剪。

## 2. 这份规范自己的决定

下列属于本规范的综合设计，不声称是三个来源的共同原文要求：

- 使用 Ochrelune Design 作为跨品牌名称，分操作、阅读、展示与混合模式。
- 以炭黑主操作、深陶土链接、暖灰表面构成默认角色。
- 将内容分隔线和必要控件边界分成不同 token。
- 用更深的通用图表色板替代案例里部分过浅的曲线颜色。
- 将保真换肤作为独立任务模式，明确数据与呈现边界。
- 提供作用域化 `.ochrelune-root` 的 CSS 起点，不侵入整个宿主项目。
- 用独立语义变量支持深色起点，但不宣称所有组件已完成生产级深色验证。

这些选择可因具体产品调整，调整应保留角色一致性和清楚的使用理由。

## 3. 本地研究与已完成案例

原研究记录在工作区 `Resources/Skills/claude-style-research/`，Impeccable 在 `Resources/Skills/impeccable/`。它们用于来源核验，不是本包使用依赖；迁移本 Skill 不需要带走这些目录。

### 初版概念预览

工作区 `Playground/factor-research-claude/` 用于探索暖白、炭黑和陶土的视觉方向，但对布局和内容做过重新组织，不能作为“只改控件、不改内容”的基准。

### Alpha117 保真样式预览

工作区 `Playground/alpha117-style-preview/`，源页面为本地报告路径 `/runs/alpha117-cash-reinvest-a5ce43a7b4e8`。它是本规范的具体应用案例，不是通用产品结构。

已记录的验证结果：

- 2,983 个原始非脚本／样式文本节点一致。
- 12 张图表的原始配置及数据一致；主题在副本上覆盖。
- 4 张表格、23 个章节标题一致。
- 原始页面 SHA-256：`0cadacf625e88e22185bd0e945331b8011d56779244c35a134e6e60f3bfb99e1`。
- 初始渲染 9 张图，展开补充结果后 12 张；测试过桌面、390px 窄屏、锚点与离线链接提示。
- 资源和六个下载文件本地化；预览设置 `connect-src 'none'`，未打包的业务页面链接拦截为预览提示。

这些结果证明该案例的特定内容保真与所测路径，不证明本包在所有浏览器、所有组件和所有无障碍场景均合格。原下载报告保留原样式，且与预览页面的运行隔离范围不同。

用户对案例的肯定表明本方向满足本次审美目标；不能外推为所有用户、领域或设备的统一偏好。

## 4. 标准参考

正文的对比度和目标尺寸说明参考 W3C 的 WCAG 2.2 Understanding 页面：

- [Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

这些是具体条款的解释资料，不是对本包的认证。配色计算应检查实际页面组合，功能与辅助技术表现需在成品中验证。

## 5. 使用与分发

本包不随附第三方原文全文、专有字体或品牌图像。若另行复制上游代码、字体或图片，使用者应按各自许可证和授权处理；这份来源说明不替代那些许可。名称中的 Claude / Anthropic 仅说明灵感来源，不表示关联或背书。
