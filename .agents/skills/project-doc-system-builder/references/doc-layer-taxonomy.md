# Documentation Layer Taxonomy

Use this taxonomy when choosing required layers for a project.

| Layer | Required by default | Purpose | Typical files |
|---|---:|---|---|
| `README.md` | yes | root docs index and reading order | `README.md` |
| `_archive/` | yes | historical, superseded, or migrated docs | `README.md`, categorized archives |
| `_templates/` | yes | project-visible templates | `reference.md`, `guide.md`, `decision-adr.md` |
| `product/` | yes | user goals, requirements, features | `requirements.md`, `feature-overview.md` |
| `strategy/` | yes | planned roadmap and future options | `roadmap.md`, `technical-strategy.md` |
| `architecture/` | yes | structure, boundaries, flows | `overview.md`, `module-boundaries.md` |
| `adr/` | yes | durable decisions | `decision-log.md`, `0001-*.md` |
| `data/` | project-dependent | schemas, migrations, dictionaries | `schema.md`, `collections/*.md` |
| `api/` | project-dependent | interface contracts | `shared-contracts.md`, `<domain>.md` |
| `standards/` | yes | rules and conventions | `documentation.md`, `naming.md` |
| `guides/` | yes | task-oriented procedures | `workflow/*.md`, `onboarding/*.md` |
| `quality/` | yes | tests, acceptance, validation | `validation-gate.md`, `manual-regression.md` |
| `operations/` | yes | setup, deployment, runbooks | `local-setup.md`, `deployment.md` |
| `collaboration/` | optional | cross-role handoff and review | `README.md`, request templates |
| `presentations/` | optional | decks and demo briefs | `slides-brief.md`, deck README files |

## Selection Rules

- Include `api/` only when the project has stable interfaces or cross-layer contracts.
- Include `data/` when persisted state, schema, collections, migrations, or data ownership matters.
- Include `frontend/`, `backend/`, `mobile/`, `infra/`, or `ml/` only when a project needs specialized implementation docs beyond generic architecture.
- Include `presentations/` only when slide or demo assets are maintained in the repository.
- Include `collaboration/` only when role handoff, review requests, or external contributors need a stable guide.
