<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img src="public/icons/icon-128.png" width="96" height="96" alt="Bookmark Visualizer 图标" />
</p>

<h1 align="center">Bookmark Visualizer</h1>

<p align="center">
  一个面向 Chrome 和 Edge 的书签工作台，用更直观的方式浏览、搜索和整理浏览器原生书签。
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

Bookmark Visualizer 是一个 Manifest V3 浏览器扩展，适合书签数量较多、需要长期整理的人。点击扩展工具栏图标后，它会先打开一个紧凑的保存 popup，并提供入口打开更舒展的书签工作台：左侧是文件夹树，右侧是书签卡片，并围绕搜索、移动、编辑和撤销提供管理能力。

扩展以 `chrome.bookmarks` 作为书签结构的唯一事实来源。移动、编辑和删除会作用于浏览器原生书签树，而不是维护一份插件内部副本。备注、摘要、设置和 UI 状态等插件自有数据保存在 `chrome.storage.local`。

浏览器工具栏图标是启动入口。Bookmark Visualizer 会打开标准扩展 popup，用于快速保存当前页面；完整工作台仍可从 popup 打开。扩展不再接管浏览器默认新标签页。

## 功能特性

- 在独立的完整页面工作台中浏览浏览器原生书签文件夹树。
- 以卡片形式查看书签标题、URL、favicon 和备注 / 摘要区域。
- 按标题和 URL 搜索书签。
- 将书签卡片拖拽到文件夹，或在当前文件夹中拖拽调整顺序。
- 行内编辑书签标题、URL、备注和文件夹名称。
- 可从卡片右键菜单在当前卡片前后新建书签。
- 通过卡片右键菜单移动或删除书签。
- 可从左侧文件夹树或移动目标选择流程中新建文件夹。
- 可在左侧树中拖拽文件夹，将其移动为子级或同级。
- 支持从 toast 或会话操作日志撤销书签移动、编辑、备注修改和删除。
- 支持主题、卡片尺寸、侧栏宽度和树内书签显示设置。
- 通过工具栏 popup 快速保存当前网页。
- 可从 popup 打开完整工作台，继续进行深度书签管理。
- 在 popup 的“保存”Tab 保存当前网页；上一轮全局 Ctrl+S listener 路线已暂停。

## 预览

首个公开版本前会补充稳定维护的截图或演示 GIF。当前项目视觉识别使用 `public/icons/` 中的扩展图标。

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
5. 可按需固定扩展图标，然后点击工具栏图标打开保存 popup。
6. 打开普通浏览器新标签页时，会保留浏览器默认新标签页。

尝试移动、编辑或删除等真实修改书签的操作时，建议使用测试浏览器 Profile。

## 使用方式

- 在左侧文件夹树中选择文件夹，右侧会展示该文件夹的直接子书签。
- 如果希望在树中也显示书签条目，可以打开树内书签显示开关。
- 在搜索框输入关键词，按标题或 URL 搜索全局书签。
- 将书签卡片拖到可写文件夹上即可移动书签。
- 将书签卡片拖到当前文件夹中其他卡片前后即可调整顺序。
- 右键书签卡片可以编辑、新建相邻书签、移动或删除。
- 右键可写文件夹可以新建子文件夹或行内重命名。
- 支持操作后通过撤销提示或会话操作日志恢复部分操作。
- 在普通网页点击工具栏图标，可以打开 popup 的“保存”Tab，搜索文件夹、填写备注，并把当前网页保存为浏览器原生书签。
- 可从 popup 顶部或“管理”Tab 打开完整工作台，进行文件夹树编辑、拖拽整理和批量查看。

## 项目结构

```text
src/
  app/                 React 应用外壳和全局样式
  components/          共享 UI 组件
  features/            书签、搜索、元数据、拖拽、菜单、摘要、设置逻辑
  lib/chrome/          Chrome API adapter 和 mock 浏览器数据
public/
  manifest.json        Manifest V3 扩展 manifest
  icons/               扩展图标
docs/                  产品、架构、交互和验收文档
```

## 文档

- [需求说明](docs/01-requirements.md)
- [架构设计](docs/02-architecture.md)
- [界面设计](docs/03-ui-design.md)
- [数据与存储](docs/04-data-storage.md)
- [模块边界](docs/05-module-boundaries.md)
- [交互规则](docs/06-interactions.md)
- [测试与验收](docs/07-testing-and-acceptance.md)
- [路线图](docs/08-roadmap.md)
- [架构决策记录](docs/adr/)

## 路线图

- 文件夹删除流程。
- 紧凑列表视图，以及轻量排序和过滤控制。
- 元数据导入 / 导出。
- 摘要抓取仍属于后续能力；当前 popup 保存路径不请求全局 http/https 站点访问权限。
- 组件级 UI 测试。
- 首个公开版本打包和稳定截图维护。

## 许可证

当前尚未指定许可证。
