# Project AI Workflow Profile

This profile captures Bookmark Visualizer-specific AI workflow conventions. Portable skills should load this file when they need repository policy beyond the generic run-folder shape.

## Local Skill Contract

This repository keeps portable local skills under `.agents/skills/`:

- `project-doc-routing`
- `project-playbook-routing`
- `project-run-orchestration`
- `project-validation-gate`
- `project-doc-maintenance`

The skills should remain portable by loading `.agents/project-profile/` for project facts instead of embedding Bookmark Visualizer paths in skill bodies.

## Pipeline Order

```text
project-doc-routing
  -> project-playbook-routing
  -> project-run-orchestration when the task is complex
  -> project-validation-gate
  -> project-doc-maintenance
```

Use `Direct Mode` only for small, obvious edits. Use a run folder when the work is multi-step, touches multiple docs/code layers, or requires validation evidence.

## Run Folder Contract

Complex tasks use:

```text
.ai/runs/<yyyy-mm-dd__short-topic>/
  spec.md
  plan.md
  tasks.md
  test-log.md
  handoff.md
```

Use `.ai/runs/_TEMPLATE/` when creating a new run folder.

## Required Workflow Docs

Read these docs for AI workflow changes:

- `AGENTS.md`
- `.ai/README.md`
- `.agents/skills/README.md`
- `.agents/project-profile/README.md`
- `.agents/project-profile/playbooks.md`
- `docs/workflow/README.md`
- `docs/workflow/ai-development-lifecycle.md`
- `docs/workflow/run-folder-convention.md`
- `docs/workflow/task-status-rules.md`
- `docs/workflow/stop-and-handoff-rules.md`
- `docs/workflow/validation-gate.md`
- `docs/playbooks/README.md`

## Formal Docs To Sync

When local skill responsibilities, profile shape, run-folder rules, playbook routing, or validation gates change, check:

- `AGENTS.md`
- `.ai/README.md`
- `docs/workflow/`
- `docs/playbooks/`
- `docs/quality/validation-gate.md`
- `docs/standards/documentation-maintenance.md`
- `.agents/skills/`
- `.agents/project-profile/`

Root README files only need updates if public documentation navigation or repository onboarding changes.

## Current Skill Portability Policy

- Generic workflow belongs in `SKILL.md` and skill `references/`.
- Bookmark Visualizer-specific surfaces, source paths, validation commands, README framing, playbook paths, and Chrome extension QA belong in `.agents/project-profile/`.
- Historical `.ai/logs/`, `.ai/dev-changelog/`, and `docs/_archive/` are not active source-of-truth files and should not be mass-edited for portability audits.
