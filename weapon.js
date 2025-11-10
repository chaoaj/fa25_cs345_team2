class Weapon {
  constructor(type) {
    this.type = type;
    this.attackCooldown = 0;
    this.attackDuration = 0.15;
    this.active = false;
  }

  getType() { return this.type; }
  setType(type) { this.type = type; }

  update() {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime / 1000;
      if (this.attackCooldown < 0) this.attackCooldown = 0;
    }
  }

  swordAttack(x, y, direction) {
    if (this.attackCooldown > 0 || this.active) return;

    this.active = true;
    this.attackCooldown = 0.45;
    this.swingTimer = this.attackDuration;

    const r = windowHeight / 10;
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

    // --- Damage + Knockback ---
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dx = e.x - x;
      const dy = e.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

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
    if (!this.active) return;

    push();
    noFill();
    stroke("blue");
    strokeWeight(8);
    const r = windowHeight / 10;
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

    arc(x, y, r, r, startAngle, endAngle);
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
