# Generic Documentation Maintenance Checklist

Use this checklist with the repository profile.

## Code Path Accuracy

- Every referenced file or directory exists, unless clearly marked planned, future, historical, or external.
- Renamed or moved paths are updated in all active docs selected by the profile.
- Deleted implementation paths are removed from active docs unless historically relevant.
- Entry files and source roots match current repository structure.

## UI / Surface Accuracy

- Entrypoint, page layout, component list, and shared component ownership match current code.
- Buttons, inputs, icons, menus, dialogs, empty states, and relevant interaction states are documented when maintainable knowledge changed.
- CSS selectors, design tokens, class names, and responsive behavior are current where docs track them.
- Keyboard and pointer behavior are documented when changed or user-facing.

## Data And State Accuracy

- Persisted keys, schemas, migrations, imports, exports, and compatibility notes match current code.
- Ownership of external/native data versus project-owned metadata is clear.
- UI docs are updated when data is displayed, edited, searched, saved, imported, or exported.

## Runtime / API Boundary Accuracy

- Permissions, manifests, adapters, message routes, service boundaries, or external API ownership match current code.
- Pure UI docs do not imply ownership of environment APIs unless that is intentional.
- Optional permissions or opt-in behavior are not documented as mandatory defaults.

## Product Behavior Accuracy

- Requirements describe current behavior, not planned behavior.
- Paused, deprecated, optional, or future behavior is clearly labeled.
- User-facing copy, default behavior, and settings behavior match implementation.

## README And Index Sync

- README files are updated only when profile rules say public onboarding or high-level understanding changed.
- Root docs indexes and directory README files link to added, moved, or renamed docs.
- Cross-links use valid relative paths from the current file.
- Image, GIF, and preview asset paths exist when referenced.

## Scope Control

- Prefer targeted edits over broad rewrites.
- Do not update unrelated docs just because they are nearby.
- Do not treat run folders, worklogs, or dev changelogs as formal product facts.
- Mark unresolved documentation gaps explicitly when they cannot be handled in the current task.
