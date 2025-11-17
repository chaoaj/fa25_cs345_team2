let gameRunning = false;
let firstRoom = true;
let transitioning = false;
let transitionAlpha = 0;
let transitionTimer = 0;
let dead = false;

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

  if (!dead && player.hp == 0) {
    dead = true;
  }

  if (dead) {
    dead = true;
    fill('black');
    rectMode(CORNER);
    rect(0, 0, windowWidth, windowHeight);
    textSize(50);
    fill('white');
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2);
    text("Click to Restart!", width / 2, height / 2 + 75);
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

  // --- Player draw/update ---
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

  // --- Room transition overlay ---
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

  // ADDED: draw HUD on top of everything (so it isn't dimmed by the overlay)
  if (player.drawHUD) player.drawHUD();        // ADDED
}

function mousePressed() {
  if (!gameRunning || dead) {
    gameRunning = true;
    dead = false;

    firstRoom = true;
    resetLevel();         

    player = new Player();

    cells = new Cells();
    cells.create();
    cells.change();         

    enemies = [];          
  }
}


function keyPressed() {
  if (keyCode === 32 && gameRunning) {
    player.attack();
  }
  // ADDED: quick test keys (optional)
  if (gameRunning) {
    if (key === 'J') player.takeDamage?.(1);   //Damages player for 1
    if (key === 'K') player.heal?.(1);         //Heals player for 1
    if (key === 'L') player.setMaxHP?.(player.maxHP + 1); //increase max HP for 1
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
