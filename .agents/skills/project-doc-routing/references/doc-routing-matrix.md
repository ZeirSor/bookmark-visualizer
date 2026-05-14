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
