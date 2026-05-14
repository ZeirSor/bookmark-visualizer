---
type: archive
status: archived
scope: archive
owner: project
last_verified: 2026-05-14
source_of_truth: false
archived_reason: "superseded, historical, or temporary content"
archived_from: "docs/tmp/documentation-issues-execution-plan.md"
current_source: "docs/README.md"
---

# Documentation Issues Execution Plan

> Scope: This plan addresses the remaining documentation and AI-workflow alignment issues found in the current project package.  
> Important path convention: local skills now live under `.agents/skills/`, not `.agent/skills/`.

## 0. Goal

Make the documentation system consistent with the current repository structure, prevent Agents from following obsolete paths, and ensure future documentation checks ignore historical AI logs while validating current docs, skills, workflow files, and playbooks.

The target result is:

```text
AGENTS.md / docs / .ai / .agents/skills
→ all reference the same current project paths
→ no active workflow docs point to obsolete source locations
→ historical logs remain untouched but excluded from path validation
→ Skill path is consistently `.agents/skills/`
```

---

## 1. Priority Summary

| Priority | Issue | Main Files | Expected Outcome |
|---|---|---|---|
| P0 | Skill root path mismatch | `AGENTS.md`, `.ai/README.md`, `docs/workflow/*`, `docs/playbooks/*`, `.agents/skills/*` | All docs use `.agents/skills/` |
| P0 | New Tab redirect path is wrong in skill maps | `.agents/skills/project-doc-routing/references/doc-routing-matrix.md`, `.agents/skills/project-doc-maintenance/references/surface-doc-sync-map.md` | Replace obsolete `src/background/newTabRedirect.ts` with current path |
| P1 | Data model guide contains old domain file paths | `docs/data/domain-model.md` | Use current folder-based domain structure |
| P1 | Cloud strategy doc mixes future entrypoint proposal with current paths | `docs/strategy/cloud-data-strategy.md` | Clearly separate current paths from proposed future paths |
| P1 | Historical `.ai/logs/` paths may pollute validation | `docs/workflow/validation-gate.md`, docs-check script if present or added | Path checks exclude `.ai/logs/` by default |
| P2 | Documentation validation command should be explicit | `package.json`, `scripts/check-doc-paths.mjs`, `docs/workflow/validation-gate.md` | `npm run docs:check` validates active docs safely |

---

## 2. P0 — Normalize Skill Path to `.agents/skills/`

### Problem

Earlier workflow docs and examples may still refer to:

```text
.agent/skills/
```

The current project convention is:

```text
.agents/skills/
```

This mismatch is risky because AI tooling and future contributors may read or update the wrong directory.

### Files to inspect

Check and update references in:

```text
AGENTS.md
AI_HANDOFF.md
.ai/README.md
docs/README.md
docs/workflow/*.md
docs/playbooks/*.md
.agents/skills/*/SKILL.md
.agents/skills/*/references/*.md
```

### Required changes

Replace all active references of:

```text
.agent/skills/
```

with:

```text
.agents/skills/
```

### Suggested command

```bash
grep -R "\.agent/skills" -n AGENTS.md AI_HANDOFF.md .ai docs .agents || true
```

Then update each hit manually.

### Acceptance criteria

```bash
grep -R "\.agent/skills" -n AGENTS.md AI_HANDOFF.md .ai docs .agents || true
```

Expected result: no active references, unless a historical note explicitly says it is obsolete.

---

## 3. P0 — Fix New Tab Redirect Path in Skill Maps

### Problem

The skill routing maps still reference the obsolete path:

```text
src/background/newTabRedirect.ts
```

The current code path is:

```text
src/features/newtab/newTabRedirect.ts
```

Background-related files may still be relevant, but the redirect feature itself should be routed to the feature module.

### Files to modify

```text
.agents/skills/project-doc-routing/references/doc-routing-matrix.md
.agents/skills/project-doc-maintenance/references/surface-doc-sync-map.md
```

### Required replacement

Replace:

```text
src/background/newTabRedirect.ts
```

with:

```text
src/features/newtab/newTabRedirect.ts
```

If the row discusses runtime integration with the background worker, keep or add:

```text
src/background/serviceWorker.ts
src/background/*
```

### Recommended wording

Use this phrasing in routing maps:

```text
New Tab runtime redirect / override behavior
→ src/features/newtab/newTabRedirect.ts
→ src/background/serviceWorker.ts
→ src/background/* when message handling or Chrome API integration is affected
```

### Acceptance criteria

```bash
grep -R "src/background/newTabRedirect.ts" -n .agents/skills docs AGENTS.md || true
```

Expected result: no active references.

---

## 4. P1 — Update Old Domain Paths in Data Model Guide

### Problem

`docs/data/domain-model.md` still references old flat files such as:

```text
src/domain/bookmarkRecord.ts
src/domain/folderRecord.ts
src/domain/tagRecord.ts
```

The current project uses folder-based domain modules:

```text
src/domain/bookmark-record/
src/domain/folder-record/
src/domain/tag-record/
```

If left unchanged, future Agents may create duplicate legacy files instead of extending the current domain structure.

### File to modify

```text
docs/data/domain-model.md
```

### Required change

Replace old flat-file examples with the current folder-based structure:

```text
src/domain/bookmark-record/
  types.ts
  normalize.ts
  tableRow.ts
  index.ts

src/domain/folder-record/
  types.ts
  index.ts

src/domain/tag-record/
  types.ts
  index.ts
```

If a proposed future file does not currently exist, label it explicitly:

```text
Proposed future file, not current implementation:
src/domain/bookmark-record/export.ts
```

### Acceptance criteria

```bash
grep -R "src/domain/bookmarkRecord.ts\|src/domain/folderRecord.ts\|src/domain/tagRecord.ts" -n docs/data docs/strategy .agents AGENTS.md || true
```

Expected result: no active current-path references. Future proposals are allowed only if clearly marked as proposed.

---

## 5. P1 — Separate Current Paths from Future Entrypoint Proposals

### Problem

`docs/strategy/cloud-data-strategy.md` still mentions old or proposed paths such as:

```text
src/entrypoints/content-scripts/quick-save-content.tsx
src/entrypoints/background/serviceWorker.ts
src/entrypoints/*
```

The current project structure uses:

```text
src/main.tsx
src/popup/main.tsx
src/newtab/main.tsx
src/service-worker.ts
src/features/quick-save/content.tsx
src/background/*
```

The strategy document may discuss future architecture, but it must not present proposed paths as current facts.

### File to modify

```text
docs/strategy/cloud-data-strategy.md
```

### Required structure

Split the relevant section into two explicit subsections:

```md
## Current Entry Points

- `src/main.tsx` — Manager entry.
- `src/popup/main.tsx` — Toolbar popup entry.
- `src/newtab/main.tsx` — Optional New Tab dashboard entry.
- `src/service-worker.ts` — Extension service worker entry.
- `src/features/quick-save/content.tsx` — Quick Save content script entry.
- `src/background/*` — Background-side runtime integration.

## Proposed Future Entrypoint Layout

The following structure is a future proposal and does not represent current repository paths:

- `src/entrypoints/...`
```

### Acceptance criteria

```bash
grep -R "src/entrypoints" -n docs/strategy docs/architecture docs/workflow .agents AGENTS.md || true
```

Expected result: any remaining `src/entrypoints` references must be explicitly labeled as proposed future structure.

---

## 6. P1 — Exclude Historical AI Logs from Active Path Validation

### Problem

`.ai/logs/` contains historical records. Those files may reference old paths that were correct at the time or were part of earlier experiments.

They should not be rewritten just to satisfy current path validation.

### Files to update

```text
docs/workflow/validation-gate.md
.agents/skills/project-validation-gate/SKILL.md
```

If a docs-check script exists or is added, update:

```text
scripts/check-doc-paths.mjs
```

### Required rule

Add this rule to validation docs:

```md
Historical AI records are not active source-of-truth documents. Documentation path validation must exclude:

- `.ai/logs/`
- `.ai/dev-changelog/`
- `.ai/archive/`
- `node_modules/`
- `dist/`
- `docs/tmp/`
```

### Acceptance criteria

- Historical logs remain unchanged.
- Active docs and skills are still checked.
- No task requires mass-editing `.ai/logs/` only to update obsolete paths.

---

## 7. P2 — Add or Update Documentation Path Check

### Problem

The project now relies heavily on documentation-driven AI workflows. Broken active paths can mislead Agents.

A lightweight validation command should catch this before future runs.

### Files to add or modify

```text
scripts/check-doc-paths.mjs
package.json
docs/workflow/validation-gate.md
.agents/skills/project-validation-gate/SKILL.md
```

### Recommended package script

```json
{
  "scripts": {
    "docs:check": "node scripts/check-doc-paths.mjs"
  }
}
```

### Minimum script behavior

The script should:

1. scan active Markdown files under:

```text
AGENTS.md
AI_HANDOFF.md
README.md
README.zh-CN.md
CHANGELOG.md
docs/
.agents/skills/
.ai/README.md
.ai/runs/_TEMPLATE/
```

2. ignore historical/generated folders:

```text
.ai/logs/
.ai/dev-changelog/
.ai/archive/
node_modules/
dist/
docs/tmp/
```

3. check common path-like references:

```text
src/...
docs/...
.ai/...
.agents/...
scripts/...
```

4. report paths that do not exist, while allowing explicitly marked future/proposed paths.

### Acceptance criteria

```bash
npm run docs:check
```

Expected result: passes after P0/P1 documentation fixes.

---

## 8. Recommended Execution Order

### Step 1 — Path Convention Fix

- Normalize `.agents/skills/` references.
- Fix New Tab redirect path in skill maps.

Validation:

```bash
grep -R "\.agent/skills" -n AGENTS.md AI_HANDOFF.md .ai docs .agents || true
grep -R "src/background/newTabRedirect.ts" -n .agents/skills docs AGENTS.md || true
```

### Step 2 — Current-vs-Future Documentation Cleanup

- Update data domain paths.
- Split cloud strategy entrypoints into current and proposed sections.

Validation:

```bash
grep -R "src/domain/bookmarkRecord.ts\|src/domain/folderRecord.ts\|src/domain/tagRecord.ts" -n docs .agents AGENTS.md || true
grep -R "src/entrypoints" -n docs .agents AGENTS.md || true
```

Remaining `src/entrypoints` hits are acceptable only if explicitly marked as future/proposed.

### Step 3 — Validation Scope Rule

- Update validation docs and validation skill.
- Explicitly exclude `.ai/logs/` and other historical/generated folders.

Validation:

```bash
grep -R "\.ai/logs" -n docs/workflow .agents/skills/project-validation-gate .ai/README.md
```

Expected result: docs clearly state `.ai/logs/` is historical and excluded from active path validation.

### Step 4 — Optional Docs Check Script

- Add `scripts/check-doc-paths.mjs`.
- Add `npm run docs:check`.
- Add this command to validation gate docs.

Validation:

```bash
npm run docs:check
npm run typecheck
```

---

## 9. Definition of Done

This plan is complete when:

- all active references use `.agents/skills/`;
- no active docs point to `src/background/newTabRedirect.ts`;
- domain model docs use folder-based current domain paths;
- cloud strategy clearly separates current paths from future entrypoint proposals;
- `.ai/logs/` is treated as historical and excluded from active docs path validation;
- `docs:check` exists or the validation docs explicitly state it is pending;
- `AGENTS.md` and validation-gate Skill mention the corrected `.agents/skills/` path;
- all changed docs are reviewed for consistency.

---

## 10. Notes for the Implementing Agent

- Do not rewrite historical `.ai/logs/` unless the user explicitly asks for log cleanup.
- Do not create new source files only to satisfy old documentation paths.
- If a path is a future proposal, mark it as `Proposed` or `Future`, not as current repository structure.
- Keep this task documentation-focused unless the user explicitly asks to add the docs-check script.
- If code is changed only for validation tooling, keep it limited to `scripts/` and `package.json`.
