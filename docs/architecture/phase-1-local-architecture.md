# 第一阶段本地架构收口（not current implementation）

## 目标

第一阶段只做架构和维护性收口：在不改变现有功能表现的前提下，让当前代码更稳定、更容易拆分、更方便后续功能扩展。

本阶段完成后，应达到：

- 文档入口、权限、保存小窗口路径和模块边界描述一致。
- P0 稳定性问题被修复或有明确验收记录。
- 大入口文件的职责拆分方向明确，后续可以小步实施。
- 后续功能有清晰落点，不继续堆进页面入口或 service worker。

## 目标分层

项目长期按以下边界演进：

```text
UI entrypoints
  -> feature / use-case orchestration
  -> domain models and pure rules
  -> infrastructure adapters
```

当前第一阶段不要求一次性创建所有目录。推荐方向是：

- `src/app/workspace/`：完整工作台入口、布局和工作台专用 hooks。
- `src/save-window/`：独立保存小窗口入口；`src/popup/`：保存窗口复用 UI 和 popup fallback，`main.tsx` 只负责 fallback 挂载。
- `src/background/`：service worker 注册、消息路由和 command handler。
- `src/features/*`：业务能力和用例编排。
- `src/lib/chrome/`：当前继续作为 Chrome API infrastructure adapter 边界。
- `src/domain/`：未来放稳定领域模型和纯规则，本阶段只规划不落地。

## 当前阶段边界

本阶段保留现有用户行为：

- 工具栏 action 打开独立 `save.html` 保存小窗口，保存窗口是当前网页保存主路径；`popup.html` 保留为 fallback / dev entry。
- 完整工作台继续由 popup 入口打开。
- `Ctrl + Shift + S` / macOS `Command + Shift + S` 保留为低权限快捷保存命令。
- `Ctrl + S` 不作为当前验收路径。
- `chrome.bookmarks` 仍是书签结构唯一事实来源。
- `chrome.storage.local` 仍保存备注、摘要、设置、快捷保存最近文件夹等插件元数据。

## P0 收口项

第一阶段必须完成：

- 同步过时文档，移除 toolbar 直接打开完整工作台的旧说法。
- 收敛测试脚本，避免测试扫描范围失控。
- 在 Chrome 和 Edge 干净 profile 中手动验收保存小窗口主流程。
- 修复 metadata 备注清空语义：字段缺失表示不修改，空字符串表示明确清空。

## 后续代码拆分顺序

本次文档重整不实施大拆分。后续实施时按小步、可验证顺序推进：

1. 抽出 toast 相关逻辑。
2. 抽出操作日志与撤销逻辑。
3. 抽出新建书签 / 新建文件夹弹窗。
4. 抽出右键菜单逻辑。
5. 抽出拖拽处理逻辑。
6. 拆分 workspace 布局组件。
7. 拆分 popup：`PopupApp`、tabs、components、hooks。
8. 拆分 service worker：注册入口、message router、command handlers。

每一步都必须保持功能表现一致，并能独立通过测试。

## 本阶段不做

- 不接云端。
- 不做账号系统。
- 不做订阅制。
- 不做 Notion 集成。
- 不做完整多维表格视图。
- 不做 AI 摘要。
- 不做大规模 UI 改版。
- 不改变当前数据存储策略。

## 未来方向

以下方向只作为后续阶段落点，不在本阶段实现：

- `BookmarkRecord`、`FolderRecord`、`TagRecord`、`BookmarkActivity`、`ExternalMapping` 等稳定领域模型。
- Versioned JSON、CSV、Netscape Bookmark HTML 等导入导出 schema。
- `SyncProvider`、local outbox、sync status 等同步抽象。
- `PlanCapability`、Cloud API、Notion mapping 和后端能力边界。

## 验收

第一阶段完成标准：

- 文档路径和索引更新完成。
- `AI_HANDOFF.md`、README、architecture docs 和 ADR 对入口路径描述一致。
- `npm run typecheck` 通过。
- `npm run test` 通过。
- `npm run build` 通过。
- `npm run verify:save-window-entry` 通过。
- 保存小窗口主流程在 Chrome / Edge 干净 profile 中有手动验收记录。
