// Player Code
class Player {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    this.playerHeight = gridSize * 0.8;
    this.playerSize = this.playerHeight * 0.5;
    this.maxHP = 3;
    this.hp = 3;
    this.strength = 1;
    this.resistance = 1;
    this.speed = 2;
    this.direction = 'right';
    this.item = new Weapon("sword");
    
    // --- Initialized Mana ---
    this.mana = 10;
    this.maxMana = 10;
    // --- END ---
    
    this.stunTimer = 0; // Timer to prevent movement after being hit

    // --- ADDED: Sprite & Animation Properties ---
    this.spriteWidth = 32; // The width of one sprite frame in player.png
    this.spriteHeight = 32; // The height of one sprite frame
    this.animFrame = 1; // Current animation frame (0, 1, or 2)
    this.animTimer = 0;
    this.animSpeed = 0.15; // Time (in seconds) per animation frame
    // --- END ADDED ---
  }

  base() {
    // --- MODIFIED: Draw Sprite instead of Rectangle ---

    // Fallback if the image didn't load
    if (!imgPlayerSheet) {
      rectMode(CENTER);
      fill('darkgray');
      rect(this.x, this.y, this.playerSize, this.playerHeight);
      return;
    }

    // --- Calculate which sprite to show ---

    // 1. Get the column (sx) from the animation frame
    let sx = this.animFrame * this.spriteWidth;

    // 2. Get the row (sy) from the player's direction
    // (Based on your player.png layout: 0=Up, 1=Down, 2=Left, 3=Right)
    let sy = 0;
    if (this.direction.includes('left')) {
      sy = 2 * this.spriteHeight; // Row 2
    } else if (this.direction.includes('right')) {
      sy = 3 * this.spriteHeight; // Row 3
    } else if (this.direction === 'up') {
      sy = 0 * this.spriteHeight; // Row 0
    } else if (this.direction === 'down') {
      sy = 1 * this.spriteHeight; // Row 1
    } else {
      sy = 1 * this.spriteHeight; // Default to 'down'
    }

    // 3. Draw the specific sprite
    imageMode(CENTER);
    image(
      imgPlayerSheet, // The whole spritesheet
      this.x, this.y, // Destination position on canvas
      this.playerSize, this.playerHeight, // Destination size
      sx, sy, // Source x, y (top-left of sprite)
      this.spriteWidth, this.spriteHeight // Source w, h (size of one sprite)
    );
    // --- END MODIFIED ---
  }

  movement() {

    // --- Stun Check ---
    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime / 1000;
      return; // Skip all movement logic if stunned
    }
    // --- END Stun Check ---


    gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    this.playerHeight = gridSize * 0.8;
    this.playerSize = gridSize / 2;

    let dx = 0;
    let dy = 0;

    fill('white')
    textSize(10)
    text('dx: ' + dx, 10, 20)
    text('dy: ' + dy, 400, 20)
    text(this.direction, 195, 20)


    if (keyIsDown(87) || keyIsDown(UP_ARROW)) dy -= 1;
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) dy += 1;
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) dx -= 1;
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) dx += 1;

    // --- MODIFIED: Animation & Direction Logic ---
    if (dx !== 0 || dy !== 0) {
      // 1. Set Direction (based on raw -1, 0, 1 input)
      //    (Moved this before normalization to fix diagonal direction bug)
      if (dx === 1) this.direction = 'right';
      if (dx === -1) this.direction = 'left';
      if (dy === -1) this.direction = 'up';
      if (dy === 1) this.direction = 'down';
      if (dx > 0 && dy > 0) this.direction = 'downright';
      if (dx > 0 && dy < 0) this.direction = 'upright';
      if (dx < 0 && dy > 0) this.direction = 'downleft';
      if (dx < 0 && dy < 0) this.direction = 'upleft';

      // 2. Update Animation Frame
      this.animTimer += deltaTime / 1000;
      if (this.animTimer > this.animSpeed) {
        this.animTimer = 0;
        // Cycle between frame 0 and 2 for walking
        this.animFrame = (this.animFrame === 0) ? 2 : 0;
      }

      // 3. Normalize for Movement
      // --- THIS IS THE FIX ---
      let length = Math.sqrt(dx * dx + dy * dy);
      // --- END FIX ---
      
      dx /= length;
      dy /= length;

      let nextX = this.x + dx * this.speed;
      let nextY = this.y + dy * this.speed;

      if (!this.collidesWithWall(nextX, this.y)) {
        this.x = nextX;
      }

      if (!this.collidesWithWall(this.x, nextY)) {
        this.y = nextY;
      }
    } else {
      // Not moving
      this.animFrame = 1; // Set to idle frame (middle sprite)
      this.animTimer = 0;
    }
    // --- END MODIFIED ---


    // Boundary limits
    const minX = offsetX + this.playerSize / 2;
    const maxX = offsetX + gridPixels - this.playerSize / 2;
    const minY = offsetY + this.playerHeight / 2;
    const maxY = offsetY + gridPixels - this.playerHeight / 2;

    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;

    // --- REMOVED: Old Direction Logic ---
    // (It's now inside the `if (dx !== 0)` block)
    // --- END REMOVED ---


    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        const cell = cells.cells[i][j];
        if (cell.isExit() && cell.contains(this.x, this.y) && !transitioning && enemies.length == 0) {
          transitioning = true;
          this.lastExit = cells.exitSide;
          return;
        }
      }
    }
  }


  collidesWithWall(nextX, nextY) {
    gridSize = Math.min(windowWidth, windowHeight) / 20;
    let halfW = this.playerSize / 2;
    let halfH = this.playerHeight / 2;

    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        let cell = cells.cells[i][j];
        if (cell.isWall()) {
          if (
            nextX + halfW > cell.x &&
            nextX - halfW < cell.x + gridSize &&
            nextY + halfH > cell.y &&
            nextY - halfH < cell.y + gridSize
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  finishRoomTransition() {

    cells.create();
    cells.change();

    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;


    if (this.lastExit === "top") {
      this.x = offsetX + 8 * gridSize;
      this.y = offsetY + gridPixels - gridSize * 1.5;
    } else if (this.lastExit === "right") {
      this.x = offsetX + gridSize * 1.5;
      this.y = offsetY + 8 * gridSize;
    } else {
      this.x = width / 2;
      this.y = height / 2;
    }

  }


  attack() {
    if (this.item.getType() === "sword") {
      this.item.swordAttack(this.x, this.y, this.direction);
    }
  }

}