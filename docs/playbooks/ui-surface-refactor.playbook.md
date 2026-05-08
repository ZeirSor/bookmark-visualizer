# Playbook: UI Surface Refactor

## When To Use

Use this playbook for UI layout, styling, component structure, interaction state, and visual consistency work.

Examples:

- redesigning the popup Save tab;
- aligning the manager page with a target preview;
- fixing New Tab layout hierarchy;
- extracting shared UI primitives;
- changing folder cascade menu visuals or behavior.

## Required Inputs

Read:

- `AGENTS.md`
- `docs/frontend/design-system.md`
- `docs/frontend/component-patterns.md`
- `docs/frontend/accessibility-and-interaction.md`
- affected `docs/frontend/surfaces/<surface>/README.md`
- affected surface UI / CSS / interaction docs
- `docs/frontend/surfaces/shared/` when shared components are touched
- `docs/frontend/surfaces/reference/03-regression-checklist.md`

## Refactor Rules

- Do not delete existing functionality for visual cleanup unless the user explicitly asks.
- Preserve existing data and Chrome API flows unless the task explicitly targets them.
- List the current functional behavior before changing layout.
- Prefer shared design tokens over hard-coded one-off values.
- Keep shared components generic; do not leak surface-specific assumptions into shared primitives.
- Update PageDocs when layout, selectors, states, or code paths change.

## Steps

1. Identify the affected surface and current component tree.
2. List behavior that must be preserved.
3. Compare current UI against the target design or issue.
4. Identify shared components and styles affected.
5. Break the refactor into small visual / structural sub-tasks.
6. Implement one sub-task.
7. Validate with build / typecheck and manual surface QA.
8. Update PageDocs and handoff.

## Required PageDocs Updates

Check and update when affected:

- layout map;
- component catalog;
- interactions and data flow;
- CSS / design tokens;
- shared component docs;
- UI element index;
- regression checklist.

## Validation

At minimum:

```bash
npm run typecheck
npm run build
```

Manual QA must cover:

- default state;
- hover / focus / active states when applicable;
- empty / loading / error states when applicable;
- narrow or constrained container behavior;
- affected keyboard or pointer interactions.
