class SnakeBoss {
  constructor(level) {
    // --- Stats ---
    this.maxHP = 8 + (level * 2);
    this.hp = this.maxHP;
    this.damage = 1;
    this.scoreValue = 100;

    // --- Grid / Movement ---
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    this.gridSize = gridSize;
    
    // Spawn in center
    this.x = width / 2; 
    this.y = height / 2;

    this.stepCounter = 0; 

    // Body Segments
    this.segments = [
      { x: 8, y: 8 }, 
      { x: 8, y: 7 }, 
      { x: 8, y: 6 }, 
      { x: 8, y: 5 }, 
      { x: 8, y: 4 }  
    ];

    // Movement Timing
    this.moveTimer = 0;
    // --- MODIFIED: Faster Initial Speed ---
    this.moveInterval = 0.3; 
    // ------------------------------------
    
    this.attackCooldown = 0;
    this.size = gridSize; 
    this.species = "snake_boss";

    // --- Apple Logic ---
    this.apple = null;
    this.spawnApple();
    this.pendingGrow = 0;
  }

  spawnApple() {
    let valid = false;
    let attempts = 0;
    let ax, ay;

    while (!valid && attempts < 100) {
      attempts++;
      ax = floor(random(1, 15));
      ay = floor(random(1, 15));
      if (cells.cells[ax][ay].isWall()) continue;
      let onBody = false;
      for (let s of this.segments) {
        if (s.x === ax && s.y === ay) { onBody = true; break; }
      }
      if (onBody) continue;
      valid = true;
    }
    if (valid) this.apple = { x: ax, y: ay };
    else this.apple = null;
  }

  update() {
    const gridSize = this.gridSize;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    // Sync main X/Y to Head
    this.x = offsetX + this.segments[0].x * gridSize + gridSize / 2;
    this.y = offsetY + this.segments[0].y * gridSize + gridSize / 2;

    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime / 1000;

    this.moveTimer += deltaTime / 1000;
    if (this.moveTimer > this.moveInterval) {
      this.moveTimer = 0;
      this.moveStep();
    }
    this.checkPlayerCollision();
  }

  moveStep() {
    this.stepCounter++; // Increment animation frame

    const gridSize = this.gridSize;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    let pGridX = floor((player.x - offsetX) / gridSize);
    let pGridY = floor((player.y - offsetY) / gridSize);
    pGridX = constrain(pGridX, 0, 15);
    pGridY = constrain(pGridY, 0, 15);

    const head = this.segments[0];
    let target = { x: pGridX, y: pGridY };

    // --- LOGIC: Low HP Mode (< 35%) ---
    const isLowHP = this.hp < (this.maxHP * 0.35); 

    if (this.apple) {
      if (isLowHP) {
        // Desperation Mode: IGNORE Player, seek Apple
        target = { x: this.apple.x, y: this.apple.y };
      } else {
        // Standard Mode: Target closer entity
        let distToPlayer = dist(head.x, head.y, pGridX, pGridY);
        let distToApple = dist(head.x, head.y, this.apple.x, this.apple.y);
        if (distToApple < distToPlayer) {
          target = { x: this.apple.x, y: this.apple.y };
        }
      }
    }

    const nextMove = this.bfsPath(head, target);

    if (nextMove) {
      this.segments.unshift({ x: nextMove.x, y: nextMove.y });
      
      if (this.apple && nextMove.x === this.apple.x && nextMove.y === this.apple.y) {
        this.pendingGrow += 1; 

        // --- MODIFIED: Heal MUCH more (+15 HP) ---
        this.hp = min(this.maxHP, this.hp + 15); 
        // ----------------------------------------

        this.moveInterval = Math.max(0.1, this.moveInterval - 0.02); // Speed up
        
        this.spawnApple(); 
      }

      if (this.pendingGrow > 0) {
        this.pendingGrow--;
      } else {
        this.segments.pop();
      }
    }
  }

  bfsPath(start, goal) {
    const q = [];
    const visited = new Set();
    const parent = {}; 
    q.push(start);
    visited.add(start.x + "," + start.y);

    let found = false;
    let loopCount = 0;

    while (q.length > 0 && loopCount < 300) {
      loopCount++;
      const cur = q.shift();
      if (cur.x === goal.x && cur.y === goal.y) {
        found = true;
        break;
      }
      const neighbors = [
        { x: cur.x + 1, y: cur.y }, { x: cur.x - 1, y: cur.y },
        { x: cur.x, y: cur.y + 1 }, { x: cur.x, y: cur.y - 1 }
      ];
      for (let n of neighbors) {
        const key = n.x + "," + n.y;
        if (n.x >= 0 && n.x < 16 && n.y >= 0 && n.y < 16) {
          if (!cells.cells[n.x][n.y].isWall() && !visited.has(key)) {
            if (!this.isBodyPart(n.x, n.y)) {
               visited.add(key);
               parent[key] = cur;
               q.push(n);
            }
          }
        }
      }
    }
    if (!found) return null; 
    let curr = goal;
    if (curr.x === start.x && curr.y === start.y) return null;
    let pathStack = [];
    while (curr.x !== start.x || curr.y !== start.y) {
      pathStack.push(curr);
      const key = curr.x + "," + curr.y;
      if (!parent[key]) break; 
      curr = parent[key];
    }
    return pathStack[pathStack.length - 1];
  }

  isBodyPart(x, y) {
    // Ignore the tail when checking collision for pathfinding
    for (let i = 0; i < this.segments.length - 1; i++) {
        if (this.segments[i].x === x && this.segments[i].y === y) return true;
    }
    return false;
  }

  checkPlayerCollision() {
    if (this.attackCooldown > 0) return;
    const gridSize = this.gridSize;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;
    const pRad = player.playerSize / 2;

    for (let seg of this.segments) {
        const segX = offsetX + seg.x * gridSize + gridSize/2;
        const segY = offsetY + seg.y * gridSize + gridSize/2;
        if (dist(player.x, player.y, segX, segY) < gridSize/2 + pRad) {
            if (player.takeDamage) player.takeDamage(1);
            this.attackCooldown = 1.0; 
            const dx = player.x - segX;
            const dy = player.y - segY;
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len > 0) {
                player.x += (dx/len) * 30;
                player.y += (dy/len) * 30;
            }
            return; 
        }
    }
  }

  draw() {
    const gridSize = this.gridSize;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    noStroke();
    imageMode(CENTER);

    if (this.apple && noodleSprites.apple) {
       let ax = offsetX + this.apple.x * gridSize + gridSize/2;
       let ay = offsetY + this.apple.y * gridSize + gridSize/2;
       image(noodleSprites.apple, ax, ay, gridSize, gridSize);
    }

    // --- DRAW SNAKE ---
    for (let i = this.segments.length - 1; i >= 0; i--) {
      let curr = this.segments[i];
      let screenX = offsetX + curr.x * gridSize + gridSize/2;
      let screenY = offsetY + curr.y * gridSize + gridSize/2;
      
      let sprite = noodleSprites.body_blue; // Default to Blue Body
      let rotation = 0;

      if (i === 0) {
        sprite = noodleSprites.head_blue;
        if (this.segments.length > 1) {
            let next = this.segments[1];
            rotation = atan2(curr.y - next.y, curr.x - next.x) + PI/2;
        }
      } else if (i === this.segments.length - 1) {
        sprite = noodleSprites.head_blue;
        let prev = this.segments[i-1];
        rotation = atan2(prev.y - curr.y, prev.x - curr.x) + PI/2; 
        rotation += PI; 
      } else {
        sprite = noodleSprites.body_blue;
        let prev = this.segments[i-1];
        rotation = atan2(prev.y - curr.y, prev.x - curr.x) + PI/2;
      }

      push();
      translate(screenX, screenY);
      rotate(rotation);
      
      if (sprite) image(sprite, 0, 0, gridSize, gridSize);
      
      pop();
    }

    // Draw HP Bar
    const h = this.segments[0];
    const screenHeadX = offsetX + h.x * gridSize + gridSize/2;
    const screenHeadY = offsetY + h.y * gridSize;
    
    rectMode(CORNER);
    fill(100);
    rect(screenHeadX - 20, screenHeadY - 20, 40, 5);
    fill(255, 0, 0);
    rect(screenHeadX - 20, screenHeadY - 20, 40 * (this.hp / this.maxHP), 5);
  }
}