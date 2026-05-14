# Project AI Workflow Profile

This profile file captures Bookmark Visualizer-specific AI workflow conventions. Portable skills should load this file when they need repository policy beyond the generic run-folder shape.

## Local Skill Contract

This repository keeps local skills under `.agents/skills/`:

- `project-doc-routing`
- `project-playbook-routing`
- `project-run-orchestration`
- `project-validation-gate`
- `project-doc-maintenance`

The skills should remain portable by loading this profile for project facts instead of embedding Bookmark Visualizer paths in skill bodies.

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
- `docs/workflow/README.md`
- `docs/workflow/ai-development-lifecycle.md`
- `docs/workflow/run-folder-convention.md`
- `docs/workflow/task-status-rules.md`
- `docs/workflow/stop-and-handoff-rules.md`
- `docs/workflow/validation-gate.md`
- `docs/playbooks/README.md`

## Formal Docs To Sync

When local skill responsibilities, profile shape, run-folder rules, or validation gates change, check:

- `AGENTS.md`
- `.ai/README.md`
- `docs/workflow/`
- `docs/playbooks/`
- `docs/standards/documentation-maintenance.md`
- `.agents/skills/`
- `.agents/project-profile/`

Root README files only need updates if public documentation navigation or repository onboarding changes.

## Current Skill Portability Policy

- Generic workflow belongs in `SKILL.md` and skill `references/`.
- Bookmark Visualizer-specific surfaces, source paths, validation commands, README framing, and Chrome extension QA belong in `.agents/project-profile/`.
- Historical `.ai/logs/` and `.ai/dev-changelog/` are not active source-of-truth files and should not be mass-edited for portability audits.
