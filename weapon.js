class Weapon {
  constructor(type) {
    this.type = type;
    this.attackCooldown = 0;
    
    // Attack properties
    this.attackDuration = 0.3; 
    this.active = false;

    // Animation properties
    this.animFrame = 0; // Current frame (0, 1, 2, or 3)
    this.animTimer = 0;
    // Each frame lasts 1/4 of the total attack duration
    this.animSpeed = this.attackDuration / 4; 
  }

  getType() { return this.type; }
  setType(type) { this.type = type; }

  update() {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime / 1000;
      if (this.attackCooldown < 0) this.attackCooldown = 0;
    }

    // Animation logic
    if (this.active) {
      this.animTimer += deltaTime / 1000;
      if (this.animTimer > this.animSpeed) {
        this.animTimer = 0;
        this.animFrame++;
        // Keep the animation on the last frame if it finishes
        if (this.animFrame > 3) {
          this.animFrame = 3;
        }
      }
    }
  }

  swordAttack(x, y, direction) {
    if (this.attackCooldown > 0 || this.active) return;

    this.active = true;
    this.attackCooldown = 0.45;

    // Reset animation on new attack
    this.animFrame = 0;
    this.animTimer = 0;

    // --- MODIFIED: Hitbox Radius ---
    // Make hitbox radius 'r' match the visual sprite length from drawAttack() (which is r * 1.5)
    const r = (windowHeight / 10) * 1.5; 
    // --- END MODIFIED ---

    const halfArc = PI / 4; // 90° total swing width

    // Center angle for each direction
    const dirAngles = {
      right: 0,
      downright: PI / 4,
      down: PI / 2,
      downleft: (3 * PI) / 4,
      left: PI,
      upleft: (5 * PI) / 4,
      up: (3 * PI) / 2,
      upright: (7 * PI) / 4
    };

    const centerAngle = dirAngles[direction] ?? 0;
    const startAngle = centerAngle - halfArc;
    const endAngle = centerAngle + halfArc;

    // Damage + Knockback
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dx = e.x - x;
      const dy = e.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // This check now uses the new, larger 'r'
      if (dist < r) {
        const angle = this.normalizeAngle(atan2(dy, dx));
        const start = this.normalizeAngle(startAngle);
        const end = this.normalizeAngle(endAngle);

        if (this.angleInArc(angle, start, end)) {
          e.hp -= 5;
          // Knockback
          const kb = 20;
          e.x += (dx / dist) * kb;
          e.y += (dy / dist) * kb;
          if (e.hp <= 0) enemies.splice(i, 1);
        }
      }
    }

    setTimeout(() => (this.active = false), this.attackDuration * 1000);
  }

  drawAttack(x, y, direction) {
    if (!this.active || !imgWeaponSheet) return;

    push();
    
    // 1. Move to the player's position (the Pivot Point)
    translate(x, y);

    // 2. Rotate to face the direction
    const dirAngles = {
      up: 0,
      upright: PI / 4,
      right: PI / 2,
      downright: (3 * PI) / 4,
      down: PI,
      downleft: (5 * PI) / 4,
      left: (3 * PI) / 2,
      upleft: (7 * PI) / 4
    };
    const centerAngle = dirAngles[direction] ?? 0;
    rotate(centerAngle);

    // 3. Setup drawing
    imageMode(CORNER); 

    // Get sprite dimensions
    const sw = imgWeaponSheet.width / 2;
    const sh = imgWeaponSheet.height / 2;
    
    // Frame picking logic
    let sx, sy;
    if (this.animFrame === 0) { // Top-left
      sx = 0; sy = 0;
    } else if (this.animFrame === 1) { // Top-right
      sx = sw; sy = 0;
    } else if (this.animFrame === 2) { // Bottom-left
      sx = 0; sy = sh;
    } else { // Bottom-right
      sx = sw; sy = sh;
    }

    // Calculate destination size
    const r = windowHeight / 10;
    const destW = r * 1.5;
    const destH = (destW / sw) * sh;

    // --- ANCHOR POINT TUNING ---
    // Increase these numbers to pull the sword closer to the center!
    
    // Shifts image LEFT. (If sword is floating to the right, increase this)
    const handleOffsetX = destW * 0.45 + 15; 
    
    // Shifts image DOWN. (If sword is floating above, increase this)
    // Note: We start at -destH (top), so adding to this moves it down towards 0.
    const handleOffsetY = destH * 0.45 - 30; 

    // 4. Draw the image with offsets
    image(imgWeaponSheet, -handleOffsetX, -destH + handleOffsetY, destW, destH, sx, sy, sw, sh);


    pop();
  }

  normalizeAngle(a) {
    a = a % (2 * PI);
    if (a < 0) a += 2 * PI;
    return a;
  }

  angleInArc(angle, start, end) {
    if (start < end) return angle >= start && angle <= end;
    return angle >= start || angle <= end;
  }
}