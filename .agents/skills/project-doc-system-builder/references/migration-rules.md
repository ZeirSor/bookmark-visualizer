# Documentation Migration Rules

Use these rules when moving an existing documentation system into the standard architecture.

## Standard Renames

| Old or ambiguous path | New path |
|---|---|
| `products/` | `product/` |
| `requirements/` | `product/` unless it is only one file |
| `deployment/` | `operations/` |
| `test_resource/` | `quality/` |
| `testing/` | `quality/` |
| `misc/` | `_archive/` or `guides/` depending on content |
| `temp/`, `tmp/` | `_archive/tmp/` |
| `_project_docs_archive/` | `_archive/` |

## Movement Rules

- Move roadmap, future options, and business/technical plans to `strategy/`.
- Move deployment, setup, release, and environment operations to `operations/`.
- Move test plans, regression guides, acceptance criteria, and validation rules to `quality/`.
- Move document governance rules to `standards/documentation.md`.
- Keep task-specific how-to procedures in `guides/`.
- Move superseded decisions to `_archive/adr/` and keep accepted decisions in `adr/`.

## Split Rules

If one document mixes multiple concerns:

- product facts -> `product/`
- future plans -> `strategy/`
- architecture structure -> `architecture/`
- operation steps -> `operations/`
- validation steps -> `quality/`
- governance rules -> `standards/`
- historical notes -> `_archive/`

## Safe Migration Order

1. Create target folders and README files.
2. Move or copy files.
3. Add frontmatter.
4. Update links and indexes.
5. Run validation.
6. Archive old paths or remove empty directories.
