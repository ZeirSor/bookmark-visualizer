# Frontend

本目录维护 Bookmark Visualizer 的前端设计系统、跨界面一致性、组件模式、交互可访问性和实施路线图。

## Reading Order

1. [Design system](design-system.md)：统一 token、视觉锚点和页面别名规则。
2. [Surface alignment plan](surface-alignment-plan.md)：管理页、New Tab、Popup 的角色分工和统一边界。
3. [Component patterns](component-patterns.md)：按钮、输入、卡片、chip、菜单、浮层和反馈状态。
4. [Accessibility and interaction](accessibility-and-interaction.md)：键盘、focus、target size、搜索建议和级联菜单规则。
5. [Implementation roadmap](implementation-roadmap.md)：按阶段落地前端完善。
6. [Documentation maintenance](documentation-maintenance.md)：前端文档维护触发条件和同步规则。

## Design Direction

当前前端采用 Swiss 风格：白 / 浅灰表面、1px 细边框、克制蓝紫强调、清晰网格、左对齐信息层级和轻量浮层。项目不追随营销页式大渐变、重装饰和过度动效。

## Maintenance

当 UI token、跨页面视觉规范、组件交互、可访问性规则或前端验收口径变化时，更新本目录。产品行为变化同步更新 `docs/product/`；模块边界变化同步更新 `docs/architecture/`；验证命令和手动验收变化同步更新 `docs/guides/`。
