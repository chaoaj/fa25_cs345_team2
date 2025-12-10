class Weapon {
  constructor(type) {
    this.type = type;
    this.attackCooldown = 0;

    // Attack properties
    this.attackDuration = 0.3;
    this.active = false;

    // Animation properties
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = this.attackDuration / 4;
  }

  getType() { return this.type; }
  setType(type) { this.type = type; }

  update() {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime / 1000;
      if (this.attackCooldown < 0) this.attackCooldown = 0;
    }

    if (this.active) {
      this.animTimer += deltaTime / 1000;
      if (this.animTimer > this.animSpeed) {
        this.animTimer = 0;
        this.animFrame++;
        if (this.animFrame > 3) this.animFrame = 3;
      }
    }
  }

  swordAttack(x, y, direction) {
    if (this.attackCooldown > 0 || this.active) return;

    this.active = true;
    this.attackCooldown = 0.45;

    this.animFrame = 0;
    this.animTimer = 0;

    const r = (windowHeight / 10) * 1.5; // radius used for hit detection
    const halfArc = PI / 4; // 90° total swing

    const dirAngles = {
      right: 0,
      downright: PI / 4,
      down: PI / 2,
      downleft: (3 * PI) / 4,
      left: PI,
      upleft: (5 * PI) / 4,
      up: (3 * PI) / 2,
      upright: (7 * PI) / 4,
    };

    const centerAngle = dirAngles[direction] ?? 0;
    const startAngle = centerAngle - halfArc;
    const endAngle = centerAngle + halfArc;

    // DAMAGE LOOP
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      // Boss special-case
      if (e instanceof SnakeBoss && typeof e.checkSwordHit === "function") {
        if (e.checkSwordHit(x, y, r, startAngle, endAngle)) {
          e.applyDamage(5);
        }
        continue; // skip normal logic for boss
      }

      // Normal enemies
      const dx = e.x - x;
      const dy = e.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < r) {
        const angle = this.normalizeAngle(atan2(dy, dx));
        const s = this.normalizeAngle(startAngle);
        const eA = this.normalizeAngle(endAngle);

        const inArc = (s < eA)
          ? (angle >= s && angle <= eA)
          : (angle >= s || angle <= eA);

        if (inArc) {
          e.hp -= 5;

          // simple knockback if you still want it
          const kb = 20;
          if (dist > 0) {
            e.x += (dx / dist) * kb;
            e.y += (dy / dist) * kb;
          }

          if (e.hp <= 0) {
            enemies.splice(i, 1);
          }
        }
      }
    }

    setTimeout(() => (this.active = false), this.attackDuration * 1000);
  }

  drawAttack(x, y, direction) {
    if (!this.active || !imgWeaponSheet) return;

    push();
    translate(x, y);

    const dirAngles = {
      up: 0,
      upright: PI / 4,
      right: PI / 2,
      downright: (3 * PI) / 4,
      down: PI,
      downleft: (5 * PI) / 4,
      left: (3 * PI) / 2,
      upleft: (7 * PI) / 4,
    };
    const centerAngle = dirAngles[direction] ?? 0;
    rotate(centerAngle);

    imageMode(CORNER);
    const sw = imgWeaponSheet.width / 2;
    const sh = imgWeaponSheet.height / 2;

    let sx, sy;
    if (this.animFrame === 0) {
      sx = 0; sy = 0;
    } else if (this.animFrame === 1) {
      sx = sw; sy = 0;
    } else if (this.animFrame === 2) {
      sx = 0; sy = sh;
    } else {
      sx = sw; sy = sh;
    }

    const r = windowHeight / 10;
    const destW = r * 1.5;
    const destH = (destW / sw) * sh;

    const handleOffsetX = destW * 0.45 + 15;
    const handleOffsetY = destH * 0.45 - 30;

    image(
      imgWeaponSheet,
      -handleOffsetX,
      -destH + handleOffsetY,
      destW,
      destH,
      sx,
      sy,
      sw,
      sh
    );

    pop();
  }

  normalizeAngle(a) {
    a = a % (2 * PI);
    if (a < 0) a += 2 * PI;
    return a;
  }
}
