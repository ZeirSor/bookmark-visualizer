---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Frontend

本目录维护前端设计系统、组件模式、可访问性、active UI surfaces 和实施路线。

## Reading Order

1. [Design system](design-system.md)
2. [Surface alignment plan](surface-alignment-plan.md)
3. [Component patterns](component-patterns.md)
4. [Accessibility and interaction](accessibility-and-interaction.md)
5. [Frontend surfaces](surfaces/README.md)
6. [Implementation roadmap](implementation-roadmap.md)
7. [Documentation maintenance](documentation-maintenance.md)

## Active UI Surfaces

- Manager workspace: `index.html`, `src/app/App.tsx`.
- Toolbar popup: `popup.html`, `src/popup/PopupApp.tsx`.
- Optional New Tab: `newtab.html`, `src/newtab/NewTabApp.tsx`.

Page shortcut code is a non-rendered runtime helper. Quick Save is a save protocol/helper area, not a UI surface.

## Maintenance

Product behavior changes update `docs/product/`. Module or runtime boundary changes update `docs/architecture/`. Data/storage changes update `docs/data/`. Validation and acceptance changes update `docs/quality/`.
