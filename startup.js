let gameRunning = false;

function setup() {
  createCanvas(1280, 720);
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
    player.base();
    player.movement();

  }
}

function mousePressed() {
  if (!gameRunning) {
    gameRunning = !gameRunning;
    player = new Player();
    let fs = fullscreen();
    fullscreen(!fs);
  }
  
}

function windowResized() {
  
  if (fullscreen()) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(1280, 720);
  }
}

