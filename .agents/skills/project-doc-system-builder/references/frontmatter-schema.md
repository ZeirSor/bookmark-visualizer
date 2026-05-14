# Frontmatter Schema

Every Markdown file in the formal documentation system should start with YAML frontmatter.

## Minimum Fields

```yaml
---
type: reference
status: active
scope: project
owner: project
last_verified: YYYY-MM-DD
source_of_truth: true
---
```

## Allowed `type` Values

```text
index
concept
guide
reference
decision
standard
strategy
runbook
quality-check
collaboration
brief
template
archive
```

## Allowed `status` Values

```text
active
draft
planned
deprecated
archived
```

## Common Scopes

```text
project
product
strategy
architecture
adr
api
data
standards
guides
quality
operations
collaboration
presentations
archive
templates
```

## Source-of-Truth Rules

- `source_of_truth: true` for active product, architecture, API, data, standards, quality, and operations facts.
- `source_of_truth: false` for templates, archives, briefs, generated demos, or planned strategy docs.
- Planned strategy docs may be important, but they must not imply current implementation.
