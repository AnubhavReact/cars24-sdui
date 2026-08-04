# AI Workflow Evidence

## Tool stack

- TODO (e.g. Claude Code, model used, any other tools)

## Context / rules files

- `CLAUDE.md` / `AGENTS.md` — TODO summarize what's in them and why

## Three prompt → outcome stories

Pull the best three from `docs/prompt-log.md` once the build is further along.
Each needs: the real prompt, what the AI produced, and what was rejected or
rewritten and why.

### 1. TODO

### 2. TODO

### 3. TODO

## One AI failure

**Incident:** When wiring the SDUI renderer's tap handling, I (Claude) wrote
`HomeScreen.tsx` with a `ScrollView` whose content started at `y: 0`, with no
top padding for the Android status bar -- I only applied the status-bar
inset (`Platform.OS === 'android' ? StatusBar.currentHeight : 44`) to the
*navigation-stack overlay*, and forgot to apply the same `topPad` to the
main scrollable content. Visually this looked fine on a screenshot (the
purple header just extended up under the translucent status bar), so it
read as correct.

**How it was caught:** Testing the `openSheet` action (tapping the location
picker) live on the emulator via adb -- the tap dispatch never fired, with
no error, no crash, nothing in the logs. Same for the profile-icon tap at a
similar height. Tapping a tab chip lower on the screen worked fine. That
pattern (works below a certain y, silently fails above it) pointed at a
touch-region conflict rather than a rendering bug -- the top ~130px of
content, though visually correct, was sitting under Android's status bar,
which was still intercepting touches there even though the app drew
(translucent) content underneath it.

**Fix:** added `contentContainerStyle={{ paddingTop: topPad }}` to the main
`ScrollView` so real content starts below the status bar inset, matching
what was already done for the overlay.

**Why this is a good example of a class of AI failure:** it's a bug a
screenshot alone won't catch -- the layout looked pixel-correct, and only
live touch-interaction testing on a real device/emulator surfaced it. It's
a reminder to verify interactive behavior, not just visual output, when
reviewing AI-written UI code.

## Verification strategy

- TypeScript compiled clean (`npx tsc --noEmit`) after every schema/renderer
  change before reloading on-device.
- Every renderer change was verified by actually reloading the app on the
  Pixel_7 emulator (via adb) and screenshotting the result -- not just
  trusting that the code "looked right."
- Action dispatch (`navigate`, `openSheet`) was verified by tapping the real
  emulator via `adb shell input tap` at coordinates pulled from
  `uiautomator dump`, and confirming the expected state change both via a
  temporary `console.log` in the dispatcher (checked against `adb logcat`)
  and a follow-up screenshot -- not assumed from reading the code.

## Verification strategy

How AI-generated code was checked before being trusted — tests run, manual
device checks, code read line-by-line, etc.
