# Demo recordings

Two clips, captured via `adb shell screenrecord` directly from the Pixel_7
emulator (not a phone screen-recording app), covering the required beats:

## `1-main-demo.mp4` (~3 min)

- Home screen rendering entirely from `home.json` (JSON render)
- Unknown-component fallback: two dashed orange boxes visible near the top
  ("unknown type" and "requires schema v2") -- the page continues rendering
  normally around them, no crash
- Tapping the location picker opens a bottom sheet (`openSheet` action)
- Navigating to a car's detail page (real, param-driven screen fetched via
  the mock server, not a placeholder)
- The tenure selector (24/36/48 months) updating the displayed EMI live --
  the brief's literal example action

## `2-live-json-edit.mp4` (~1 min)

Recorded separately (screenrecord's process naturally ended after the
first clip's time limit before this beat) rather than splicing one video --
no video-editing tooling was available in this environment, so two honest
clips instead of a stitched fake continuous one.

- Shows the footer in its original state
- `home.json`'s footer section is edited directly (color + text) --
  confirmed via `git diff --stat` immediately before this recording that
  only `home.json` changed, no `.ts`/`.tsx` files
- App is force-stopped and relaunched (**no rebuild**)
- Footer now shows the edited content -- proving the JSON-only live-edit
  capability the assignment requires

The edit was reverted immediately after recording; `home.json` in the repo
is back to its original content.
