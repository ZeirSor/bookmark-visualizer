# Quick Save Injection And Background Flow

This document describes the current Save Overlay runtime chain plus the preserved legacy Quick Save message flow.

## Scope

Save Overlay is a content-script / background-assisted save flow. It should remain lightweight and avoid broad host permissions unless a future accepted decision changes that boundary. Legacy Quick Save still uses the same background message handler for bookmark creation and folder creation.

## High-Level Flow

```text
extension command / toolbar-triggered message
→ background service worker
→ active tab lookup
→ URL classification
→ content script injection or fallback tab
→ Save Overlay Shadow DOM overlay / `save.html` fallback
→ folder selection and note input
→ save request
→ chrome.bookmarks create / chrome.storage.local metadata update
```

## Key Areas To Check

- `src/background/`
- `src/features/save-overlay/`
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
- Save Overlay or Quick Save starts using new storage keys;
- permissions or host access assumptions change.

## Validation

Use the validation gate for Quick Save changes:

```bash
npm run typecheck
npm run build
```

Manual QA should confirm:

- shortcut / command triggers the overlay on normal webpages;
- restricted pages open `save.html` fallback and can still save;
- overlay can close and reopen;
- folder picker works;
- save request creates a native bookmark;
- metadata is written only to extension storage.
