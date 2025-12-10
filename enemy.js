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
    this.size = gridSize * 0.8;

    this.state = "wander";
    this.targetX = x;
    this.targetY = y;
    this.wanderTimer = 0;
    this.memoryTimer = 0;

    this.attackCooldown = 0;

    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = 0.1;

    // Visual properties
    this.colorVariant = floor(random(0, 4)); // slime color
    this.animFrame = 0;
    this.animTimer = 0;
    this.damageTimer = 0; // damage flash timer
  }

  // Trigger flash when taking damage
  takeDamage(amount) {
    this.hp = max(0, this.hp - amount);
    this.damageTimer = 0.1;
  }

  // -------------------------
  // DRAW FUNCTION (FIXED)
  // -------------------------
  draw() {

    // If zombie / slime / normal enemy
    if (this.species === "zombie" && slimeSprites.length > 0) {

      // Animate slime
      this.animTimer += deltaTime / 1000;
      if (this.animTimer > 0.5) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 2;
      }

      let sprite = slimeSprites[this.colorVariant][this.animFrame];

      push();
      translate(this.x, this.y);
      imageMode(CENTER);

      if (this.velocityX < 0) scale(-1, 1);

      if (this.damageTimer > 0) tint(255, 0, 0);
      else noTint();

      if (sprite) {
        image(sprite, 0, 0, this.size, this.size);
      } else {
        fill(255, 0, 0);
        ellipse(0, 0, this.size);
      }

      noTint();
      pop();
      return;
    }

    // Snake boss fallback (should be handled in snake.js)
    if (this.species === "snake_boss") {
      fill(0, 255, 0);
      ellipse(this.x, this.y, this.size);
      return;
    }

    // Fallback enemy
    fill(this.state === "chase" ? "orange" : "red");
    ellipse(this.x, this.y, this.size);
  }

  // -------------------------
  // UPDATE LOGIC
  // -------------------------
  update() {

    if (this.attackCooldown > 0)
      this.attackCooldown -= deltaTime / 1000;

    if (this.damageTimer > 0) {
      this.damageTimer -= deltaTime / 1000;
      if (this.damageTimer < 0) this.damageTimer = 0;
    }

    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    // Distance to player
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Player contact damage
    const playerRadius = player.playerSize / 2;
    const enemyRadius = this.size / 2;
    const hitDistance = playerRadius + enemyRadius;

    if (distance < hitDistance && this.attackCooldown <= 0 && !transitioning) {

      if (player.takeDamage)
        player.takeDamage(1);

      this.attackCooldown = 1.5;
      player.stunTimer = 0.25;

      const knockbackStrength = 25;
      if (distance > 0) {
        const normX = dx / distance;
        const normY = dy / distance;
        let newX = player.x + normX * knockbackStrength;
        let newY = player.y + normY * knockbackStrength;

        if (!player.collidesWithWall(newX, player.y)) player.x = newX;
        if (!player.collidesWithWall(player.x, newY)) player.y = newY;
      }
    }

    // AI state logic
    let canSeePlayer = this.hasLineOfSight(player.x, player.y);

    if (canSeePlayer && distance < gridSize * 6) {
      this.state = "chase";
      this.memoryTimer = 2.5;
      this.targetX = player.x;
      this.targetY = player.y;
    } else if (this.memoryTimer > 0) {
      this.state = "search";
      this.memoryTimer -= deltaTime / 1000;
    } else {
      this.state = "wander";
    }

    let moveX = 0;
    let moveY = 0;

    // Separation from other enemies (avoid clumping)
    let sepX = 0;
    let sepY = 0;
    let separationCount = 0;
    const desiredSeparation = this.size * 1.5;

    for (let other of enemies) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d > 0 && d < desiredSeparation) {
          let diffX = (this.x - other.x) / d;
          let diffY = (this.y - other.y) / d;
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

    // AI Behavior
    if (this.state === "chase") {
      dx /= distance;
      dy /= distance;
      moveX = dx * this.speed * 0.5;
      moveY = dy * this.speed * 0.5;
    }
    else if (this.state === "search") {
      dx = this.targetX - this.x;
      dy = this.targetY - this.y;
      let len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
        moveX = dx * this.speed * 0.3;
        moveY = dy * this.speed * 0.3;
      }
    }
    else {
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

    const separationWeight = 1.0;
    moveX += sepX * separationWeight;
    moveY += sepY * separationWeight;

    this.velocityX = lerp(this.velocityX, moveX, this.acceleration);
    this.velocityY = lerp(this.velocityY, moveY, this.acceleration);

    let nextX = this.x + this.velocityX;
    let nextY = this.y + this.velocityY;

    if (!this.collidesWithWall(nextX, this.y)) this.x = nextX;
    if (!this.collidesWithWall(this.x, nextY)) this.y = nextY;

    const minX = offsetX + this.size / 2;
    const maxX = offsetX + gridPixels - this.size / 2;
    const minY = offsetY + this.size / 2;
    const maxY = offsetY + gridPixels - this.size / 2;

    this.x = constrain(this.x, minX, maxX);
    this.y = constrain(this.y, minY, maxY);
  }

  hasLineOfSight(targetX, targetY) {
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

// GLOBAL enemy list
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
