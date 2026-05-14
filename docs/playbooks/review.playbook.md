---
type: playbook
status: active
scope: ai-workflow
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Playbook: Review

## When To Use

Use this playbook when the task is to audit, review, critique, or assess existing code, docs, architecture, UI, or Agent workflow.

Default behavior is read-only unless the user explicitly asks for edits.

## Required Inputs

Read:

- `AGENTS.md`
- relevant docs selected by `project-doc-routing`
- relevant workflow / playbook docs if the review concerns AI process
- relevant code or document files

## Review Rules

- Do not modify files unless the user explicitly asks.
- Separate confirmed issues from recommendations.
- Use severity levels.
- Reference exact file paths.
- Explain impact and suggested fix.
- Avoid broad rewrites when targeted changes solve the issue.

## Severity Levels

| Level | Meaning |
|---|---|
| P0 | correctness, data loss, broken build, broken main flow, serious docs contradiction |
| P1 | maintainability, architecture drift, likely UX issue, stale docs that can mislead implementation |
| P2 | polish, naming, clarity, small consistency improvements |

## Output Structure

```md
# Review Result

## P0

- `<path>` — issue, impact, suggested fix

## P1

- `<path>` — issue, impact, suggested fix

## P2

- `<path>` — issue, impact, suggested fix

## Suggested Execution Order

1. <first>
2. <second>
```

## When Review Becomes Implementation

If the user asks to apply fixes, switch to the relevant playbook and create / update a run folder if the work is complex.
