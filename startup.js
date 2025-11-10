let gameRunning = false;
let firstRoom = true;
let transitioning = false;
let transitionAlpha = 0;
let transitionTimer = 0;



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
    return;
  }

  drawGrid();
  border();
  level();

  for (let i = 0; i < cells.cells.length; i++) {
    for (let j = 0; j < cells.cells[i].length; j++) {
      cells.cells[i][j].show();
    }
  }

  player.base();
  player.item.drawAttack(player.x, player.y, player.direction);
  player.item.update();

  for (let enemy of enemies) {
    if (!transitioning) {
      enemy.update();
    }
    enemy.draw();
  }

  if (!transitioning) {
    player.movement();
  }

  if (transitioning) {
    transitionTimer += deltaTime / 1000;
    if (transitionTimer < 0.4) {
      
      transitionAlpha = map(transitionTimer, 0, 0.4, 0, 255);
    } else if (transitionTimer < 0.8) {
      
      if (transitionTimer > 0.4 && !player.transitionHandled) {
        player.finishRoomTransition();
        player.transitionHandled = true;
      }
      transitionAlpha = 255;
    } else {
      
      transitionAlpha = map(transitionTimer, 0.8, 1.2, 255, 0);
      if (transitionTimer >= 1.2) {
        transitioning = false;
        transitionAlpha = 0;
        transitionTimer = 0;
        player.transitionHandled = false;
      }
    }

    fill(0, 0, 0, transitionAlpha);
    rectMode(CORNER);
    noStroke();
    gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;
    rect(offsetX, offsetY, offsetX + gridPixels, offsetY + gridPixels);
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


