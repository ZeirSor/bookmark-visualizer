# Generic README Sync Rules

Use this reference with `.agents/project-profile/docs-map.md`.

## Update README Files When

Update the README files named by the project profile when a change affects:

- public product or project identity;
- install, build, test, load, or deployment commands;
- top-level entrypoints, launch behavior, or platform support;
- permissions, authentication, host access, or other public setup expectations;
- major user-facing features added, removed, paused, or redefined;
- repository structure in a way that affects onboarding;
- documentation entry links;
- screenshot, GIF, preview, or demo assets;
- public roadmap or status claims.

## Do Not Update README Files When

Do not update README files for:

- small internal refactors without public behavior change;
- local docs wording that does not affect onboarding;
- PageDocs-only corrections;
- worklogs, dev changelogs, or ADR-only records;
- private implementation notes.

## Multiple README Variants

When the profile names multiple README variants:

1. Update all variants in the same work round unless the user explicitly targets one variant only.
2. Keep feature lists, command lists, links, and project structure semantically aligned.
3. Keep translations natural rather than word-for-word.
4. Verify referenced media and docs links exist.
