# Playbook Routing Matrix

| Task type | Primary playbook | Secondary playbooks |
|---|---|---|
| New user-visible feature | `docs/playbooks/feature-implementation.playbook.md` | `docs/playbooks/docs-sync.playbook.md` |
| UI layout / visual refactor | `docs/playbooks/ui-surface-refactor.playbook.md` | `docs/playbooks/docs-sync.playbook.md` |
| Component extraction | `docs/playbooks/ui-surface-refactor.playbook.md` | `docs/playbooks/review.playbook.md` if risk is high |
| Specific bug fix | `docs/playbooks/bugfix.playbook.md` | `docs/playbooks/docs-sync.playbook.md` if docs changed |
| Documentation stale / code-doc alignment | `docs/playbooks/docs-sync.playbook.md` | `docs/playbooks/review.playbook.md` for audit-only work |
| Architecture / maintainability review | `docs/playbooks/review.playbook.md` | `docs/playbooks/docs-sync.playbook.md` if fixes are requested |
| AI workflow / agent process update | `docs/playbooks/docs-sync.playbook.md` | `docs/playbooks/review.playbook.md` |
| Validation failure investigation | `docs/playbooks/bugfix.playbook.md` | `docs/playbooks/review.playbook.md` |

## Run Folder Recommendation

Recommend a run folder when:

- more than one playbook applies;
- the task touches multiple files;
- validation and docs sync are both required;
- the task may continue in another session;
- the user asks for a checklist-driven Agent workflow.
