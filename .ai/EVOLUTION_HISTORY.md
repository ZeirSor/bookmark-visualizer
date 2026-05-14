# Bookmark Visualizer 项目深度演进史

时间范围：2026-04-30 至 2026-05-12  
性质：内部 AI 协作历史、工程复盘和下一阶段计划，不替代 `docs/`、ADR 或 README。  
主要依据：git 历史、`.ai/logs/`、`.ai/runs/`、`.ai/dev-changelog/`、`CHANGELOG.md`、`docs/adr/`、产品/架构/前端文档，以及少量外部 AI-assisted coding / vibe coding 方法论资料。

## 1. 项目总览

Bookmark Visualizer 是一个 Chrome / Edge Manifest V3 扩展。它以浏览器原生书签为结构数据源，用 React、TypeScript 和 Vite 实现多 surface 的书签管理体验：完整 Manager 工作台、Toolbar Popup 保存入口、可选 New Tab Portal、可选页面内快捷键 bridge，以及 2026-05-12 新增的 Dev Workbench / Chrome adapter mock layer。

当前真实状态可以概括为：

- Manager：负责完整书签管理，包括文件夹树、书签卡片、搜索、排序、备注、拖拽移动/重排、右键菜单、批量入口和操作日志。
- Toolbar Popup：当前主保存入口，默认打开 `popup.html` 的 Save Tab，承载保存当前网页、管理入口和常用设置。
- Optional New Tab：默认不接管浏览器新标签页，用户开启后通过运行时重定向到 `newtab.html`。
- Optional Page Shortcut Bridge：默认关闭；用户开启并授权 host permissions 后，通过轻量 content script 捕获页面 `Ctrl+S` / `Command+S` 并打开 toolbar popup，不渲染 overlay。
- Dev Workbench：通过 Vite dev server 与 mock Chrome adapter 让扩展场景更容易在开发环境中验证。

项目当前阶段已经从“快速功能爆发”转入“工业化治理 + 组件系统 + 验证体系补齐”。这不是简单的 UI polish 阶段，而是从多个方向收敛维护成本：入口收敛、设计 token 治理、PageDocs 同步、run folder 交接、验证门禁、mock/dev harness 和未来业务能力的边界定义。

一个关键判断是：这个项目的高风险不再主要来自“做不出功能”，而来自“功能越做越多后，AI、文档、CSS、组件、真实浏览器验证之间彼此漂移”。因此，后续成功的核心不是继续堆 feature，而是让每个新增 feature 都落在可维护的结构里。

## 2. 证据来源与解释边界

本文把信息分为两类：

- 已确认事实：来自 git commit、ADR、正式 docs、`.ai/logs/`、`.ai/runs/`、`CHANGELOG.md` 和当前仓库文件。
- 解释判断：对这些事实的阶段划分、思想总结、失败原因和方法论抽象。

主要本地证据：

- Git 历史显示 2026-04-30 初始化工程，2026-05-03/04 进入 Quick Save 和级联菜单高密度迭代，2026-05-08 建立文档工作流和 Manager refactor，2026-05-09 完成保存入口战略收敛，2026-05-11 进入设计系统组件基础，2026-05-12 继续修复 popup/newtab 并加入 Dev Workbench。
- `.ai/logs/` 记录了每轮工作，包括 2026-04-30 的初始化与基础 UI、2026-05-03/04 的 Quick Save 与 cascade menu、2026-05-08 的 workflow/run folder、2026-05-09 的 legacy save cleanup、2026-05-10/11 的 popup polish 和 UI system refactor。
- `.ai/runs/` 记录当前或可恢复任务状态，尤其是 `2026-05-08__manager-page-current-code-analysis`、`2026-05-09__legacy-save-surface-cleanup`、`2026-05-10__popup-final-ui-polish-plan`、`2026-05-10__ui-system-component-refactor-plan`。
- `docs/adr/` 记录关键架构决策：原生书签为真相源、本地 metadata、toolbar action、toggleable New Tab、local favicon cache、恢复 popup 主入口、删除 legacy 保存 surfaces。
- `docs/frontend/design-system.md` 和 surfaces reference docs 记录当前 token 分层、`src/design-system/` ownership、Button/IconButton/FormControls 迁移、hardcode policy 和 token exceptions ledger。

外部方法论只用于对照本项目经验，不用于替代本项目事实。本文引用的外部来源包括 GitHub 对 vibe coding 的解释、GitHub Copilot 的 plan/test/iterate 教程、Copilot coding agent 的 well-scoped task 建议、Tweag 的 agentic coding handbook，以及 Spec Kitty 的 spec-driven agent workflow。

## 3. 发展阶段总表

| 阶段 | 时间 | 核心产物 | 关键证据 | 成功 | 失败/教训 |
|---|---|---|---|---|---|
| 一：创世与防御性基建 | 2026-04-30 | React + TS + Vite + MV3、Chrome adapters、Mock 数据、Manager 基础、AGENTS.md、Undo/operation log | 初始 git commits、`.ai/dev-changelog/2026-04-30__dev-changelog.md`、ADR 0001/0003/0004/0005 | 快速有真实书签管理能力，同时保留 mock 开发路径 | 文档最初承载过多内容，后续证明 AI 协作必须更早分层 |
| 二：书签管理能力爆发 | 2026-04-30 至 2026-05-03 | 文件夹树、卡片、拖拽、重排、右键菜单、cascade move menu、inline edit | 多个 04-30/05-03 worklogs、CHANGELOG | 用户价值成型快，操作闭环完整 | hover、滚动、drop hit-test 等交互细节复杂度快速上升 |
| 三：Quick Save / Ctrl+S / 注入式 UI 探索 | 2026-05-03 至 2026-05-05 | Quick Save dialog、Shadow DOM、content script、shortcut、folder picker | 05-04 Quick Save logs、ADR 0007/0008、CHANGELOG | 证明“当前页快速保存”是核心需求 | 注入式 UI、快捷键优先级和权限模型维护成本高 |
| 四：Popup 与 New Tab 表面扩张 | 2026-05-05 至 2026-05-07 | toolbar popup Save tab、Settings、New Tab Portal、recent folders | git commits `fef4fca`、`1523c88`、`cd324cd`、roadmap/requirements | 入口更完整，扩展从单 Manager 变成多 surface 产品 | CSS、状态、组件语义在多 surface 间开始分裂 |
| 五：AI 工作流从日志到 Run | 2026-05-06 至 2026-05-08 | `.ai/runs/`、spec/plan/tasks/test-log/handoff、playbooks、local skills、docs:check | `.ai/README.md`、docs/workflow、docs/playbooks、05-08 logs | 长会话可恢复，任务边界更清晰 | 如果 run 不及时同步 docs，仍会形成另一层“临时真相” |
| 六：保存入口摇摆与战略收敛 | 2026-05-09 | independent save window、Save Overlay、restore popup、remove legacy save surfaces | ADR 0011/0012/0013/0014、legacy cleanup run | 敢删除高维护成本路线，回归浏览器原生 popup | 早期探索有价值，但若不及时停止会拖垮维护面 |
| 七：隐私、本地优先与 favicon cache | 2026-05-09 | IndexedDB local favicon cache、`_favicon` URL、local metadata | ADR 0010、newtab favicon run | 隐私和离线体验增强，减少第三方 favicon 依赖 | 浏览器真实环境 QA 仍不可完全由单元测试替代 |
| 八：设计系统与工程治理 | 2026-05-10 至 2026-05-11 | `src/design-system/`、Button/IconButton/FormControls、token governance、hardcode policy、token exceptions | UI system run、design-system docs、05-11 logs | 从“页面 CSS 打磨”转向“系统组件治理” | Card/Panel、Dialog/Drawer、Toast、FolderPickerCore、stories/visual regression 仍未完成 |
| 九：当前阶段与 Dev Workbench | 2026-05-12 | popup/newtab fixes、dashboard reliability refactor、Dev Workbench mock layer | git commits `7852f1d`、`525f7fa`、`7dd06e5`、`c031b6e`、`5e52ac1` | 开发反馈回路增强，真实扩展场景更易模拟 | 当前仍有未跟踪文档与已有代码改动，必须避免覆盖用户状态 |

## 4. 阶段一：创世与防御性基建

时间：2026-04-30  
关键词：技术栈、边界、mock、撤销、防误伤。

项目第一天完成了相当密集的基础建设：React + TypeScript + Vite + Manifest V3、`public/manifest.json`、`index.html` Manager 入口、书签树读取、卡片展示、主题设置、侧栏宽度、卡片尺寸、本地备注、操作日志和 undo。这个速度说明项目从一开始就不是“先做个静态 UI”，而是直接朝真实扩展能力推进。

更重要的是，第一天就确立了几条长期原则：

- `chrome.bookmarks` 是书签结构唯一真相源。
- `chrome.storage.local` 只保存 extension-owned metadata、settings、recent folders、UI state 等扩展数据。
- Chrome API 尽量收敛到 adapter 或环境边界。
- 真实书签变更必须有失败处理和撤销思路。

这些原则后来被 ADR 0003、ADR 0004、架构文档和 `AGENTS.md` 持续强化。它们给项目提供了一个“不会把数据层做歪”的底座。

### 任务内容

- 初始化 Manifest V3 扩展工程。
- 建立 Manager 工作台：左侧文件夹树、右侧卡片区、搜索、主题、尺寸、侧栏宽度。
- 添加 bookmark/storage/permissions adapter 和 mock bookmark data。
- 实现本地备注、书签移动、编辑、删除、操作日志与撤销。
- 添加项目级 `AGENTS.md`，把工程边界、文档要求和验证意图写进仓库。

### 思想

这一阶段的核心思想是“先建立不会伤数据的工程边界，再快速做功能”。书签管理扩展天然高风险，因为真实调用 `chrome.bookmarks` 会影响用户浏览器数据。项目没有把真实 API 调用散落在 UI 组件里，而是早早建立 adapter 和 mock path，这让后续开发可以在 Vite 环境中快速迭代，同时保留真实扩展环境的边界。

另一个思想是“撤销能力是 UX 的防线”。对书签移动、编辑、删除这样的操作，如果没有日志和恢复路径，任何 UI 误触都会变成用户信任问题。早期就做 operation log，说明项目不是只追求展示，而是在处理真实数据产品。

### 成功经验

- Mock adapter 让 UI 开发摆脱“每次都打包扩展再加载”的低效循环。
- 原生书签作为结构真相源，避免了自建书签数据库与浏览器状态分叉。
- 本地 metadata 的边界清晰，备注和设置不污染原生书签结构。
- 操作日志和 undo 让危险操作具备产品级容错。

### 失败与教训

- 初期文档承载比较集中，后续很快需要拆分为 `docs/product/`、`docs/architecture/`、`docs/data/`、`docs/frontend/surfaces/`、`docs/workflow/` 等层。
- 早期功能密度高，导致后续必须用 PageDocs 和 run folder 重新梳理“什么已完成，什么只是入口或占位”。
- 文档同步不是附属工作；在 AI 协作中，它直接决定下一轮 Agent 会不会误解当前系统。

## 5. 阶段二：书签管理能力爆发

时间：2026-04-30 至 2026-05-03  
关键词：Manager、拖拽、右键菜单、cascade menu、inline edit。

第二阶段的主线是把 Manager 从展示界面推到“可用的书签管理器”。这包括卡片打开、卡片拖拽到文件夹、文件夹树内书签点击定位、行内编辑标题/URL/备注、文件夹创建/重命名、右键菜单、删除确认、移动菜单、同父级排序、左侧树内书签前后插入等。

这阶段最重要的工程资产之一是级联菜单和 folder target selection。它起初服务于右键移动和 quick save folder picker，后来逐渐成为 Popup、Manager、Quick Save 等多个 surface 共享或需要统一的模式。

### 任务内容

- 书签卡片支持点击打开、行内编辑、右键操作、拖拽移动和重排。
- 文件夹树支持展开/折叠、选择、拖拽自动滚动、显示树内书签。
- Move menu 支持多级 cascade、recent folder、search、viewport-aware placement。
- 删除、移动、编辑进入 operation log，并尽量提供撤销。
- 逐步补齐测试和日志，尤其是 drag/drop、hover buffer、edge scrolling、drop indicator。

### 思想

这一阶段的思想更偏“先让真实工作流跑起来”。书签管理不是单个按钮，而是大量小交互的组合：拖拽目标、滚动区域、右键菜单、空状态、错误反馈、可撤销操作。项目选择了快速堆出真实交互，再通过日志和小修迭代打磨。

从 vibe coding 角度看，这一阶段很像“高流速探索”。AI 的优势是能迅速把多个交互拼出来；人的职责是不断把“看起来能用”的交互拉回真实边界：真实书签 API、可写文件夹、特殊顶层文件夹、长列表、失败回滚。

### 成功经验

- 真实功能优先带来了很强的产品感，Manager 很早就不是空壳。
- cascade menu、folder search、recent folders 等能力具有复用潜力。
- 用小 worklog 记录每次交互修复，留下了非常清晰的后续证据链。

### 失败与教训

- 菜单 hover buffer、submenu placement、edge scrolling 和 drag hit-test 的细节非常消耗精力。
- 交互越“顺手”，内部状态越复杂，必须尽早把纯逻辑和 UI shell 分离。
- 如果只靠页面 CSS 修每个 surface，后续一定会出现重复实现和状态缺口。

### 方法论沉淀

这一阶段证明：AI 很适合快速生成交互草案，但复杂交互必须拆成可测试的纯规则。比如 folder flatten/search/disabled-target、menu placement、drag target detection，这些都应从 UI 事件中抽出，进入 helper 或 core model，再由测试覆盖。

## 6. 阶段三：Quick Save / Ctrl+S / 注入式 UI 探索

时间：2026-05-03 至 2026-05-05  
关键词：当前页保存、Shadow DOM、content script、快捷键、权限。

Quick Save 是项目第一次认真处理“完整 Manager 之外的轻量入口”。用户想在当前网页上快速保存当前 URL、标题、备注和预览图，不希望进入完整管理页。这个方向非常正确，但实现路线经历了高成本探索。

早期方案偏注入式：通过 extension command 或页面快捷键触发 content script，在宿主页面中注入 Shadow DOM quick-save dialog。后续实现过 React Shadow DOM、自包含 IIFE bundle、folder browse panel、recent folders、inline create folder、read-only URL、拖拽 reposition 和 cascade menu。

### 任务内容

- Quick Save dialog 从 imperative DOM 演进为 React + Shadow DOM UI。
- `quick-save-content.js` 独立 bundle，避免 `chrome.scripting.executeScript(files)` 注入 Vite split chunks 的问题。
- 保存链路通过 background service worker 和 message router 创建原生书签，并保存 note / preview metadata。
- Folder picker 引入 default folder、recent folders、search、browse/cascade。
- 尝试 `Ctrl+S` / `Command+S` 作为当前页快捷保存入口。

### 思想

这一阶段的思想是“零跳出感”：用户不离开当前网页，也不点浏览器 toolbar，在页面内部完成保存。这是很有诱惑力的体验方向，尤其适合“看到一个页面，顺手保存”的场景。

但浏览器扩展不是普通 Web App。它有 host permissions、activeTab、scripting、browser shortcut precedence、content script lifecycle、Shadow DOM style isolation、宿主页面事件拦截等限制。越追求无缝，越容易和浏览器安全模型、宿主页行为发生冲突。

### 成功经验

- 确认“快速保存当前页”是项目核心价值之一。
- 建立了 popup/background save message protocol 的雏形。
- folder picker 和 cascade menu 的复用需求被充分暴露。
- 对 extension bundle 注入边界有了实战经验：content script 注入不能随意依赖 Vite chunk。

### 失败与教训

- 注入式 UI 的维护成本高于预期。Shadow DOM 可以隔离部分 CSS，但不能消除所有宿主页事件、层级、快捷键和权限问题。
- `Ctrl+S` 不是一个稳定可控的默认入口。浏览器或系统可能优先处理，用户也可能需要手动设置 extension shortcut。
- 默认请求广泛 host permissions 会破坏低权限和隐私策略。
- 复杂的 overlay UI 会复制 popup/manager 的组件和 CSS 维护成本。

### 方法论沉淀

这阶段最重要的教训是：沉浸式体验不应凌驾于平台原生边界。Chrome 扩展的“自然入口”是 toolbar action、popup、commands、runtime messaging 和 optional permissions。项目后来回归 toolbar popup，不是设计退步，而是平台适配成熟。

## 7. 阶段四：Popup 与 New Tab 的表面扩张

时间：2026-05-05 至 2026-05-07  
关键词：toolbar popup、Save Tab、Settings、New Tab Portal、多 surface。

当 Quick Save 的价值被确认后，项目把 toolbar popup 发展成一个更稳定的保存入口。Popup 不再只是打开 Manager 的跳板，而是拥有 Save / Manage / Settings 三个 tab 的轻量工作台。与此同时，New Tab Portal 被引入，提供网络搜索、本地书签建议、固定快捷方式、书签分组和轻量活动面板。

这使 Bookmark Visualizer 从“书签管理页面”变成“扩展产品”：它开始有多个入口、多个使用情境和多个 UI surface。

### 任务内容

- Toolbar action 从打开完整 workspace 改为打开 `popup.html`。
- Popup Save Tab 支持当前页 title/URL/note/preview/folder selection。
- Popup Manage Tab 提供完整管理页入口、最近保存、最近文件夹和快捷操作。
- Popup Settings Tab 管理默认保存位置、快捷键说明、界面偏好和可选 page shortcut。
- New Tab Portal 通过设置开关启用，默认不接管浏览器新标签页。
- New Tab 支持搜索引擎/类型、固定快捷方式、书签分组、最近活动和布局设置。

### 思想

这一阶段的思想是“入口分层”。Manager 负责深度管理，Popup 负责当前页保存和常用控制，New Tab 负责启动/搜索/轻量入口。三个 surface 各司其职，比一个页面承载所有功能更符合使用场景。

但表面扩张也带来第一个明显架构危机：同一个控件在 Manager、Popup、New Tab 里有不同 CSS、不同状态命名、不同 focus/hover/disabled 表现。视觉上看起来都能用，工程上却开始分叉。

### 成功经验

- Popup 成为真正有价值的默认入口，而不是简单跳转器。
- New Tab 使用运行时重定向而不是 manifest 静态覆盖，保留用户选择权。
- 保存当前页的逻辑逐渐从 overlay UI 中抽离为 popup/background message protocol。

### 失败与教训

- 多 surface 会指数级增加 CSS 和组件状态维护成本。
- 如果没有统一 token 和 primitives，每个 surface 的 polish 都会变成长期债务。
- PageDocs 必须记录每个 surface 的组件、CSS selector、状态和消息链路，否则未来修改很容易误伤。

### 方法论沉淀

这一阶段说明：产品 surface 可以扩张，但共享系统必须同步扩张。一个扩展项目即使代码量不大，只要有 Manager、Popup、New Tab、content bridge，就已经需要设计系统和 PageDocs，而不是靠“顺手复制 CSS”。

## 8. 阶段五：AI 工作流从日志到 Run

时间：2026-05-06 至 2026-05-08  
关键词：`.ai/runs/`、spec、plan、tasks、test-log、handoff、playbooks、validation gate。

2026-05-08 是项目 AI 工作流的分水岭。此前 `.ai/logs/` 已经记录了大量工作，但 log 只能说明“已经发生了什么”。当任务变复杂后，下一轮 Agent 还需要知道“现在应该从哪里继续、哪些任务完成、哪些验证失败、什么不能碰”。于是项目正式引入 `.ai/runs/`。

Run folder 约定每个复杂任务包含：

- `spec.md`：目标、范围、验收和约束。
- `plan.md`：实现路径、影响文件、风险和验证策略。
- `tasks.md`：可执行 checklist。
- `test-log.md`：命令、手动 QA、结果和失败。
- `handoff.md`：当前状态、下一步、阻塞和交接信息。

这套结构后来配合 `docs/workflow/`、`docs/playbooks/`、`project-run-orchestration`、`project-validation-gate`、`project-doc-routing`、`project-doc-maintenance` 等 local skills，形成可恢复的 AI-assisted development lifecycle。

### 任务内容

- 建立 `.ai/README.md`，明确 runs/logs/dev-changelog/docs/ADR 的分工。
- 建立 `docs/workflow/` 和 `docs/playbooks/`。
- 为 Manager 当前代码分析、search/sort/filter implementation、documentation path validation、P3 component decomposition 等创建 run folders。
- 引入 docs path validation，避免 active docs 引用不存在路径。
- 将项目本地 skills 与 playbook routing 对齐。

### 思想

这一阶段的思想是“对抗 AI 协作熵增”。AI 很擅长在一个上下文里高速推进，但长会话天然会忘记细节、误判已完成状态、把临时任务状态当长期事实。Run folder 把任务状态放回仓库，减少“只有聊天记录知道”的风险。

这与外部方法论高度一致。GitHub Copilot coding agent 文档强调任务要 well-scoped，要有清晰问题、验收标准和可能的文件方向；GitHub 的 vibe coding 教程也把 research、planning、building、testing、iterating 分开处理。Spec Kitty 这样的 spec-driven workflow 也明确把 product intent 转成 `spec -> plan -> tasks -> next -> review -> accept -> merge` 的 repo-native 工作包。本项目的 run folder 是同一类思想的本地化版本。

### 成功经验

- 复杂任务可以跨轮恢复，不再依赖聊天上下文。
- `test-log.md` 让“没跑完/被环境阻塞”的验证状态不会被遗忘。
- `handoff.md` 明确下一步，减少新 Agent 从头摸索。
- Playbooks 让 feature、bugfix、docs sync、review、UI refactor 有不同执行手册。

### 失败与教训

- Run folder 不能替代正式 docs。临时任务中的长期事实必须同步到 `docs/` 或 ADR。
- 如果任务拆得太大，run folder 仍然会变成“计划坟场”。任务必须小到能实现、验证、记录。
- 每次停下都要更新 handoff，否则 run folder 也会失去可恢复性。

### Vibe coding 经验

这一阶段把项目从“vibe coding”转成“结构化 agentic coding”。AI 仍然负责提速、探索和生成初稿，但人和项目规则负责：

- 目标是否清楚；
- 范围是否过大；
- 是否需要 ADR；
- 是否完成验证；
- 是否把临时发现同步到长期文档；
- 是否记录阻塞和下一步。

换句话说，AI 不是项目记忆；仓库才是项目记忆。

## 9. 阶段六：保存入口摇摆与战略收敛

时间：2026-05-09  
关键词：independent save window、Save Overlay、toolbar popup、ADR 0011/0012/0013/0014、删除。

2026-05-09 是项目架构判断最密集的一天。保存入口经历了多次方向变化：

1. 使用独立保存小窗口作为主保存入口（ADR 0011）。
2. 使用内容脚本 Save Overlay 作为主保存入口（ADR 0012）。
3. 恢复 toolbar popup 作为主保存入口（ADR 0013）。
4. 删除 legacy 保存入口并保留可选页面快捷键 bridge（ADR 0014）。

这看起来像摇摆，但从工程史角度看，它是项目从“追求理想体验”到“接受平台约束”的成熟过程。

### 任务内容

- 实现过独立 `save.html` / `src/save-window/` 保存窗口。
- 现代化过 save window UI。
- 恢复 toolbar popup 主入口，重新验证 `action.default_popup = "popup.html"`。
- 删除 `save.html`、`src/save-window/`、`src/features/save-overlay/`、legacy QuickSaveDialog 和相关 background handlers。
- 保留 `src/features/quick-save/` 作为 popup/background save protocol/helper namespace。
- 新增 `src/features/page-shortcut/` 和 `src/background/pageShortcutHandlers.ts`，让可选 page shortcut 只打开 popup，不渲染 overlay。

### 思想

这一阶段的思想是“战略收敛”。项目承认 Chrome 扩展生态中，稳定、低权限、可维护的入口比高沉浸但脆弱的注入式入口更重要。

这里最值得记录的不是“最终选择了 popup”，而是“删除了已经投入大量精力的旧路线”。很多项目会因为 sunk cost 保留旧代码，导致未来 Agent 不断误入 legacy path。本项目通过 ADR 0014 和 legacy cleanup run 明确删除旧 UI surfaces，保留业务 protocol，这是一种非常健康的架构治理。

### 成功经验

- Popup 成为唯一当前保存 UI，降低用户心智和代码维护成本。
- Optional page shortcut bridge 保留“页面内触发”的可能性，但默认关闭并遵守 optional host permissions。
- 删除旧 artifacts 后，通过 source assertions 和 build artifact assertions 防止 legacy save surfaces 回流。
- README、architecture、requirements、PageDocs、local skills 和 validation references 同步更新。

### 失败与教训

- 保存入口早期探索过多，导致短时间内出现多条路线并存。
- Independent window 和 Save Overlay 虽然有体验亮点，但会引入额外入口、额外 bundle、额外 CSS 和额外真实浏览器 QA。
- 决策文档必须跟上，否则未来看到旧 ADR 或旧代码会误判当前方向。

### 方法论沉淀

架构能力不是“永远选择第一个方案”，而是“能在证据出现后及时改变方向”。在 AI-assisted 项目里，这一点更重要，因为 AI 很容易沿着已有代码继续扩写。删除和收敛需要更明确的文档、ADR 和验证。

## 10. 阶段七：隐私、本地优先与 favicon cache

时间：2026-05-09  
关键词：ADR 0010、IndexedDB、browser `_favicon`、local-first。

在入口收敛之外，2026-05-09 还完成了一个长期价值很高的改动：local favicon cache。项目不再依赖第三方 favicon 服务，而是通过浏览器官方 `_favicon` URL 和 IndexedDB cache 提供站点图标。

这与项目长期原则一致：原生书签结构归 `chrome.bookmarks`，extension-owned metadata 归本地 storage / IndexedDB，尽量避免默认外部服务依赖。

### 任务内容

- 建立 `src/features/favicon/*`，负责 favicon URL 归一化、`_favicon` URL 构建、IndexedDB cache 和 stale-while-refresh 策略。
- 共享 UI 通过 `SiteFavicon` / `useSiteFavicon()` 消费，不在各页面组件中拼远程 favicon URL。
- ADR 0010 记录本地 favicon cache 的长期决策。
- New Tab 和 Manager 逐步接入该能力。

### 思想

这一阶段的思想是“隐私默认正确”。书签本身是高度个人化数据，如果每个 favicon 都发往第三方服务，会破坏用户对本地扩展的信任。即使第三方服务很方便，也不应成为默认路径。

### 成功经验

- 本地 cache 提升隐私和性能。
- 统一 favicon feature ownership，避免组件各自拼 URL。
- ADR 把“为什么不用第三方 favicon 服务”记录下来，避免未来回退。

### 失败与教训

- 浏览器 `_favicon` 行为和 IndexedDB cache 仍需要真实 Chrome / Edge QA。
- 图标属于视觉细节，但它牵涉隐私、网络请求和缓存策略，不能当成纯 UI 小事。

## 11. 阶段八：设计系统与工程治理

时间：2026-05-10 至 2026-05-11  
关键词：`src/design-system/`、tokens、Button、IconButton、FormControls、hardcode policy、token exceptions。

进入 2026-05-10 后，项目开始处理之前多 surface 扩张留下的 UI 债务。Popup 最终 UI polish 先把 toolbar popup 收敛到 720x600 full-bleed shell、sticky footer、vertical Save flow、Manage cards、Settings rows 等；随后 UI system component refactor run 把治理提升到系统层。

当前设计系统的核心成果：

- `src/design-system/` 成为共享 UI-system ownership path。
- `src/styles/tokens.css` 仍是 CSS token 来源。
- Token 分为 raw、semantic、component、surface alias 四层。
- `Button`、`IconButton` 已有 runtime primitives 并迁移到至少两个 surface。
- `Input`、`Textarea`、native `Select` 已有 runtime primitives，迁移了 Popup SaveTab 和 New Tab 部分低风险表单行。
- `Switch` 仍是 contract-only。
- 已建立 component-token groups：Button、IconButton、Input、Card、Panel、Dialog、Drawer、Menu、Toast、Chip。
- 已建立 `css-hardcode-policy.md` 和 `token-exceptions.md`，把 raw visual values 纳入治理。

### 任务内容

- Popup UI polish：shell sizing、safe area、sticky footer、topbar buttons、tooltip strategy、Manage card grid、Settings section rows。
- UI system run：component inventory、token audit、component state matrix、duplicated page CSS primitive inventory。
- `src/design-system/` skeleton 和 primitives export。
- Button/IconButton contracts and migration。
- FormControls contracts and runtime migration。
- PageDocs/reference docs 同步 token ownership、hardcode policy、exceptions、component state matrix。

### 思想

这一阶段的思想是“工程美学”。项目不再满足于“页面看起来差不多”，而是要求视觉值、状态、组件语义和文档都能被维护。硬编码颜色、半径、阴影、z-index、motion 不是立刻全部禁止，而是通过 policy 和 exception ledger 管起来：哪些是 token，哪些是允许的结构值，哪些是 provisional exception。

这是一种务实治理，而不是形式主义。项目没有强行一次性重写所有 CSS，而是先建立 inventory，再定义 ownership，再迁移低风险 primitives。

### 成功经验

- 先做 inventory，避免盲目抽象。
- 先做 Button/IconButton/FormControls，再处理 Card/Panel/Dialog/Drawer，顺序合理。
- token exceptions ledger 承认现实复杂性，同时防止例外失控。
- PageDocs 同步让 UI ownership 从代码扩展到维护知识。

### 失败与教训

- `src/components/`、surface CSS 和新 `src/design-system/` 仍处于迁移期，短期内复杂度会上升。
- 如果没有 stories 或 visual regression，新 primitives 可能只是在代码上统一，视觉和状态仍可能漂移。
- Manual/headless visual QA 在当前环境多次受限，不能把 automated typecheck/docs check 当成完整 UI 验收。

### 当前未完成

`/.ai/runs/2026-05-10__ui-system-component-refactor-plan/tasks.md` 显示，当前下一步是：

- `2.7` Define `Card` / `Panel` contracts。
- `2.8` Migrate at least one Popup card and one New Tab panel。
- 后续还有 Dialog/Drawer、Toast、EmptyState/Skeleton/Spinner/SiteIcon、FolderPickerCore、Manager/Popup/New Tab refactor、Storybook/Ladle、visual regression、AI workflow hardening。

这说明项目还没有完成设计系统，只是完成了关键开端。

## 12. 阶段九：2026-05-12 当前阶段

时间：2026-05-12  
关键词：behavior fixes、reliability refactor、Dev Workbench、未跟踪状态。

截至 2026-05-12，git 历史中最新几项工作显示项目正在同时推进可靠性、交互修复和开发体验：

- `fix(popup): close location picker on Escape instead of closing window`
- `fix(popup): expand location picker by default, add setting tooltips, fix cascade z-index`
- `fix(popup,newtab): enforce note limit, require title, reset search activeIndex on filter change`
- `refactor(newtab,dashboard): replace querySelector focus with forwardRef, allSettled batch delete, fix resize leak`
- `feat(dev): add Dev Workbench — Vite dev server + Chrome adapter mock layer`

这些改动很有代表性：

- Popup 正在补齐真实使用中的细节：Escape 行为、默认展开、tooltip、z-index。
- New Tab / dashboard 正在减少脆弱 DOM 查询，修复 batch delete 和 resize leak。
- Dev Workbench 表明项目意识到“扩展开发反馈回路”本身需要工具，而不只是靠 Chrome 手动加载。

### 当前工作区状态

执行计划前观察到：

- `.ai/EVOLUTION_HISTORY.md` 是未跟踪文件。
- `src/dev/devScenarios.ts` 已有修改。

本轮演进史实现必须只更新 `.ai/EVOLUTION_HISTORY.md`、本 run folder 和本轮 `.ai/logs/`，不得覆盖 `src/dev/devScenarios.ts` 的现有修改。

### 当前阶段判断

项目现在不是单纯 MVP 阶段，也不是纯重构阶段，而是“产品可用性 + 工程系统化”并行阶段。后续最容易犯的错有两个：

- 继续新增业务功能，但绕开设计系统、PageDocs 和 validation gate。
- 只做设计系统抽象，却不完成真实 surface migration 和 manual QA。

正确节奏应是：一个小批次完成一个可验证的组件/模式迁移，再同步 docs/run/log，并把真实浏览器 QA 缺口明确保留。

## 13. Vibe Coding 方法论总结

本项目不是“无脑 vibe coding”，而是逐步演化成“结构化 agentic coding”。

GitHub 对 vibe coding 的定义强调自然语言描述、快速迭代、AI 生成草案、人类继续塑形，并提醒过度依赖会带来质量、一致性、维护和安全风险。这个定义与项目早期很贴近：大量功能确实通过自然语言驱动快速成型。但 Bookmark Visualizer 的经验也说明，一旦进入真实数据、浏览器权限、多 surface UI 和长期维护，单纯“跟着感觉迭代”不够。

### 本项目的有效循环

1. 先探索：读取当前代码、docs、ADR、logs、runs，而不是凭记忆改。
2. 再计划：复杂任务进入 run folder，写 spec/plan/tasks。
3. 小步执行：一次只做一个 unchecked task 或一个小批次。
4. 验证记录：typecheck/test/build/docs:check/manual QA 能跑就跑，不能跑就写入 `test-log.md`。
5. 同步事实：产品/架构/UI/data 事实进入 `docs/` 或 ADR，过程进入 `.ai/logs/`，下一步进入 `.ai/runs/`。
6. 删除旧路：当方向收敛后，删除 legacy surfaces，避免 AI 继续沿旧路径扩写。

### 与外部方法论的对应

- GitHub vibe coding 文章强调 AI 能把自然语言转为代码，但人仍要 review、test、shape output；本项目的 adapter、ADR、docs:check、validation gate 就是 human-in-loop 的工程化形式。
- GitHub Copilot vibe coding 教程把 research、planning、building、testing、iterating 拆开，并建议每个成功迭代 commit；本项目把类似节奏落在 `.ai/runs/` 和 git/worklog 中。
- GitHub Copilot coding agent best practices 强调 clear problem、acceptance criteria、which files may change；本项目的 `spec.md`、`plan.md`、`tasks.md` 正在承担这些职责。
- Tweag agentic coding handbook 强调结构比速度更长久，AI 是 collaborator 不是 replacement；本项目从 05-08 开始的 workflow 革命正是这个转向。
- Spec Kitty 的 `spec -> plan -> tasks -> next -> review -> accept -> merge` 和本项目 run folder 高度相似，说明 repo-native 工作包是 AI coding 从玩具走向长期项目的重要模式。

### 本项目自己的方法论句子

- 日志记录过去，run folder 管未来，docs/ADR 管长期事实。
- AI 可以快，但不能替代验收。
- 如果一个事实会影响下一位开发者，就不要只把它留在聊天记录里。
- 如果一个旧入口会误导未来 Agent，就删除它或在 ADR 中明确废弃。
- 如果一个 UI 模式出现三次，就应该考虑 primitive/pattern/token，而不是继续复制 CSS。

## 14. 成功经验

### 14.1 Adapter / Mock-first development

从第一天建立 Chrome API adapter 和 mock data，是项目能高速迭代的关键。它让 Vite dev 环境可以展示和交互，不必每次加载扩展。2026-05-12 的 Dev Workbench 进一步把这个经验产品化：开发扩展也需要自己的开发 surface。

### 14.2 Local-first privacy

项目始终把浏览器原生书签作为结构数据源，把备注、设置、recent folders、preview metadata、favicon cache 放在本地 storage / IndexedDB。这个边界保护隐私，也减少云端同步尚未成熟时的数据一致性风险。

### 14.3 ADR-based architecture memory

ADR 记录了技术栈、数据源、入口、New Tab、favicon cache、保存入口恢复和 legacy 删除等决策。尤其是 ADR 0011-0014，把保存入口的摇摆和最终收敛记录下来，避免未来只看到代码结果而不知道为什么。

### 14.4 Run-folder recovery

`.ai/runs/` 让复杂任务能跨轮继续。UI system refactor 的任务清单非常长，如果没有 `tasks.md`、`test-log.md`、`handoff.md`，后续 Agent 很难知道从 `2.7 Card/Panel contracts` 继续，而不是乱改 Manager。

### 14.5 PageDocs and docs:check

PageDocs 把 UI surface 的组件、selector、状态和数据链路写清楚。`npm run docs:check` 则把路径引用错误变成可检查问题。这对 AI 项目尤其重要，因为 AI 很容易引用旧路径。

### 14.6 Deletion as architecture cleanup

删除 Save Overlay、independent save page 和 legacy QuickSaveDialog，是项目一次成熟的“断舍离”。这比继续兼容所有旧入口更有长期价值。

## 15. 失败与教训

### 15.1 注入式 UI 和快捷键拦截成本高

Quick Save overlay 证明页面内保存体验很诱人，但宿主页干扰、Shadow DOM、快捷键优先级、host permissions 和 bundle 注入都让成本上升。最终保留 optional bridge、回归 popup 是正确收敛。

### 15.2 `spawn EPERM` 反复阻塞验证

多轮 logs/runs 显示 `npm run test`、`npm run build` 经常在 sandbox 中被 Vite/esbuild `spawn EPERM` 阻塞，需要提升权限或记录例外。这不是产品 bug，但它会影响验证可信度。未来应继续把这种环境限制写入 `test-log.md`，并尽量建设不依赖脆弱环境的检查路径。

### 15.3 Manual Chrome / Edge QA 缺口长期存在

许多 extension 行为无法只靠 unit tests 覆盖：toolbar action、popup 尺寸、shortcut、optional host permissions、content script registration、New Tab redirect、favicon `_favicon` behavior。当前多轮 handoff 都记录真实浏览器 QA 未完成。这是发布前最大风险之一。

### 15.4 Surface CSS drift

Manager、Popup、New Tab 在功能爆发期各自打磨，导致 hardcoded colors/radii/shadows/z-index/motion、focus rings、menu states 等分裂。UI system run 已经开始治理，但迁移尚未完成。

### 15.5 Visible placeholders 容易制造产品事实错觉

Manager 里曾有排序、筛选、收藏、未读等占位入口；如果文档或 UI 没有明确 disabled/planned，很容易让用户和 Agent 误以为业务能力已完成。后续所有占位必须有 disabled reason 或 coming-soon pattern。

### 15.6 大型 UI refactor 必须分阶段

设计系统不能靠一次大重写完成。先 inventory，再 tokens，再 primitives，再 patterns，再 surface migrations，再 stories/visual regression，是更稳的路线。否则只是把重复 CSS 搬到另一个目录。

## 16. 当前风险

### P0 / 发布前风险

- Real Chrome / Edge manual QA 在多个 run 中仍未完成，尤其是 Popup save、optional page shortcut、New Tab redirect、favicon、popup visual fit。
- UI system migration 处于中段，`src/components/`、surface CSS 和 `src/design-system/` 并存，容易出现重复 ownership。
- `src/dev/devScenarios.ts` 当前已有未提交修改，后续任务必须先看 diff，避免覆盖用户或前一轮工作。

### P1 / 维护风险

- Manager 仍有 pending business features：tags、starred/unread、batch move、batch delete undo、import/export UI、duplicate detection、trash/soft-delete、persistent operation log。
- New Tab search / keyboard semantics 仍需补齐：empty submit、Esc behavior、suggestion navigation、recent tab semantics。
- Popup final polish run 中 T020/T025 bottom scroll visual QA 仍未完成。
- Card/Panel、Dialog/Drawer、Toast、FolderPickerCore 等共享模式未落地，后续 surface work 仍可能复制局部实现。

### P2 / 方法风险

- 如果 `.ai/logs/`、`.ai/runs/`、`docs/` 三层边界被混用，未来文档会再次变成不可信状态。
- 如果外部 vibe coding 方法论被照搬，而不是映射到本项目已有机制，会产生漂亮但无用的流程话术。
- 如果每轮只写 worklog、不更新 active run handoff，下一轮仍会断线。

## 17. 下一步计划清单

### Immediate

1. 完成 UI system run 的 `2.7 Card/Panel contracts`。
   - 原因：Card/Panel 是 Popup、New Tab、Manager 都大量使用的视觉容器；不先统一，后续页面 refactor 仍会复制 panel/card CSS。
2. 在可用环境中补 Popup manual/visual QA，尤其是 Save/Manage/Settings 720x600、bottom scroll、SaveLocationPicker、DefaultFolderMenu。
   - 原因：Popup 是当前主保存入口，发布风险最高。
3. 验证 Dev Workbench smoke path。
   - 原因：Dev Workbench 是降低未来扩展开发摩擦的新基础设施，必须确认 mock adapter 场景稳定。
4. 检查当前 dirty worktree，明确 `src/dev/devScenarios.ts` 修改归属。
   - 原因：避免后续任务误覆盖未提交工作。

### Near-term

1. 完成 Dialog/Drawer/Toast primitives。
   - 原因：这些是 Manager、New Tab、Popup 反馈和确认流程的核心 shell。
2. 建立 FolderPickerCore。
   - 原因：folder search、recent folders、disabled target、long names、selected state 在 Popup/Manager 中重复出现。
3. 继续 Manager placeholder replacement。
   - 原因：可见但未实现的入口会误导用户和 Agent。
4. 补 New Tab keyboard/search state。
   - 原因：New Tab 是键盘高频 surface，搜索建议和 tab semantics 需要更强可访问性。

### Mid-term

1. 选择 Storybook 或 Ladle，并建立 component workbench。
   - 原因：没有 stories，组件状态矩阵很难长期执行。
2. 建立 visual regression strategy。
   - 原因：设计系统迁移最容易引入“类型通过但视觉错位”的问题。
3. 接入 import/export UX。
   - 原因：数据可迁移是 local-first metadata 的长期可靠性要求。
4. 实现 duplicate detection。
   - 原因：书签管理器的高价值增强能力，适合在 Manager 基础稳定后推进。
5. 完成 batch move / batch delete polish。
   - 原因：批量能力对大量书签用户非常重要，但必须和 undo/metadata 规则一起设计。

### Long-term

1. 演进 metadata model。
   - 原因：当前以 bookmarkId 为 key 的 metadata map 足够 MVP，但 tags、trash、activity、sync、import/export 都需要更稳定模型。
2. 仅在 local-first core 稳定后考虑 cloud/Notion/subscription。
   - 原因：云端化会引入账号、同步冲突、隐私、订阅和数据迁移问题；过早加入会放大复杂度。
3. 形成发布前 extension QA checklist。
   - 原因：Chrome / Edge extension 行为必须通过真实浏览器 profile 验证，不能只靠 Vite/Vitest。

## 18. 可优化内容

### 18.1 验证环境

- 为 Vite/esbuild `spawn EPERM` 建立明确的 troubleshooting note 或本地验证脚本。
- 将“需要真实浏览器验证”的项集中成 release checklist，而不是散落在多个 handoff。
- Dev Workbench 后续可承担更多 popup/newtab/manager scenario smoke tests。

### 18.2 文档分层

- `.ai/EVOLUTION_HISTORY.md` 适合保留为历史复盘，但当前实现事实仍应以 `docs/` 和 ADR 为准。
- 对“下一阶段计划”应避免复制到多个位置；真正执行时应进入对应 run folder。
- 长期方法论如果稳定，可考虑沉淀到项目级 `AGENTS.md` 或 repo-local skill，而不是只留在演进史。

### 18.3 UI 系统

- 尽快完成 Card/Panel，因为它是下一批 migration 的基础。
- token exceptions 应周期性复查，不能让 provisional exceptions 永久化。
- 所有新 primitives 都应有状态矩阵、docs、至少临时 story/example。

### 18.4 产品能力

- Manager 的排序/备注筛选已落地，后续应优先处理真实高价值任务：duplicate detection、batch move、import/export、soft delete。
- New Tab 应聚焦搜索体验和快捷方式，不应变成第二个 Manager。
- Popup 应继续保持轻量，不要再引入复杂 overlay/window 路线。

## 19. 项目阶段结论

Bookmark Visualizer 在 2026-04-30 到 2026-05-12 的演进，可以概括为四次跃迁：

1. 从静态扩展壳到真实书签管理器。
2. 从单 Manager 到多 surface 产品。
3. 从自由 AI 迭代到 run-folder 驱动的结构化协作。
4. 从页面级 UI 打磨到设计系统和治理体系。

这个项目最有价值的经验不是某个具体组件，而是它逐步建立了一套“AI 可以高速参与，但项目不会失忆”的机制：ADR 记决策，docs 记当前事实，runs 记下一步，logs 记历史，tests/build/docs:check/manual QA 记证据。

后续真正的考验是把这套机制坚持下去。只要继续做到小步执行、及时验证、文档同步、敢删旧路，Bookmark Visualizer 就能从一个快速成型的 AI-assisted extension，继续演进成可长期维护的本地优先书签工作台。

## 20. 来源与参考

### 本地来源

- `git log --date=short --pretty=format:"%ad %h %s"`：项目提交时间线。
- `.ai/dev-changelog/2026-04-30__dev-changelog.md`：第一天功能、文档和注意事项汇总。
- `.ai/logs/`：2026-04-30 至 2026-05-11 的每轮工作记录。
- `.ai/runs/2026-05-08__manager-page-current-code-analysis/`：Manager 当前能力与 future task 分析。
- `.ai/runs/2026-05-09__legacy-save-surface-cleanup/`：保存入口收敛与 legacy surfaces 删除。
- `.ai/runs/2026-05-10__popup-final-ui-polish-plan/`：Popup 720x600 shell 和视觉 polish 状态。
- `.ai/runs/2026-05-10__ui-system-component-refactor-plan/`：设计系统迁移主线和当前 `2.7 Card/Panel` 下一步。
- `CHANGELOG.md`：Unreleased 功能变化。
- `docs/adr/README.md` 和 ADR 0001-0014：长期架构决策。
- `docs/product/requirements.md`、`docs/product/roadmap.md`：当前产品事实和后续能力。
- `docs/architecture/overview.md`：当前 MV3 架构、入口、权限和链路。
- `docs/frontend/design-system.md`：当前设计系统、token、component ownership。

### 外部来源

- [GitHub, What Is Vibe Coding?](https://github.com/resources/articles/what-is-vibe-coding)：用于定义 vibe coding 的自然语言迭代、人类塑形和风险边界。
- [GitHub Docs, Vibe coding with GitHub Copilot](https://docs.github.com/en/copilot/tutorials/vibe-coding)：用于对照 research、planning、building、testing、iterating 的工作节奏。
- [GitHub Docs, Get the best results from Copilot coding agent](https://docs.github.com/en/copilot/tutorials/cloud-agent/get-the-best-results)：用于对照 well-scoped tasks、acceptance criteria 和 planning before implementation。
- [Tweag, Agentic Coding at Modus vs Vibe Coding](https://github.com/tweag/agentic-coding-handbook/blob/main/VIBE_CODING.md)：用于对照“AI 是 collaborator，不是 replacement”和结构化流程的价值。
- [Spec Kitty](https://github.com/Priivacy-ai/spec-kitty)：用于对照 repo-native `spec -> plan -> tasks -> review` 工作包模式。
