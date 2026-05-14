---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Token Exceptions

This document records intentional visual raw-value exceptions for the UI-system refactor. It complements [CSS hardcode policy](css-hardcode-policy.md) and [Token ownership](token-ownership.md).

## Scope

Use this file only for raw visual values that are intentionally kept after review.

Do not list:

- structural raw values allowed by [CSS hardcode policy](css-hardcode-policy.md), such as layout widths, grid tracks, icon sizes, media-query breakpoints, or popup dimensions;
- raw values inside `src/styles/tokens.css` when they define project-wide raw tokens;
- untouched legacy CSS that has not been reviewed yet;
- values that should simply be replaced with an existing token before the task is complete.

## Status Values

| Status | Meaning | Required follow-up |
|---|---|---|
| Accepted | Intentional and stable enough to keep. | Re-review when the related surface or primitive is refactored. |
| Provisional | Allowed during staged migration, but not a permanent design-system rule. | Promote to token, remove, or convert to Accepted with rationale. |
| Migrate | Known raw value that should become a token or component style. | Track in the relevant phase task. |
| Retired | Previously listed exception that has been removed from current code. | Keep only if the history helps future maintenance. |

## Current Exceptions

| ID | Status | Area | Current owner | Exception | Rationale | Review trigger |
|---|---|---|---|---|---|---|
| TE-001 | Provisional | Manager dark mode | `src/styles/tokens.css` `--app-dark-*`, consumed by `src/app/styles.css` | Manager dark palette and dark shadow aliases remain surface-specific. | Manager is the only surface with an explicit dark theme pass. These values should not block Phase 1, but they should become global dark semantic/component tokens before broad Manager primitive migration. | Phase 4 Manager refactor or any dark-theme token work. |
| TE-002 | Provisional | New Tab page background | `src/newtab/styles.css` `.nt-page` | Ambient radial gradients use raw color stops. | New Tab currently uses a search-first atmospheric background. It is a visual-system exception candidate until page background tokens or a deliberate removal decision exists. | Phase 6 New Tab refactor or `Panel` / page-background token work. |
| TE-003 | Provisional | Popup accent emphasis | `src/popup/styles.css` local action/hero gradients | Some popup primary/hero actions still use local gradient stops and accent shadows. | Popup is mid-migration and still carries polished local selector-owned styling. These values should be normalized into `Button`, `Card`, or surface accent tokens during Popup primitive migration. | Task `5.1` Popup primitive migration or task `1.7` visual render review if it reveals drift. |

## Review Rules

When a new raw visual value appears during UI work:

1. Replace it with an existing token if possible.
2. Add or extend the correct token layer when the value is reusable.
3. If neither is appropriate yet, add an entry here with:
   - status;
   - code owner path;
   - exact selector or token name;
   - reason it cannot be tokenized now;
   - review trigger.
4. Do not mark a UI task complete if a new raw visual value is neither tokenized nor listed here.

## Related Docs

- [CSS hardcode policy](css-hardcode-policy.md)
- [Token ownership](token-ownership.md)
- [Token audit](token-audit.md)
- [Design system](../../design-system.md)
