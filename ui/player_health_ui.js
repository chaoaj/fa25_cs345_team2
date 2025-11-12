// Extends Player with health UI + helpers. Must load AFTER player.js.
(function () {
  if (typeof Player === "undefined") {
    console.error("player_health_ui.js must load after player.js");
    return;
  }

  // Ensure HP fields exist even if player.js doesn’t set them
  const _ensureHP = function () {
    if (typeof this.maxHP !== "number") this.maxHP = 3;
    if (typeof this.hp !== "number") this.hp = this.maxHP;
    if (typeof this._hpVisual !== "number") this._hpVisual = this.hp;
  };

  Player.prototype.drawHealth = function () {
    _ensureHP.call(this);
    this._hpVisual = lerp(this._hpVisual, this.hp, 0.2);

    const barWidth  = this.playerSize;
    const barHeight = this.playerHeight * 0.12;
    const barX = this.x;
    const barY = this.y - this.playerHeight/2 - barHeight*1.2;

    // Border
    rectMode(CENTER);
    stroke(0);
    strokeWeight(1);
    noFill();
    rect(barX, barY, barWidth, barHeight, 2);

    // Fill %
    const pct = constrain(this._hpVisual / this.maxHP, 0, 1);
    let c;
    if (pct > 0.5) c = color(map(pct, 0.5, 1, 255, 0), 255, 0);
    else           c = color(255, map(pct, 0, 0.5, 0, 255), 0);

    noStroke();
    fill(c);
    const innerW = barWidth - 2;
    const innerH = barHeight - 2;
    const left   = barX - innerW/2;
    rectMode(CORNER);
    rect(left, barY - innerH/2, innerW * pct, innerH, 2);

    // Optional number
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(barHeight * 0.8);
    text(`${ceil(this._hpVisual)}/${this.maxHP}`, barX, barY);

    // Restore defaults ONLY if code relies on them elsewhere
    rectMode(CENTER);
    textAlign(LEFT, BASELINE);
  };

  Player.prototype.drawHUD = function () {
    _ensureHP.call(this);
    const margin = 12, w = 140, h = 14;

    noStroke(); fill(0, 100); rectMode(CORNER);
    rect(margin-4, margin-4, w+8, h+8, 4);

    stroke(0); strokeWeight(1); noFill();
    rect(margin, margin, w, h, 3);

    const pct = constrain(this._hpVisual / this.maxHP, 0, 1);
    let c;
    if (pct > 0.5) c = color(map(pct, 0.5, 1, 255, 0), 255, 0);
    else           c = color(255, map(pct, 0, 0.5, 0, 255), 0);

    noStroke(); fill(c);
    rect(margin+1, margin+1, (w-2)*pct, h-2, 3);

    fill(255); noStroke(); textSize(12);
    textAlign(LEFT, CENTER);
    text(`HP: ${ceil(this._hpVisual)}/${this.maxHP}`, margin+6, margin + h/2);
    textAlign(LEFT, BASELINE);
  };

  Player.prototype.takeDamage = function (amount = 1) {
    _ensureHP.call(this);
    this.hp = max(0, this.hp - max(0, amount));
    if (this.hp <= 0 && this.onDeath) this.onDeath();
  };

  Player.prototype.heal = function (amount = 1) {
    _ensureHP.call(this);
    this.hp = min(this.maxHP, this.hp + max(0, amount));
  };

  Player.prototype.setMaxHP = function (newMax, keepRatio = true) {
    _ensureHP.call(this);
    newMax = max(1, int(newMax));
    if (keepRatio) {
      const ratio = this.hp / this.maxHP;
      this.maxHP = newMax;
      this.hp = constrain(round(ratio * this.maxHP), 0, this.maxHP);
    } else {
      this.maxHP = newMax;
      this.hp = min(this.hp, this.maxHP);
    }
    this._hpVisual = this.hp;
  };

  if (!Player.prototype.onDeath) {
    Player.prototype.onDeath = function () {
      // Placeholder: respawn/reset logic
      this.hp = this.maxHP;
      this._hpVisual = this.hp;
    };
  }
})();
