# 文档路由矩阵

## 作用

这份矩阵用于让 AI 在本仓库中：

1. 根据任务语义先读正确的 README 与正式文档
2. 在任务结束前判断哪些正式文档需要同步更新

## 读取顺序总规则

1. 先读 `docs/README.md`
2. 再读目标模块 `README.md`
3. 再读最小必要正文
4. 如需修改，结束前按本矩阵做文档维护判断

## 任务语义到正式文档的映射

| 任务语义 | 先读什么 | 结束前可能更新什么 |
|---|---|---|
| 需求、范围、业务目标、里程碑、功能规划 | `docs/products/README.md` | `docs/products/product-requirements.md`、`docs/products/feature-overview.md` |
| 当前功能模块变化 | `docs/products/README.md` | `docs/products/feature-overview.md` |
| 架构、分层、运行链路、模块协同 | `docs/architecture/README.md`、`docs/standards/README.md` | `docs/architecture/`、`docs/standards/` |
| API、OpenAPI 风格、请求响应、错误码 | `docs/api/README.md` | `docs/api/` |
| 集合、字段、索引、快照、`extra_json`、typeless 扩展结构 | `docs/data/README.md`、`docs/data/collections/README.md` | `docs/data/schema.md`、`docs/data/collections/*.md`、`docs/data/conventions.md`、`docs/data/indexes.md` |
| 长期决策、架构演进、规则取舍 | `docs/adr/README.md`、`docs/adr/decision-log.md` | `docs/adr/` |
| 演示文稿、slides、汇报材料、HTML presentation | `docs/presentations/README.md` | `docs/presentations/README.md`、`docs/presentations/presentation-types-and-doc-sources.md`、目标演示目录 |
| 前端协作、工程审阅请求 | `docs/collaboration/README.md`、`docs/collaboration/frontend/README.md` | `docs/collaboration/`、必要时 `docs/guides/frontend-collaboration/` |
| Codex、session、AI 协作流程 | `AGENTS.md`、`docs/guides/workflow/document-governance.md`、`.ai/README.md` | `AGENTS.md`、`docs/guides/workflow/document-governance.md`、相关协作文档 |

## 数据与 presentations 的额外规则

### 数据字段设计

- `docs/data/schema.md` 只负责总览
- 完整字段设计写在 `docs/data/collections/*.md`
- 若字段、快照结构、typeless 扩展结构变化，必须优先更新集合文档

### 演示文稿

- `docs/presentations/` 不是正式事实源
- 生成 slides 前先判断正式来源是否完整
- 若正式来源缺失，应先补 `docs/`，再做 slides
- `slides-brief.md` 只作为演示任务说明，不替代正式设计文档
