
export class AppleTimer {
  constructor(timeoutMs = 5000, nowFn = defaultNow) {
    this.timeoutMs = timeoutMs;
    this.nowFn = nowFn;
    this.lastSpawn = this.nowFn();
  }
  reset() {
    this.lastSpawn = this.nowFn();
  }
  tick(onTimeout, isActive = true) {
    if (!isActive) return;
    if (this.nowFn() - this.lastSpawn >= this.timeoutMs) {
      onTimeout();    // e.g., placeApple()
      this.reset();
    }
  }
}

function defaultNow() {
  // Use p5's millis() when available; otherwise high-res time.
  if (typeof millis === 'function') return millis();
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  return Date.now();
}
