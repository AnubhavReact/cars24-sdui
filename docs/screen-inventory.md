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

## Open questions to resolve during schema design

- Does the category tab selection actually re-filter the sections below, or
  just navigate? (Need to tap it and observe — not yet confirmed.)
- The "tenure selector -> EMI" interaction mentioned in the brief isn't on this
  page as-is; may need to add it inside the car card / a detail sheet, or
  pick a different concrete interactive element and justify it in the README.
