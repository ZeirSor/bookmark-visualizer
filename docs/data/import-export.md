---
type: reference
status: active
scope: data
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Import and Export

## Code Paths

| Format | Files |
|---|---|
| JSON | `src/features/import-export/importJson.ts`, `src/features/import-export/exportJson.ts` |
| CSV | `src/features/import-export/importCsv.ts`, `src/features/import-export/exportCsv.ts` |
| Netscape HTML | `src/features/import-export/importNetscapeHtml.ts`, `src/features/import-export/exportNetscapeHtml.ts` |
| Shared schema | `src/features/import-export/schema.ts` |

## Rules

- Import must preserve native bookmark semantics: folders, URLs, titles and hierarchy.
- Extension metadata should be imported only when schema validation succeeds.
- Export should make native bookmark fields clear and keep extension-only fields explicit.
- Failed rows or unsupported fields should produce user-readable feedback rather than silent loss.

## Validation

Run import/export unit tests and manual smoke checks when parser, serializer or schema behavior changes.
