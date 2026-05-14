---
type: playbook
status: active
scope: ai-workflow
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Playbooks

Playbooks are reusable execution manuals for common AI-assisted development workflows.

A playbook is not the task itself. It defines how a class of tasks should be handled.

```text
Spec = what this specific task should change
Plan = how this specific task will be implemented
Tasks = current checklist and progress
Playbook = reusable method for this type of work
```

## Available Playbooks

- [Feature implementation](feature-implementation.playbook.md)
- [UI surface refactor](ui-surface-refactor.playbook.md)
- [Bugfix](bugfix.playbook.md)
- [Docs sync](docs-sync.playbook.md)
- [Review](review.playbook.md)

## Naming

Use `*.playbook.md` instead of `*.play.md` for clarity. The term comes from “playbook”: a standard set of moves for a repeated situation.

## How Agents Should Use Playbooks

1. Read `AGENTS.md`.
2. Use `project-playbook-routing` to select the relevant playbook.
3. Read `.agents/project-profile/ai-workflow.md` when repository-specific workflow conventions matter.
4. Read the selected playbook.
5. Create or resume a run folder if the task is complex.
6. Apply the playbook steps to the current `spec.md`, `plan.md`, and `tasks.md`.
7. Validate and update run state before stopping.
