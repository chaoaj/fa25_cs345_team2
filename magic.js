// This file defines the MagicProjectile class

class MagicProjectile {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.size = 12; // The projectile's diameter
    this.speed = 7;
    this.damage = 3; // How much HP it removes
    this.active = true; // Set to false when it hits something

    // --- ADDED: Homing Properties ---
    this.homingRange = 300; // How close an enemy needs to be to start curving
    this.turnStrength = 0.3; // How sharp the curve is (0.1 = wide, 2.0 = sharp)
    // --- END ADDED ---

    this.vx = 0;
    this.vy = 0;

    // --- Calculate Velocity from Direction ---
    let dx = 0;
    let dy = 0;

    // Check for diagonal/cardinal directions
    if (direction.includes('left')) dx = -1;
    if (direction.includes('right')) dx = 1;
    if (direction.includes('up')) dy = -1;
    if (direction.includes('down')) dy = 1;

    // Handle single directions (which don't include the words above)
    if (direction === 'up') { dx = 0; dy = -1; }
    if (direction === 'down') { dx = 0; dy = 1; }
    if (direction === 'left') { dx = -1; dy = 0; }
    if (direction === 'right') { dx = 1; dy = 0; }

    // Normalize the vector (so diagonal isn't faster)
    let len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    // Set final velocity
    this.vx = dx * this.speed;
    this.vy = dy * this.speed;
  }

  /**
   * Updates the projectile's position and checks for collisions.
   */
  update() {
    if (!this.active) return;

    // --- ADDED: Homing Logic ---
    this.applyHoming();
    // --- END ADDED ---

    this.x += this.vx;
    this.y += this.vy;

    // Check for Wall Collisions
    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        const cell = cells.cells[i][j];
        // cell.contains() is a simple point-in-box check
        if (cell.isWall() && cell.contains(this.x, this.y)) {
          this.active = false;
          return; // Stop
        }
      }
    }

    // ===============================
// ENEMY COLLISION HANDLING
// ===============================
for (let i = enemies.length - 1; i >= 0; i--) {
  const e = enemies[i];

  // --- SPECIAL: SnakeBoss ---
  if (e instanceof SnakeBoss) {
    let hit = e.checkProjectileHit(this.x, this.y, this.size / 2);
    if (hit) {
      e.applyDamage(this.damage);
      this.active = false;
      return;
    }
    continue; // skip normal hit logic
  }

  // --- NORMAL ENEMY HIT LOGIC ---
  let d = dist(this.x, this.y, e.x, e.y);
  if (d < this.size / 2 + e.size / 2) {
    e.hp -= this.damage;
    if (e.hp <= 0) enemies.splice(i, 1);
    this.active = false;
    return;
  }
}

    
    // Check for Out-of-Bounds (using the main grid boundaries)
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;
    
    if (this.x < offsetX || this.x > offsetX + gridPixels ||
        this.y < offsetY || this.y > offsetY + gridPixels) {
      this.active = false;
    }
  }

  // --- ADDED: New Helper Method for Homing ---
  applyHoming() {
    let closestEnemy = null;
    let closestDist = Infinity;

    // 1. Find the closest enemy
    for (let e of enemies) {
      let d = dist(this.x, this.y, e.x, e.y);
      if (d < closestDist && d < this.homingRange) {
        closestDist = d;
        closestEnemy = e;
      }
    }

    // 2. Adjust Velocity if enemy found
    if (closestEnemy) {
      // Vector to target
      let dx = closestEnemy.x - this.x;
      let dy = closestEnemy.y - this.y;

      // Normalize vector to target
      let len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
      }

      // Nudge current velocity towards target direction
      // We add the target direction * turnStrength to current velocity
      this.vx += dx * this.turnStrength;
      this.vy += dy * this.turnStrength;

      // 3. Re-Normalize to maintain original speed
      // (This ensures the projectile curves but doesn't speed up)
      let newSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.vx = (this.vx / newSpeed) * this.speed;
      this.vy = (this.vy / newSpeed) * this.speed;
    }
  }
  // --- END ADDED ---

  /**
   * Draws the projectile to the screen.
   */
  draw() {
    if (!this.active) return;
    
    fill(100, 200, 255); // A nice cyan color
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
}