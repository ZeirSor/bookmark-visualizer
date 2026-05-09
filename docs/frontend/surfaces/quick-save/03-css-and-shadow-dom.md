# Save Overlay CSS And Shadow DOM

Save Overlay renders inside a Shadow DOM boundary to reduce style conflicts with arbitrary webpages. Legacy Quick Save keeps its older `contentStyle.ts` string stylesheet, while the current Save Overlay injects project tokens, popup/save fallback CSS, and overlay-specific overrides into the Shadow DOM.

## Styling Boundary

Save Overlay styles should be injected into the overlay boundary rather than relying on the host page.

Expected properties:

- host page CSS should not break the overlay layout;
- overlay CSS should not leak into the host page;
- positioning should remain stable on normal webpages;
- drag, hover, focus, and scroll behavior should remain usable inside the overlay.

## Maintenance Rules

Update this document when:

- `contentStyle.ts` or equivalent injected CSS changes;
- Shadow DOM structure changes;
- overlay positioning, z-index, drag behavior, or scroll handling changes;
- inline folder picker behavior changes inside Save Overlay;
- legacy folder cascade menu behavior changes inside Quick Save;
- the overlay starts sharing more styles with popup or manager surfaces.

## Layout Guidelines

- Prefer tokenized spacing, radius, shadows, and typography where possible.
- Keep overlay dimensions responsive within viewport constraints.
- Ensure long folder names do not break icon alignment.
- Ensure nested menus can scroll internally when viewport space is limited.
- Avoid host-page-dependent selectors.

## Manual QA

Check on pages with different CSS environments:

- plain document;
- dense app page;
- page with global resets;
- scrollable page;
- narrow viewport.
