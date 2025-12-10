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

    this.applyHoming();

    this.x += this.vx;
    this.y += this.vy;

    // --- ADDED: Animation Update ---
    this.animTimer += deltaTime / 1000;
    if (this.animTimer > this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4; // Cycle 0-3
    }
    // ------------------------------

    // Check for Wall Collisions
    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        const cell = cells.cells[i][j];
        if (cell.isWall() && cell.contains(this.x, this.y)) {
          this.active = false;
          return; 
        }
      }
    }

    // --- MODIFIED: Robust Enemy Collision Check (Handles Segmented Bosses) ---
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      let collisionDetected = false;
      let targetSize = e.size; // Default size

      if (e.segments && e.segments.length > 0) {
        // Handle segmented enemies (like SnakeBoss)
        const gridSize = Math.min(windowWidth, windowHeight) / 20; 
        const gridPixels = gridSize * 16;
        const offsetX = (windowWidth - gridPixels) / 2;
        const offsetY = (windowHeight - gridPixels) / 2;
        targetSize = gridSize; // Snake segments are a grid square size

        for (let seg of e.segments) {
            const segX = offsetX + seg.x * gridSize + gridSize / 2;
            const segY = offsetY + seg.y * gridSize + gridSize / 2;

            if (dist(this.x, this.y, segX, segY) < this.size / 2 + targetSize / 2) {
                collisionDetected = true;
                break; // Found a hit, break segment loop
            }
        }
      } else {
        // Standard single-entity enemy collision
        if (dist(this.x, this.y, e.x, e.y) < this.size / 2 + e.size / 2) {
          collisionDetected = true;
        }
      }

      if (collisionDetected) {
        e.hp -= this.damage; 
        e.takeDamage?.(0); // Trigger flash if method exists
        
        if (e.hp <= 0) {
          enemies.splice(i, 1); 
        }
        this.active = false;
        return; // Exit the function after collision
      }
    }
    // --- END MODIFIED ---
    
    // Check for Out-of-Bounds
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;
    
    if (this.x < offsetX || this.x > offsetX + gridPixels ||
        this.y < offsetY || this.y > offsetY + gridPixels) {
      this.active = false;
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