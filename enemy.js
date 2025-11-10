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
  }

  draw() {
    fill(this.state === "chase" ? "orange" : "red");
    ellipse(this.x, this.y, this.size);
  }

  update() {
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    // Distance to player
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Check line of sight
    let canSeePlayer = this.hasLineOfSight(player.x, player.y);

    if (canSeePlayer && distance < gridSize * 6) {
      this.state = "chase";
      this.memoryTimer = 2.5; // seconds
    } else if (this.memoryTimer > 0) {
      this.state = "search";
      this.memoryTimer -= deltaTime / 1000;
    } else {
      this.state = "wander";
    }

    let moveX = 0;
    let moveY = 0;

    // --- Behavior States ---
    if (this.state === "chase") {
      dx /= distance;
      dy /= distance;

      // Predict next position
      let nextX = this.x + dx * this.speed;
      let nextY = this.y + dy * this.speed;

      // If blocked, find alternate nearby route
      if (this.collidesWithWall(nextX, nextY)) {
        [dx, dy] = this.findAlternateDirection(dx, dy, gridSize);
      }

      moveX = dx * this.speed * 0.5;
      moveY = dy * this.speed * 0.5;
    } else if (this.state === "search") {
      // Move toward last known player position
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

    // --- Move with sliding & bounds ---
    let nextX = this.x + moveX;
    let nextY = this.y + moveY;
    let blockedX = this.collidesWithWall(nextX, this.y);
    let blockedY = this.collidesWithWall(this.x, nextY);

    if (!blockedX && !blockedY) {
      this.x = nextX;
      this.y = nextY;
    } else if (!blockedX) {
      this.x = nextX;
    } else if (!blockedY) {
      this.y = nextY;
    }

    // --- Enemy-to-enemy collision ---
    for (let other of enemies) {
    if (other !== this) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.size * 1.2;
        if (dist > 0 && dist < minDist) {
        const overlap = (minDist - dist) / 2;
        this.x += (dx / dist) * overlap;
        this.y += (dy / dist) * overlap;
        other.x -= (dx / dist) * overlap;
        other.y -= (dy / dist) * overlap;
        }
    }
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
