# Form Controls Primitives And Contracts

This file defines P0 form-control primitives for the UI-system refactor. `Input`, `Textarea`, and native `Select` are runtime exports from `src/design-system`; `Switch` remains contract-only until `--bv-switch-*` tokens and a validated migration land.

## Input Primitive Contract

## Purpose

`Input` owns generic single-line text-like fields across Manager, Popup, and New Tab surfaces.

## Non-Goals

- Does not replace checkbox, radio, file, range, color, or hidden inputs.
- Does not own search suggestions, folder search behavior, or clear-button business logic.
- Does not decide field labels, validation copy, helper text, or form layout.

## Layer

- Primitive

## Owner Path

```text
src/design-system/primitives/FormControls/
```

## Props API

| Prop | Type | Required | Default | Notes |
|---|---|---:|---|---|
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` | Control height and density. |
| `invalid` | `boolean` | no | `false` | Applies error state styling and exposes `aria-invalid` unless caller overrides it. |
| `fullWidth` | `boolean` | no | `false` | Makes the control fill its container. |
| `leadingIcon` | `ReactNode` | no | none | Decorative icon before the field value. |
| `trailingSlot` | `ReactNode` | no | none | Right-side action or status slot, such as clear or copy. |
| native input props | `Omit<InputHTMLAttributes<HTMLInputElement>, "size">` | no | varies | Includes `value`, `onChange`, `readOnly`, `disabled`, `placeholder`, `autoComplete`, `aria-*`. |

## Variants

| Variant | Purpose |
|---|---|
| default | Standard editable text-like field. |
| readonly | Keeps text readable and selectable, such as Popup URL fields. |
| invalid | Marks the field as failed without owning the error message. |

## State Matrix

| State | Applies? | Expected Behavior |
|---|---|---|
| default | yes | Token-owned height, border, background, text, and placeholder styling. |
| hover | yes | Border uses shared hover token while enabled and editable. |
| active/pressed | no | Text fields do not use pressed motion. |
| focus-visible | yes | Uses `--bv-input-focus-ring` and focus border token. |
| disabled | yes | Locks interaction, lowers emphasis, and does not mimic readonly. |
| loading | no | Caller owns surrounding saving/loading feedback. |
| selected | no | Text selection remains native browser behavior. |
| empty | yes | Placeholder is visible when provided. |
| error | yes | Uses `invalid` styling and preserves user input. |
| success | no | Caller owns saved/success feedback. |
| long content | yes | Single-line text scrolls or clips according to native input behavior. |
| overflow/narrow width | yes | `min-width: 0`; wrapper and slots must not force overflow. |
| light/dark mode | partial | Uses existing tokens; dark token pass remains future work. |

## Accessibility

- Role: native `input`.
- ARIA: caller provides accessible name via label or `aria-label`; `invalid` maps to `aria-invalid` unless overridden.
- Keyboard behavior: native input keyboard behavior.
- Focus behavior: visible token-owned focus ring.

## Token Usage

| Token | Purpose |
|---|---|
| `--bv-input-height-*` | Size scale. |
| `--bv-input-bg` / `--bv-input-bg-readonly` / `--bv-input-bg-disabled` | Field background states. |
| `--bv-input-border-*` | Default, hover, focus, and error borders. |
| `--bv-input-text` / `--bv-input-placeholder` | Text and placeholder colors. |
| `--bv-input-radius` | Control radius. |
| `--bv-input-focus-ring` | Focus-visible ring. |
| `--bv-motion-fast` | State transitions. |

## Stories Required

- Default
- WithIcon
- Readonly
- Disabled
- Invalid
- LongContent
- NarrowWidth
- DarkMode

## Tests Required

- Native input props pass through.
- `invalid` exposes error semantics without clearing input.
- Readonly remains selectable and visually distinct from disabled.
- Visual regression story after component workbench exists.

## Correct Usage

```tsx
<Input value={title} onChange={(event) => setTitle(event.target.value)} />
```

## Incorrect Usage

```tsx
<Input type="checkbox" checked={enabled} />
```

## Migration Notes

- Migrated usages: Popup title/URL fields and New Tab shortcut dialog fields.
- Current usages to migrate later: Manager inline edit fields, New Tab search combobox, popup folder search, and folder-picker create-row fields.
- CSS/classes to retire after broader migration: page-local input, URL, dialog-field, and inline-edit field selectors after `rg` confirms no usage.
- Docs to update: component inventory, state matrix, affected Popup/New Tab/Manager PageDocs.

## Textarea Primitive Contract

## Purpose

`Textarea` owns generic multi-line text entry for notes, descriptions, and compact edit flows.

## Non-Goals

- Does not own rich text, markdown preview, autosave policy, or validation copy.
- Does not decide note length limits or counter placement.
- Does not replace inline business editors that need bookmark-specific save/cancel behavior.

## Layer

- Primitive

## Owner Path

```text
src/design-system/primitives/FormControls/
```

## Props API

| Prop | Type | Required | Default | Notes |
|---|---|---:|---|---|
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` | Density and minimum height tier. |
| `invalid` | `boolean` | no | `false` | Applies error state styling and exposes `aria-invalid` unless caller overrides it. |
| `fullWidth` | `boolean` | no | `false` | Makes the control fill its container. |
| `resize` | `"none" \| "vertical"` | no | `"vertical"` | Allowed resize behavior. |
| native textarea props | `TextareaHTMLAttributes<HTMLTextAreaElement>` | no | varies | Includes `value`, `onChange`, `rows`, `placeholder`, `disabled`, `readOnly`, `aria-*`. |

## Variants

| Variant | Purpose |
|---|---|
| default | Standard multi-line input. |
| compact | Dense notes or inline editing contexts through `size="sm"`. |
| invalid | Failed field state while preserving text. |

## State Matrix

| State | Applies? | Expected Behavior |
|---|---|---|
| default | yes | Token-owned border, background, text, placeholder, and minimum height. |
| hover | yes | Border uses shared hover token while enabled and editable. |
| active/pressed | no | Textareas do not use pressed motion. |
| focus-visible | yes | Uses `--bv-input-focus-ring` and focus border token. |
| disabled | yes | Locks interaction and lowers emphasis. |
| loading | no | Caller owns saving/loading feedback. |
| selected | no | Text selection remains native browser behavior. |
| empty | yes | Placeholder is visible when provided. |
| error | yes | Uses `invalid` styling and preserves text. |
| success | no | Caller owns saved/success feedback. |
| long content | yes | Scrolls vertically without resizing surrounding layout unexpectedly. |
| overflow/narrow width | yes | Uses full available width and wraps text. |
| light/dark mode | partial | Uses existing tokens; dark token pass remains future work. |

## Accessibility

- Role: native `textarea`.
- ARIA: caller provides accessible name via label or `aria-label`; `invalid` maps to `aria-invalid` unless overridden.
- Keyboard behavior: native textarea keyboard behavior; caller owns Ctrl/Cmd+Enter save shortcuts.
- Focus behavior: visible token-owned focus ring.

## Token Usage

| Token | Purpose |
|---|---|
| `--bv-input-bg` / `--bv-input-bg-disabled` | Field background states. |
| `--bv-input-border-*` | Default, hover, focus, and error borders. |
| `--bv-input-text` / `--bv-input-placeholder` | Text and placeholder colors. |
| `--bv-input-radius` | Control radius. |
| `--bv-input-focus-ring` | Focus-visible ring. |
| `--bv-motion-fast` | State transitions. |

## Stories Required

- Default
- Compact
- Disabled
- Invalid
- LongContent
- NarrowWidth
- DarkMode

## Tests Required

- Native textarea props pass through.
- `invalid` exposes error semantics without clearing text.
- Resize mode maps only to approved values.
- Visual regression story after component workbench exists.

## Correct Usage

```tsx
<Textarea value={note} rows={3} onChange={(event) => setNote(event.target.value)} />
```

## Incorrect Usage

```tsx
<Textarea className="page-only-error-shadow" />
```

## Migration Notes

- Migrated usages: Popup note field.
- Current usages to migrate later: Manager inline note editor and any future dialog textareas.
- CSS/classes to retire after broader migration: page-local textarea, note-field, dialog textarea, and inline editor selectors after `rg` confirms no usage.
- Docs to update: component inventory, state matrix, affected Popup/Manager PageDocs.

## Select Primitive Contract

## Purpose

`Select` owns generic native select fields for compact option picking across Manager, Popup, and New Tab surfaces.

## Non-Goals

- Does not implement custom listbox, combobox, search suggestions, or portal menu behavior.
- Does not replace Popup `CustomSelect` until a shared Menu/Listbox primitive exists.
- Does not own option persistence, settings save feedback, or business validation copy.

## Layer

- Primitive

## Owner Path

```text
src/design-system/primitives/FormControls/
```

## Props API

| Prop | Type | Required | Default | Notes |
|---|---|---:|---|---|
| `options` | `Array<{ value: T; label: string; disabled?: boolean }>` | yes | none | Native option list. |
| `value` | `T` | yes | none | Current selected value. |
| `onValueChange` | `(value: T) => void` | yes | none | Receives the selected option value. |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` | Control height and density. |
| `invalid` | `boolean` | no | `false` | Applies error state styling and exposes `aria-invalid` unless caller overrides it. |
| `fullWidth` | `boolean` | no | `false` | Makes the control fill its container. |
| native select props | `Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" \| "value" \| "onChange">` | no | varies | Includes `disabled`, `name`, `form`, `aria-*`. |

## Variants

| Variant | Purpose |
|---|---|
| default | Native select shell for settings, sorting, and search engine choice. |
| invalid | Failed field state while preserving selection. |

## State Matrix

| State | Applies? | Expected Behavior |
|---|---|---|
| default | yes | Token-owned native select shell with stable height and text. |
| hover | yes | Border uses shared hover token while enabled. |
| active/pressed | no | Native select interaction remains browser-owned. |
| focus-visible | yes | Uses `--bv-input-focus-ring` and focus border token. |
| disabled | yes | Locks interaction and lowers emphasis. |
| loading | no | Caller owns saving/loading feedback. |
| selected | yes | Native selected option reflects `value`. |
| empty | partial | Caller may include a placeholder option. |
| error | yes | Uses `invalid` styling and preserves selection. |
| success | no | Caller owns saved/success feedback. |
| long content | yes | Option label and selected text truncate or clip safely in constrained rows. |
| overflow/narrow width | yes | `min-width: 0`; full-width option available. |
| light/dark mode | partial | Uses existing tokens; native popup styling remains browser-owned. |

## Accessibility

- Role: native `select`.
- ARIA: caller provides accessible name via label or `aria-label`; `invalid` maps to `aria-invalid` unless overridden.
- Keyboard behavior: native select keyboard behavior.
- Focus behavior: visible token-owned focus ring.

## Token Usage

| Token | Purpose |
|---|---|
| `--bv-input-height-*` | Size scale. |
| `--bv-input-bg` / `--bv-input-bg-disabled` | Select shell background states. |
| `--bv-input-border-*` | Default, hover, focus, and error borders. |
| `--bv-input-text` | Selected value text. |
| `--bv-input-radius` | Control radius. |
| `--bv-input-focus-ring` | Focus-visible ring. |
| `--bv-motion-fast` | State transitions. |

## Stories Required

- Default
- Disabled
- Invalid
- LongContent
- NarrowWidth
- DarkMode

## Tests Required

- `onValueChange` receives selected option values.
- Disabled options remain disabled.
- Native select props pass through.
- Visual regression story after component workbench exists.

## Correct Usage

```tsx
<Select
  aria-label="Sort order"
  value={sortMode}
  options={sortOptions}
  onValueChange={(value) => setSortMode(value)}
/>
```

## Incorrect Usage

```tsx
<Select options={searchSuggestions} role="combobox" />
```

## Migration Notes

- Migrated usages: New Tab customize native selects.
- Current usages to migrate later: Manager sort select and New Tab search engine/category combobox controls.
- Popup `CustomSelect` stays page-local until shared Menu/Listbox primitives exist.
- CSS/classes to retire after broader migration: page-local native select shell selectors after `rg` confirms no usage.
- Docs to update: component inventory, state matrix, affected Manager/New Tab PageDocs.

## Switch Primitive Contract

## Purpose

`Switch` owns generic binary on/off controls for settings and preferences.

## Non-Goals

- Does not own settings persistence, default values, storage writes, or error copy.
- Does not replace checkbox lists where native checkbox semantics are the clearer fit.
- Does not own row layout; use a future SettingsRow pattern for label/description/control composition.

## Layer

- Primitive

## Owner Path

```text
src/design-system/primitives/FormControls/
```

## Props API

| Prop | Type | Required | Default | Notes |
|---|---|---:|---|---|
| `checked` | `boolean` | yes | none | Current on/off state. |
| `onCheckedChange` | `(checked: boolean) => void` | yes | none | Receives the next checked state. |
| `label` | `string` | yes | none | Accessible name. |
| `disabled` | `boolean` | no | `false` | Locks interaction. |
| `loading` | `boolean` | no | `false` | Locks interaction while persistence is in flight. |
| `size` | `"sm" \| "md"` | no | `"md"` | Target and track density. |
| native button props | `ButtonHTMLAttributes<HTMLButtonElement>` | no | varies | Includes `id`, `form`, `aria-*`, except caller must not override `role`. |

## Variants

| Variant | Purpose |
|---|---|
| default | Standard neutral/off and accent/on switch. |
| loading | Keeps current value visible while locking interaction. |

## State Matrix

| State | Applies? | Expected Behavior |
|---|---|---|
| default | yes | Off state uses neutral track and visible thumb. |
| hover | yes | Track/border becomes slightly stronger while enabled. |
| active/pressed | yes | Minimal thumb/track response while enabled. |
| focus-visible | yes | Uses shared compact focus ring. |
| disabled | yes | Locks interaction, dims track/thumb, removes hover. |
| loading | yes | Locks interaction and exposes busy state without changing checked value. |
| selected | yes | `checked=true` maps to on state and `aria-checked`. |
| empty | no | Binary value is required. |
| error | partial | Caller owns persistence error feedback around the switch. |
| success | partial | Caller owns saved feedback around the switch. |
| long content | no | Label is accessible, not visually rendered by the primitive. |
| overflow/narrow width | yes | Fixed target dimensions prevent row layout shift. |
| light/dark mode | partial | Requires future `--bv-switch-*` component-token group. |

## Accessibility

- Role: `button` with `role="switch"`.
- ARIA: `label` is required and becomes `aria-label`; `checked` maps to `aria-checked`; `loading` maps to `aria-busy`.
- Keyboard behavior: Space and Enter toggle while enabled and not loading.
- Focus behavior: visible token-owned focus ring.

## Token Usage

| Token | Purpose |
|---|---|
| `--bv-control-height-*` | Minimum target sizing until switch tokens land. |
| `--bv-focus-ring-compact` | Focus-visible ring. |
| `--bv-motion-fast` | Thumb and track transitions. |
| future `--bv-switch-*` | Track, thumb, checked, disabled, loading, and dark-mode states. |

## Stories Required

- Off
- On
- Disabled
- Loading
- NarrowWidth
- KeyboardToggle
- DarkMode

## Tests Required

- Space and Enter toggle while enabled.
- Disabled and loading states do not call `onCheckedChange`.
- `label` exposes the accessible name.
- Visual regression story after component workbench exists.

## Correct Usage

```tsx
<Switch checked={showRecentActivity} label="Show recent activity" onCheckedChange={setShowRecentActivity} />
```

## Incorrect Usage

```tsx
<Switch checked={value} onCheckedChange={setValue} />
```

## Migration Notes

- Current usages to migrate later: Popup settings switch and New Tab customize checkbox-style preferences after deciding whether visual switch semantics are appropriate.
- CSS/classes to retire after migration: `.switch-control`, `.switch-track`, `.switch-thumb`, and matching page-local checkbox switch selectors after `rg` confirms no usage.
- Docs to update: component inventory, state matrix, affected Popup/New Tab PageDocs.
