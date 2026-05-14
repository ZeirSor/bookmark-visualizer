# Documentation System Validation Rules

A documentation system is valid when the following checks pass.

## Required Checks

1. `docs/README.md` exists.
2. Every directory under `docs/` has `README.md`.
3. Every Markdown file starts with frontmatter.
4. Required baseline folders exist.
5. Required templates exist.
6. Active Markdown local links resolve.
7. Active docs do not reference old renamed paths unless explicitly documenting migration history.
8. ADR filenames follow the accepted naming convention.
9. Archive docs have `type: archive` or `status: archived`.
10. Presentation briefs or deck docs are marked `source_of_truth: false` unless the project profile defines otherwise.

## Completion Rule

Do not claim the docs system is ready if any required check fails. Fix the failure or record it as a deliberate project-profile exception.
