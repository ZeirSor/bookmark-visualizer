# Archive Policy

`docs/_archive/` stores historical documents that should not define current project facts.

## Archive When

- an implementation path, design, interface, or workflow was removed;
- a document describes a superseded decision;
- a document is a temporary execution plan or migration note;
- a document was replaced by a clearer active source;
- a generated or copied source is kept only for traceability.

## Do Not Archive When

- a document is active but incomplete; mark it `status: draft` instead;
- a document is future-oriented; put it in `strategy/` with `status: planned`;
- a document is a repeatable procedure; move it to `guides/`, `quality/`, or `operations/`.

## Archive Frontmatter

```yaml
---
type: archive
status: archived
scope: archive
owner: project
last_verified: YYYY-MM-DD
source_of_truth: false
archived_reason: "<why this is no longer active>"
current_source: "<relative path or unknown>"
---
```

## Active Docs Rule

Active docs may link to archive docs for history, but must not cite archive docs as the current source of implementation, product, API, or data facts.
