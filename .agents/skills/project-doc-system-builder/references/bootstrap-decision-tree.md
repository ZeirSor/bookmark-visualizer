# Bootstrap Decision Tree

Use this tree before creating or replacing a documentation system.

## 1. Does `docs/` exist?

- No: use `bootstrap` mode and copy `resources/base-docs/docs/`.
- Yes: continue.

## 2. Does `docs/README.md` exist?

- No: use `migration` mode and create root navigation first.
- Yes: continue.

## 3. Are required layers present?

Required baseline:

```text
_archive/
_templates/
product/
strategy/
architecture/
adr/
standards/
guides/
quality/
operations/
```

- Missing several layers: use `migration` mode.
- Missing one layer requested by the user: use `extension` mode.
- All present: use `audit-only` or routine maintenance.

## 4. Are there historical or temporary docs in active areas?

- Yes: archive them before adding new current docs.
- No: continue.

## 5. Does every directory have README and every Markdown file have frontmatter?

- No: repair structure before content edits.
- Yes: proceed with task-specific docs.
