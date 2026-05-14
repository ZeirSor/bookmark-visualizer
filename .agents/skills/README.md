# Local Agent Skills

This directory contains portable workflow skills for repository-aware AI work. The skill bodies stay generic; project-specific facts live in `.agents/project-profile/`.

## Skill Pipeline

| Stage | Skill | Responsibility | Reads project profile |
|---|---|---|---|
| 1. Context routing | `project-doc-routing` | Select the smallest useful formal docs before work starts. | `docs-map.md`, `surfaces.md` |
| 2. Workflow routing | `project-playbook-routing` | Select the matching reusable playbook and decide whether run state is needed. | `ai-workflow.md`, `playbooks.md` |
| 3. State orchestration | `project-run-orchestration` | Create or resume `.ai/runs/<run-id>/` and maintain `spec.md`, `plan.md`, `tasks.md`, `test-log.md`, and `handoff.md`. | `ai-workflow.md` |
| 4. Validation gate | `project-validation-gate` | Select commands and manual QA checks before a task is marked complete. | `validation.md` |
| 5. Documentation maintenance | `project-doc-maintenance` | Synchronize active docs and README files after implementation and validation. | `docs-map.md`, `surfaces.md`, `playbooks.md` |

## Workflow

```text
User request
  -> classify Direct / Spec-run / Playbook mode
  -> project-doc-routing
  -> project-playbook-routing when repeatable workflow applies
  -> project-run-orchestration for complex or resumable work
  -> implementation or documentation edit
  -> project-validation-gate
  -> project-doc-maintenance
  -> final report or run handoff
```

## Portability Contract

Keep these generic:

- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/references/`
- read-only inventory or audit scripts

Customize these per repository:

- `.agents/project-profile/docs-map.md`
- `.agents/project-profile/surfaces.md`
- `.agents/project-profile/validation.md`
- `.agents/project-profile/playbooks.md`
- `.agents/project-profile/ai-workflow.md`
- `.agents/project-profile/portability.md`

## Validation

Run the portability audit after changing skill bodies or references:

```bash
npm run skills:audit
```

Run active documentation validation when project profile paths, docs routes, or workflow references change:

```bash
npm run docs:check
```
