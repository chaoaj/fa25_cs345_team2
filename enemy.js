class Enemy {
  constructor(species, level, x, y, hp, maxHP, strength, resistance, speed) {
    this.species = species;
    this.level = level;
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHP = maxHP;
    this.strength = strength;
    this.resistance = resistance;
    this.speed = speed;

    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    this.size = gridSize * 0.5;

    this.state = "wander"; // "wander" | "chase" | "search"
    this.targetX = x;
    this.targetY = y;
    this.wanderTimer = 0;
    this.memoryTimer = 0; // remembers player for short time

    this.attackCooldown = 0; // Cooldown for player damage

    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = 0.1; 
  }

  draw() {
    fill(this.state === "chase" ? "orange" : "red");
    ellipse(this.x, this.y, this.size);
  }

  update() {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime / 1000;
    }

    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    // Distance to player
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Player Collision/Damage
    const playerRadius = player.playerSize / 2;
    const enemyRadius = this.size / 2;
    const hitDistance = playerRadius + enemyRadius;

    // Check if touching player and cooldown is ready
    if (distance < hitDistance && this.attackCooldown <= 0 && !transitioning) {
      if (player.takeDamage) {
        player.takeDamage(1); // Deal 1 damage
      }
      this.attackCooldown = 1.5; // Set 1.5 second cooldown

      player.stunTimer = 0.25; // Stun player for 0.25 seconds

      // Knockback Logic
      const knockbackStrength = 25; 
      if (distance > 0) {
        const normX = dx / distance;
        const normY = dy / distance;
        let newX = player.x + normX * knockbackStrength;
        let newY = player.y + normY * knockbackStrength;
        if (!player.collidesWithWall(newX, player.y)) {
          player.x = newX;
        }
        if (!player.collidesWithWall(player.x, newY)) {
          player.y = newY;
        }
      }
    }


    // Check line of sight
    let canSeePlayer = this.hasLineOfSight(player.x, player.y);

    if (canSeePlayer && distance < gridSize * 6) {
      this.state = "chase";
      this.memoryTimer = 2.5; // seconds
      
      // --- ADDED: This is the fix! ---
      // Continuously update the "last known position" while chasing
      this.targetX = player.x;
      this.targetY = player.y;
      // --- END ADDED ---

    } else if (this.memoryTimer > 0) {
      this.state = "search";
      this.memoryTimer -= deltaTime / 1000;
    } else {
      this.state = "wander";
    }

    // --- MODIFIED: Movement Logic ---

    let moveX = 0;
    let moveY = 0;
    
    // Separation Steering
    let sepX = 0;
    let sepY = 0;
    let separationCount = 0;
    const desiredSeparation = this.size * 2.0; // Personal space

    for (let other of enemies) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d > 0 && d < desiredSeparation) {
          // Calculate vector pointing away from neighbor
          let diffX = this.x - other.x;
          let diffY = this.y - other.y;
          diffX /= d; // Normalize
          diffY /= d;
          sepX += diffX;
          sepY += diffY;
          separationCount++;
        }
      }
    }
    if (separationCount > 0) {
      sepX /= separationCount;
      sepY /= separationCount;
    }


    // --- Behavior States (now set 'moveX' and 'moveY' as GOALS) ---
    if (this.state === "chase") {
      dx /= distance;
      dy /= distance;
      let nextX = this.x + dx * this.speed;
      let nextY = this.y + dy * this.speed;
      if (this.collidesWithWall(nextX, nextY)) {
        [dx, dy] = this.findAlternateDirection(dx, dy, gridSize);
      }
      moveX = dx * this.speed * 0.5;
      moveY = dy * this.speed * 0.5;
    } else if (this.state === "search") {
      // --- THIS LOGIC NOW WORKS! ---
      // It will move towards the targetX/Y set during the "chase" state
      dx = this.targetX - this.x;
      dy = this.targetY - this.y;
      let len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
        moveX = dx * this.speed * 0.3;
        moveY = dy * this.speed * 0.3;
      }
    } else {
      // Wander randomly
      this.wanderTimer -= deltaTime / 1000;
      if (this.wanderTimer <= 0) {
        this.targetX = this.x + random(-gridSize * 3, gridSize * 3);
        this.targetY = this.y + random(-gridSize * 3, gridSize * 3);
        this.wanderTimer = random(1, 3);
      }
      let dirX = this.targetX - this.x;
      let dirY = this.targetY - this.y;
      let len = Math.sqrt(dirX * dirX + dirY * dirY);
      if (len > 0) {
        dirX /= len;
        dirY /= len;
        moveX = dirX * this.speed * 0.2;
        moveY = dirY * this.speed * 0.2;
      }
    }
    
    // Combine Goal + Separation
    const separationWeight = 1.0; 
    moveX = moveX + sepX * separationWeight;
    moveY = moveY + sepY * separationWeight;


    // Acceleration/Inertia
    this.velocityX = lerp(this.velocityX, moveX, this.acceleration);
    this.velocityY = lerp(this.velocityY, moveY, this.acceleration);

    // --- Move with sliding & bounds (NOW USES VELOCITY) ---
    let nextX = this.x + this.velocityX;
    let nextY = this.y + this.velocityY;
    let blockedX = this.collidesWithWall(nextX, this.y);
    let blockedY = this.collidesWithWall(this.x, nextY);

    if (!blockedX && !blockedY) {
      this.x = nextX;
      this.y = nextY;
    } else if (!blockedX) {
      this.x = nextX;
      this.velocityY = 0; // Stop vertical movement if hitting wall
    } else if (!blockedY) {
      this.y = nextY;
      this.velocityX = 0; // Stop horizontal movement if hitting wall
    } else {
      // If blocked in both, stop all velocity
      this.velocityX = 0;
      this.velocityY = 0;
    }
    
    const minX = offsetX + this.size / 2;
    const maxX = offsetX + gridPixels - this.size / 2;
    const minY = offsetY + this.size / 2;
    const maxY = offsetY + gridPixels - this.size / 2;
    this.x = constrain(this.x, minX, maxX);
    this.y = constrain(this.y, minY, maxY);
  }

  // --- Avoidance Helper ---
  findAlternateDirection(dx, dy, gridSize) {
    let bestAngle = null;
    let bestDir = [0, 0];
    let minBlock = Infinity;

    // Try small angles around the current direction
    for (let a = -PI / 3; a <= PI / 3; a += PI / 12) {
      const angle = atan2(dy, dx) + a;
      const testX = this.x + cos(angle) * gridSize * 0.5;
      const testY = this.y + sin(angle) * gridSize * 0.5;
      let blocked = this.collidesWithWall(testX, testY);
      if (!blocked) {
        // Slightly favor directions closer to the player
        const bias = Math.abs(a);
        if (bias < minBlock) {
          minBlock = bias;
          bestAngle = angle;
          bestDir = [cos(angle), sin(angle)];
        }
      }
    }
    return bestDir;
  }

  // --- Line of sight (Bresenham-style grid check) ---
  hasLineOfSight(targetX, targetY) {
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      let t = i / steps;
      let x = lerp(this.x, targetX, t);
      let y = lerp(this.y, targetY, t);
      if (this.collidesWithWall(x, y)) return false;
    }
    return true;
  }

  collidesWithWall(nextX, nextY) {
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    let half = this.size / 2;

    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        const cell = cells.cells[i][j];
        if (cell.isWall()) {
          if (
            nextX + half > cell.x &&
            nextX - half < cell.x + gridSize &&
            nextY + half > cell.y &&
            nextY - half < cell.y + gridSize
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

// 🧟 Global enemy list
let enemies = [];

function spawnEnemiesForLevel(name) {
  enemies = [];
  if (name === "first") return;

  const gridSize = Math.min(windowWidth, windowHeight) / 20;
  const gridPixels = gridSize * 16;
  const offsetX = (windowWidth - gridPixels) / 2;
  const offsetY = (windowHeight - gridPixels) / 2;

  const enemyCount = floor(random(2, 5));

  while (enemies.length < enemyCount) {
    const gx = floor(random(0, 16));
    const gy = floor(random(0, 16));
    const cell = cells.cells[gx][gy];
    if (!cell.isWall() && !cell.isExit()) {
      const ex = offsetX + gx * gridSize + gridSize / 2;
      const ey = offsetY + gy * gridSize + gridSize / 2;
      enemies.push(new Enemy("zombie", 1, ex, ey, 10, 10, 2, 1, 2));
    }
  }
}