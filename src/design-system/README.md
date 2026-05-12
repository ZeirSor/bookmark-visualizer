# Design System Source Ownership

`src/design-system/` is the code home for reusable UI system work.

## Layers

```text
tokens
  CSS token ownership and future token helpers

primitives
  generic UI building blocks with no bookmark or surface-specific knowledge

patterns
  bookmark-specific reusable UI patterns that can be composed by Manager, Popup, and New Tab
```

## Dependency Direction

Allowed:

```text
surface -> pattern -> primitive -> token
```

Not allowed:

```text
primitive -> pattern
primitive -> surface
pattern -> surface
```

Current page code can continue using existing `src/components/` exports while migration proceeds. New shared primitives and patterns should be added here first, then adopted by surfaces in small validated steps.

## Current Runtime Primitives

- `Button`
- `IconButton`
- `Input`
- `Textarea`
- `Select`

`Button` and `IconButton` live under `src/design-system/primitives/Button/`.
`Input`, `Textarea`, and native `Select` live under `src/design-system/primitives/FormControls/`.
All current runtime primitives are exported from `src/design-system`.

## Contracted But Not Runtime-Exported

- `Switch`

`Switch` remains contract-only in `src/design-system/primitives/FormControls/README.md` until `--bv-switch-*` tokens and a validated runtime migration land.
