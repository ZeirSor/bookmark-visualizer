# Generic Playbook Routing Matrix

Use this reference after reading any project playbook index and AI workflow profile.

| Task type | Primary workflow | Secondary workflow |
|---|---|---|
| New user-visible feature | Feature implementation | Docs sync when durable docs change |
| UI layout / visual refactor | UI surface refactor | Docs sync when PageDocs or design docs change |
| Component extraction | UI surface refactor | Review when API or shared ownership risk is high |
| Specific bug fix | Bugfix | Docs sync when docs were stale or behavior changes |
| Validation failure investigation | Bugfix / investigation | Review when root cause is architectural or unclear |
| Documentation stale / code-doc alignment | Docs sync | Review for audit-only work |
| Architecture / maintainability review | Review | Docs sync if fixes are requested |
| AI workflow / agent process update | Docs sync / workflow update | Review when changing long-lived process rules |
| Local skill creation or update | Skill update | Docs sync and validation workflow |

## Run Folder Recommendation

Recommend a run folder when:

- more than one workflow applies;
- the task touches multiple files or docs layers;
- validation and docs sync are both required;
- the task may continue in another session;
- the user asks for checklist-driven execution;
- implementation choices need to be recorded for handoff.

Skip a run folder for small direct edits, pure explanations, or explicitly named single-file documentation fixes.
