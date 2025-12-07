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


  // --- MODIFIED: drawHUD function ---
  Player.prototype.drawHUD = function () {
    // smooth animation toward current HP
    if (typeof this._hpVisual === "undefined") this._hpVisual = this.hp;
    this._hpVisual = lerp(this._hpVisual, this.hp, 0.2);

    // ADDED: smooth animation for MP
    if (this.maxMana > 0) { // Only if mana exists
      if (typeof this._mpVisual === "undefined") this._mpVisual = this.mana;
      this._mpVisual = lerp(this._mpVisual, this.mana, 0.2);
    }

    // --- Fallback to simple rects if images aren't loaded ---
    if (!imgHPBarFrame || !imgHPBarFill) {
      console.warn("HUD images not loaded. Drawing simple bar.");
      // placement & size (bottom-left)
      const margin_bottom = 200; // distance from bottom edge
      const barWidth = width * 0.2; // total length of the bar
      const barHeight = 24; // thickness
      const barX = 20;
      const barY = height - margin_bottom - barHeight;
      const r = 6; // corner radius

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

      // RED fill
      noStroke();
      fill(220, 0, 0); // solid red
      rect(barX, barY, fillW, barHeight, r);
      return; // Stop here
    }
    // --- END Fallback ---


    // --- New Sprite-based HUD (Bottom-Left) ---
    
    // --- MODIFIED: Size and Position ---
    // Calculate width relative to screen, just like the old bar
    const barW = width * 0.2; 
    // Calculate scale based on new width vs. original sprite width
    const barScale = barW / imgHPBarFrame.width;
    // Calculate height based on the new scale
    const barH = imgHPBarFrame.height * barScale;

    const barX = 20; // Same X as old bar
    const margin_bottom = 200; // Same bottom margin as old bar
    const bar_gap = 10; // Space between HP and MP bars
    // --- END MODIFIED ---

    imageMode(CORNER);
    noStroke();

    // --- 1. Draw MP Bar (if it exists) ---
    // We draw the MP bar first so we can place the HP bar above it
    let barY_MP = 0;
    if (this.maxMana > 0 && imgMPBarFrame && imgMPBarFill) {
      // Position from bottom
      barY_MP = height - margin_bottom - barH; 
      const mpPct = constrain(this._mpVisual / this.maxMana, 0, 1);

      // Draw the BLUE FILL
      if (mpPct > 0) {
        let mpFillSrcW = imgMPBarFill.width * mpPct;
        image(
          imgMPBarFill,
          barX, barY_MP,            // Dest pos
          barW * mpPct, barH,       // Dest size
          0, 0,                     // Source pos
          mpFillSrcW, imgMPBarFill.height // Source size
        );
      }
      // Draw the SILVER FRAME on top
      image(imgMPBarFrame, barX, barY_MP, barW, barH);
    }
    
    // --- 2. Draw HP Bar ---
    
    // Position HP bar relative to bottom/MP bar
    let barY_HP;
    if (barY_MP > 0) {
      // If MP bar exists, place HP bar above it
      barY_HP = barY_MP - barH - bar_gap;
    } else {
      // No MP bar, just place HP bar at the bottom position
      barY_HP = height - margin_bottom - barH;
    }

    const hpPct = constrain(this._hpVisual / this.maxHP, 0, 1);
    
    // Draw the RED FILL (cropping the source image)
    if (hpPct > 0) {
      let hpFillSrcW = imgHPBarFill.width * hpPct;
      image(
        imgHPBarFill,
        barX, barY_HP,             // Dest pos (on screen)
        barW * hpPct, barH,        // Dest size (scaled by pct)
        0, 0,                      // Source pos (start from left of sprite)
        hpFillSrcW, imgHPBarFill.height // Source size (crop width by pct)
      );
    }
    
    // Draw the GOLD FRAME on top
    image(imgHPBarFrame, barX, barY_HP, barW, barH);

    this.drawHealCooldown();

  };
  // --- END MODIFIED ---


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

  // --- MODIFIED: onDeath function ---
  Player.prototype.onDeath = function () {
    // Set global game state variable (defined in startup.js)
    if (typeof window.isGameOver !== 'undefined') {
      window.isGameOver = true;
    }
    // No need to reset HP here; resetGame will handle that.
  };
  // --- END MODIFIED ---
})();
