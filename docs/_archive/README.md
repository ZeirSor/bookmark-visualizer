---
type: archive
status: archived
scope: archive
owner: project
last_verified: 2026-05-14
source_of_truth: false
archived_reason: "superseded, historical, or temporary content"
archived_from: "_archive/README.md"
current_source: "docs/README.md"
---

# Archive

本目录存放历史设计、旧实现方案、临时执行计划和已被取代的 ADR。Archive 可用于追溯决策背景，但不作为当前实现事实源。

## Rules

- `_archive/` 中的文档可以引用已删除路径和旧设计。
- 当前事实必须回到 `docs/` 的 active 区域查找。
- 归档文档需要保留 `archived_reason`、`archived_from` 和 `current_source`。
- 不要从 active 文档直接复制 Archive 内容，除非同步更新为当前代码事实。

## Sections

| Directory | Content |
|---|---|
| `adr/` | 被后续 ADR 取代的架构决策。 |
| `architecture/` | 阶段性架构分析和旧本地架构收口。 |
| `data/` | 阶段性数据模型计划。 |
| `frontend/` | 已删除 UI surface、旧 Shadow DOM dialog 和旧 overlay 说明。 |
| `product/` | 旧保存入口设计和历史交互方案。 |
| `strategy/` | 已过期或代码路径不再成立的未来规划。 |
| `tmp/` | 临时任务计划和一次性执行记录。 |
