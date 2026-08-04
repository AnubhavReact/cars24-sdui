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

- **Category tabs navigate, they don't filter in place.** Tapping "Buy used
  car" on the home page pushes a full listing/search screen (filters, sort,
  budget chips, results count, car cards with "Free Test Drive" / "View
  Details"). So the tab selector is a `navigate` action, not an in-place
  content swap — model it that way in the schema (an action with a
  `navigate` type + target screen id, not a conditional-render toggle).
- The listing screen -> car detail screen is a good candidate for the
  "different screen" surprise test in round 1: it reuses some patterns (car
  card) but adds new ones (image carousel with tabs, EMI/price block, sticky
  bottom CTA bar).
- The brief's "tenure selector -> EMI" example isn't present in-place on
  these screens as tested — "Check eligibility" on the car detail page
  bounced back without showing a sheet (likely gated behind login). Not
  chasing this further; per the brief this was only an example ("e.g.") of
  a valid interactive action. **Decision: use the category-tab
  navigation action (or an equivalent chip/tab selection with visible
  content change) as our required SDUI-driven interactive element**, and
  note this substitution explicitly in the README.
