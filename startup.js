let gameRunning = false;

function setup() {
  createCanvas(1280, 720);
}

function draw() {
  background(220);
  if (!gameRunning) {
    textSize(50);
    fill('black');
    text("Click to Start!", 250, 300);
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
  // when fullscreen is toggled, resize canvas to match new screen size
  if (fullscreen()) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(1280, 720);
  }
}

