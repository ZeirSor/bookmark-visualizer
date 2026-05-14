# Project Playbook Map

This profile maps repeatable work types to this repository's active playbooks. Portable skills should read this file instead of embedding project playbook paths.

## Active Playbooks

| Work type | Primary playbook | Secondary checks |
|---|---|---|
| New user-facing feature | `docs/playbooks/feature-implementation.playbook.md` | `docs/playbooks/docs-sync.playbook.md` when durable docs change |
| UI surface layout, visual, or interaction refactor | `docs/playbooks/ui-surface-refactor.playbook.md` | `docs/playbooks/docs-sync.playbook.md` when surface docs change |
| Shared component extraction or component API change | `docs/playbooks/ui-surface-refactor.playbook.md` | `docs/playbooks/review.playbook.md` when ownership or API risk is high |
| Specific bug fix | `docs/playbooks/bugfix.playbook.md` | `docs/playbooks/docs-sync.playbook.md` when behavior or docs change |
| Validation failure investigation | `docs/playbooks/bugfix.playbook.md` | `docs/playbooks/review.playbook.md` when root cause is architectural or unclear |
| Documentation stale-path cleanup or docs/code alignment | `docs/playbooks/docs-sync.playbook.md` | `docs/playbooks/review.playbook.md` for audit-only findings |
| Architecture or maintainability review | `docs/playbooks/review.playbook.md` | `docs/playbooks/docs-sync.playbook.md` when fixes are applied |
| AI workflow, local skill, or project profile update | `docs/playbooks/docs-sync.playbook.md` | `docs/playbooks/review.playbook.md` when changing long-lived process rules |

## Run Folder Guidance

Recommend `.ai/runs/<run-id>/` when the task is multi-step, changes more than one docs layer, requires validation evidence, or should be resumable across sessions.

Skip run folders for small direct edits, pure explanations, or explicitly named single-file corrections.
