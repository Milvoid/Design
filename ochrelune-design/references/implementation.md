# 工程适配与保真实现

按需阅读：共享样式映射、基础控件用法、既有页面换肤、静态预览、图表、主题和打印。这里的方法不要求使用特定框架或增加后端。

## 1. 与现有项目结合

先找现有主题变量、基础按钮／字段／表格组件、页面容器与图表入口。将 `assets/tokens.css` 的角色映射进去：页面底色 → canvas，内容表面 → surface，文字 → text，主要操作 → action，焦点 → focus。现有变量名无需改成 `--ochrelune-*`。

- **已有组件库**：通过主题 API 或共享组件包装层调整；避免逐页深层选择器覆盖。
- **实用类 CSS**：把语义变量接入颜色与尺度配置，保留框架现有版本及构建方式。
- **服务端模板／静态 HTML**：统一加载主题文件，用显式组件类和局部容器。
- **大型已有系统**：先在授权页面或 `.ochrelune-root` 作用域内采用，不对整个站点突然重置。

不要复制每个示例色值到所有组件。样式存在多次 `!important`、深层后代选择器或依赖按钮位置时，优先修正共享入口。小范围兼容旧页面的覆盖可以暂时存在，但应说明原因。

## 2. 使用配套 CSS

`tokens.css` 只提供 `.ochrelune-root` 范围的变量；`primitives.css` 是可选基础样式，不包含路由、状态管理、图标或图表库。按页面实际需要取用，功能行为由应用实现。

```html
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./primitives.css">
<main class="ochrelune-root">
  <div class="ochrelune-shell">
    <h1 class="ochrelune-title ochrelune-title--editorial">项目设置</h1>
    <form class="ochrelune-field">
      <label class="ochrelune-label" for="project-name">项目名称</label>
      <input class="ochrelune-input" id="project-name" name="projectName"
             aria-describedby="project-name-help" value="研究资料">
      <p class="ochrelune-help" id="project-name-help">用于目录和搜索结果。</p>
      <div class="ochrelune-toolbar">
        <button class="ochrelune-button ochrelune-button--primary" type="submit">保存名称</button>
      </div>
    </form>
  </div>
</main>
```

以上只演示语义与视觉，不能把示例表单当成已接通保存功能的成品。真实任务需实现保存，静态演示则提供本地反馈并明确模拟。

将 `.ochrelune-root` 放在 body 可覆盖整页；放在局部容器只覆盖该区域。Portal／浮层若挂到 body，而主题只在局部根节点，必须把主题变量也传给浮层根节点。深色属性 `data-ochrelune-theme="dark"` 与 `.ochrelune-root` 放在同一节点；代码不自动切换主题。

表格滚动容器可使用 `role="region" aria-label="结果表格" tabindex="0"`，表格保留 caption、列头和正确 scope。CSS 中的 `aria-selected` 选择器仅提供外观，是否使用该 ARIA 状态取决于实际组件语义；普通只读表格不要无故标成 grid。

`aria-disabled="true"` 不会自动禁止链接／按钮动作，应用需实现相应行为。原生 button 用 disabled 更直接。加载状态可以用 `aria-busy`，同时处理重复提交和可见反馈。

## 3. 保真适配

### 3.1 建立基线

保存可重现的原页面或数据样本，记录原文、顺序、表格数据、图表配置和主要交互。只采集当前任务涉及的资源，避免全站抓取。

- 字体、颜色、间距、边框、布局换列是主要适配对象。
- 原文、公式、日期、数值精度、图例、数据系列和默认筛选属于保留对象。
- 截断时提供全文；新折叠、删列、内容重写不自动归入换肤。

### 3.2 实施顺序

先调整变量与共享容器，再调整组件，最后处理图表与原页面兼容。覆盖 CSS 保持作用域；不要用“第一个链接”决定哪个动作是 Primary。应按动作语义加类，而不是依赖 DOM 位置。

### 3.3 验证内容

可以用 HTML 解析器比较非脚本／样式文本、章节序列和表格；图表另比较数据对象。对空白的归一化规则应明确，不能顺手丢弃符号或格式化数值。图表比较检查值、顺序、轴类型和配置，而不只是点数。

对主题函数使用深拷贝，确认源对象未变；验证变更只落在呈现白名单。对有业务交互的页面还需实际操作，静态内容一致无法证明筛选或保存行为正确。

## 4. 静态预览

当用户要求“不连后端”时：

- 数据用打包快照或明确的模拟数据，资源本地化；字体优先系统字体。
- 已授权的一次性读取可以用于采集页面，运行时不再访问来源 API。
- 链接指向本地页面、页内锚点或本地下载；未实现路由提供清楚的预览提示。
- 不把原服务表单动作、WebSocket、EventSource、分析脚本或自动刷新留在预览里。
- 原始下载若保留原样式和外链，要与预览的运行隔离分开说明。

CSP 的 `connect-src 'none'` 可作为附加防护，但不能阻止普通页面导航、图片或表单的所有网络行为。仍需检查资源 URL、链接和表单；结合 `default-src 'self'`、`form-action 'none'` 等按实际资源配置。不要照抄需要 unsafe-eval 的图表快照策略到无此需要的正式应用。

检查浏览器网络记录或服务日志，确认运行期没有访问业务服务；配合代码检查。静态 HTTP 服务器只是文件服务，不算业务后端，但需要在交付中说明启动方式。

## 5. 图表主题适配

在现有绘图入口注入主题，不重新拼一份“看起来差不多”的数据。伪代码：

```js
const themed = structuredClone(originalFigure);
// Set fonts, surfaces, grid and approved per-series colors only.
// Preserve type, order, axes, values, dates, range settings, names and units.
render(themed);
```

`structuredClone` 适合可克隆配置；含函数或第三方实例的配置应使用库支持的复制／合并方式，保留 formatter 等行为，不盲目 JSON 序列化。框架响应式对象也应先按框架要求取出原始可用值。

按稳定系列 ID 分配颜色。旧色→新色映射仅适合确认颜色没有业务含义的固定快照；它可能把不同含义误映射为同色，不作为通用策略。数值颜色数组、连续色阶、状态色和阈值带不能当成普通类别颜色批量替换。

只改变既有轴的视觉属性；不要凭空增加轴、改变 log/linear、重新定范围或对缺失值插值。保持用户缩放与图例选择，主题更新使用库支持的状态保留机制。

主题变更和容器变化时更新图表；从隐藏区域展开后重测尺寸。检查 hover、图例、工具栏、导出背景和触控行为，不只观察第一屏。

## 6. 深色、打印与导出

深色使用语义映射，并分别验证文本、控件和图表；不依赖全局滤镜。若项目没有深色要求，可以仅交付浅色，不制造未验证的“支持深色”开关。

打印按需求使用清楚的浅底、避免多余导航和被滚动容器截断的内容，保留标题、单位、来源与图表。不能只用 `display:none` 隐藏操作区后就保证所有长表格完整打印；需检查分页和图表栅格质量。没有打印要求时，不扩展为额外 PDF 项目。

## 7. 合理的验证范围

样式变化优先做浏览器可视检查、键盘检查和关键路径验证。只换颜色时不重写整套业务测试；改共享组件或状态逻辑时跑现有相关测试。每次修复后针对变化重新检查，无新问题时交付，不无限扩展审计。
