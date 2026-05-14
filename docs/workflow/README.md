---
type: workflow
status: active
scope: ai-workflow
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# AI Development Workflow

This directory defines the repository's AI-assisted development workflow. It explains how Agents should move from a user request to a scoped spec, implementation plan, executable task list, validation record, formal documentation sync, and handoff.

## Documents

- [AI development lifecycle](ai-development-lifecycle.md): end-to-end flow from work classification to docs sync and logging.
- [Run folder convention](run-folder-convention.md): `.ai/runs/<run-id>/` structure and file responsibilities.
- [Task status rules](task-status-rules.md): task breakdown and checkbox rules.
- [Stop and handoff rules](stop-and-handoff-rules.md): when an Agent must stop and how to preserve continuation state.
- [Validation gate](validation-gate.md): command and manual QA selection by task type.

## Relationship To Other Directories

```text
AGENTS.md
→ project-level rules and required workflow

docs/workflow/
→ how AI-assisted development should run

docs/playbooks/
→ repeatable task-specific execution manuals

.ai/runs/
→ state for one specific task or workstream

.ai/logs/
→ historical work records after a work round
```

## When To Use

Use this directory for complex work involving:

- multiple files;
- UI, product, storage, architecture, validation, or docs changes;
- tasks that may span multiple sessions;
- tasks where another Agent must be able to continue from repository files alone.
