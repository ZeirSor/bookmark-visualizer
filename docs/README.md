# Bookmark Visualizer 文档索引

本目录按系统域组织文档。根目录只保留索引，具体说明放入各主题目录。

## 文档目录

- [Product](product/README.md)：产品定位、需求、交互、UI、路线图和具体体验设计。
- [Frontend](frontend/README.md)：前端设计系统、跨界面一致性、组件模式、可访问性规范和 surface 级 UI 实现文档。
- [Architecture](architecture/README.md)：扩展架构、模块边界、第一阶段本地架构收口和分层分析。
- [Data](data/README.md)：本地数据、存储、导入导出和未来数据模型。
- [Guides](guides/README.md)：测试、验收、健康检查和操作型指南。
- [Workflow](workflow/README.md)：AI-assisted development lifecycle、run folder、任务状态、验证和交接规则。
- [Playbooks](playbooks/README.md)：可复用任务执行手册，例如 feature implementation、UI surface refactor、bugfix、docs sync 和 review。
- [Strategy](strategy/README.md)：云端化、订阅、Notion、AI 等未来阶段策略。
- [Standards](standards/README.md)：文档维护规则和协作规范。
- [ADR](adr/README.md)：已接受或废弃的长期架构决策记录。

## 阅读顺序

新接手项目时，建议先读：

1. [Product overview](product/overview.md)
2. [Requirements](product/requirements.md)
3. [Frontend design system](frontend/design-system.md)
4. [Architecture overview](architecture/overview.md)
5. [Module boundaries](architecture/module-boundaries.md)
6. [Phase 1 local architecture](architecture/phase-1-local-architecture.md)
7. [ADR index](adr/README.md)

AI-assisted implementation 还应先读：

1. `AGENTS.md`
2. `.ai/README.md`
3. [Workflow](workflow/README.md)
4. [Playbooks](playbooks/README.md)
5. 当前任务对应的 product / architecture / data / frontend surface 文档

## 维护规则

文档维护规则见 [Documentation maintenance](standards/documentation-maintenance.md)。新增或迁移文档时，必须同步更新本索引和对应目录的 `README.md`。

不要把 `.ai/runs/` 中的临时任务状态复制进 `docs/`。只有当 run 结果形成长期产品事实、架构边界、数据规则、UI 维护规则或验证规则时，才同步到本目录。
