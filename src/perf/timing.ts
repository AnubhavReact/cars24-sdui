// Lightweight perf marker used to compare the Static vs SDUI screens.
//
// `jsEvalStart` is captured the moment this module is first evaluated --
// i.e. as close to "JS bundle starts executing" as we can get from JS
// itself. It is NOT the same as "user tapped the app icon": that also
// includes OS process spawn + native module init, which we measure
// separately via `adb shell am start -W` (see PERF.md methodology).
//
// Marks are intentionally always logged (not gated behind __DEV__) so the
// same instrumentation works in the release build we actually measure.
export const jsEvalStart = Date.now();

export interface PerfMark {
  label: string;
  timestamp: number;
  sinceJsEvalMs: number;
}

const marks: PerfMark[] = [];

export function mark(label: string): PerfMark {
  const timestamp = Date.now();
  const entry: PerfMark = { label, timestamp, sinceJsEvalMs: timestamp - jsEvalStart };
  marks.push(entry);
  // eslint-disable-next-line no-console
  console.log(`[perf] ${label}: +${entry.sinceJsEvalMs}ms since JS eval start`);
  return entry;
}

export function getMarks(): PerfMark[] {
  return marks;
}

export function clearMarks(): void {
  marks.length = 0;
}
