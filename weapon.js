class Weapon {
  constructor(type) {
    this.type = type;
    this.attackCooldown = 0;

    this.attackDuration = 0.3;
    this.active = false;

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

    const r = (windowHeight / 10) * 1.5;
    const halfArc = PI / 4;

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

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      // Boss special logic
      if (typeof e.checkSwordHit === "function") {
        if (e.checkSwordHit(x, y, r, startAngle, endAngle)) {
          e.applyDamage(5);
        }
        continue;
      }

      // Normal enemy logic
      const dx = e.x - x;
      const dy = e.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < r) {
        const angle = this.normalizeAngle(atan2(dy, dx));
        const s = this.normalizeAngle(startAngle);
        const eA = this.normalizeAngle(endAngle);

        const inArc = (s < eA)
          ? angle >= s && angle <= eA
          : angle >= s || angle <= eA;

        if (inArc) {
          e.hp -= 5;
          if (e.hp <= 0) enemies.splice(i, 1);
        }
      }
    }

    setTimeout(() => this.active = false, this.attackDuration * 1000);
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
      upleft: (7 * PI) / 4
    };

    rotate(dirAngles[direction] ?? 0);

    imageMode(CORNER);

    const sw = imgWeaponSheet.width / 2;
    const sh = imgWeaponSheet.height / 2;

    let sx = (this.animFrame % 2) * sw;
    let sy = (this.animFrame < 2) ? 0 : sh;

    const r = windowHeight / 10;
    const destW = r * 1.5;
    const destH = (destW / sw) * sh;

    const handleOffsetX = destW * 0.45 + 15;
    const handleOffsetY = destH * 0.45 - 30;

    image(imgWeaponSheet,
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
