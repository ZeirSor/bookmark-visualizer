# Summary

## User Request

Implement the proposed frontend improvement and documentation maintenance plan by creating formal `docs/frontend/` Markdown files and applying the first code-level alignment steps for shared tokens, New Tab header, and Popup edge states.

## User Constraints

- Put the frontend plan in `docs/frontend/`.
- Keep the plan implementation-level and actionable.
- Do not introduce a new UI library or change bookmark/storage data boundaries.

## Goal

Make the project's frontend design direction durable: document a unified Swiss-style design system, align New Tab and Popup with shared tokens, and close the most visible UI state gaps identified in the prior audit.

## Background

The repo already had `src/styles/tokens.css` for New Tab, while Popup kept local token values. New Tab markup used `nt-header-top`, `nt-main-nav`, and `nt-brand-copy` without matching CSS. Popup save UI lacked explicit preview loading, location disabled/loading, and folder creation loading feedback.

## Files Changed

- Added `docs/frontend/` with README, design system, surface alignment, component patterns, accessibility/interaction, implementation roadmap, and documentation maintenance docs.
- Updated `docs/README.md` and `docs/standards/documentation-maintenance.md` to include the new Frontend docs area.
- Extended `src/styles/tokens.css` with shared `--bv-*` base tokens and surface aliases for New Tab, Popup, and app usage.
- Imported shared tokens in `src/popup/main.tsx` and mapped Popup CSS variables to shared aliases.
- Updated New Tab header copy and CSS so `Bookmark Visualizer` is primary and `新标签页` is a pill.
- Added Popup preview skeleton, disabled/loading save-location path row, and inline folder create spinner.

## Key Decisions

- Kept React + CSS only; no Tailwind, shadcn, Radix, visual regression tool, or design tooling was introduced.
- Treated CSS tokens as the new stable frontend interface while preserving existing `--nt-*` and `--bv-*` consumers through aliases.
- Kept Popup's `我的书签 / Bookmark Visualizer` branding because Popup is a toolbar save tool, while New Tab uses the lighter `Bookmark Visualizer / 新标签页` identity.

## Validation

- `npm run typecheck` passed.
- `npm run test` initially failed in the sandbox with Vite/esbuild `spawn EPERM`, then passed outside the sandbox: 24 files, 138 tests.
- `npm run build` initially failed in the sandbox with the same `spawn EPERM`, then passed outside the sandbox.
- `npm run verify:popup-entry` passed.
- Confirmed `dist/manifest.json`, `dist/index.html`, `dist/popup.html`, and `dist/quick-save-content.js` exist after build.

## Risks

- Visual appearance was validated through code and build checks, not an in-browser screenshot pass.
- Existing untracked `docs/tmp/*` design-plan directories remain untouched and uncommitted.

## Next Step

Run a browser visual pass for `newtab.html` and `popup.html`, then continue Phase 4 by mapping the management surface to shared `--app-*` aliases.
