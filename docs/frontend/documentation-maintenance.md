# Frontend Documentation Maintenance

## Update Triggers

更新 `docs/frontend/` 的触发条件：

- 设计 token、颜色、圆角、阴影、字体策略变化。
- New Tab、Popup、管理页之间的统一规则变化。
- 组件模式、键盘交互、可访问性规则变化。
- 前端实施路线图阶段完成或优先级变化。

## Cross-Document Sync

按变化类型同步：

- 用户可见行为变化：更新 `docs/product/`。
- 入口、模块职责、权限、数据边界变化：更新 `docs/architecture/`。
- 验证命令、手动验收、健康检查变化：更新 `docs/guides/`。
- 长期不可轻易反转的技术决策：新增或更新 `docs/adr/`。
- 新增、移动或重命名前端文档：更新 `docs/README.md` 和 `docs/frontend/README.md`。

## Source Handling

- 官方规范链接放在相关文档的 Sources 小节。
- 项目选择必须与外部规范分开表述，避免把项目偏好写成行业事实。
- 外部资料只吸收稳定原则：token 分层、平台一致性、可访问性、清晰层级、克制动效。

## Review Checklist

- 文档标题层级是否连续。
- 文档是否说明适用范围和非目标。
- 是否给出实施或验收方式。
- 是否避免重复 `docs/product/`、`docs/architecture/` 的职责。
- 是否同步索引。
