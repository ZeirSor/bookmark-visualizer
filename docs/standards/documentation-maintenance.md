# 文档维护规则

## 目录组织

`docs/` 按系统域组织，不在根目录使用 `00/01/02` 编号文件维持顺序。

- `product/`：产品定位、需求、交互、UI 和路线图。
- `frontend/`：前端设计系统、跨界面一致性、组件模式和可访问性规范。
- `frontend/surfaces/`：页面级 PageDocs，维护每个页面的 UI 元素、组件、CSS selector、代码链路和回归清单。
- `architecture/`：架构总览、模块边界、入口、权限和阶段性架构治理。
- `data/`：数据源、storage key、metadata、导入导出和数据模型。
- `guides/`：测试、验收、健康检查和操作型指南。
- `workflow/`：AI-assisted development lifecycle、run folder、任务状态、停止交接和验证门禁。
- `playbooks/`：可复用任务执行手册，例如 feature implementation、UI refactor、bugfix、docs sync 和 review。
- `strategy/`：未来阶段、云端化、订阅、Notion 和 AI 策略。
- `standards/`：文档维护和协作规范。
- `adr/`：长期技术决策记录。

## 索引规则

- `docs/README.md` 必须链接每个一级目录。
- 每个一级目录必须有 `README.md`。
- 目录 README 必须说明目录用途、当前有效文档和维护触发条件。
- 移动、重命名或新增文档时，同步更新根索引和对应目录索引。
- 新增、移动或重命名页面级文档时，同步检查 `docs/frontend/surfaces/README.md` 和 `docs/frontend/surfaces/reference/`。
- 新增、移动或重命名 AI workflow / playbook 文档时，同步检查 `AGENTS.md`、`.ai/README.md`、`docs/workflow/README.md`、`docs/playbooks/README.md` 和相关 local skill references。

## 文档类型

本项目使用轻量分类：

- Concept：解释概念和设计理由，例如架构分层、数据源原则。
- Task：说明如何完成操作，例如测试验收、健康检查。
- Reference：稳定事实和接口说明，例如模块边界、storage schema、UI element index。
- Strategy：未来阶段方向，必须明确是否属于当前实现范围。
- PageDocs：页面级维护文档，记录具体页面的组件、UI 元素、CSS selector、代码链路和功能链路。
- Workflow：AI 开发流程规范，例如 run folder、任务状态、停止规则和验证门禁。
- Playbook：某一类重复任务的标准执行手册。

一篇文档可以包含多个章节，但不要让同一页面同时承担所有读者目的。内容膨胀时拆到对应系统域目录。

## PageDocs 维护规则

以下变化必须同步 `docs/frontend/surfaces/`：

- 页面 layout、栏位、区块或响应式结构变化。
- 按钮、图标、输入框、菜单、空状态、toast、弹窗变化。
- CSS class、selector、设计 token、圆角、阴影、间距、动效变化。
- 页面状态、交互流、消息流、Chrome API 链路或 storage 链路变化。
- 组件文件移动、复用方式变化或跨页面共享组件变化。

推荐同步目标：

- Manager：`docs/frontend/surfaces/manager/`
- Popup：`docs/frontend/surfaces/popup/`
- New Tab：`docs/frontend/surfaces/newtab/`
- Quick Save：`docs/frontend/surfaces/quick-save/`
- Shared：`docs/frontend/surfaces/shared/`
- Index / Checklist：`docs/frontend/surfaces/reference/`

## AI Workflow 文档规则

以下变化必须同步 `docs/workflow/`、`docs/playbooks/`、`.ai/README.md` 或 `AGENTS.md`：

- Agent 执行模式变化。
- `.ai/runs/` 结构变化。
- task checkbox 规则变化。
- stop / handoff 规则变化。
- validation gate 规则变化。
- playbook 命名、职责或路由变化。
- local skill 职责变化。

区分三类文件：

- `.ai/runs/`：当前任务执行状态，不是正式事实源。
- `.ai/logs/`：事后工作记录，不是正式事实源。
- `docs/`：当前系统事实、流程和长期规则。

不要把 `spec.md`、`tasks.md`、`handoff.md` 的临时任务内容复制进 `docs/`。只有当任务结果形成长期规则、产品事实、架构边界、数据规则、UI 维护规则或验收标准时，才同步到 `docs/`。

## 草稿和历史文档

- 设计草稿应晋升到 `product/`、`frontend/`、`architecture/`、`data/` 或 `strategy/` 后再作为正式文档维护。
- AI workflow 规则应放入 `workflow/`、`playbooks/`、`.ai/README.md` 或 `AGENTS.md`，不要散落在普通 PageDocs 中。
- 未来阶段文档放入 `strategy/` 或明确阶段目录，不与当前验收文档混写。
- 废弃但有决策价值的内容写入 ADR，并标注“已废弃”或“被取代”。
- `.ai/logs/` 是工作记录，不是正式事实源；长期规则必须同步正式文档或 ADR。

## 变更同步

- 代码变更影响产品行为时，更新 `docs/product/` 和必要验收指南。
- 代码变更影响模块职责、入口、权限或分层时，更新 `docs/architecture/`。
- 数据结构、storage key、导入导出或 migration 变化时，更新 `docs/data/`。
- UI surface、组件、CSS selector 或页面链路变化时，更新 `docs/frontend/surfaces/`。
- 验证命令、手动验收或健康检查变化时，更新 `docs/guides/` 和必要的 `docs/workflow/validation-gate.md`。
- AI-assisted workflow、run folder、task 状态、playbook 或 local skill 变化时，更新 `docs/workflow/`、`docs/playbooks/`、`.agents/skills/`、`.ai/README.md` 和 `AGENTS.md`。
- 持久技术决策变化时，新增或更新 `docs/adr/`。
- 非轻量工作收尾按项目规则写入 `.ai/logs/`。
