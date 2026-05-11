# Button Primitive Contract

## Purpose

`Button` owns generic text/button actions across Manager, Popup, and New Tab surfaces.

## Non-Goals

- Does not decide page layout, footer placement, or business copy.
- Does not own bookmark-specific actions.
- Does not replace tab, menu, or switch behavior where those controls need specialized semantics.

## Layer

- Primitive

## Owner Path

```text
src/design-system/primitives/Button/
```

## Props API

| Prop | Type | Required | Default | Notes |
|---|---|---:|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "text" \| "danger"` | no | `"secondary"` | Visual role. |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` | Control height and density. |
| `leadingIcon` | `ReactNode` | no | none | Decorative icon before label. |
| `trailingIcon` | `ReactNode` | no | none | Decorative icon after label. |
| `loading` | `boolean` | no | `false` | Disables the button and exposes `aria-busy`. |
| `selected` | `boolean` | no | `false` | Visual selected/current state for tab-like or filter-like buttons. |
| `fullWidth` | `boolean` | no | `false` | Makes the button fill its container. |
| native button props | `ButtonHTMLAttributes<HTMLButtonElement>` | no | varies | Includes `onClick`, `form`, `type`, `disabled`, `aria-*`. |

## Variants

| Variant | Purpose |
|---|---|
| `primary` | Main submit or confirm action. |
| `secondary` | Default neutral action. |
| `ghost` | Low-emphasis toolbar or navigation action. |
| `text` | Compact text-like action. |
| `danger` | Destructive action after the flow has confirmation or clear context. |

## State Matrix

| State | Applies? | Expected Behavior |
|---|---|---|
| default | yes | Token-owned size, border, background, and label spacing. |
| hover | yes | Uses shared hover background and border tokens. |
| active/pressed | yes | Minimal translate only while enabled. |
| focus-visible | yes | Uses shared compact focus ring. |
| disabled | yes | Locks pointer state, lowers opacity, removes shadow. |
| loading | yes | Disables action, exposes busy state, shows spinner. |
| selected | yes | Uses current/selected visual state without changing semantics. |
| empty | no | Caller owns empty state messaging. |
| error | no | Use `danger` or surrounding error/status UI. |
| success | no | Use surrounding status UI or future toast. |
| long content | yes | Label truncates inside the button. |
| overflow/narrow width | yes | `min-width: 0`; caller controls container width. |
| light/dark mode | partial | Uses existing tokens; Manager dark aliases remain future work. |

## Accessibility

- Role: native `button`.
- ARIA: `aria-busy` when loading; caller provides extra ARIA when needed.
- Keyboard behavior: native button keyboard behavior.
- Focus behavior: visible token-owned focus ring.

## Token Usage

| Token | Purpose |
|---|---|
| `--bv-control-height-*` | Size scale. |
| `--bv-radius-control` | Button radius. |
| `--bv-button-*` | Variant backgrounds, borders, text, shadow. |
| `--bv-focus-ring-compact` | Focus-visible ring. |
| `--bv-motion-fast` | State transitions. |

## Stories Required

- Default
- WithIcon
- Disabled
- Loading
- Danger
- Selected
- LongContent
- NarrowWidth
- DarkMode

## Tests Required

- Loading disables the button and exposes busy state.
- Native `type`, `form`, and `disabled` props pass through.
- Visual regression story after component workbench exists.

## Correct Usage

```tsx
<Button variant="primary" loading={saving} type="submit">
  Save
</Button>
```

## Incorrect Usage

```tsx
<Button className="new-page-only-primary-gradient">Save</Button>
```

## Migration Notes

- First migrated users may retain legacy surface selector classes for layout compatibility.
- Retire old page CSS only after all matching selectors have no usage.
- Update `component-state-matrix.md` and PageDocs as more button usages migrate.

# IconButton Primitive Contract

## Purpose

`IconButton` owns icon-only actions that need a required accessible label and consistent size/focus treatment.

## Non-Goals

- Does not invent icons.
- Does not own tooltip rendering beyond native `title` until a tooltip primitive exists.
- Does not replace menu items or switches.

## Layer

- Primitive

## Owner Path

```text
src/design-system/primitives/Button/IconButton.tsx
```

## Props API

| Prop | Type | Required | Default | Notes |
|---|---|---:|---|---|
| `icon` | `ReactNode` | yes | none | Visual icon. |
| `label` | `string` | yes | none | Used for `aria-label` and default `title`. |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` | Icon button box size. |
| `tone` | `"neutral" \| "accent" \| "danger"` | no | `"neutral"` | Color emphasis. |
| `loading` | `boolean` | no | `false` | Disables action and shows spinner. |
| `selected` | `boolean` | no | `false` | Current/open state. |
| `tooltip` | `string` | no | none | Native title fallback. |
| native button props | `ButtonHTMLAttributes<HTMLButtonElement>` | no | varies | Includes `onClick`, `disabled`, `aria-*`. |

## Variants

| Variant | Purpose |
|---|---|
| `neutral` | Default toolbar and utility actions. |
| `accent` | Current primary utility. |
| `danger` | Destructive utility action with context. |

## State Matrix

| State | Applies? | Expected Behavior |
|---|---|---|
| default | yes | Fixed square target with centered icon. |
| hover | yes | Shared accent-soft hover treatment. |
| active/pressed | yes | Minimal translate while enabled. |
| focus-visible | yes | Shared compact focus ring. |
| disabled | yes | Locked and visually dimmed. |
| loading | yes | Spinner replaces icon and locks action. |
| selected | yes | Shared current/open visual state. |
| empty | no | Icon is required. |
| error | no | Use `danger` tone or surrounding status UI. |
| long content | no | Label is not rendered visually. |
| overflow/narrow width | yes | Fixed target size prevents layout shift. |
| light/dark mode | partial | Uses existing tokens; dark token pass remains future work. |

## Accessibility

- Role: native `button`.
- ARIA: `label` is required and becomes `aria-label`.
- Keyboard behavior: native button keyboard behavior.
- Focus behavior: visible token-owned focus ring.

## Token Usage

| Token | Purpose |
|---|---|
| `--bv-control-height-icon-*` | Size scale. |
| `--bv-radius-control` | Radius. |
| `--bv-icon-button-*` | Hover, border, and text treatment. |
| `--bv-focus-ring-compact` | Focus-visible ring. |

## Stories Required

- Default
- Accent
- Danger
- Disabled
- Loading
- Selected
- LabelRequirement
- DarkMode

## Tests Required

- Requires `label` at the type/API level.
- Exposes `aria-label` and default `title`.
- Loading disables action.

## Correct Usage

```tsx
<IconButton icon={<ExternalLinkIcon />} label="Open manager" onClick={openManager} />
```

## Incorrect Usage

```tsx
<button className="icon-only">
  <ExternalLinkIcon />
</button>
```
