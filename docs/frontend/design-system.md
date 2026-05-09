# Frontend Design System

## Purpose

本设计系统把管理页、New Tab 和 Popup 统一到同一套基础 token 与组件语义上。参考 Fluent 2 的 global / alias token 分层、Apple HIG 的层级与一致性原则、WCAG 2.2 的可访问性要求，并结合本项目扩展场景做轻量落地。

Sources:

- [Fluent 2 Design Tokens](https://fluent2.microsoft.design/design-tokens)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/?locale=en_us)
- [WCAG 2.2](https://www.w3.org/TR/wcag/)

## Token Layers

项目 token 分三层：

1. Base tokens：`--bv-color-*`、`--bv-radius-*`、`--bv-shadow-*`、`--bv-font-*`，存放稳定基础值。
2. Semantic tokens：表达用途，例如 text、surface、line、accent、success、danger。
3. Surface aliases：`--nt-*`、`--popup-*`、`--save-*`、`--app-*`，只做页面适配，不再独立维护随机色值。

代码入口：

- `src/styles/tokens.css` 是跨页面 token 来源。
- New Tab 必须引入 `src/styles/tokens.css`。
- Popup 必须引入 `src/styles/tokens.css`，再在 `src/popup/styles.css` 内做 popup 局部布局。
- 独立保存窗口必须引入 `src/styles/tokens.css`、`src/popup/styles.css` 和 `src/save-window/styles.css`；保存窗口视觉应使用 `--save-*` alias 覆盖，不直接复用 popup 尺寸和圆角。
- 管理页后续治理时同样映射到 `--app-*`。

## Visual Anchor

项目统一采用 Swiss 风格：

- Surface：白色、浅灰、半透明白面板。
- Structure：1px 分割线、明确网格、左对齐文本。
- Accent：蓝紫为唯一主强调色，普通状态避免大面积填色。
- Motion：120-180ms 的轻量过渡；尊重 `prefers-reduced-motion`。
- Shadows：只用于浮层、主 shell 和可交互卡片，不作为装饰主角。

## Color Rules

- 主色使用 `--bv-color-accent-base` / `--bv-color-accent`，不同页面可通过 alias 微调明度。
- 状态色只用于语义：success、danger、blue、orange，不用作装饰色。
- 新增颜色必须先进入 `src/styles/tokens.css`，再由页面 alias 引用。
- 禁止在组件 CSS 中继续散落新的 hex 色值，除非是一次性第三方品牌色或 favicon fallback。

## Radius And Elevation

- 小控件：8-10px。
- 卡片 / panel / popup 菜单：14-18px。
- New Tab 搜索主卡：24px。
- 轻卡片使用 `--bv-shadow-xs` 或 `--bv-shadow-sm`。
- Overlay 使用 `--bv-shadow-overlay` 或 popup 专用 `--bv-shadow-popup`。

## Typography

统一字体栈使用 `--bv-font-ui`。字号不随 viewport 线性缩放；移动端使用断点调整布局，不使用 `vw` 缩放正文。

层级建议：

- 页面 / panel 标题：15-20px，700-850。
- 表单 label：12-13px，700。
- 正文与输入：14-17px，500-650。
- 辅助信息：12-13px，500-600。

## Source Of Truth

当文档和代码不一致时，优先修正文档或代码到 `src/styles/tokens.css` 所表达的 token 架构。涉及长期技术决策时补 ADR。
