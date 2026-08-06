# Demo recording

`demo.mp4` — screen recording covering the required beats. (Re-encoded
with ffmpeg from the original ~186MB QuickTime `.mov` capture down to
~2.4MB, same content, to fit under GitHub's 100MB file limit -- mostly
static UI compresses extremely well.)

- **Page rendering from JSON** — cold open, full scroll through the home
  screen, all sections rendering from `src/data/home.json`
- **Unknown-component fallback** — the two dashed orange boxes near the
  top of the page (unregistered type, and a node requiring a newer schema
  version than this client supports); the page renders normally around
  them instead of crashing
- **Bottom sheet** — tapping the location picker opens a real,
  JSON-driven sheet (search box, banner, CTA, popular-cities grid)
- **Tenure selector + EMI** — on the car detail page, selecting a
  different loan tenure (24/36/48 months) updates the displayed EMI live
- **Live JSON edit, no rebuild** — `home.json`'s `trending_rail` section
  had its `type` changed from `"carousel"` to `"grid"` (one word), the app
  was force-stopped and relaunched with no build step, and the section
  visibly changed from a horizontal scrolling rail to a vertical grid --
  proving the JSON controls page *structure*, not just styling
