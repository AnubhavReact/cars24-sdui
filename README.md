# Cars24 SDUI Assignment

Server-Driven UI system for the Cars24 home/landing page — the page is rendered
entirely from a JSON payload by a generic component registry, not hardcoded
per-screen.

> Status: scaffolding only. This README will be filled in as the system is built.

## Which screen, and why

TODO — screenshot the real Cars24 home page, list every section type, and
explain why it was chosen (should clear the 5-section-type / carousel+grid /
interactive-action bar from the brief).

## Setup

```bash
npm install
npm run ios      # or: npm run android / npm run web
```

## Architecture overview

TODO — component registry, renderer, action dispatch, unknown-component fallback.

## Schema design rationale

TODO — why the JSON shape is what it is, what primitives it's built from.

## Versioning story

TODO — how an old client survives a server payload using component types or
props it doesn't understand yet.

## Trade-offs / what was cut

TODO — be explicit about anything scoped out under the timebox, and why.

## Repo layout

```
src/
  schema/    # JSON schema types + example payloads
  registry/  # component-type -> native component map
  renderer/  # walks JSON tree, invokes registry, handles fallback
  actions/   # action dispatch (navigation, state updates, sheets...)
  screens/
    static/  # hardcoded twin of the chosen screen, for perf comparison
    sdui/    # SDUI-rendered screen
  data/      # mock JSON payload(s) served locally
docs/        # supporting notes, screenshots, schema drafts
```

See also: `PERF.md`, `COVERAGE.md`, `AI_WORKFLOW.md`.
