# Local Agent Skills

This directory contains portable workflow skills for repository-aware AI work. The skill bodies stay generic; project-specific facts live in `.agents/project-profile/`.

## Skill Pipeline

| Stage | Skill | Responsibility | Reads project profile |
|---|---|---|---|
| 0. Documentation system bootstrap | `project-doc-system-builder` | Create, migrate, extend, and validate the formal docs architecture. | `docs-system.md`, `docs-map.md` |
| 1. Context routing | `project-doc-routing` | Select the smallest useful formal docs before work starts. | `docs-system.md`, `docs-map.md`, `surfaces.md` |
| 2. Workflow routing | `project-playbook-routing` | Select the matching reusable playbook and decide whether run state is needed. | `ai-workflow.md`, `playbooks.md` |
| 3. State orchestration | `project-run-orchestration` | Create or resume run state and maintain spec, plan, tasks, test-log, and handoff files. | `ai-workflow.md` |
| 4. Validation gate | `project-validation-gate` | Select commands and manual QA checks before a task is marked complete. | `docs-system.md`, `validation.md` |
| 5. Documentation maintenance | `project-doc-maintenance` | Synchronize active docs and README files after implementation and validation. | `docs-system.md`, `docs-map.md`, `surfaces.md`, `playbooks.md` |

## Workflow

```text
New or migrated docs system
  -> project-doc-system-builder
  -> project-doc-routing
  -> project-playbook-routing when repeatable workflow applies
  -> project-run-orchestration for complex or resumable work
  -> implementation or documentation edit
  -> project-validation-gate
  -> project-doc-maintenance
  -> final report or run handoff
```

For routine implementation work, `project-doc-system-builder` is skipped unless the task adds or changes a documentation layer.

## Portability Contract

Keep these generic:

- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/references/`
- `.agents/skills/*/templates/`
- `.agents/skills/*/resources/`
- `.agents/skills/*/scripts/`

Customize these per repository:

- `.agents/project-profile/docs-system.md`
- `.agents/project-profile/docs-map.md`
- `.agents/project-profile/surfaces.md`
- `.agents/project-profile/validation.md`
- `.agents/project-profile/playbooks.md`
- `.agents/project-profile/ai-workflow.md`
- `.agents/project-profile/portability.md`

## Validation

Run the skill-pack check after changing skill structure:

```bash
node .agents/skills/project-doc-system-builder/scripts/verify-skill-pack.mjs --root .
```

Run the docs system check after changing docs architecture:

```bash
node .agents/skills/project-doc-system-builder/scripts/check-doc-system.mjs --docs docs
```

Run the portability audit after changing generic skill bodies or references when the host repository provides it:

```bash
node .agents/skills/project-doc-routing/scripts/audit-skill-portability.mjs --root . --strict true
```
