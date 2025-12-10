// snake.js — Boss version of your BFS Snake AI

const COLS = 20;
const ROWS = 20;
const CELL = 26;
const STEP_DELAY = 6;

const SNAKE_HEAD_COLOR = [0, 200, 255];
const SNAKE_BODY_COLOR = [0, 150, 200];
const APPLE_COLOR = [255, 80, 80];

class SnakeBoss {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;

    // Drawing offset (center the grid at world coords)
    this.offsetX = x - (COLS * CELL) / 2;
    this.offsetY = y - (ROWS * CELL) / 2;

    // Boss Stats
    this.maxHP = 50;
    this.hp = this.maxHP;
    this.damage = 1;
    this.touchRange = 30;
    this.attackCooldown = 800;
    this._lastAttack = 0;

    this.resetState();
  }

  resetState() {
    this.snake = [
      { x: floor(COLS / 2), y: floor(ROWS / 2) },
      { x: floor(COLS / 2) - 1, y: floor(ROWS / 2) },
      { x: floor(COLS / 2) - 2, y: floor(ROWS / 2) }
    ];

    this.pendingGrow = 0;
    this.gameOver = false;

    this.lastStepFrame = millis();
    this.appleTimer = new AppleTimer(5000);

    this.placeApple();
  }

  // --------------------
  // DRAWING
  // --------------------
  draw() {
    this.drawHPBar();

    push();
    translate(this.offsetX, this.offsetY);

    // Draw apple
    fill(...APPLE_COLOR);
    rect(this.apple.x * CELL, this.apple.y * CELL, CELL, CELL);

    // Draw snake body
    for (let i = 0; i < this.snake.length; i++) {
      fill(i === 0 ? SNAKE_HEAD_COLOR : SNAKE_BODY_COLOR);
      rect(
        this.snake[i].x * CELL,
        this.snake[i].y * CELL,
        CELL,
        CELL
      );
    }

    pop();
  }

  drawHPBar() {
    const barW = 300;
    const barH = 22;
    const pct = this.hp / this.maxHP;

    push();
    translate(width / 2 - barW / 2, 40);

    fill(80, 0, 0);
    rect(0, 0, barW, barH);

    fill(255, 60, 60);
    rect(0, 0, barW * pct, barH);

    noFill();
    stroke(255);
    strokeWeight(2);
    rect(0, 0, barW, barH);

    pop();
  }

  // --------------------
  // UPDATE
  // --------------------
  update() {
    if (this.hp <= 0) return;
    if (this.gameOver) return;

    // Move periodically
    if (millis() - this.lastStepFrame >= STEP_DELAY * 10) {
      this.aiStep();
      this.lastStepFrame = millis();
    }

    // Auto-move apple
    this.appleTimer.tick(() => this.placeApple(), true);

    // Player collision (bite)
    this.checkPlayerCollision();
  }

  // --------------------
  // PLAYER COLLISION DAMAGE
  // --------------------
  checkPlayerCollision() {
    if (!player) return;

    const head = this.snake[0];
    const hx = head.x * CELL + this.offsetX;
    const hy = head.y * CELL + this.offsetY;

    const dx = player.x - hx;
    const dy = player.y - hy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.touchRange) this.tryDamagePlayer();
  }

  tryDamagePlayer() {
    const now = millis();
    if (now - this._lastAttack < this.attackCooldown) return;
    this._lastAttack = now;

    if (player.takeDamage) player.takeDamage(this.damage);
  }

  // --------------------
  // AI MOVEMENT
  // --------------------
  aiStep() {
    if (this.snake.length === COLS * ROWS) return;

    const head = this.snake[0];
    const tail = this.snake[this.snake.length - 1];

    const pathToApple = this.bfsPath(head, this.apple, this.snake, true);
    let chosenPath = null;

    if (pathToApple && pathToApple.length > 1) {
      const sim = this.simulateFollowPath(this.snake, pathToApple);

      if (sim.ateApple) {
        const vHead = sim.virtualSnake[0];
        const vTail = sim.virtualSnake.at(-1);
        const safe = this.bfsPath(vHead, vTail, sim.virtualSnake, true);

        if (safe && safe.length > 1) chosenPath = pathToApple;
      } else {
        chosenPath = pathToApple;
      }
    }

    if (!chosenPath) {
      const pathToTail = this.bfsPath(head, tail, this.snake, true);
      if (pathToTail && pathToTail.length > 1) chosenPath = pathToTail;
    }

    if (!chosenPath) {
      const safe = this.safeNeighborStep(head, this.snake);
      if (!safe) return (this.gameOver = true);
      return this.moveSnakeTo(safe);
    }

    this.moveSnakeTo(chosenPath[1]);
  }

  moveSnakeTo(pos) {
    if (
      pos.x < 0 || pos.x >= COLS ||
      pos.y < 0 || pos.y >= ROWS ||
      this.collidesWithBody(pos, this.snake.slice(0, -1))
    ) {
      return (this.gameOver = true);
    }

    this.snake.unshift({ x: pos.x, y: pos.y });

    if (pos.x === this.apple.x && pos.y === this.apple.y) {
      this.pendingGrow++;
      this.placeApple();
    }

    if (this.pendingGrow > 0) this.pendingGrow--;
    else this.snake.pop();
  }

  // --------------------
  // SWORD DAMAGE CHECK
  // --------------------
  checkSwordHit(px, py, radius, startAngle, endAngle) {
    if (this.hp <= 0) return false;

    for (let seg of this.snake) {
      let sx = seg.x * CELL + this.offsetX + CELL / 2;
      let sy = seg.y * CELL + this.offsetY + CELL / 2;

      let dx = sx - px;
      let dy = sy - py;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius + CELL / 2) {
        let angle = atan2(dy, dx);
        angle = (angle + TWO_PI) % TWO_PI;

        startAngle = (startAngle + TWO_PI) % TWO_PI;
        endAngle = (endAngle + TWO_PI) % TWO_PI;

        const inArc =
          (startAngle < endAngle)
            ? angle >= startAngle && angle <= endAngle
            : angle >= startAngle || angle <= endAngle;

        if (inArc) return true;
      }
    }
    return false;
  }

  // --------------------
  // APPLY DAMAGE
  // --------------------
  applyDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;

      console.log("Snake Boss Defeated!");

      // Remove boss
      enemies = enemies.filter(e => !(e instanceof SnakeBoss));

      // Reset room cycle
      roomCount = 0;

      // Generate exit tile in top-center
      this.spawnBossExit();
    }
  }

  // Create an exit tile when boss dies
  spawnBossExit() {
    const exitX = floor(COLS / 2);
    const exitY = 0;

    if (cells && cells.cells && cells.cells[exitX][exitY]) {
      cells.cells[exitX][exitY].setType("exit");
      cells.exitSide = "top";
      console.log("Boss exit created at", exitX, exitY);
    }
  }

  // --------------------
  // BFS & SIMULATION
  // --------------------
  bfsPath(start, goal, body, allowTail) {
    const blocked = new Set();
    for (let i = 0; i < body.length; i++) {
      const seg = body[i];
      if (!(seg.x === start.x && seg.y === start.y)) {
        if (!(allowTail && i === body.length - 1)) {
          blocked.add(`${seg.x},${seg.y}`);
        }
      }
    }

    const q = [start];
    const visited = new Set([`${start.x},${start.y}`]);
    const parent = {};
    let found = false;

    while (q.length) {
      const cur = q.shift();
      if (cur.x === goal.x && cur.y === goal.y) {
        found = true;
        break;
      }

      for (let nb of this.neighbors(cur)) {
        const key = `${nb.x},${nb.y}`;
        if (
          nb.x >= 0 && nb.x < COLS &&
          nb.y >= 0 && nb.y < ROWS &&
          !blocked.has(key) &&
          !visited.has(key)
        ) {
          visited.add(key);
          parent[key] = cur;
          q.push(nb);
        }
      }
    }

    if (!found) return null;

    const path = [];
    let cur = goal;
    path.unshift(cur);

    while (!(cur.x === start.x && cur.y === start.y)) {
      const p = parent[`${cur.x},${cur.y}`];
      if (!p) return null;
      path.unshift(p);
      cur = p;
    }

    return path;
  }

  simulateFollowPath(realSnake, path) {
    const vsnake = realSnake.map(s => ({ x: s.x, y: s.y }));
    let grow = 0;
    let ate = false;

    for (let i = 1; i < path.length; i++) {
      const next = path[i];
      vsnake.unshift({ x: next.x, y: next.y });

      if (i === path.length - 1) {
        ate = true;
        grow++;
      }

      if (grow > 0) grow--;
      else vsnake.pop();
    }

    return { virtualSnake: vsnake, ateApple: ate };
  }

  // --------------------
  // UTILITIES
  // --------------------
  placeApple() {
    const occupied = new Set(this.snake.map(s => `${s.x},${s.y}`));
    const free = [];

    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) free.push({ x, y });
      }
    }

    if (free.length === 0) return (this.gameOver = true);

    this.apple = random(free);
    this.appleTimer.reset();
  }

  collidesWithBody(pos, arr) {
    return arr.some(s => s.x === pos.x && s.y === pos.y);
  }

  neighbors(c) {
    return [
      { x: c.x + 1, y: c.y },
      { x: c.x - 1, y: c.y },
      { x: c.x, y: c.y + 1 },
      { x: c.x, y: c.y - 1 }
    ];
  }
}

window.SnakeBoss = SnakeBoss;
