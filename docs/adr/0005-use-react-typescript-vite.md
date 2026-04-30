# ADR 0005: 前端使用 React + TypeScript + Vite

## 状态

已接受

## 背景

产品包含复杂组件和状态：树、卡片、拖拽、右键菜单、搜索、弹窗、撤销、设置和导入导出。原生 JavaScript 可以完成，但长期维护成本更高。

## 决策

第一版使用 React + TypeScript + Vite。

## 替代方案

- 原生 HTML / CSS / JavaScript：构建简单，但复杂交互和类型约束不足。
- Vue + TypeScript + Vite：同样可行，但当前决策优先 React 生态。

## 后果

- 组件化和状态管理更清晰。
- 可使用成熟拖拽和测试生态。
- 需要构建步骤和扩展打包流程。
