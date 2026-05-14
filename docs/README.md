---
type: reference
status: active
scope: project
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Bookmark Visualizer Documentation

本目录是项目长期事实源。临时任务状态、运行记录和 AI 会话上下文不进入 `docs/`；只有形成稳定产品事实、架构边界、数据规则、质量门禁或维护规范后，才同步到这里。

## Directory Map

| Directory | Responsibility |
|---|---|
| [`product/`](product/README.md) | 产品定位、需求、交互、UI 和路线图。 |
| [`architecture/`](architecture/README.md) | 当前系统架构、模块边界、运行链路和入口事实。 |
| [`adr/`](adr/README.md) | 当前仍有效的架构决策记录。被取代的 ADR 移入 `_archive/adr/`。 |
| [`data/`](data/README.md) | 本地数据模型、Chrome storage、IndexedDB cache 和导入导出。 |
| [`frontend/`](frontend/README.md) | 设计系统、组件模式、可访问性和 UI surface 维护文档。 |
| [`quality/`](quality/README.md) | 测试、验收、健康检查和文档验证门禁。 |
| [`operations/`](operations/README.md) | 本地运行、构建、发布和运维边界。当前项目无服务端生产运维。 |
| [`workflow/`](workflow/README.md) | AI-assisted workflow 的人类可读流程说明。 |
| [`playbooks/`](playbooks/README.md) | 可复用任务执行手册。 |
| [`strategy/`](strategy/README.md) | 明确标记为 planned 的未来阶段策略。 |
| [`standards/`](standards/README.md) | 文档、命名、维护和协作规范。 |
| [`_templates/`](_templates/README.md) | 新文档模板。 |
| [`_archive/`](_archive/README.md) | 历史设计、旧方案、临时计划和已被取代的文档。 |

## Recommended Reading Order

1. [Product overview](product/overview.md)
2. [Requirements](product/requirements.md)
3. [Architecture overview](architecture/overview.md)
4. [Runtime flows](architecture/runtime-flows.md)
5. [Module boundaries](architecture/module-boundaries.md)
6. [Data storage](data/storage.md)
7. [Frontend surfaces](frontend/surfaces/README.md)
8. [Validation gate](quality/validation-gate.md)
9. [ADR index](adr/README.md)

## Current Implementation Facts

- `popup.html` 是当前主保存入口。
- `index.html` 是完整书签管理工作台。
- `newtab.html` 是可选 New Tab Portal。
- Page `Ctrl+S` bridge 只作为可选 listener 打开 toolbar popup，不渲染 UI。
- 独立保存页、内容脚本 Save Overlay 和旧 Shadow DOM Quick Save dialog 已归档，不属于当前事实源。

## Maintenance Rule

新增、移动或归档文档时必须同步更新对应目录的 `README.md`，并执行：

```bash
npm run docs:check
```
