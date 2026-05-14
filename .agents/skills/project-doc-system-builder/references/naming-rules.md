# Naming Rules

Use stable, semantic, kebab-case names.

## Directories

```text
product/
strategy/
architecture/
quality/
operations/
```

Avoid:

```text
Products/
productDocs/
01-product/
tmp/
misc/
```

## Files

Use:

```text
requirements.md
feature-overview.md
runtime-flows.md
manual-regression.md
0001-record-important-decision.md
```

Avoid:

```text
01-requirements.md
final-new-latest.md
Untitled.md
ADR-0001__2026-01-01__v001__long-title.md
```

## ADR Files

Use:

```text
0001-short-kebab-title.md
0002-another-decision.md
```

Put date, version, supersedes, and status in frontmatter.

## Exceptions

The project profile may allow exceptions for generated files, vendor assets, images, or externally mandated filenames. Exceptions should be explicit.
