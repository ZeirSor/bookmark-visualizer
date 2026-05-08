# Quick Save Injection And Background Flow

This document describes the Quick Save overlay runtime chain.

## Scope

Quick Save is a content-script / background-assisted save flow. It should remain lightweight and avoid broad host permissions unless a future accepted decision changes that boundary.

## High-Level Flow

```text
extension command / toolbar-triggered message
→ background service worker
→ active tab lookup
→ content script injection or message
→ Quick Save Shadow DOM overlay
→ folder selection and note input
→ save request
→ chrome.bookmarks create / chrome.storage.local metadata update
```

## Key Areas To Check

- `src/background/`
- `src/features/quick-save/`
- `src/lib/chrome/`
- `public/manifest.json`
- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/data/storage.md`

## Maintenance Rules

Update this doc when:

- command handling changes;
- active tab lookup changes;
- content script injection changes;
- runtime message shape changes;
- save request ownership changes;
- Quick Save starts using new storage keys;
- permissions or host access assumptions change.

## Validation

Use the validation gate for Quick Save changes:

```bash
npm run typecheck
npm run build
```

Manual QA should confirm:

- shortcut / command triggers the overlay;
- overlay can close and reopen;
- folder picker works;
- save request creates a native bookmark;
- metadata is written only to extension storage.
