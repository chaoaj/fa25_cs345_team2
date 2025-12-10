let gameRunning = false;
let firstRoom = true;
let transitioning = false;
let transitionAlpha = 0;
let transitionTimer = 0;
let dead = false;
let magicProjectiles = [];
let roomCount = 0;
let inBossRoom = false;
let player = null;

// --- Sound variables ---
let applesound, swingsound, fireballsound, healsound, footstepsound, bossmusic;
let snakeGame; 

// --- Sprite variables ---
let spritesheet, imgWall, imgFloor;
let imgPlayerSheet;
let imgWeaponSheet;

// --- HUD Sprite Variables ---
let imgHUDSheet;
let imgHPBarFrame, imgMPBarFrame, imgHPBarFill, imgMPBarFill, imgHPBarBack, imgMPBarBack;
// --- END ADDED ---

// --- Enemy & Boss Sprites ---
let imgSlimeSheet, imgNoodleSheet;
let slimeSprites = []; 
let noodleSprites = {}; 

// --- Magic Sprites ---
let imgFireballSheet;
let redFireFrames = []; 

function preload() {
  // Environment
  spritesheet = loadImage('libraries/Assets/Enviroment/enviroment.png');
  // Player
  imgPlayerSheet = loadImage('libraries/Assets/Player/player.png');
  // Weapon
  imgWeaponSheet = loadImage('libraries/Assets/Player/Key-Blade.png');
  
  // --- ADDED: Load the HUD spritesheet ---
  imgHUDSheet = loadImage('libraries/Assets/Player/HPMPBar.png');

  applesound = loadSound('libraries/Assets/Sounds/20279__koops__apple_crunch_16.wav');
  swingsound = loadSound('libraries/Assets/Sounds/sword-swing-whoosh-2-SBA-300463384.mp3');
  swingsound.setVolume(0.2);
  fireballsound = loadSound('libraries/Assets/Sounds/magical-fireball-whoosh-SBA-300156509.mp3');
  healsound = loadSound('libraries/Assets/Sounds/ascend-flutter-SBA-300148979.mp3');
  footstepsound = loadSound('libraries/Assets/Sounds/fast-footsteps.mp3');
  footstepsound.setVolume(0.2);

  bossmusic = loadSound(
    'libraries/Assets/Sounds/dubstep-trap-hype-music-274575.mp3',
    () => console.log("Boss music LOADED!"),
    () => console.error("FAILED to load boss music!")
  );
  bossmusic.setVolume(0.6);
  dungeonmusic = loadSound('libraries/Assets/Sounds/8-bit-dungeon-251388.mp3');
  dungeonmusic.setVolume(0.2);
}

function playDungeonMusic() {
  if (dungeonmusic && dungeonmusic.isLoaded()) {
    if (!dungeonmusic.isPlaying()) {
      dungeonmusic.loop();
    }
  }

  // Stop boss music if needed
  if (bossmusic && bossmusic.isPlaying()) {
    bossmusic.stop();
  }
}

function stopDungeonMusic() {
  if (dungeonmusic && dungeonmusic.isPlaying()) {
    dungeonmusic.stop();
  }
  // Enemies
  imgSlimeSheet = loadImage('libraries/Assets/Enemies/slimes.png');
  imgNoodleSheet = loadImage('libraries/Assets/Enemies/Noodle.png');

  // Magic
  imgFireballSheet = loadImage('libraries/Assets/Player/firewall.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // --- Create sub-images ---
  imgWall = spritesheet.get(0, 0, 32, 32);
  imgFloor = spritesheet.get(32, 0, 32, 32);

  // HUD Slicing
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
  
  // Slime Slicing
  if (imgSlimeSheet) {
    let sw = imgSlimeSheet.width / 2;
    let sh = imgSlimeSheet.height / 4;
    const getFrame = (c, r) => imgSlimeSheet.get(c * sw, r * sh, sw, sh);
    slimeSprites.push([ getFrame(0, 0), getFrame(0, 2) ]);
    slimeSprites.push([ getFrame(1, 0), getFrame(1, 2) ]);
    slimeSprites.push([ getFrame(0, 1), getFrame(0, 3) ]);
    slimeSprites.push([ getFrame(1, 1), getFrame(1, 3) ]);
  }

  // Snake Boss Sprites
  if (imgNoodleSheet) {
    let nw = imgNoodleSheet.width / 3;
    let nh = imgNoodleSheet.height / 3;
    noodleSprites.head_blue = imgNoodleSheet.get(0, 0, nw, nh);     
    noodleSprites.body_blue = imgNoodleSheet.get(nw, 0, nw, nh);    
    noodleSprites.head_yellow = imgNoodleSheet.get(0, nh, nw, nh); 
    noodleSprites.body_yellow = imgNoodleSheet.get(nw, nh, nw, nh);
    noodleSprites.tail_standard = imgNoodleSheet.get(nw, 2 * nh, nw, nh); 
    noodleSprites.apple = imgNoodleSheet.get(2 * nw, 2 * nh, nw, nh);   
  }

  // --- MODIFIED: Slice Specific Red Fireball Sprites ---
  if (imgFireballSheet) {
    // 4x4 Grid
    let fw = imgFireballSheet.width / 4;
    let fh = imgFireballSheet.height / 4;

    // Grab Red frames at specific locations: (0,0), (2,0), (0,2), (2,2)
    // (Column, Row)
    redFireFrames.push(imgFireballSheet.get(0 * fw, 0 * fh, fw, fh)); // (0,0)
    redFireFrames.push(imgFireballSheet.get(2 * fw, 0 * fh, fw, fh)); // (2,0)
    redFireFrames.push(imgFireballSheet.get(0 * fw, 2 * fh, fw, fh)); // (0,2)
    redFireFrames.push(imgFireballSheet.get(2 * fw, 2 * fh, fw, fh)); // (2,2)
  }
  // --- END MODIFIED ---
}

function draw() {
  background(0);

  // MUST BE FIRST
  if (player === null || !gameRunning) {
    textSize(50);
    fill('white');
    textAlign(CENTER, CENTER);
    text("Click to Start!", width / 2, height / 2);
    return;
  }

  if (!dead && player.hp == 0) {
    dead = true;
  }


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

    rect(offsetX, offsetY, gridPixels, gridPixels);
  }

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
    roomCount = 0
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
    if (key === 'J') player.takeDamage?.(1); 
    if (key === 'K') player.heal?.(1); 
    if (key === 'L') player.setMaxHP?.(player.maxHP + 1); 
    
    if (key === 'N' && player.mana > 0) player.mana = max(0, player.mana - 1); 
    
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
      if (player.castHealSpell && !player.castHealSpell()) {
  console.log("Heal spell failed: not enough mana or HP full.");
}
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function createSnakeBossRoom() {
  console.log("Entering BOSS ROOM!");
  
  stopDungeonMusic();

  enemies = [];
  cells.create();
  cells.clearInterior();
  cells.exitSide = null;

  // Draw arena walls
  for (let x = 0; x < 16; x++) {
    cells.cells[x][0].setType("wall");
    cells.cells[x][15].setType("wall");
  }
  for (let y = 0; y < 16; y++) {
    cells.cells[0][y].setType("wall");
    cells.cells[15][y].setType("wall");
  }

  // ⭐ IMPORTANT: Start Music Here
  if (bossmusic && bossmusic.isLoaded()) {
    console.log("Starting boss music...");
    bossmusic.setVolume(0.5);
    bossmusic.loop();
  } else {
    console.warn("Boss music not loaded yet!");
  }

  // Spawn the boss
  enemies.push(new SnakeBoss(width / 2, height / 2));

  levelNumber++;

  console.log("BOSS ROOM CREATED, attempting to play music.");
  console.log("Audio state:", getAudioContext().state);

}
