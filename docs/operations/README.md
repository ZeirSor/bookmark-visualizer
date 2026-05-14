---
type: guide
status: active
scope: operations
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Operations

Bookmark Visualizer 当前是本地浏览器扩展项目，没有服务端生产运维面。这里记录本地运行、构建和发布边界。

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run docs:check
npm run verify:popup-entry
npm run typecheck
npm test
npm run build
```

## Build Output

Vite build output goes to `dist/`. Browser loading and store packaging procedures should be documented here once release automation is formalized.

## Non-goals

- No server deployment runbook exists for the current project.
- No cloud infrastructure, database migration or production incident process is active.
