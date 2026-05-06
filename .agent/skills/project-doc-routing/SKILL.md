---
name: project-doc-routing
description: Use when a task in this repository needs to decide which formal docs to read first, which module README to open, and which formal documents must be updated before finishing.
---

# Project Doc Routing

## Quick Start

- 在读取大量 `docs/` 正文前先用本 skill。
- 先读 [doc-routing-matrix.md](references/doc-routing-matrix.md)。
- 先看 `docs/README.md`，再按任务语义进入目标模块 README。
- 不整仓通读 `docs/`；只读取最小必要正式文档集合。

## Workflow

1. 识别当前任务更接近需求、功能、架构、API、数据、标准、演示，还是 ADR。
2. 先读 `docs/README.md`。
3. 按路由矩阵进入目标模块 README。
4. 只继续读取当前任务需要的少量正式文档。
5. 在任务结束前，根据路由矩阵判断哪些正式文档必须同步更新。

## Reference Map

- [doc-routing-matrix.md](references/doc-routing-matrix.md): 任务语义、优先阅读入口和收尾更新目标

## Output Rules

完成后只返回：

- 当前任务类型
- 建议先读的 README 与正式文档
- 当前不需要读的模块
- 若任务落地修改，结束前应同步更新的正式文档列表
