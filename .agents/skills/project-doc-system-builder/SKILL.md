---
name: project-doc-system-builder
description: Use to initialize, migrate, extend, and validate a repository's formal documentation system with portable references, templates, base docs resources, and scripts.
stage: bootstrap
follows: []
precedes:
  - project-doc-routing
  - project-doc-maintenance
---

# Project Doc System Builder

## Purpose

Use this skill when a repository needs a formal documentation system to be created, migrated, extended, audited, or repaired.

It answers:

- What documentation layers should this project have?
- Which folders and README files form the minimum viable documentation system?
- Which templates should be installed for future documents?
- Which existing documents should be moved, renamed, archived, or normalized?
- Which validation checks must pass before the documentation system can be considered ready?

This skill is for documentation system construction and structural maintenance. For routine post-implementation updates, use `project-doc-maintenance` after the documentation system already exists.

## Modes

Choose one mode before editing:

| Mode | Use when | Main output |
|---|---|---|
| `bootstrap` | A project has no formal `docs/` system or only a minimal README | Base docs tree, templates, standards, and validation script |
| `migration` | A project has existing docs that need to be aligned with the standard architecture | Moved/renamed docs, archive, indexes, metadata, validation report |
| `extension` | A project needs a new documentation layer or document type | New folder, README, template, profile mapping, index links |
| `audit-only` | The user asks for analysis without changes | Findings, recommended plan, validation gaps |

## Required Inputs

Read in this order when available:

1. `AGENTS.md`
2. `.agents/project-profile/docs-system.md`
3. `.agents/project-profile/docs-map.md`
4. `docs/README.md`
5. `docs/standards/documentation.md`
6. `references/documentation-system-architecture.md`
7. `references/doc-layer-taxonomy.md`
8. `references/doc-folder-work-modes.md`
9. `references/bootstrap-decision-tree.md`
10. `references/migration-rules.md`
11. `references/archive-policy.md`
12. `references/frontmatter-schema.md`
13. `references/naming-rules.md`
14. `references/validation-rules.md`
15. `references/base-docs-structure.md`

Use `resources/base-docs/docs/` as the portable starter documentation tree.

## Workflow

1. Inspect the repository root and existing `docs/` directory.
2. Classify the task mode: `bootstrap`, `migration`, `extension`, or `audit-only`.
3. Identify required and optional documentation layers from the project profile, falling back to `references/doc-layer-taxonomy.md`.
4. For bootstrap work, copy `resources/base-docs/docs/` with `scripts/create-doc-system.mjs`.
5. For migration work, apply `references/migration-rules.md` and move historical or superseded material according to `references/archive-policy.md`.
6. For extension work, add the new layer or document with `scripts/add-doc-layer.mjs` or `scripts/add-doc.mjs`.
7. Ensure every directory has `README.md`.
8. Ensure every Markdown file has valid minimum frontmatter.
9. Ensure file and directory names follow kebab-case unless a project profile explicitly allows another convention.
10. Update `docs/README.md` and directory README files so navigation reflects current structure.
11. Run `scripts/check-doc-system.mjs` against the resulting docs tree.
12. Report the exact changes, validation commands, and remaining limitations.

## Script Shortcuts

```bash
node .agents/skills/project-doc-system-builder/scripts/create-doc-system.mjs --target .
node .agents/skills/project-doc-system-builder/scripts/add-doc-layer.mjs --docs docs --layer api
node .agents/skills/project-doc-system-builder/scripts/add-doc.mjs --docs docs --type reference --scope api --name order
node .agents/skills/project-doc-system-builder/scripts/add-frontmatter.mjs --docs docs
node .agents/skills/project-doc-system-builder/scripts/archive-doc.mjs --docs docs --file docs/product/old-plan.md --reason "superseded"
node .agents/skills/project-doc-system-builder/scripts/check-doc-system.mjs --docs docs
```

## Completion Rule

Do not stop after structural edits until the relevant checks pass or the failure is documented as out of scope, pre-existing, or impossible to verify in the available repository.

Minimum required checks for edit mode:

- every directory has `README.md`;
- every Markdown file has frontmatter;
- active docs do not link to missing local Markdown files;
- archive docs are separated from active facts;
- required templates exist;
- required project profile fields are present when profile files are in scope.

## Output Format

```md
## Doc System Builder

Mode: <bootstrap | migration | extension | audit-only>

Changes made:
- `<path>` - <what changed>

Validation:
- `<command>` - <pass | fail | not run> - <notes>

Profile updates:
- `<path>` - <what changed or none>

Remaining gaps:
- <gap or none>
```

## Portability Rule

Keep product-specific paths, product names, platform details, and project-specific validation commands in `.agents/project-profile/`. Keep this skill portable by storing generic rules in `references/`, reusable starter files in `resources/base-docs/`, and reusable generators in `scripts/`.
