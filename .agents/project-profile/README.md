# Project Profile

This directory is the project-specific adapter layer for the portable local skills in `.agents/skills/`.

The skills stay generic. Put repository-specific facts here:

- documentation layers and required templates;
- source roots and subsystem mappings;
- validation commands;
- playbook paths;
- run-folder and handoff conventions;
- portability notes.

## Files

| File | Purpose |
|---|---|
| `docs-system.md` | Defines the repository's formal documentation system: root, required layers, templates, frontmatter, naming, validation. |
| `docs-map.md` | Maps knowledge areas to active documentation locations. |
| `surfaces.md` | Maps UI surfaces, subsystems, source roots, runtime helpers, or domain areas to docs. |
| `validation.md` | Maps change types to concrete validation commands and manual checks. |
| `playbooks.md` | Maps repeatable work types to project playbooks or workflow docs. |
| `ai-workflow.md` | Defines run-folder, handoff, and workflow conventions for this repository. |
| `portability.md` | Explains how to copy or adapt the skills and profile into another repository. |

## Maintenance Rule

When active docs move, validation commands change, required layers change, or workflow rules change, update this profile in the same work round.
