# Architecture

本目录保存项目架构、模块边界和阶段性架构治理方案。

## Active Docs

- [Architecture overview](overview.md)：Manifest V3 扩展总体架构、状态流和分层原则。
- [Module boundaries](module-boundaries.md)：`features/*`、popup、quick-save、settings 等模块职责边界。
- [Phase 1 local architecture](phase-1-local-architecture.md)：第一阶段本地架构收口目标、非目标和后续拆分顺序。
- [Layering analysis](layering-analysis.md)：当前分层状态、长期目标分层和云端化前置边界分析。

## Maintenance

代码入口、模块职责、Chrome API 访问边界或第一阶段收口方向变化时，先更新本目录，再按需要更新 [ADR](../adr/README.md)。
