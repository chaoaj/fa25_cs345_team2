// Player Code
class Player {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    const gridSize = Math.min(windowWidth, windowHeight) / 20;
    this.playerHeight = gridSize * 0.8;
    this.playerSize = this.playerHeight * 0.5;
    this.hp = 3;
    this.strength = 1;
    this.resistance = 1;
    this.speed = 3;
    this.direction = 'right';
    this.item = new Weapon("sword");
    this.mana = null;
  }

  base() {
    rectMode(CENTER);
    fill('darkgray');
    rect(this.x, this.y, this.playerSize, this.playerHeight);
  }

  movement() {

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

    if (dx !== 0 || dy !== 0) {
      let length = Math.sqrt(dx * dx + dy * dy);
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
    }

    // Boundary limits: stay inside the 16x16 grid
    const minX = offsetX + this.playerSize / 2;
    const maxX = offsetX + gridPixels - this.playerSize / 2;
    const minY = offsetY + this.playerHeight / 2;
    const maxY = offsetY + gridPixels - this.playerHeight / 2;

    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;

    // Directions
    if (dx === 1) this.direction = 'right';
    if (dx === -1) this.direction = 'left';
    if (dy === -1) this.direction = 'up';
    if (dy === 1) this.direction = 'down';
    if (dx > 0 && dy > 0) this.direction = 'downright';
    if (dx > 0 && dy < 0) this.direction = 'upright';
    if (dx < 0 && dy > 0) this.direction = 'downleft';
    if (dx < 0 && dy < 0) this.direction = 'upleft';


    for (let i = 0; i < cells.cells.length; i++) {
    for (let j = 0; j < cells.cells[i].length; j++) {
      const cell = cells.cells[i][j];
      if (cell.isExit() && cell.contains(this.x, this.y)) {
        console.log("Player reached exit!");

        const lastExit = cells.exitSide;

        // Create new room
        cells.create();
        // Set opposite spawn side
        cells.change();

        const gridSize = Math.min(windowWidth, windowHeight) / 20;
        const gridPixels = gridSize * 16;
        const offsetX = (windowWidth - gridPixels) / 2;
        const offsetY = (windowHeight - gridPixels) / 2;

        // Corrected spawn location
        if (lastExit === "top") {
          // Came from top → spawn near bottom center
          this.x = offsetX + 8 * gridSize;
          this.y = offsetY + gridPixels - gridSize * 1.5;
        } else if (lastExit === "right") {
          // Came from right → spawn near left center
          this.x = offsetX + gridSize * 1.5;
          this.y = offsetY + 8 * gridSize;
        } else {
          // Default center
          this.x = width / 2;
          this.y = height / 2;
        }

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

  attack() {
    if (this.item.getType() === "sword") {
      this.item.swordAttack(this.x, this.y, this.direction);
    }
  }
}
