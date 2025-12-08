let gameRunning = false;
let firstRoom = true;
let transitioning = false;
let transitionAlpha = 0;
let transitionTimer = 0;
let dead = false;
let magicProjectiles = [];

// --- Sound variables ---
let applesound, swingsound, fireballsound, healsound, footstepsound;

// --- Sprite variables ---
let spritesheet, imgWall, imgFloor;
let imgPlayerSheet;
let imgWeaponSheet;

// --- ADDED: HUD Sprite Variables ---
let imgHUDSheet;
let imgHPBarFrame, imgMPBarFrame, imgHPBarFill, imgMPBarFill, imgHPBarBack, imgMPBarBack;
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
    //added bar backs
    imgHPBarFrame = imgHUDSheet.get(0, 0, barW, barH);
    imgMPBarFrame = imgHUDSheet.get(0, barH, barW, barH);
    imgHPBarFill = imgHUDSheet.get(0, barH * 2, barW, barH);
    imgMPBarFill = imgHUDSheet.get(0, barH * 3, barW, barH);
    imgHPBarBack = imgHUDSheet.get(0, barH * 4, barW, barH);
    imgMPBarBack = imgHUDSheet.get(0, barH * 5, barW, barH);
  }
    // --- Load Sounds ---
  applesound = loadSound('libraries/Assets/Sounds/20279__koops__apple_crunch_16.wav');
  swingsound = loadSound('libraries/Assets/Sounds/sword-swing-whoosh-2-SBA-300463384.mp3');
  fireballsound = loadSound('libraries/Assets/Sounds/magical-fireball-whoosh-SBA-300156509.mp3');
  healsound = loadSound('libraries/Assets/Sounds/ascend-flutter-SBA-300148979.mp3');
  footstepsound = loadSound('libraries/Assets/Sounds/fast-footsteps.mp3');
    footstepsound.setVolume(0.2);
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
  
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  
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
    // Player swings sword
    player.attack();

    // Play swing sound
    if (swingsound && swingsound.isLoaded()) {
        swingsound.stop();
        swingsound.play();
    }
}
  // ADDED: quick test keys (optional)
  if (gameRunning) {
    if (key === 'J') player.takeDamage?.(1); //Damages player for 1
    if (key === 'K') player.heal?.(1); //Heals player for 1
    if (key === 'L') player.setMaxHP?.(player.maxHP + 1); //increase max HP for 1
    
    // --- MODIFIED: Mana Keys ---
    if (key === 'N' && player.mana > 0) player.mana = max(0, player.mana - 1); // Use 1 mana
    
    // REPLACE the old 'M' key logic with this:
    const manaCost = 1;
if ((key === 'M' || key === 'm') && player.mana >= manaCost) {
  player.mana -= manaCost;

  // --- PLAY MAGIC CAST SOUND ---
  if (fireballsound && fireballsound.isLoaded()) {
    fireballsound.stop();   // ensures clean restart
    fireballsound.play();
  }

  // Create the projectile
  magicProjectiles.push(new MagicProjectile(player.x, player.y, player.direction));
}
    // --- END MODIFIED ---

    if (key === 'h' || key === 'H') {
      if (!player.castHealSpell()) {
  console.log("Heal spell failed: not enough mana or HP full.");
}
    }

  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

