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


 Player.prototype.drawHUD = function () {
  // smooth animation toward current HP
  if (typeof this._hpVisual === "undefined") this._hpVisual = this.hp;
  this._hpVisual = lerp(this._hpVisual, this.hp, 0.2);

  // placement & size (bottom center)
  const margin = 200;              // distance from bottom edge
  const barWidth = width * 0.2;   // total length of the bar
  const barHeight = 24;           // thickness
  const barX = 20;
  const barY = height - margin - barHeight;
  const r = 6;                    // corner radius

  // background panel (subtle plate)
  noStroke();
  fill(0, 0, 0, 120);
  rectMode(CORNER);
  rect(barX - 4, barY - 4, barWidth + 8, barHeight + 8, r + 2);

  // border
  stroke(255);
  strokeWeight(2);
  noFill();
  rect(barX, barY, barWidth, barHeight, r);

  // fill percent
  const pct = constrain(this._hpVisual / this.maxHP, 0, 1);
  const fillW = barWidth * pct;

  // RED fill — draw from the RIGHT edge so loss eats from right->left
  noStroke();
  fill(220, 0, 0); // solid red
  const rightEdge = barX + barWidth;
  rect(rightEdge - fillW, barY, fillW, barHeight, r);

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
