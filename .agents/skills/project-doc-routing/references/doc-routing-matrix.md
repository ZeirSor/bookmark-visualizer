# Generic Documentation Routing Matrix

Use this reference with `project-doc-routing` after reading the repository profile.

## Generic Routing Rules

| Task signal | Prefer reading | Likely affected after work |
|---|---|---|
| Product behavior, requirements, scope, roadmap | Product / requirements docs from profile | Product docs, affected surface docs, README if public framing changes |
| UI surface, page, layout, component, CSS, accessibility | Surface docs and shared component docs from profile | Affected surface docs, shared UI docs, UI indexes |
| Data model, storage, persistence, metadata, migration | Data docs and architecture boundary docs from profile | Data docs, architecture docs, affected surface docs |
| Runtime boundary, service worker, API adapter, permission, manifest | Architecture docs, permission docs, runtime flow docs | Architecture docs, data docs, README if permissions or entry behavior change |
| Validation command, test setup, acceptance checklist | Validation docs and project validation profile | Validation docs, package scripts, workflow docs |
| Documentation structure, moved docs, stale paths | Docs index, documentation standards, project profile | Directory README files, root docs index, profile files, AGENTS if workflow changes |
| AI workflow, local skills, playbooks, run state | AI workflow profile, workflow docs, playbook docs | Workflow docs, playbooks, local skills, run template, profile |
| Review / audit | Narrow docs selected by the reviewed surface or subsystem | Usually none unless fixes are requested |

## Narrowing Heuristics

- Prefer a page-level or subsystem doc over a broad architecture doc when the task is local.
- Prefer architecture docs when the task changes ownership, boundaries, permissions, runtime APIs, or module dependencies.
- Prefer data docs when a change affects persisted state, schemas, migrations, imports, exports, or storage keys.
- Prefer README files only for public onboarding, install/build/test commands, top-level features, browser/platform support, permissions, or documentation navigation.
- Prefer ADRs only for durable decisions, not ordinary implementation details.
- When unsure, mark a doc as "likely affected" for maintenance rather than reading the whole docs tree up front.

## Missing Profile Fallback

If `.agents/project-profile/` is absent:

1. Inspect `AGENTS.md`, root README files, `docs/README.md`, and `package.json`.
2. List top-level docs directories and likely source roots.
3. Route conservatively to existing docs only.
4. Recommend creating a project profile before broad work.

## Documentation System Routing Additions

| Task signal | Prefer reading | Likely affected after work |
|---|---|---|
| Create docs system from scratch | `docs-system.md`, `project-doc-system-builder` references, base docs structure | `docs/README.md`, `_templates/`, `standards/documentation.md`, profile docs-system config |
| Migrate old docs structure | Documentation standard, migration rules, archive policy, current docs index | Moved docs, `_archive/`, README indexes, broken-link checks |
| Add new docs layer | `docs-system.md`, layer taxonomy, folder work modes | New layer README, root docs index, templates, profile docs-map |
| Add or change templates | `_templates/`, builder templates, documentation standard | Template index, docs-system profile, validation rules |
| Quality or validation docs | `quality/`, `validation.md`, validation command map | `quality/`, docs checks, workflow docs |
| Operations docs | `operations/`, setup/deploy/runbook docs | README, operations runbooks, public setup docs |
| Strategy or roadmap | `strategy/`, product requirements when needed | Strategy docs, product docs if scope becomes current |
| Collaboration docs | `collaboration/`, project-specific workflow docs | Collaboration README, review templates, role handoff docs |
| Presentation docs | `presentations/`, upstream source docs | Deck README files, slide briefs, upstream links |
