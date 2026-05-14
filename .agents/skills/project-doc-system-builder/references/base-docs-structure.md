# Base Docs Structure

The starter documentation system lives at:

```text
.agents/skills/project-doc-system-builder/resources/base-docs/docs/
```

It can be copied into a project with:

```bash
node .agents/skills/project-doc-system-builder/scripts/create-doc-system.mjs --target .
```

## Included Base Tree

```text
docs/
├── README.md
├── _archive/
│   └── README.md
├── _templates/
│   ├── README.md
│   ├── archive.md
│   ├── concept.md
│   ├── decision-adr.md
│   ├── directory-readme.md
│   ├── guide.md
│   ├── operations-runbook.md
│   ├── quality-check.md
│   ├── reference.md
│   └── strategy.md
├── product/
│   └── README.md
├── strategy/
│   └── README.md
├── architecture/
│   ├── README.md
│   ├── backend/README.md
│   ├── diagrams/README.md
│   ├── frontend/README.md
│   └── shared/README.md
├── adr/
│   ├── README.md
│   └── decision-log.md
├── api/
│   └── README.md
├── data/
│   ├── README.md
│   └── collections/README.md
├── standards/
│   ├── README.md
│   └── documentation.md
├── guides/
│   ├── README.md
│   └── workflow/README.md
├── quality/
│   └── README.md
├── operations/
│   └── README.md
├── collaboration/
│   └── README.md
└── presentations/
    ├── README.md
    └── assets/README.md
```

## Copy Policy

The script copies missing files by default and does not overwrite existing project docs unless `--force` is provided. Use `--dry-run` to inspect changes.
