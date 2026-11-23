// Milliseconds from `now` until just after the next local midnight.
export function msUntilNextMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
  return next.getTime() - now.getTime();
}

// Runs `task` shortly after every local midnight. Each run schedules the next
// one from the clock, so daylight saving changes do not make it drift.
// Returns a function that stops the schedule.
export function runDaily(task, { setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  let timer;
  function schedule() {
    timer = setTimer(() => {
      task();
      schedule();
    }, msUntilNextMidnight());
    timer?.unref?.();
  }
  schedule();
  return () => clearTimer(timer);
}
