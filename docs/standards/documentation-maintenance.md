---
type: standard
status: active
scope: project
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Documentation Maintenance Standard

## Core Principle

`docs/` is the long-lived project knowledge base. Active documents must describe current facts or explicitly planned strategy. Historical records belong in `docs/_archive/`.

## Document Types

| Type | Use |
|---|---|
| `concept` | Background and explanation. |
| `guide` | Step-by-step task instructions. |
| `reference` | Stable paths, fields, commands and contracts. |
| `decision` | Accepted ADRs. |
| `strategy` | Planned future direction, not current implementation. |
| `standard` | Rules and conventions. |
| `workflow` | Human-readable process. |
| `playbook` | Reusable execution procedure. |
| `archive` | Historical or superseded content. |

## Required Frontmatter

Every Markdown document must start with:

```yaml
---
type: reference
status: active
scope: project
owner: project
last_verified: 2026-05-14
source_of_truth: true
---
```

Allowed `status` values: `active`, `planned`, `draft`, `deprecated`, `archived`.

## Directory README Rule

Every directory under active `docs/` must contain `README.md`. A directory README must define responsibility, reading order and maintenance triggers.

## Naming Rule

- Use semantic lowercase kebab-case filenames.
- Do not use `00-`, `01-`, `02-` prefixes to force reading order.
- Use README reading order instead of filename numbering.
- Keep names stable and descriptive: `runtime-flows.md`, not `phase-1-notes.md`.

## Archive Rule

Move historical documents to `docs/_archive/` before adding archive status. Do not leave old design documents beside active docs with only a warning banner.

Archived documents must include:

```yaml
status: archived
archived_reason: "superseded by current implementation"
archived_from: "docs/original/path.md"
current_source: "docs/current/source.md"
```

## Source-of-truth Rule

- Product behavior → `docs/product/`
- Runtime architecture and module boundaries → `docs/architecture/`
- Data ownership and storage → `docs/data/`
- UI surface implementation → `docs/frontend/surfaces/`
- Testing and validation → `docs/quality/`
- Future direction → `docs/strategy/` with `status: planned`
- AI execution process → `docs/workflow/` and `docs/playbooks/`

## Validation

Run:

```bash
npm run docs:check
```

The check excludes `docs/_archive/` and validates active Markdown structure, local links, path references, directory README coverage and semantic names.
