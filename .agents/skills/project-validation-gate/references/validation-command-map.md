# Generic Validation Command Map

Use this reference after reading the repository validation profile.

| Change type | Generic validation family |
|---|---|
| Typed application logic | typecheck, relevant tests, build |
| Untyped application logic | relevant tests, build or smoke check |
| UI surface behavior | build, affected UI tests if present, manual UI QA |
| Shared component / design system | build, consuming surface checks, visual or interaction QA |
| Data / storage / migration | tests, typecheck if applicable, build, data docs check |
| Runtime boundary / external API / permissions | build, integration or adapter tests, affected manual QA |
| Documentation-only | docs link/path check, referenced path check |
| Workflow / validation / local skills | docs check, skill validation, portability audit if available |
| Build / tooling / package scripts | package command smoke check, typecheck/build as relevant |

If a command is unavailable:

1. Verify whether the profile or package scripts are stale.
2. Record the unavailable command.
3. Use the nearest meaningful check without claiming the missing command passed.

## Documentation System Validation Families

| Change type | Generic validation family |
|---|---|
| Documentation system bootstrap | docs system check, base docs README coverage, template coverage |
| Documentation migration | docs system check, local link check, archive boundary check, README coverage |
| Documentation layer extension | docs system check, root index check, directory README check, profile docs-system check |
| Template update | template coverage check, sample document generation smoke check |
| Archive move | archive frontmatter check, active-link check, current-source or archived-reason check |

Recommended portable commands:

```bash
node .agents/skills/project-doc-system-builder/scripts/verify-skill-pack.mjs --root .
node .agents/skills/project-doc-system-builder/scripts/check-doc-system.mjs --docs docs
```
