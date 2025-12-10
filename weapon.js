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

    // Grid constants needed for checking segmented enemies like SnakeBoss
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    const s = this.normalizeAngle(startAngle);
    const eA = this.normalizeAngle(endAngle);

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      let targets = [];
      let isSegmented = e.segments && e.segments.length > 0;
      
      // --- MODIFIED LOGIC: Get all hit targets (segments or center) ---
      if (isSegmented) {
        // If it's the Snake Boss, check all segments
        for (let seg of e.segments) {
          // Convert grid coords to screen coords
          const segX = offsetX + seg.x * gridSize + gridSize / 2;
          const segY = offsetY + seg.y * gridSize + gridSize / 2;
          // Segments are treated as a circle with half a grid square radius
          targets.push({ x: segX, y: segY, radius: gridSize / 2 });
        }
      } else {
        // Normal enemy (use its center x/y)
        targets.push({ x: e.x, y: e.y, radius: e.size / 2 });
      }

      let hit = false;
      for (const target of targets) {
        const dx = target.x - x;
        const dy = target.y - y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);

        // Check if the target is within the sword's range (r + target's radius)
        if (distToTarget < r + target.radius) {
          const angle = this.normalizeAngle(atan2(dy, dx));

          // Check if the target is within the sword's arc
          const inArc = (s < eA)
            ? angle >= s && angle <= eA
            : angle >= s || angle <= eA;

          if (inArc) {
            hit = true;
            break; // Segment/Enemy hit, break the target loop
          }
        }
      }

      if (hit) {
        e.hp -= 5;
        e.takeDamage?.(0); // Trigger damage flash
        if (e.hp <= 0) enemies.splice(i, 1);
      }
    }
    // --- END MODIFIED LOGIC ---

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