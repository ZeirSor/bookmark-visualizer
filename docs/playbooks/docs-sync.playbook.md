# Playbook: Docs Sync

## When To Use

Use this playbook when code, UI behavior, architecture, data, validation, or public onboarding has changed and formal docs need to be synchronized.

Also use it for documentation audits where the task is to find and fix stale paths, missing indexes, or inconsistent descriptions.

## Required Inputs

Read:

- `AGENTS.md`
- `docs/README.md`
- `docs/standards/documentation-maintenance.md`
- affected docs and directory README files;
- affected code files when syncing docs to code reality.

## Docs Sync Rules

- Treat current code as the source for implementation facts.
- Treat accepted ADRs as the source for durable decisions.
- Do not invent features that are not implemented.
- Mark future items as planned, not current.
- Do not copy temporary task progress into `docs/`.
- If a temporary run result becomes durable knowledge, move the durable part into the proper docs area.
- Update indexes when adding, moving, or renaming docs.

## Steps

1. Identify what changed and which docs are likely stale.
2. Check directory README files and cross-links.
3. Update only affected docs.
4. Update root README files only when public onboarding or high-level project understanding changed.
5. Check Markdown links and referenced code paths.
6. Record validation / link-check result in `test-log.md` when a run folder exists.
7. Leave handoff notes for unresolved documentation gaps.

## Common Targets

| Change | Docs to check |
|---|---|
| Product behavior | `docs/product/` |
| Architecture / permissions / runtime | `docs/architecture/`, `docs/adr/` |
| Storage / metadata | `docs/data/` |
| UI surface / CSS / components | `docs/frontend/surfaces/` |
| Validation commands | `docs/guides/`, `docs/workflow/validation-gate.md` |
| AI workflow | `AGENTS.md`, `.ai/README.md`, `docs/workflow/`, `docs/playbooks/`, `.agent/skills/` |
| Public onboarding | `README.md`, `README.zh-CN.md` |

## Non-Goals

This playbook does not write `.ai/logs/` or `.ai/dev-changelog/`. Those are historical records handled after docs synchronization when project rules trigger them.
