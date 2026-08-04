// Frame-drop counter for the "scroll perf" metric. Samples requestAnimationFrame
// deltas while active; any gap wider than one vsync interval (~16.6ms @60fps)
// counts the extra frames as dropped. This is a JS-thread proxy for jank --
// it will not catch UI-thread-only stalls, which is a documented limitation
// in PERF.md, not something this file claims to solve.
export function createFrameJankTracker() {
  let lastFrameTime = 0;
  let droppedFrames = 0;
  let totalFrames = 0;
  let rafId: number | null = null;
  let running = false;

  function loop(time: number) {
    if (!running) return;
    if (lastFrameTime) {
      const delta = time - lastFrameTime;
      totalFrames += 1;
      if (delta > 32) {
        droppedFrames += Math.floor(delta / 16.6) - 1;
      }
    }
    lastFrameTime = time;
    rafId = requestAnimationFrame(loop);
  }

  return {
    start() {
      running = true;
      lastFrameTime = 0;
      droppedFrames = 0;
      totalFrames = 0;
      rafId = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      return { droppedFrames, totalFrames };
    },
  };
}
