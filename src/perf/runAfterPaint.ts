// Non-deprecated stand-in for InteractionManager.runAfterInteractions
// (flagged deprecated in this RN version). Schedules `fn` after the current
// frame has committed and the JS thread has gone idle once -- a reasonable
// proxy for "the screen is now interactive," used for the TTI perf mark.
export function runAfterPaint(fn: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(fn, 0);
    });
  });
}
