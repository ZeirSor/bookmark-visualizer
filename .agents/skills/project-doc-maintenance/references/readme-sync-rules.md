# README Sync Rules

## Scope

Maintain these files together:

- `README.md`
- `README.zh-CN.md`

They should describe the same product state in different languages.

## Update README Files When

Update both root README files when a change affects any of these areas:

- A top-level surface is added, removed, paused, or redefined:
  - Manager
  - Popup
  - Quick Save
  - New Tab
- Extension launch behavior changes.
- New Tab default or optional behavior changes.
- Browser support changes.
- Manifest permissions or host permissions change.
- Install, build, test, or loading commands change.
- Major user-facing features are added, removed, or paused.
- The repository structure changes in a way that affects onboarding.
- Documentation entry links change.
- A screenshot, GIF, or preview asset is added to or removed from the repository.
- Public roadmap claims change.

## Do Not Update README Files When

Do not update root README files for changes such as:

- small CSS polish
- internal component refactor without behavior change
- PageDocs-only corrections
- docs wording changes that do not affect public onboarding
- worklogs, dev changelogs, or ADR changes
- private implementation notes

## Bilingual Consistency

When updating either README:

1. Update the other language file in the same work round.
2. Keep feature lists semantically aligned.
3. Keep documentation links aligned.
4. Keep project structure blocks aligned.
5. Avoid adding roadmap items to only one language.
6. If a GIF or screenshot is referenced, verify the asset exists in the repository.
7. Keep English and Chinese text natural rather than literal word-by-word translations.

## Current Expected Product Framing

The README files should describe the current product at a high level:

- Bookmark Visualizer is a Manifest V3 Chrome / Edge extension.
- The toolbar icon opens the popup.
- The popup supports current-page saving and links to the full manager workspace.
- The full manager workspace supports visual browsing, searching, editing, moving, and organizing native browser bookmarks.
- New Tab is optional and can be enabled from settings; default browser New Tab behavior should not be described as always replaced unless code changes make that true.
- Browser-native bookmarks remain the source of truth.
- Extension-only metadata and UI state live in `chrome.storage.local`.
