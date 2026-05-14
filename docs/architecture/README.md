---
type: reference
status: active
scope: architecture
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Architecture

本目录维护当前系统架构、模块边界、运行链路和入口事实。阶段性分析和旧保存入口架构已移动到 `docs/_archive/architecture/`。

## Reading Order

1. [Overview](overview.md)
2. [Runtime flows](runtime-flows.md)
3. [Module boundaries](module-boundaries.md)
4. [ADR index](../adr/README.md)

## Current Entry Facts

- `popup.html`：toolbar popup，当前主保存入口。
- `index.html`：完整管理工作台。
- `newtab.html`：可选 New Tab Portal。
- `src/features/page-shortcut/content.ts`：可选 listener，只请求打开 popup。
