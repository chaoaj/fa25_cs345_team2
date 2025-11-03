let gameRunning = false;
let firstRoom = true;


function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);

  if (!gameRunning) {
    textSize(50);
    fill('black');
    textAlign(CENTER, CENTER);
    text("Click to Start!", width / 2, height / 2);
  }

  if (gameRunning) {
    drawGrid();
    border();
    level();

    // ✅ show all cell contents (walls/exits) each frame
    for (let i = 0; i < cells.cells.length; i++) {
      for (let j = 0; j < cells.cells[i].length; j++) {
        cells.cells[i][j].show();
      }
    }

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
    cells.change();
  }
}

function keyPressed() {
  if (keyCode === 32 && gameRunning) {
    player.attack();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
