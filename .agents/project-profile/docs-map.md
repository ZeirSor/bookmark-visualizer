# Project Documentation Map

This profile file contains Bookmark Visualizer-specific documentation structure. Portable skills should read this file instead of hard-coding these paths.

## Documentation Layers

| Knowledge type | Primary location |
|---|---|
| Product scope, behavior, roadmap | `docs/product/` |
| Architecture, runtime flow, module boundaries | `docs/architecture/` |
| Storage, metadata, persistence | `docs/data/` |
| Page-level UI and code chains | `docs/frontend/surfaces/` |
| Validation and QA | `docs/guides/` |
| Documentation standards | `docs/standards/` |
| AI development workflow | `docs/workflow/` |
| Reusable task execution manuals | `docs/playbooks/` |
| Durable decisions | `docs/adr/` |
| Public onboarding | `README.md`, `README.zh-CN.md` |

## Read Before Common Work

| Work type | Read before work |
|---|---|
| Product behavior / requirements | `docs/product/requirements.md`, `docs/product/interactions.md`, `docs/product/ui-design.md`, affected surface docs |
| Architecture / runtime boundaries | `docs/architecture/overview.md`, `docs/architecture/module-boundaries.md` |
| Data / metadata / storage | `docs/data/storage.md`, `docs/architecture/module-boundaries.md`, `docs/frontend/surfaces/shared/02-data-storage-and-chrome-api.md` |
| Manifest / permissions | `docs/architecture/overview.md`, `docs/product/requirements.md`, `README.md`, `README.zh-CN.md` |
| Testing / validation | `docs/guides/testing-and-acceptance.md`, `docs/workflow/validation-gate.md` |
| Documentation structure | `docs/README.md`, `docs/standards/documentation-maintenance.md`, `AGENTS.md` |
| AI workflow / playbooks | `AGENTS.md`, `.ai/README.md`, `docs/workflow/README.md`, `docs/workflow/ai-development-lifecycle.md`, `docs/workflow/run-folder-convention.md`, `docs/playbooks/README.md` |

## Likely Affected Docs

| Change type | Docs to check after work |
|---|---|
| Product behavior | `docs/product/requirements.md`, `docs/product/interactions.md`, affected surface docs |
| Product scope / roadmap | `docs/product/requirements.md`, `docs/product/roadmap.md`, README files if public description changes |
| Architecture / runtime / permissions | `docs/architecture/overview.md`, `docs/architecture/module-boundaries.md`, `docs/data/storage.md`, affected surface docs, README files if permissions or entry behavior change |
| Storage / metadata | `docs/data/storage.md`, `docs/architecture/module-boundaries.md`, `docs/frontend/surfaces/shared/02-data-storage-and-chrome-api.md`, affected surface docs |
| Testing / validation commands | `docs/guides/testing-and-acceptance.md`, `docs/workflow/validation-gate.md` |
| Documentation structure | `docs/README.md`, affected directory README files, root README documentation links, local skill references, `AGENTS.md` if workflow changes |
| AI workflow / local skills | `AGENTS.md`, `.ai/README.md`, `.ai/runs/_TEMPLATE/`, `docs/workflow/`, `docs/playbooks/`, `.agents/skills/`, `docs/standards/documentation-maintenance.md` |

## README Sync Rules

Update both `README.md` and `README.zh-CN.md` when a change affects:

- project identity or public product framing;
- extension entrypoints or launch behavior;
- Manager, Popup, Quick Save, or New Tab top-level behavior;
- browser support;
- manifest permissions or host permissions;
- installation, build, test, or loading commands;
- major user-facing features;
- repository structure or documentation entry links;
- screenshot, GIF, preview asset, or public roadmap claims.

Do not update root README files for small CSS polish, internal component refactors without behavior change, PageDocs-only corrections, worklogs, dev changelogs, or ADR-only changes.

## Current Public Framing

- Bookmark Visualizer is a Manifest V3 Chrome / Edge extension.
- The toolbar icon opens the popup.
- The popup supports current-page saving and links to the full manager workspace.
- The full manager workspace supports visual browsing, searching, editing, moving, and organizing native browser bookmarks.
- New Tab is optional and can be enabled from settings.
- Browser-native bookmarks remain the source of truth.
- Extension-only metadata and UI state live in `chrome.storage.local`.
