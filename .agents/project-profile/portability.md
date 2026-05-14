# Project Profile Portability Guide

Use this file when copying the local skills to another repository.

## Replace These Files First

- `.agents/project-profile/docs-map.md`
- `.agents/project-profile/surfaces.md`
- `.agents/project-profile/validation.md`
- `.agents/project-profile/ai-workflow.md`
- `.agents/project-profile/portability.md`

## What To Customize

- Product or domain name.
- Source roots and entrypoints.
- User-facing surfaces or modules.
- Formal documentation directories.
- README files and language variants.
- Validation commands and package scripts.
- Manual QA checks.
- Run-folder and worklog conventions.
- Paths that should be excluded from active docs validation.

## What Should Stay Generic

- The five skill names and responsibilities.
- The idea that `SKILL.md` contains compact workflow guidance.
- The use of `references/` for generic detail.
- The use of project profile files for repository-specific facts.
- Read-only scripts for inventory and portability audits.

## Migration Checklist

1. Copy `.agents/skills/` and `.agents/project-profile/` into the target repository.
2. Rewrite every profile file for the target project.
3. Run the discovery script to compare inferred structure with the profile.
4. Run the portability audit script and fix hard-coded project terms in `.agents/skills/`.
5. Validate every skill with `skill-creator` quick validation.
6. Test at least three representative tasks: feature routing, docs sync, and validation selection.
