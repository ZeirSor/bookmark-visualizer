# Generic Surface Doc Sync Map

Use this reference after reading `.agents/project-profile/surfaces.md`.

## How To Use The Project Surface Profile

For every changed file:

1. Match it to a surface, subsystem, source root, or runtime boundary in the profile.
2. Read only the docs listed for that matched area.
3. If the change touches shared code, check every consuming surface listed or implied by the profile.
4. If no profile entry matches, inspect nearby docs and update the profile if the mapping should be durable.

## Generic Surface Categories

| Category | Docs to consider |
|---|---|
| Page / app surface | Page docs, interaction docs, CSS/design-token docs, shared component docs |
| Shared UI / component library | Shared component docs, UI element indexes, consuming surface docs |
| Data / storage / metadata | Data docs, architecture boundary docs, affected surface docs |
| Runtime / API / permissions | Architecture docs, permission docs, affected clients, README if public setup changes |
| Documentation structure | Docs index, directory README files, documentation standards, local skill references |

## Missing Mapping Rule

If a changed file has no stable profile mapping:

- do not guess broadly;
- inspect the nearest code and docs;
- add a profile update when the mapping is durable;
- record uncertainty in the maintenance output or run handoff.
