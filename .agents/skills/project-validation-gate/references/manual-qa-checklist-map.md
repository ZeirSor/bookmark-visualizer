# Generic Manual QA Checklist Map

Use this reference after reading the repository validation profile.

## UI Surface

- Open the affected surface through its normal entrypoint.
- Exercise the changed control, interaction, or workflow.
- Check default, hover, focus, active, disabled, loading, empty, and error states when relevant.
- Check long text, overflow, keyboard behavior, and pointer behavior when relevant.

## Data Or State Flow

- Create, update, and read the affected data through the normal UI or API path.
- Confirm persistence or reset behavior according to product expectations.
- Confirm compatibility with existing data when keys, schemas, or migrations changed.

## Runtime / External API

- Trigger the affected runtime boundary through the normal user or system action.
- Confirm permissions, authentication, host access, or environment assumptions are accurate.
- Confirm failure states are handled when the external API is unavailable.

## Documentation / Workflow

- Confirm changed docs point to existing active paths.
- Confirm examples and commands match current repository scripts.
- Confirm local skills route to project profile files instead of hard-coded project facts.
