# Schema design notes

Working notes for the JSON schema, kept alongside `src/schema/types.ts` and
the example payload `src/data/home.json`. This will get condensed into
`README.md` (rationale) and `COVERAGE.md` (registry table) once the renderer
is built and we know what actually held up in practice.

## The core bet

Every visually distinct section on the real Cars24 home page (13 of them,
see `docs/screen-inventory.md`) is composed from the **same ~13 generic
primitives** — no bespoke `carCard`, `loanRail`, or `showroomCard` types.
This is the opposite of "one component type per section." The reason: the
round-1 test hands us a screen we've never seen. If our registry is
one-type-per-section, coverage on that screen is near 0% (every new visual
shape needs a new component). If the registry is generic layout + content
primitives, a new screen mostly just recombines primitives we already have —
coverage should be high, and the gaps should be legitimately new *visual
primitives* (e.g. a video player, a map), not just new arrangements of
existing ones.

Trade-off, stated up front: this makes each JSON payload more verbose (a car
card is ~15 nested nodes, not one `carCard` node with flat props). Verbosity
is an acceptable cost for generality within the timebox; a production system
would likely add a thin templating/data-binding layer on top to cut payload
size without losing the generic renderer underneath. Noting this as a
documented cut, not an oversight.

## Component registry (v1)

**Layout primitives** — take `children: Node[]`:
- `stack` — vertical linear layout
- `row` — horizontal linear layout, wraps, no scroll
- `carousel` — horizontal scrollable rail (the "at least one horizontal
  carousel/rail" requirement)
- `grid` — n-column grid (the "at least one vertical list or grid"
  requirement; used for "Manage your vehicle")
- `list` — vertical scrollable list

**Content primitives** — leaves, take `props`:
- `text`, `image`, `icon`, `badge`, `button`, `divider`, `spacer`

**Interactive primitive**:
- `tappable` — wraps one child, attaches `onTap: Action`. Every tap target
  on the page (chip, card, banner, CTA) is a `tappable` wrapping a plain
  visual node, rather than every visual primitive having its own `onTap`.
  Keeps "is this tappable" orthogonal to "what does it look like."

## Actions

`navigate | openUrl | openSheet | call | setState | toggleState | composite`

The real app's category tabs are an **in-place content swap**, not a
navigation — confirmed by tapping precisely (via exact `uiautomator`
bounds) live in the emulator, see `docs/screen-inventory.md`. An earlier,
imprecisely-tapped exploration wrongly concluded tabs navigate; that was
caught and corrected. `setState` + `visibleIf` is the mechanism used for
this: every tab is a pair of selected/unselected variants (same pattern as
the favorite-heart `toggleState` demo), and every "All tab"-only section
carries `visibleIf: {state: activeTab, equals: 'all'}`. `navigate` is still
used separately for the "listing" destination reached from the "Buy car"
rail cards and the "Buy used car" tab's own internal category grid, which
is a genuine screen change with its own back stack — the two patterns
coexist because the real app uses both, for different interactions.

## Conditionals

`visibleIf` on any node, evaluated against client-side state:
```json
"visibleIf": { "state": "activeTab", "equals": "all" }
```
Supports `and`/`or` composition. This is what satisfies the "conditionals"
line item in the coverage checklist — no node type needs to know about it,
the renderer checks it once, generically, before mounting any node.

## Styling overrides

Every node accepts an optional `style` object — a flat, intentionally small
set of props (`backgroundColor`, `padding`, `borderRadius`, `gap`, `align`,
`justify`, typography, sizing) that maps close to 1:1 onto RN style props.
Applied generically by the renderer, not per-component-type. This is what
lets the server reskin a section (new brand color, new spacing) without a
new component type or client release.

## Unknown component fallback

`type` is typed as `string`, not a closed enum, specifically so an unknown
value parses fine. The renderer's registry lookup is a plain map; a miss
renders a configurable fallback (default: render nothing and log, so a
malformed/future payload degrades silently instead of crashing the page).
Demonstrated in `src/data/home.json` via the `live_traffic_widget` node
(`type: "video_carousel"`, deliberately unregistered).

## Versioning (story, not yet implemented)

Each node may declare `minVersion: number`. An old client compares this
against its own supported schema version and, if the node requires a newer
version than the client understands, skips it (or renders a
server-suppliable fallback node — not yet built) instead of attempting to
render props it doesn't recognize. This is additive versioning: old clients
degrade gracefully on new payloads; new clients render old payloads exactly
as before since old nodes just don't set `minVersion`. Full writeup with
trade-offs goes in `README.md`.
