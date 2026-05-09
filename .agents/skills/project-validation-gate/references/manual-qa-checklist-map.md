# Manual QA Checklist Map

## Manager Workspace

- Open manager workspace.
- Confirm folder tree loads.
- Select folders and breadcrumbs.
- Test affected card / folder actions.
- Check search if affected.

## Toolbar Popup / Page Shortcut

- Open toolbar popup from toolbar action and `_execute_action` on a normal web page.
- Open toolbar popup from a restricted page such as `chrome://extensions/`.
- Confirm tabs render.
- Confirm Save tab current-page fields if affected.
- Confirm save location picker and recent folders if affected.
- Confirm Manage / Settings entries if affected.
- If page Ctrl+S is enabled, confirm ordinary page `Ctrl+S` opens the popup and editable fields are not intercepted.

## Quick Save

- Trigger extension command.
- Confirm overlay injection.
- Confirm Shadow DOM styling.
- Confirm save action and folder picker if affected.
- Confirm closing and reopening behavior if affected.

## Optional New Tab

- Enable New Tab override.
- Open a new tab.
- Test search box / categories if affected.
- Disable override and confirm browser default behavior returns.

## Shared UI

- Test every surface that consumes the changed shared component.
- Check overflow, long text, focus, hover, and disabled states when relevant.
