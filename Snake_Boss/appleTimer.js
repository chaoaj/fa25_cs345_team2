// appleTimer.js
// A simple timer utility that relies on p5.js millis() but only AFTER setup() has started.

class AppleTimer {
  constructor(duration) {
    this.duration = duration; 
    this.last = 0;  // DO NOT call millis() here (p5 isn't ready yet)
  }

  reset() {
    this.last = millis();  // Safe: called after p5 is initialized
  }

  tick(onExpire, active = true) {
    if (!active) return;

    if (millis() - this.last >= this.duration) {
      onExpire();   // Trigger callback
      this.reset(); // Restart timer
    }
  }
}

// Expose globally (non-module environment)
window.AppleTimer = AppleTimer;
