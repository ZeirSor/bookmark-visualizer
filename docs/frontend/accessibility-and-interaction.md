---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Accessibility And Interaction

## Standards

本项目按 WCAG 2.2 和 WAI-ARIA APG 的稳定原则实现可访问性，不追求复杂 ARIA 模拟控件，优先使用语义 HTML。

Sources:

- [WCAG 2.2](https://www.w3.org/TR/wcag/)
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WAI-ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [MDN Extension Popups](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups)

## Focus

- 所有键盘可达控件必须有清晰 `:focus-visible`。
- Focus ring 不得被 sticky header、portal overlay 或 popup footer 完全遮挡。
- Focus 指示面积和对比度应符合 WCAG 2.2 Focus Appearance 的精神要求。

## Target Size

- 主要点击目标不小于 24x24 CSS px。
- 常用 icon button 建议 34-40px。
- New Tab 快捷方式、保存窗口位置箭头、菜单行必须给足点击区域，而不是只让图标可点。

## Keyboard Rules

- `Escape`：关闭当前局部浮层；若无局部浮层，再关闭 popup 或退出当前模式。
- `Enter`：在表单内提交当前主动作；在搜索建议中打开当前候选。
- 箭头键：用于级联菜单、搜索候选或未来树形控件时，必须区分 hover、focus、selected。

## Search And Combobox

- New Tab 搜索建议应保持输入框为主要焦点，候选使用可理解的 listbox / option 语义。
- 输入 URL 时 Enter 直达 URL；输入关键词时按当前搜索引擎和分类搜索。
- 没有候选时不展示空浮层，或展示轻量空态。

## Popup Constraints

浏览器扩展 popup 会在点击外部时关闭，且只能由用户动作打开。Popup 内动作应短、明确、可恢复；保存失败、新建失败、不可保存页面都必须停留在当前上下文并给出文字说明。

## Motion

- 默认过渡 120-180ms。
- 只对 hover、focus、overlay entrance、spinner/skeleton 使用动效。
- `prefers-reduced-motion: reduce` 下关闭非必要动画。
