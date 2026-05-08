# Shared Frontend Surface Docs

This directory documents UI, data, Chrome API, and interaction patterns shared across Bookmark Visualizer surfaces.

## Documents

- [Shared components](01-shared-components.md): reusable cross-surface React components and ownership rules.
- [Data, storage, and Chrome API](02-data-storage-and-chrome-api.md): shared runtime data and Chrome API flow notes.
- [Folder cascade menu](03-folder-cascade-menu.md): shared folder picker / cascade menu behavior.
- [Icons and UI primitives](04-icons-and-ui-primitives.md): shared icon, button, input, menu, card, toast, and primitive styling rules.

## Maintenance Trigger

Update this directory when:

- a component under `src/components/` changes;
- a shared folder picker, cascade menu, or move menu changes;
- shared design tokens change;
- multiple surfaces consume the same component or interaction pattern;
- a shared UI primitive gains or loses behavior.

If the shared change affects a specific surface, update that surface's docs too.
