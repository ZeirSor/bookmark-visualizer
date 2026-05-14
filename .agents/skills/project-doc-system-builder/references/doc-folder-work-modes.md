# Documentation Folder Work Modes

Each folder has a different creation and maintenance mode.

## `product/`

- Created from stakeholder discussion, product discovery, or existing behavior.
- Updated when user-visible scope, flows, roles, or features change.
- Should not contain implementation details or temporary task notes.

## `strategy/`

- Created from future direction, roadmap, or option analysis.
- Planned items must be marked as planned and should not be described as current implementation.
- When a strategy becomes implemented, move durable facts into product, architecture, api, data, quality, or operations docs.

## `architecture/`

- Created from current system structure and runtime boundaries.
- Updated when module ownership, runtime flows, dependencies, or deployment views change.
- Major decisions should be recorded in `adr/`.

## `api/`

- Created from contract files, handlers, routers, schemas, or agreed API specs.
- Updated on request/response, error code, auth, permission, or versioning changes.
- Should link to `data/` for field meanings and `operations/` for deployment details.

## `data/`

- Created from schemas, collections, models, migrations, storage keys, or dictionaries.
- Updated when collections, fields, indexes, migration rules, or data ownership change.
- Temporary import/export execution notes belong in run state or archive, not active data references.

## `standards/`

- Created when a rule needs to be reused across tasks.
- Updated when conventions change or repeated review feedback becomes a project rule.
- Standards define what must be true; guides explain how to do the work.

## `guides/`

- Created when a task will be repeated.
- Updated when the steps, commands, or prerequisites change.
- Guides should be step-oriented and narrow.

## `quality/`

- Created when the project needs validation gates, test strategies, regression guides, or acceptance criteria.
- Updated when features, release criteria, test commands, or manual QA flows change.
- Validation instructions must be concrete enough to execute.

## `operations/`

- Created when setup, deployment, runtime support, or troubleshooting must be repeatable.
- Updated when environments, secrets, deployment steps, release steps, or incident procedures change.
- If there is no deployment yet, keep a README that states the current operations status instead of inventing details.

## `adr/`

- Created when a decision is durable, costly to reverse, or cross-cutting.
- Updated by adding a new ADR or marking an existing ADR superseded; do not silently rewrite historical decisions.

## `_archive/`

- Created at project bootstrap.
- Used for superseded docs, old designs, migration snapshots, and historical references.
- Archive docs must explain why they are archived and where the current source lives when known.

## `_templates/`

- Created at project bootstrap.
- Generated from the skill's portable templates.
- Updated when the project adopts a new document type or local template customization.

## `collaboration/`

- Created when teams, agents, vendors, or role-based contributors need stable handoff rules.
- Updated when role boundaries, review request templates, or collaboration workflows change.

## `presentations/`

- Created when decks, slide briefs, or demo assets are maintained in the repository.
- Updated when decks change or upstream facts move.
- Must link to upstream source-of-truth docs instead of becoming a parallel product or architecture source.
