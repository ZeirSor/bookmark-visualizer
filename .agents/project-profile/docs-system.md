# Documentation System Profile

This file configures the repository's formal documentation system for `project-doc-system-builder`, `project-doc-routing`, `project-doc-maintenance`, and `project-validation-gate`.

## Roots

```yaml
docs_root: docs
archive_root: docs/_archive
templates_root: docs/_templates
standards_doc: docs/standards/documentation.md
root_index: docs/README.md
```

## Required Baseline Layers

```yaml
required_layers:
  - _archive
  - _templates
  - product
  - strategy
  - architecture
  - adr
  - standards
  - guides
  - quality
  - operations
```

## Conditional Layers

Enable these only when the project has durable content for them:

```yaml
conditional_layers:
  api: "stable interfaces, public contracts, service boundaries, SDKs, or cross-layer API agreements"
  data: "schemas, persisted entities, storage keys, migrations, or dictionaries"
  collaboration: "role boundaries, review requests, handoff contracts, or repo-local collaborator workflows"
  presentations: "decks, slide briefs, demos, or presentation assets maintained in the repository"
  frontend: "UI surface docs that require more detail than architecture/frontend"
  backend: "backend service docs that require more detail than architecture/backend"
  infra: "infrastructure topology, provisioning, or platform operations"
  mobile: "mobile platform-specific behavior, build, or release docs"
  ml: "models, datasets, evaluation, or training workflows"
```

## Required Templates

```yaml
required_templates:
  - archive.md
  - api-domain.md
  - concept.md
  - data-collection.md
  - data-migration.md
  - decision-adr.md
  - directory-readme.md
  - guide.md
  - operations-runbook.md
  - presentation-brief.md
  - presentation-readme.md
  - quality-check.md
  - reference.md
  - strategy.md
```

## Frontmatter Rules

```yaml
frontmatter_required: true
minimum_fields:
  - type
  - status
  - scope
  - owner
  - last_verified
  - source_of_truth
allowed_status:
  - active
  - draft
  - planned
  - deprecated
  - archived
```

## README Rules

```yaml
directory_readme_required: true
readme_file: README.md
root_readme_required: true
```

## Naming Rules

```yaml
naming:
  directories: kebab-case
  markdown_files: kebab-case
  adr_files: "0001-kebab-title.md"
```

## Archive Rules

```yaml
archive_not_source_of_truth: true
archive_required_fields:
  - archived_reason
  - current_source
```

## Validation Commands

Configure these commands in the host repository when possible:

```yaml
recommended_commands:
  docs_system_check: "node .agents/skills/project-doc-system-builder/scripts/check-doc-system.mjs --docs docs"
  skill_pack_check: "node .agents/skills/project-doc-system-builder/scripts/verify-skill-pack.mjs --root ."
```
