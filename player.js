//Player Code
class Player {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.hp = 3;
    this.strength = 1;
    this.resistance = 0;
    this.speed = 3;
    this.direction = 'right';
    this.item = null;
    this.mana = null;
  }
  
  base() {
    rectMode(CENTER);
    fill('darkgray');
    rect(this.x, this.y, 20, 40);
  }
  
  movement() {
    let dx = 0;
    let dy = 0;

    if (keyIsDown(87) || keyIsDown(UP_ARROW)) { // w
      dy -= 1;
    }
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) { // s
      dy += 1;
    }
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) { // a
      dx -= 1;
    }
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) { // d
      dx += 1;
    }

    if (dx !== 0 || dy !== 0) {
      let length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      this.x += dx * player.speed;
      this.y += dy * player.speed;
    }
    if (this.x <= width / 12 + 10) {
      this.x = width / 12 + 10;
    }
    if (this.x >= width - width / 12 - 10) {
      this.x = width - width / 12 - 10;
    }
    if (this.y <= height / 12 + 20) {
      this.y = height / 12 + 20;
    }
    if (this.y >= height - height / 12 - 20) {
      this.y = height - height / 12 - 20;
    }
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
}