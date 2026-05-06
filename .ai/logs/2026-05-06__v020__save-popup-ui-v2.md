# Summary

## User Request

Redesign the toolbar popup save UI using the design notes under `docs/tmp/save-popup-ui-plan` and match the provided five preview states: default save tab, location cascade, folder search results, inline folder creation, and expanded recent folders.

## User Constraints

- Use the existing `popup.html` save entry and current popup component structure.
- Follow the referenced `codex-vibe-coding` workflow.
- Keep Chrome / Edge Manifest V3 assumptions and do not alter extension entry decisions.
- Preserve unrelated dirty worktree changes.

## Goal

Bring the save popup closer to the UI v2 plan: a stable two-column save flow with a preview card, compact title / URL / note fields, and a stronger save-location picker that handles cascade, search, inline creation, and recent locations coherently.

## Background

The repo already had save popup components split across `SaveTab`, `SaveLocationPicker`, save-location subcomponents, and `styles.css`. The design plan documented the desired field order, location picker mutual exclusion rules, cascade initial path behavior, recent chips expansion behavior, and visual tokens.

## Files Changed

- `src/popup/PopupApp.tsx`: added `creatingFolder` state and passed it to the save tab.
- `src/popup/tabs/SaveTab.tsx`: reordered fields to title, URL, note, then save location.
- `src/popup/components/SaveLocationPicker.tsx`: clears search when opening the cascade and passes folder creation state.
- `src/popup/components/PagePreviewCard.tsx`: enriched fallback preview structure.
- `src/popup/components/save-location/InlineCreateFolderRow.tsx`: added loading / disabled handling for folder creation.
- `src/popup/components/save-location/LocationCascadeOverlay.tsx`: auto-expands the current selected path in the cascade.
- `src/popup/styles.css`: aligned popup visual tokens, preview card styling, form density, folder results, inline create row, recent chips, and primary action treatment.
- `docs/product/popup-save-design.md`: replaced outdated "keep existing save page" wording with save popup UI v2 behavior and corrected shortcut example to `Ctrl + Shift + S`.

## Key Decisions

- Kept the existing popup entry and component boundaries rather than adding a new page or data layer.
- Used the current folder tree and `chrome.bookmarks` flow; no new persistence model was introduced.
- Made local picker states mutually exclusive: cascade opening clears search and closes create; search/create already close the cascade.
- Used the existing `buildFolderCascadeInitialPathIds` helper so the cascade opens on the selected folder path instead of an arbitrary root branch.

## Validation

- `npm run typecheck` passed in the sandbox.
- `npm run test` initially failed in the sandbox with Vite/esbuild `spawn EPERM`, then passed outside the sandbox: 24 files, 138 tests.
- `npm run build` initially failed in the sandbox with the same `spawn EPERM`, then passed outside the sandbox.
- `npm run verify:popup-entry` passed.
- Confirmed `dist/manifest.json`, `dist/index.html`, `dist/popup.html`, and `dist/quick-save-content.js` exist after build.
- Started local Vite preview at `http://127.0.0.1:5173/popup.html`.

## Risks

- The worktree contained many pre-existing unrelated changes; only save popup and product design files were intentionally edited for this task.
- Browser-extension popup behavior still needs manual visual validation in Chrome / Edge with real bookmark data for exact cascade placement and popup bounds.

## Next Step

Open `http://127.0.0.1:5173/popup.html` for a quick visual pass, then load `dist` as an unpacked extension for the final toolbar-popup check.
