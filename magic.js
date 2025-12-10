// This file defines the MagicProjectile class

class MagicProjectile {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.size = 24; // Increased size for the sprite
    this.speed = 7;
    this.damage = 3; 
    this.active = true; 

    this.homingRange = 150; 
    this.turnStrength = 0.5; 

    this.vx = 0;
    this.vy = 0;

    // --- ADDED: Animation Properties ---
    this.animTimer = 0;
    this.animFrame = 0;
    this.animSpeed = 0.1; // 100ms per frame
    // -----------------------------------

    // --- Calculate Velocity from Direction ---
    let dx = 0;
    let dy = 0;

    if (direction.includes('left')) dx = -1;
    if (direction.includes('right')) dx = 1;
    if (direction.includes('up')) dy = -1;
    if (direction.includes('down')) dy = 1;

    if (direction === 'up') { dx = 0; dy = -1; }
    if (direction === 'down') { dx = 0; dy = 1; }
    if (direction === 'left') { dx = -1; dy = 0; }
    if (direction === 'right') { dx = 1; dy = 0; }

    let len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    this.vx = dx * this.speed;
    this.vy = dy * this.speed;
  }

  update() {
  if (!this.active) return;

  // Move projectile
  this.x += this.dx * this.speed;
  this.y += this.dy * this.speed;

  // Remove projectile if leaving room
  if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
    this.active = false;
    return;
  }

  // --- DAMAGE CHECK FOR ALL ENEMIES ---
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    let hit = false;

    // --- CASE 1: Boss or special enemies with their own hitbox logic ---
    if (typeof e.checkProjectileHit === "function") {
      hit = e.checkProjectileHit(this.x, this.y, this.radius);
    }

    // --- CASE 2: Normal enemies with simple circular hitbox ---
    else if (typeof e.x === "number" && typeof e.y === "number") {
      let dx = this.x - e.x;
      let dy = this.y - e.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      // Estimate hit radius of 20px (adjust as needed)
      if (dist < this.radius + 20) {
        hit = true;
      }
    }

    // If a hit is detected:
    if (hit) {

      // If enemy has its own applyDamage() method, use it
      if (typeof e.applyDamage === "function") {
        e.applyDamage(this.damage);
      }

      // Otherwise use direct HP subtraction
      else if (typeof e.hp === "number") {
        e.hp -= this.damage;
        if (e.hp <= 0) {
          enemies.splice(i, 1);
        }
      }

      // Remove projectile after hitting
      this.active = false;
      return;
    }
  }
}


  applyHoming() {
    let closestEnemy = null;
    let closestDist = Infinity;

    for (let e of enemies) {
      let d = dist(this.x, this.y, e.x, e.y);
      if (d < closestDist && d < this.homingRange) {
        closestDist = d;
        closestEnemy = e;
      }
    }

    if (closestEnemy) {
      let dx = closestEnemy.x - this.x;
      let dy = closestEnemy.y - this.y;

      let len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
      }

      this.vx += dx * this.turnStrength;
      this.vy += dy * this.turnStrength;

      let newSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.vx = (this.vx / newSpeed) * this.speed;
      this.vy = (this.vy / newSpeed) * this.speed;
    }
  }

  draw() {
    if (!this.active) return;
    
    // --- MODIFIED: Draw Fireball Sprite ---
    if (redFireFrames && redFireFrames.length > 0) {
        push();
        translate(this.x, this.y);
        
        // Rotate the fireball to face direction of movement
        // We add PI/2 because usually these flames point "Up" by default
        let angle = atan2(this.vy, this.vx) + PI/2; 
        rotate(angle);
        
        imageMode(CENTER);
        // Use mod to ensure safety if frames aren't loaded yet
        let frame = redFireFrames[this.animFrame % redFireFrames.length];
        if (frame) {
            image(frame, 0, 0, this.size, this.size);
        }
        pop();
    } else {
        // Fallback
        fill(255, 100, 0); 
        noStroke();
        ellipse(this.x, this.y, this.size, this.size);
    }
    // --------------------------------------
  }
}