let gameRunning = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  if (!gameRunning) {
    textSize(50);
    fill('black');
    text("Click to Start!", 430, 360);
  }
  if (gameRunning) {
    drawGrid();
    border();
    
    cells.create();
    cells.change();

    player.base();
    player.movement();

    

  }
}

function mousePressed() {
  if (!gameRunning) {
    gameRunning = true;
    player = new Player();
    cells = new Cells();
    cells.create();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
