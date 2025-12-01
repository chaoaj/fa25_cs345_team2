let gameRunning = false;
let firstRoom = true;
let transitioning = false;
let transitionAlpha = 0;
let transitionTimer = 0;
let dead = false;
let magicProjectiles = [];

// --- Sprite variables ---
let spritesheet, imgWall, imgFloor;
let imgPlayerSheet;
let imgWeaponSheet;

// --- ADDED: HUD Sprite Variables ---
let imgHUDSheet;
let imgHPBarFrame, imgMPBarFrame, imgHPBarFill, imgMPBarFill;
// --- END ADDED ---

// --- Preload function ---
function preload() {
  // Environment spritesheet
  spritesheet = loadImage('libraries/Assets/Enviroment/enviroment.png');

  // Player spritesheet
  imgPlayerSheet = loadImage('libraries/Assets/Player/player.png');

  // Weapon spritesheet
  imgWeaponSheet = loadImage('libraries/Assets/Player/Key-Blade.png');
  
  // --- ADDED: Load the HUD spritesheet ---
  imgHUDSheet = loadImage('libraries/Assets/Player/HPMPBar.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // --- Create sub-images ---
  // We assume the sprites are 32x32 pixels on the sheet
  // Wall texture is at (0, 0)
  imgWall = spritesheet.get(0, 0, 32, 32);
  // Floor texture is at (32, 0)
  imgFloor = spritesheet.get(32, 0, 32, 32);

  // --- ADDED: Create HUD sub-images ---
  // This assumes the HPMPBar.png has 6 equal-height rows
  if (imgHUDSheet) {
    let barH = imgHUDSheet.height / 6; // Height of one bar row
    let barW = imgHUDSheet.width;    // Full width
    
    // Get each part of the spritesheet
    imgHPBarFrame = imgHUDSheet.get(0, 0, barW, barH);
    imgMPBarFrame = imgHUDSheet.get(0, barH, barW, barH);
    imgHPBarFill = imgHUDSheet.get(0, barH * 2, barW, barH);
    imgMPBarFill = imgHUDSheet.get(0, barH * 3, barW, barH);
  }
  // --- END ADDED ---
}

function draw() {
  // MODIFIED: Changed background to black for a better border look
  background(0);

  if (!gameRunning) {
    textSize(50);
    fill('white');
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

  // **MODIFIED: Commented out drawGrid() to remove the lines**
  // drawGrid();

  border();
  level();

  for (let i = 0; i < cells.cells.length; i++) {
    for (let j = 0; j < cells.cells[i].length; j++) {
      cells.cells[i][j].show();
    }
  }

  for (let i = magicProjectiles.length - 1; i >= 0; i--) {
    let p = magicProjectiles[i];
    if (!transitioning) {
      p.update();
    }
    p.draw();
    if (!p.active) {
      magicProjectiles.splice(i, 1);
    }
  }

  // --- Player draw/update ---
  player.base();
  player.item.drawAttack(player.x, player.y, player.direction); // <-- This will now draw the sprite
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

    rect(offsetX, offsetY, gridPixels, gridPixels);
  }

  // ADDED: draw HUD on top of everything (so it isn't dimmed by the overlay)
  if (player.drawHUD) player.drawHUD();
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
    if (key === 'J') player.takeDamage?.(1); //Damages player for 1
    if (key === 'K') player.heal?.(1); //Heals player for 1
    if (key === 'L') player.setMaxHP?.(player.maxHP + 1); //increase max HP for 1
    
    // --- MODIFIED: Mana Keys ---
    if (key === 'N' && player.mana > 0) player.mana = max(0, player.mana - 1); // Use 1 mana
    
    // REPLACE the old 'M' key logic with this:
    const manaCost = 1; // Define the cost of one shot
    if (key === 'M' || key === 'm' && player.mana >= manaCost) {
      player.mana -= manaCost; // Subtract mana
      magicProjectiles.push(new MagicProjectile(player.x, player.y, player.direction));
    }
    // --- END MODIFIED ---

    if (key === 'h' || key === 'H') {
      if (!castHealSpell(player)) {
        console.log("Heal spell failed: not enough mana or HP full.");
      }
    }

  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}