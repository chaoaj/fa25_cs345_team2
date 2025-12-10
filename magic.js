// magic.js — MagicProjectile (with homing + boss hit support)

class MagicProjectile {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.size = 12;
    this.speed = 7;
    this.damage = 3;
    this.active = true;

    // Homing settings
    this.homingRange = 300;
    this.turnStrength = 0.3;

    this.vx = 0;
    this.vy = 0;

    // Direction → velocity
    let dx = 0;
    let dy = 0;

    if (direction.includes("left")) dx = -1;
    if (direction.includes("right")) dx = 1;
    if (direction.includes("up")) dy = -1;
    if (direction.includes("down")) dy = 1;

    if (direction === "up") { dx = 0; dy = -1; }
    if (direction === "down") { dx = 0; dy = 1; }
    if (direction === "left") { dx = -1; dy = 0; }
    if (direction === "right") { dx = 1; dy = 0; }

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    this.vx = dx * this.speed;
    this.vy = dy * this.speed;
  }

  update() {
    if (!this.active) return;

    this.applyHoming();

    this.x += this.vx;
    this.y += this.vy;

    // Wall collisions
    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        const cell = cells.cells[i][j];
        if (cell.isWall() && cell.contains(this.x, this.y)) {
          this.active = false;
          return;
        }
      }
    }

    // Enemy / Boss collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      // Special case: SnakeBoss supports checkProjectileHit()
      if (e instanceof SnakeBoss && typeof e.checkProjectileHit === "function") {
        if (e.checkProjectileHit(this.x, this.y, this.size / 2)) {
          e.applyDamage(this.damage);
          this.active = false;
          return;
        }
        continue; // don't run normal enemy logic on SnakeBoss
      }

      // Normal enemies: circle collision
      const d = dist(this.x, this.y, e.x, e.y);
      if (d < this.size / 2 + (e.size || 20) / 2) {
        e.hp -= this.damage;
        if (e.hp <= 0) enemies.splice(i, 1);
        this.active = false;
        return;
      }
    }

    // Out of bounds kill
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    if (
      this.x < offsetX ||
      this.x > offsetX + gridPixels ||
      this.y < offsetY ||
      this.y > offsetY + gridPixels
    ) {
      this.active = false;
    }
  }

  applyHoming() {
    let closestEnemy = null;
    let closestDist = Infinity;

    for (let e of enemies) {
      let ex = e.x;
      let ey = e.y;

      // If boss is grid-based, approximate its head position:
      if (e instanceof SnakeBoss && e.snake && e.snake.length > 0) {
        const head = e.snake[0];
        ex = head.x * CELL + e.offsetX + CELL / 2;
        ey = head.y * CELL + e.offsetY + CELL / 2;
      }

      const d = dist(this.x, this.y, ex, ey);
      if (d < closestDist && d < this.homingRange) {
        closestDist = d;
        closestEnemy = { ex, ey, ref: e };
      }
    }

    if (!closestEnemy) return;

    let dx = closestEnemy.ex - this.x;
    let dy = closestEnemy.ey - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    this.vx += dx * this.turnStrength;
    this.vy += dy * this.turnStrength;

    const newSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (newSpeed > 0) {
      this.vx = (this.vx / newSpeed) * this.speed;
      this.vy = (this.vy / newSpeed) * this.speed;
    }
  }

  draw() {
    if (!this.active) return;

    // If you want to use fireball frames:
    if (Array.isArray(redFireFrames) && redFireFrames.length > 0) {
      imageMode(CENTER);
      const frameIndex = floor((millis() / 80) % redFireFrames.length);
      const frame = redFireFrames[frameIndex];
      image(frame, this.x, this.y, this.size * 2, this.size * 2);
    } else {
      // fallback: cyan circle
      noStroke();
      fill(100, 200, 255);
      ellipse(this.x, this.y, this.size, this.size);
    }
  }
}
