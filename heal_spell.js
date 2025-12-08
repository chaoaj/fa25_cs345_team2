// --- Tweak these to balance the game ---
const HEAL_SPELL_COST      = 3;      // Mana cost to cast
const HEAL_SPELL_AMOUNT    = 1;      // HP restored per cast
const HEAL_SPELL_COOLDOWN  = 1000;   // Cooldown in ms (1000 ms = 1 second)
// ----------------------------------------

// Main method added onto Player
Player.prototype.castHealSpell = function () {
  if (typeof this.heal !== "function") {
    console.error("Player.castHealSpell: this.heal() is not defined yet.");
    return false;
  }

  // Create cooldown tracker if missing
  if (typeof this._lastHealCastTime !== "number") {
    this._lastHealCastTime = -Infinity;
  }

  const now = millis();

  // --- Cooldown check ---
  if (now - this._lastHealCastTime < HEAL_SPELL_COOLDOWN) {
    return false;
  }

  // --- Already at full HP ---
  if (this.hp >= this.maxHP) return false;

  // --- Not enough mana ---
  if (this.mana < HEAL_SPELL_COST) return false;

  // --- Perform heal ---
  this.mana -= HEAL_SPELL_COST;
  this.heal(HEAL_SPELL_AMOUNT);

  // --- PLAY HEAL SOUND ---
  if (healsound && healsound.isLoaded()) {
    healsound.stop();        // ensures clean restart
    healsound.play();
  }

  // --- Start cooldown ---
  this._lastHealCastTime = now;

  return true;
};

// --- Draw Cooldown Visual (Cross Always Visible) ---
Player.prototype.drawHealCooldown = function () {
  const now = millis();

  // Compute cooldown progress
  let elapsed = now - this._lastHealCastTime;

  // pct = 1 → ready (full bar)
  // pct = 0 → just cast (empty bar)
  let pct = 1;

  if (elapsed < HEAL_SPELL_COOLDOWN) {
    pct = constrain(elapsed / HEAL_SPELL_COOLDOWN, 0, 1);
  }

  const size = 60;
  const arm = size * 0.35;     // thickness of cross arms
  const x   = width - 80;
  const y   = height - 140;

  push();
  translate(x, y);
  rectMode(CENTER);

  // -------------------------------------------------
  // 1️⃣ ALWAYS draw permanent black cross outline
  // -------------------------------------------------
  stroke(0);
  strokeWeight(4);
  noFill();

  // Horizontal bar of cross
  rect(0, 0, size, arm);

  // Vertical bar of cross
  rect(0, 0, arm, size);

  // -------------------------------------------------
  // 2️⃣ Draw green fill (fills UPWARD)
  // pct controls how much is filled
  // -------------------------------------------------
  noStroke();
  fill(0, 200, 0);

  const fillHeight = size * pct;
  const fillCenterY = (fillHeight - size) / 2;

  // Vertical arm fill
  rect(0, fillCenterY, arm, fillHeight);

  // Horizontal arm fills AFTER 50% progress
  if (pct > 0.5) {
    const horizPct = map(pct, 0.5, 1, 0, 1);
    const horizH = arm * horizPct;
    const horizCenterY = -(arm / 2) + horizH / 2;

    rect(0, horizCenterY, size, horizH);
  }

  pop();
};
