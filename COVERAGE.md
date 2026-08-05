# Coverage — how far does the schema generalize

## Component registry (v1, `CLIENT_SCHEMA_VERSION = 1`)

| Type | Category | Props | Notes |
|---|---|---|---|
| `stack` | layout | -- | vertical linear layout of children |
| `row` | layout | `wrap?` | horizontal linear layout of children, no scroll |
| `carousel` | layout | `showsIndicator?` | horizontal scrollable rail -- every rail on the home page (Buy car, car listings, showrooms, trending, value-prop banners) is this one type |
| `grid` | layout | `columns` | n-column grid -- "Manage your vehicle" |
| `list` | layout | -- | vertical scrollable list -- "Why choose Cars24" |
| `text` | content | `content`, `variant?`, `numberOfLines?` | |
| `image` | content | `uri`, `resizeMode?` | |
| `icon` | content | `name` (Ionicons), `size?` | |
| `badge` | content | `text`, `tone?` | |
| `button` | content | `label`, `variant?`, `selected?` | `variant: 'chip'` + `selected` is how the tab selector's active state is expressed |
| `divider` | content | `thickness?` | |
| `spacer` | content | `size` | |
| `tappable` | interactive | -- (wraps 1 child) | the only thing that can carry `onTap`; every tap target on the page (chip, card, banner, CTA, call button) is this wrapping a plain visual node |

13 types total. No section-specific types (no `carCard`, `loanRail`, `showroomCard`, etc.) -- every one of the 13 visually distinct sections on the real
home page (see `docs/screen-inventory.md`) is composed from this same set.

## Patterns supported

- [x] Lists / grids -- `grid` ("Manage your vehicle"), `list` ("Why choose Cars24")
- [x] Carousels/rails -- `carousel`, used 6 times (category tabs, buy-car rail, car listings, showrooms, trending, value-prop banners)
- [x] Conditionals -- `visibleIf` (`equals`/`notEquals`/`and`/`or`), demonstrated by the "All" tab's selected-chip styling
- [x] Actions -- 6 of 7 action types demonstrated live on the home screen: `navigate` (tabs, cards, CTAs), `openSheet` (location picker), `openUrl` (promo banner), `call` (showroom "Call us now"), `setState` (tab selection), `toggleState` (car-card favorite heart, paired with `visibleIf` to swap the outline/filled icon). `composite` (run several actions from one tap) is implemented in the dispatcher but has no home-screen use case that needs it yet -- kept simple rather than forced.
- [x] Styling overrides -- every node's `style` (color, spacing, radius, sizing, typography, flex alignment) is applied generically by the renderer, not per-type
- [x] Unknown-component fallback -- `video_carousel` node (unregistered type) and `ar_preview_banner` node (`minVersion: 2`, newer than this client) both degrade to the same silent-in-prod / labeled-in-dev fallback, proving both degrade paths independently
- [x] Versioning -- `minVersion` on a node + `CLIENT_SCHEMA_VERSION` in the client; see `README.md` for the full story

## Honest coverage claim

Given a new Cars24 screen built from the same visual language (headers, rails,
grids, cards, banners, CTAs, tab/chip selectors) -- which is true of most
Cars24 screens, since they share a consistent design system -- **I'd expect
60-80% of it to render with JSON-only changes**, because it recomposes the
same 13 primitives in a new arrangement.

The patterns that would need new client code:
- **New interaction primitives** the registry has no equivalent for -- e.g. a
  drag-to-reorder list, a map view, a video player, a slider/stepper input
  (the tenure-selector-style control from the brief would need this)
- **New visual primitives** with genuinely different rendering, not just
  different styling -- e.g. a circular progress ring, a chart
- **Complex multi-field forms** with client-side validation logic that goes
  beyond "collect input, dispatch an action"

This was tested empirically, not just estimated: `docs/screen-inventory.md`
documents exploring the real app's listing screen and car-detail screen (a
screen this system was *not* built for). Both are composed almost entirely
of patterns already in the registry -- rails, cards, badges, CTA rows, a
sticky bottom bar (expressible as a `stack` with `position`-style overrides
if that prop is added) -- with the clearest gap being the image-carousel
with tab strip (Exterior/Interior/Features/Highlights/Tyres) on the car
detail page, which is a new interactive primitive, not a restyle.

It was also tested by actually building two more real screens, not just
inspecting them:

- **"listing"** (reached from the home page's category tab and "Buy car"
  rail) -- a different `Screen` JSON per `category` param
  (`all`/`budget`/`premium`/`buy_used_car`).
- **"car_detail"** (reached from every car card across home, the listing
  results, and the "Buy used car" tab's rail) -- a different `Screen` JSON
  per `listingId` param, matched against the real app's actual car-detail
  layout (`docs/reference-screenshots/car-detail-1.png`): hero image, spec
  chip row, stock badge, title/variant, location, feature badges, an EMI
  box, a price box, and a two-button CTA row.

Both are served by `src/server/mockServer.ts` and rendered through the
identical `RenderNode` used for the home screen, with **zero new component
types** across either screen. That's two real screens at effectively 100%
JSON-only coverage, which is the strongest evidence in this doc for the
coverage claim above -- not just an estimate.

Building `car_detail` also surfaced a real renderer bug -- see
`AI_WORKFLOW.md`'s failure story -- which is itself a data point: the gap
found by extending coverage wasn't a missing *pattern* in the schema, it
was a bug in how the *existing* primitives combined a variant default with
a custom style override. Fixed at the root (`styleUtils.ts`), not patched
per-node.

## Round-1 surprise-screen result

To be filled in during the live round-1 test: screen given, % rendered with
zero code changes, what needed a new component, and how long it took (with
AI tools) to add it.
