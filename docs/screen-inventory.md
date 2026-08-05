# Reference screen: Cars24 home page

Captured from the real Cars24 app running on the Pixel_7 emulator
(`docs/reference-screenshots/home-1.png` ... `home-6.png`, top to bottom).

## Section inventory

| # | Section | Layout | Notes |
|---|---|---|---|
| 1 | Header | location picker + search bar (rotating placeholder text) + profile icon | |
| 2 | Category tabs | horizontal tab selector: All / Buy used car / Sell car / Loans / Challan | candidate for the required SDUI action (selection likely changes content below) |
| 3 | "Buy car" rail | horizontal carousel, pill cards, has a promo badge | |
| 4 | "Sell your car" rail | horizontal carousel, pill cards | |
| 5 | "Get loans" rail | horizontal carousel, circular icon cards | |
| 6 | "Car check services" rail | horizontal carousel, outlined cards | |
| 7 | Car listings rail | horizontal carousel, rich cards: image, "Cars24 Owned stock" badge, title, spec chips (km/fuel/transmission/reg), price + EMI, feature badges | this is the "car card rail" called out in the brief |
| 8 | "Manage your vehicle" | 2x3 **grid** (not a rail) + "+ Add vehicle" action | satisfies the vertical grid requirement |
| 9 | Promo banner | single full-width card (Cars24 x Spotify) | |
| 10 | Showrooms rail | horizontal carousel, cards with image, cars-in-stock count, distance, open/close status, 2 CTA buttons each | |
| 11 | "Trending new cars" rail | horizontal carousel + "View all" header link | |
| 12 | Marketing banner carousel | horizontal swipeable full-bleed banners | |
| 13 | Footer / brand section | static tagline block, no interactivity | |

13 distinct section types, well past the "5 visually distinct section types" bar.
Has rails (horizontal) and a grid (vertical), and the category-tab selector is a
strong candidate for the required SDUI-driven interactive element.

## Findings from live exploration (real app, via emulator + adb)

- **CORRECTED finding: category tabs swap content in place; they do not
  navigate.** The original note here said tabs `navigate` to a full
  listing/search screen. That was wrong -- it was based on an imprecise,
  eyeballed tap coordinate (before this build adopted the discipline of
  reading exact bounds via `adb shell uiautomator dump` for every tap),
  which almost certainly missed the tab and landed on a neighboring
  element instead. Re-verified carefully with exact bounds
  (`content-desc="Buy used car"`, clickable area `[226,424][528,614]`):
  tapping "Buy used car" keeps the header, tab bar, and bottom nav all
  identical, and only swaps the body content below the tabs (a 2x2
  category grid + a "Cars you'll love" rail + "Explore by brand" +
  "Buy used cars by body type"). This is the brief's own literal example
  of the required interactive element ("a tab/chip selection that changes
  content") -- modeled with `setState` + `visibleIf`, not `navigate`.
  Caught by the user reviewing the running app and flagging the
  discrepancy against the real Cars24 app, not caught internally --
  logged in `AI_WORKFLOW.md`.
- The listing screen -> car detail screen is a good candidate for the
  "different screen" surprise test in round 1: it reuses some patterns (car
  card) but adds new ones (image carousel with tabs, EMI/price block, sticky
  bottom CTA bar).
- The brief's "tenure selector -> EMI" example isn't present in-place on
  these screens as tested — "Check eligibility" on the car detail page
  bounced back without showing a sheet (likely gated behind login). Not
  chasing this further; per the brief this was only an example ("e.g.") of
  a valid interactive action. **Decision: use the category-tab selection
  (now correctly modeled as an in-place content swap, see above) as our
  required SDUI-driven interactive element**, and note this substitution
  explicitly in the README.
