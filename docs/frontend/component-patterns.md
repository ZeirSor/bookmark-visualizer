# Component Patterns

## Buttons

- Icon-only button 必须有 `aria-label` 和 `title`。
- 主按钮只用于明确提交动作，例如保存、确认创建。
- 次按钮使用白底灰边；hover/focus 使用浅紫背景和蓝紫边框。
- disabled 必须同时表现为不可点击光标、降低不透明度、移除强阴影。

## Inputs And Textareas

- 默认白底、灰边、10px 圆角。
- focus 使用蓝紫边框和 3-4px 半透明 ring。
- readonly URL 可以保持可选中文本，不要像 disabled 一样降低可读性。
- 错误不默认散落在每个输入框中；短流程优先集中到 footer 或 toast。

## Search

- New Tab 搜索使用 combobox 思路：输入框保留焦点，建议浮层展示候选。
- Popup 文件夹搜索原位展示最多 4 条结果，不跳转管理页。
- Escape 优先关闭局部浮层；没有局部浮层时再交给页面级关闭逻辑。

## Cards And Panels

- Panel 使用白 / 半透明白、1px 边框、轻阴影。
- 卡片 hover 优先改变边框和轻阴影，不做大位移。
- 不要嵌套装饰性卡片。重复内容项可以是卡片，页面 section 不应伪装成卡片堆叠。

## Chips

- Chip 文案单行省略。
- 图标和文字间距固定 7-8px。
- 选中态使用浅紫背景 + 蓝紫文字 / 边框。
- 展开态必须自动换行，不撑破容器。

## Menus And Cascade Overlays

- 浮层使用 `position: fixed` 或 portal，避免被滚动容器裁剪。
- 级联菜单当前路径使用浅紫高亮，最终目标显示当前状态。
- 滚轮优先滚动菜单自身，不制造双层滚动混乱。
- 右侧或底部空间不足时允许向左 / 向上展开。

## Feedback States

- Loading：使用 skeleton 或明确 spinner，不只禁用控件。
- Empty：说明当前状态和下一步可做什么。
- Error：说明失败原因，并保留用户输入和当前 UI 状态。
- Success：短反馈即可，不打断高频流程。
