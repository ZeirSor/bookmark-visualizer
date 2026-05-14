---
type: reference
status: active
scope: quality
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Validation Gate

## Required Checks

```bash
npm run docs:check
npm run verify:popup-entry
```

Run broader checks when code changes accompany documentation changes:

```bash
npm run typecheck
npm test
npm run build
```

## Documentation Checks

`npm run docs:check` verifies active docs only. It excludes `docs/_archive/` and checks:

- every active Markdown document has frontmatter;
- every active directory has `README.md`;
- local Markdown links resolve;
- backticked project paths in active docs resolve unless clearly described as archived or removed;
- semantic naming is used instead of numeric ordering prefixes.

## Popup Entry Checks

`npm run verify:popup-entry` verifies the current save entry contract:

- `popup.html` exists;
- `public/manifest.json` declares `action.default_popup = "popup.html"`;
- current popup/background/page-shortcut files exist;
- removed save entry files are absent.

## Archive Boundary

Archived docs may mention removed paths. Active docs must not describe removed save surfaces as current implementation.
