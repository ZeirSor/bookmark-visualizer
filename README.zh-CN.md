<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img src="public/icons/icon-128.png" width="96" height="96" alt="Bookmark Visualizer 图标" />
</p>

<h1 align="center">Bookmark Visualizer</h1>

<p align="center">
  一个面向 Chrome 和 Edge 的书签工作台，用更直观的方式保存、浏览、搜索和整理浏览器原生书签。
</p>

<p align="center">
  <img alt="状态：预览版" src="https://img.shields.io/badge/status-preview-f59e0b" />
  <img alt="Chrome and Edge" src="https://img.shields.io/badge/browser-Chrome%20%7C%20Edge-2563eb" />
  <img alt="Manifest V3" src="https://img.shields.io/badge/manifest-v3-16a34a" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646cff" />
</p>

## 项目概览

Bookmark Visualizer 是一个 Manifest V3 浏览器扩展，适合书签数量较多、需要长期整理的人。它当前主要包含三个 UI 入口和一个 Quick Save 浮层：

- 工具栏 popup：用于保存当前页面，并提供轻量管理入口；
- 完整管理工作台：用于浏览、搜索、编辑、移动和复盘书签；
- 可选 New Tab 页面：可在设置中开启，用作搜索优先的新标签页书签入口；
- Quick Save 浮层：通过扩展命令 / background 协作流程实现低打扰快捷保存。

扩展以 `chrome.bookmarks` 作为书签结构的唯一事实来源。移动、编辑、删除、文件夹调整和新建书签都会作用于浏览器原生书签树，而不是维护一份插件内部副本。备注、摘要、最近使用文件夹、New Tab 状态、设置和 UI 状态等插件自有数据保存在 `chrome.storage.local`。

浏览器工具栏图标会打开 `popup.html`。完整管理工作台由 `index.html` 承载。默认情况下，Bookmark Visualizer 保留浏览器原生新标签页；用户可以在设置中开启可选的 New Tab 接管，开启后新建标签页会跳转到 `newtab.html`。

## 功能特性

- 在独立的完整页面工作台中浏览浏览器原生书签文件夹树。
- 可通过可点击的面包屑路径在文件夹层级之间快速跳转。
- 以卡片形式查看书签标题、URL、favicon、备注和摘要区域。
- 按标题和 URL 搜索书签。
- 将书签卡片拖拽到文件夹，或在当前文件夹中拖拽调整顺序。
- 行内编辑书签标题、URL、备注和文件夹名称。
- 可从卡片右键菜单在当前卡片前后新建书签。
- 通过卡片右键菜单移动或删除书签。
- 可从左侧文件夹树或移动目标选择流程中新建文件夹。
- 可在左侧树中拖拽文件夹，将其移动为子级或同级。
- 支持从 toast 或会话操作日志撤销书签移动、编辑、备注修改和删除。
- 支持主题、卡片尺寸、侧栏宽度和树内书签显示设置。
- 通过工具栏 popup 快速把当前网页保存为浏览器原生书签。
- 在 popup 的“保存”Tab 中搜索文件夹、选择保存位置、新建文件夹、填写备注并保存页面。
- 可从 popup 打开完整工作台，继续进行深度书签管理。
- 可选接管浏览器新标签页，提供搜索优先的书签入口页。
- 支持配置 New Tab 搜索引擎、搜索分类、布局模式、每行快捷入口数量、最近活动和存储使用信息显示。

## 预览

首个公开版本前应补充稳定维护的截图或演示 GIF。如果演示资源已经进入仓库，建议放在 `docs/assets/` 下，并在本段引用。

## 安装

克隆仓库并安装依赖：

```bash
git clone https://github.com/ZeirSor/bookmark-visualizer.git
cd bookmark-visualizer
npm install
```

构建扩展资源：

```bash
npm run build
```

构建完成后，未打包扩展文件会生成在 `dist/` 目录中。

## 开发

启动 Vite 开发服务器：

```bash
npm run dev
```

运行校验命令：

```bash
npm run typecheck
npm run test
npm run build
```

## 加载扩展

在 Chrome 或 Edge 中加载生成的 `dist` 文件夹：

1. 在 Chrome 打开 `chrome://extensions`，或在 Edge 打开 `edge://extensions`。
2. 启用开发者模式。
3. 选择“加载已解压的扩展程序”。
4. 选择由 `npm run build` 生成的 `bookmark-visualizer/dist` 文件夹。
5. 可按需固定扩展图标，然后点击工具栏图标打开 popup。
6. 打开普通浏览器新标签页时，默认会保留浏览器原生新标签页；只有在扩展设置中开启可选 New Tab 接管后，才会跳转到扩展的 `newtab.html`。

尝试移动、编辑或删除等真实修改书签的操作时，建议使用测试浏览器 Profile。

## 使用方式

### Popup 保存流程

- 在普通网页点击工具栏图标，打开 popup 的“保存”Tab。
- 检查自动识别到的标题、URL、favicon、预览图和保存位置。
- 通过搜索文件夹或最近使用文件夹选择保存目标。
- 如有需要，可以在选择保存位置时新建文件夹。
- 填写备注后，将当前页面保存为浏览器原生书签。
- 可从 popup 顶部或“管理”Tab 打开完整工作台。

### 管理工作台

- 在左侧文件夹树中选择文件夹，右侧会展示该文件夹的直接子书签。
- 点击面包屑路径中的任一层级，可以直接跳转到对应文件夹。
- 如果希望在树中也显示书签条目，可以打开树内书签显示开关。
- 可在文件夹树中拖拽可见书签行，将其移动到同级书签前后。
- 在搜索框输入关键词，按标题或 URL 搜索全局书签。
- 将书签卡片拖到可写文件夹上即可移动书签。
- 将书签卡片拖到当前文件夹中其他卡片前后即可调整顺序。
- 右键书签卡片可以编辑、新建相邻书签、移动或删除。
- 右键可写文件夹可以新建子文件夹或行内重命名。
- 支持操作后通过撤销提示或会话操作日志恢复部分操作。

### 可选 New Tab

- 在扩展设置中开启 New Tab 接管。
- 使用 New Tab 搜索框进行网页搜索或分类搜索。
- 从仪表盘打开固定或常用书签快捷入口。
- 在相关设置开启后查看最近活动和存储使用状态。
- 关闭 New Tab 接管后，会恢复浏览器原生新标签页。

## 项目结构

```text
src/
  app/                 完整管理工作台应用外壳、工作区状态和全局应用装配
  app/workspace/       管理页工作台布局和页面级组件
  background/          MV3 service worker、命令、popup 路由、quick-save 和 new-tab redirect 处理
  components/          跨页面复用的共享 UI 组件
  domain/              书签、文件夹、活动记录和表格视图等领域模型
  features/            功能模块：bookmarks、popup、quick-save、newtab、settings、metadata、search
  lib/chrome/          Chrome API adapter 和可 mock 的浏览器集成层
  newtab/              可选 New Tab 页面入口和应用装配
  popup/               工具栏 popup 页面入口和应用装配
  styles/              共享设计 token 和页面级样式

public/
  manifest.json        Manifest V3 扩展 manifest
  icons/               扩展图标

docs/
  product/             产品需求、UI 设计、交互规则和路线图
  architecture/        架构概览和模块边界
  data/                存储与数据模型
  frontend/            页面级 PageDocs 和 UI 维护文档
  guides/              测试、验收和开发指南
  workflow/            AI-assisted development lifecycle 和 run-folder 规则
  playbooks/           面向常见 Agent 工作流的可复用执行手册
  standards/           文档维护和工程维护规范
  adr/                 架构决策记录

index.html             完整管理工作台入口
popup.html             工具栏 popup 入口
newtab.html            可选 New Tab 入口
```

## 文档

- [文档总览](docs/README.md)
- [需求说明](docs/product/requirements.md)
- [架构设计](docs/architecture/overview.md)
- [UI 设计](docs/product/ui-design.md)
- [数据与存储](docs/data/storage.md)
- [模块边界](docs/architecture/module-boundaries.md)
- [交互规则](docs/product/interactions.md)
- [测试与验收](docs/guides/testing-and-acceptance.md)
- [路线图](docs/product/roadmap.md)
- [右键移动菜单](docs/product/right-click-move-menu.md)
- [前端 PageDocs](docs/frontend/surfaces/README.md)
- [AI 开发工作流](docs/workflow/README.md)
- [Agent Playbooks](docs/playbooks/README.md)
- [文档维护规范](docs/standards/documentation-maintenance.md)
- [架构决策记录](docs/adr/README.md)

## 路线图

- 文件夹删除流程。
- 紧凑列表视图，以及轻量排序和过滤控制。
- 元数据导入 / 导出。
- 更强的 New Tab 自定义和快捷入口管理能力。
- 摘要抓取仍属于后续能力；当前 popup 保存路径不请求全局 `http://*/*` 或 `https://*/*` 站点访问权限。
- 组件级 UI 测试。
- 首个公开版本打包和稳定截图维护。

## 许可证

当前尚未指定许可证。
