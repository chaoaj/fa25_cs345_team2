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
    
    this.iswalking = false;

    // --- Initialized Mana ---
    this.mana = 10;
    this.maxMana = 10;
    // --- ADDED: Mana Regeneration Rate ---
    this.manaRegenRate = 0.5; // Regenerates 2 mana per second
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

    // --- MODIFIED: Corrected Row (sy) Mapping ---
    // (Based on your player.png layout: 0=Right, 1=Left, 2=Down, 3=Up)
    let sy = 0;
    if (this.direction.includes('left')) {
      sy = 1 * this.spriteHeight; // Row 1 is Left
    } else if (this.direction.includes('right')) {
      sy = 0 * this.spriteHeight; // Row 0 is Right
    } else if (this.direction === 'up') {
      sy = 3 * this.spriteHeight; // Row 3 is Up (facing away)
    } else if (this.direction === 'down') {
      sy = 2 * this.spriteHeight; // Row 2 is Down (facing camera)
    } else {
      sy = 2 * this.spriteHeight; // Default to 'down'
    }
    // --- END MODIFIED ---

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
    
    // --- ADDED: Mana Regeneration Logic ---
    if (this.mana < this.maxMana) {
      this.mana += this.manaRegenRate * (deltaTime / 1000);
      if (this.mana > this.maxMana) this.mana = this.maxMana;
    }
    // --- END ADDED ---


    gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    //fixed player size to match sprites
    this.playerHeight = gridSize * 0.9;
    this.playerSize = gridSize * 0.7;

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

    // --- MODIFIED: Animation, Direction, & Footsteps Logic ---
if (dx !== 0 || dy !== 0) {

      // --- FOOTSTEP SOUND LOGIC ---
      if (footstepsound && footstepsound.isLoaded()) {
        if (!footstepsound.isPlaying()) {
          footstepsound.setLoop(true);
          footstepsound.play();
        }
      }
      // --- END FOOTSTEP LOGIC ---

      // Direction updates
      if (dx === 1) this.direction = 'right';
      if (dx === -1) this.direction = 'left';
      if (dy === -1) this.direction = 'up';
      if (dy === 1) this.direction = 'down';
      if (dx > 0 && dy > 0) this.direction = 'downright';
      if (dx > 0 && dy < 0) this.direction = 'upright';
      if (dx < 0 && dy > 0) this.direction = 'downleft';
      if (dx < 0 && dy < 0) this.direction = 'upleft';

      // Walking animation
      this.animTimer += deltaTime / 1000;
      if (this.animTimer > this.animSpeed) {
        this.animTimer = 0;
        //modified to correct frames
        this.animFrame = (this.animFrame === 0) ? 1 : 0;
      }

      // Normalize movement vector
      let length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      // Apply movement if no wall
      let nextX = this.x + dx * this.speed;
      let nextY = this.y + dy * this.speed;

      if (!this.collidesWithWall(nextX, this.y)) {
        this.x = nextX;
      }

      if (!this.collidesWithWall(this.x, nextY)) {
        this.y = nextY;
      }

} else {

      // --- STOP FOOTSTEPS WHEN NOT MOVING ---
      if (footstepsound && footstepsound.isPlaying()) {
        footstepsound.stop();
      }
      // --- END FOOTSTEP LOGIC ---

      // Idle animation frame
      this.animFrame = 1;
      this.animTimer = 0;
}
    // --- END MODIFIED ---


    // --- MODIFIED: Border Collision Logic ---
    // Recalculate hitbox dimensions based on collidesWithWall for consistency
    const spriteW = this.playerSize;
    const spriteH = this.playerHeight;

    const hitboxW = spriteW * 0.8;
    const hitboxH = spriteH * 0.2; 

    const hitboxHalfW = hitboxW / 2;
    const hitboxHalfH = hitboxH / 2;
    
    // Vertical offset calculation
    const hitboxCenterOffsetY = spriteH / 2 - hitboxHalfH;
    
    // X limits are straightforward (use shrunken width)
    const minX = offsetX + hitboxHalfW;
    const maxX = offsetX + gridPixels - hitboxHalfW;
    
    // Y limits are adjusted based on the new collision box center and size:
    // minY: Player's Y center when the hitbox top edge touches the top border.
    const minY = offsetY - hitboxCenterOffsetY + hitboxHalfH;
    
    // maxY: Player's Y center when the hitbox bottom edge touches the bottom border.
    const maxY = (offsetY + gridPixels) - hitboxCenterOffsetY - hitboxHalfH;

    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;
    // --- END MODIFIED BORDER LIMITS ---


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

    // --- MODIFIED: Use a smaller, offset hitbox for the 'feet' area ---
    const spriteW = this.playerSize; 
    const spriteH = this.playerHeight; 

    const hitboxW = spriteW * 0.8; 
    const hitboxH = spriteH * 0.2; 

    const hitboxHalfW = hitboxW / 2;
    const hitboxHalfH = hitboxH / 2;

    // Calculate the vertical offset to center the hitbox near the bottom of the sprite.
    const hitboxCenterOffsetY = spriteH / 2 - hitboxHalfH;

    // Calculate the actual center point of the NEW, smaller collision box
    const hitboxY_center = nextY + hitboxCenterOffsetY; // Shift the collision center down!

    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        let cell = cells.cells[i][j];
        if (cell.isWall()) {
          if (
            // Check X-axis using new dimensions
            nextX + hitboxHalfW > cell.x &&
            nextX - hitboxHalfW < cell.x + gridSize &&
            // Check Y-axis using the new center and half-height
            hitboxY_center + hitboxHalfH > cell.y &&
            hitboxY_center - hitboxHalfH < cell.y + gridSize
          ) {
            return true;
          }
        }
      }
    }
    return false;
    // --- END MODIFIED ---
  }

  finishRoomTransition() {
    //Ensure audio is unlocked before starting boss music
    if (getAudioContext().state !== "running") {
        getAudioContext().resume();
    }

    roomCount++;

    // Check if this is a boss room
    let isBossRoom = (roomCount % 5 === 0);

    // Create normal room or boss room
    if (isBossRoom) {

    console.log("Loading BOSS ROOM...");
    stopDungeonMusic();        //Stop dungeon music
    createSnakeBossRoom();     //Boss music starts inside this function

} else {

    console.log("Loading NORMAL ROOM...");
    cells.create();
    cells.change();
    playDungeonMusic();        //Start dungeon music

}


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
    //added use animation frame
    this.animFrame = 2;
  }

}