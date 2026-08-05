# Performance — Static vs SDUI

## Device & methodology

- **Device:** Android emulator, AVD `Pixel_7` (`sdk_gphone64_arm64`), Android 16, run via Android Studio's emulator on this machine.
  **Caveat, stated up front:** this is an emulator, not a physical device. The brief asks for "same device" -- that's satisfied for the *relative* Static-vs-SDUI comparison (both variants ran on the identical emulator instance, back to back, same session), but the *absolute* numbers below will not transfer to a real phone. Treat the overhead percentages as the meaningful output of this report, not the raw millisecond counts.
- **Build type:** release (`npx expo run:android --variant release`), not dev/debug -- confirmed by the absence of the dev-mode fallback banners (`UnknownComponent`'s dev placeholder, which is `__DEV__`-gated) in the release screenshots.
- **App variants:** a single codebase with a build-time constant (`INITIAL_SCREEN` in `App.tsx`) flipped between `'static'` and `'sdui'`, rebuilt as a release APK for each. This means each variant is genuinely the first screen rendered after a cold process start -- an in-app runtime toggle would not give valid cold-start numbers for the screen switched *into*, so the toggle button visible in the app is for demo/QA only, not how these numbers were produced.
- **Sample size:** n=3 repeat cold starts per variant, n=4 scroll passes per variant. Small sample, stated honestly -- this is enough to see the shape of the result, not enough to defend a specific millisecond figure to two decimal places.
- **How each metric was captured:**
  - **Native cold-launch time:** `adb shell am start -W -n <pkg>/.MainActivity`, reading `TotalTime` (Android's own measurement from `startActivity` to first frame drawn). The very first launch after each `adb install` was **discarded** -- it includes one-time APK verification / ART compilation overhead (observed: 6326ms on the first launch vs. 98-322ms on repeat launches of the identical build). Only repeat cold starts (force-stop, then relaunch) are reported.
  - **JS-side marks:** `src/perf/timing.ts`'s `mark()`, logged via `console.log` and read back with `adb logcat`, filtered to the app's PID. `sdui_module_eval_done` / `static_module_eval_done` fire at JS module evaluation (proxy for "JS bundle has started executing"); `*_mount_committed` fires in a `useEffect` right after first commit; `*_first_layout` fires on the root `ScrollView`'s `onLayout` (proxy for **TTR** -- above-the-fold content has been measured and placed); `*_interactions_ready` fires after two `requestAnimationFrame`s + a `setTimeout(0)` past mount (proxy for **TTI**).
  - **SDUI JSON breakdown:** the JSON payload (`src/data/home.json`) is bundled locally and `require`d, not fetched over the network, so there is no isolable "fetch" phase (~0ms) and no isolable "parse" phase either -- it becomes part of the JS bundle's data segment and is parsed together with everything else at bundle-eval time. To still give a number for the "parse" side of this metric, `sdui_json_parse_bench` times a synthetic `JSON.parse(JSON.stringify(homeJson))` round-trip on the same payload once at module load -- an honest estimate of what parsing this payload *would* cost if it arrived as network JSON text, clearly not a measurement of what actually happens in this local-bundle architecture.
  - **Scroll perf:** `src/perf/scrollJank.ts`, a `requestAnimationFrame`-delta counter started/stopped on `onScrollBeginDrag`/`onScrollEndDrag` of the main `ScrollView`, driven by `adb shell input swipe`. This is a JS-thread proxy for jank -- it will not catch UI-thread-only stalls (e.g. a slow native image decode blocking the compositor without ever touching JS). Stated as a limitation, not fixed within this timebox.

## Results

| Metric | Static | SDUI | Overhead |
|---|---|---|---|
| Cold launch, native `TotalTime` (repeat cold starts, n=3) | 322 / 137 / 98ms → avg **186ms** | 301 / 221 / 219ms → avg **247ms** | **+33%** |
| TTR proxy: `first_layout` since JS eval start (n=3) | 107 / 72 / 19ms → avg **66ms** | 91 / 70 / 51ms → avg **71ms** | **+8%** |
| TTI proxy: `interactions_ready` since JS eval start (n=3) | 149 / 121 / 79ms → avg **116ms** | 157 / 108 / 102ms → avg **122ms** | **+5%** |
| Mount → commit (JS-measured) | 71 / 48 / 19ms → avg **46ms** | 56 / 49 / 24ms → avg **43ms** | **-7%** (SDUI slightly faster in this sample -- within noise) |
| Full page time | Not separately isolated -- see note below | | |
| Scroll perf (dropped frames, n=4 swipes) | 1/13, 0/14, 0/14, 0/14 | 0/14, 0/14, 0/14, 0/13 | No measurable difference |

### SDUI breakdown

- JSON fetch: **0ms** (bundled locally, not fetched -- see methodology)
- JSON parse: folded into bundle eval, not separately isolable; synthetic re-parse benchmark of the same payload: **0-1ms**
- View-build (mount → first layout): comparable to static, see table

### Full page time note

Both variants build their entire node tree in one synchronous React render
pass (there's no incremental/lazy section rendering in either), so
`first_layout` is effectively "all sections structurally mounted" for both --
there wasn't a separate "full page" moment to isolate beyond TTR here.
Remote images (`picsum.photos`) load asynchronously on top of both variants
identically, using the same URLs, so image-decode latency is a wash between
Static and SDUI and correctly excluded from the "SDUI overhead" number.

## Reading these numbers honestly

- The **native cold-launch overhead (+33%)** is the largest gap and the
  least explained by this investigation -- it's a bigger jump than anything
  visible in the JS-side marks, which suggests it's dominated by
  native-side work (bundle size difference between the two APKs, class
  loading, etc.) rather than anything in the SDUI renderer itself. This is
  flagged as a real open question, not swept under the rug: with more time,
  the next step would be comparing APK sizes and running a systrace capture
  instead of relying on `am start -W` alone.
- The **JS-measurable overhead (TTR +8%, TTI +5%)** is small and, given the
  n=3 sample size on an emulator, close to measurement noise. `mount → commit`
  was actually *faster* for SDUI in this sample, which is a coincidence of a
  small sample size, not a real SDUI performance advantage -- included for
  honesty, not because it should be believed.
- **Scroll performance showed no measurable difference.** At this page's
  complexity (13 sections, ~150 total nodes), neither variant dropped
  meaningful frames.

## Optimization log

1. **Checked for a structural strawman.** Before trusting any of the above,
   I compared the two implementations' view-tree shape directly (not just
   their pixel output) -- it would be easy to make "static" look artificially
   fast by writing flatter, less-nested JSX than the SDUI renderer produces.
   `StaticHomeScreen.tsx` was deliberately written with comparable nesting
   depth to what the SDUI renderer actually produces for the same content
   (e.g. the car card is a comparable number of nested `View`/`Text` either
   way). Result: no artificial gap found, which is why the JS-level overhead
   measured this small.
2. **Did not chase the native `TotalTime` gap within this timebox.** Given
   it's the one number here that doesn't have a JS-side explanation yet,
   the honest move given the 8-10hr budget was to report it clearly with a
   named next step (APK size diff + systrace) rather than either hide it or
   guess at a fix without evidence.
3. **Found and fixed a repeat-navigation latency bug -- caught by manual
   testing against the real app, not by the automated perf harness above.**
   Every `navigate` in the SDUI screen goes through a mock server with a
   simulated 450ms network delay (`src/server/mockServer.ts`). The
   destination screen was written to reset to a loading spinner on *every*
   navigation, including repeat visits to a screen+params combination
   already fetched earlier in the session -- so reopening the same car
   detail page a second time replayed the full 450ms wait and spinner
   again, every time.

   This was caught by directly comparing against the real Cars24 app: a
   car detail page there shows a skeleton on first visit, then opens
   *instantly* on a revisit (revalidating in the background, no visible
   loading state) -- confirmed live, screenshotted, timed. Our app didn't
   do this.

   **Fix:** an in-memory stale-while-revalidate cache
   (`src/server/screenCache.ts`), keyed by `screenId + params`. First
   visit to a given screen+params: show the loading state, fetch, cache
   the result. Every later visit to the *same* screen+params: render the
   cached `Screen` JSON immediately (no loading state at all), while a
   fresh fetch still happens invisibly behind it and refreshes the cache
   for next time.

   **Before/after, measured:** cold navigation to a car detail page took
   the full ~450ms simulated fetch, with a spinner visible for that
   duration. After the fix, a repeat visit to the same car renders fully
   populated content within ~150ms of the tap (screenshotted at a 150ms
   delay after `input tap`, before the simulated fetch would even
   resolve) -- confirmed the fast path is the cache hit, not luck, since
   150ms is well under the 450ms fetch time. Not a rigorous multi-sample
   timing (this was a manual-testing catch, not a run through the
   `mark()`/`adb logcat` harness used for the cold-start numbers above),
   but the qualitative result -- zero perceived loading on revisit,
   matching the real app -- is unambiguous and was directly verified, not
   assumed.
