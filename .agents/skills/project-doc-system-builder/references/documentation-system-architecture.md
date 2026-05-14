# Documentation System Architecture

A formal project documentation system separates current facts, execution guidance, templates, and historical material.

## Core Layers

```text
docs/
├── README.md                 # root index and reading map
├── _archive/                 # historical or superseded material
├── _templates/               # project-visible templates
├── product/                  # product goals, scope, requirements, feature facts
├── strategy/                 # planned direction and future options
├── architecture/             # system structure, boundaries, runtime flows
├── adr/                      # accepted architecture decisions
├── api/                      # interface contracts when applicable
├── data/                     # schemas, data dictionaries, migrations
├── standards/                # rules and conventions
├── guides/                   # task-oriented how-to guides
├── quality/                  # testing, acceptance, validation gates
└── operations/               # setup, deployment, runbooks, troubleshooting
```

## Optional Extension Layers

Add only when they represent durable project needs:

```text
docs/collaboration/           # role boundaries, review requests, handoff contracts
docs/presentations/           # decks, slide briefs, demo assets; not a source of truth
docs/infra/                   # infrastructure topology and provisioning
docs/ml/                      # model, dataset, evaluation, and training docs
docs/mobile/                  # mobile platform-specific docs
docs/frontend/                # UI surfaces and component docs
docs/backend/                 # backend services and runtime docs
```

## Source-of-Truth Rules

- Active docs describe current facts or explicitly labeled future plans.
- `_archive/` stores superseded or historical material and does not define current behavior.
- `_templates/` stores reusable project templates, not project facts.
- `standards/` defines rules; `guides/` explains how to perform tasks.
- `strategy/` may contain planned work but must not imply current implementation.
- `presentations/` may summarize facts but should link to upstream sources.
