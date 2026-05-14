---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Shared Frontend Surface Docs

This directory documents UI, data, Chrome API, and interaction patterns shared across Bookmark Visualizer surfaces.

## Documents

- [Shared components](shared-components.md): reusable cross-surface React components and ownership rules.
- [Data, storage, and Chrome API](data-storage-chrome-api.md): shared runtime data and Chrome API flow notes.
- [Folder cascade menu](folder-cascade-menu.md): shared folder picker / cascade menu behavior.
- [Icons and UI primitives](icons-ui-primitives.md): shared icon, button, input, menu, card, toast, and primitive styling rules.

## Maintenance Trigger

Update this directory when:

- a component under `src/components/` changes;
- a shared folder picker, cascade menu, or move menu changes;
- shared design tokens change;
- multiple surfaces consume the same component or interaction pattern;
- a shared UI primitive gains or loses behavior.

If the shared change affects a specific surface, update that surface's docs too.
