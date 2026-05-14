# Validation Profile

Map change types to repository-specific commands. Replace placeholders with real package scripts or commands.

| Change type | Commands | Manual checks |
|---|---|---|
| Documentation system | `node .agents/skills/project-doc-system-builder/scripts/check-doc-system.mjs --docs docs` | Confirm docs navigation and archive boundary. |
| Skill pack | `node .agents/skills/project-doc-system-builder/scripts/verify-skill-pack.mjs --root .` | Confirm profile files match project conventions. |
| Application logic | `<typecheck command>`, `<test command>`, `<build command>` | Project-specific smoke checks. |
| API contracts | `<api test command>` | Exercise changed endpoint or contract. |
| Data model | `<data test command>` | Check migration and compatibility notes. |
| Operations | `<deployment dry-run or lint command>` | Verify setup/deploy steps in a safe environment. |

If a command is unavailable, document the limitation and choose the nearest meaningful check.
