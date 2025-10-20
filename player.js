//Player Code
class Player {


  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.playerHeight = height / 18;
    this.playerSize = this.playerHeight / 2;
    this.hp = 3;
    this.strength = 1;
    this.resistance = 1;
    this.speed = 3;
    this.direction = 'right';
    this.item = null;
    this.mana = null;
  }

  base() {
    rectMode(CENTER);
    fill('darkgray');
    rect(this.x, this.y, this.playerSize, this.playerHeight);
  }

  movement() {
    let dx = 0;
    let dy = 0;

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

    // Boundaries
    if (this.x <= width / 12 + this.playerSize / 2)
      this.x = width / 12 + this.playerSize / 2;

    if (this.x >= width - width / 12 - this.playerSize / 2)
      this.x = width - width / 12 - this.playerSize / 2;

    if (this.y <= height / 12 + this.playerHeight / 2)
      this.y = height / 12 + this.playerHeight / 2;

    if (this.y >= height - height / 12 - this.playerHeight / 2)
      this.y = height - height / 12 - this.playerHeight / 2;

    fill('white')
    textSize(10)
    text('dx: ' + dx, 10, 20)
    text('dy: ' + dy, 400, 20)
    text(this.direction, 195, 20)
    
    //Directions
    if (dx == 1) this.direction = 'right';
    
    if (dx == -1) this.direction = 'left';
    
    if (dy == -1) this.direction = 'up';
    
    if (dy == 1) this.direction = 'down';
    
    if (dx > 0 && dy > 0) this.direction = 'downright';
    
    if (dx > 0 && dy < 0) this.direction = 'upright';
    
    if (dx < 0 && dy > 0) this.direction = 'downleft';
    
    if (dx < 0 && dy < 0) this.direction = 'upleft';
      
    
  }

  collidesWithWall(nextX, nextY) {
    let gridSize = windowHeight / 18;
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

  
}