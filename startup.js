// --------------------------------------
// GLOBAL STATE
// --------------------------------------
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

// Sounds
let applesound, swingsound, fireballsound, healsound, footstepsound, bossmusic, dungeonmusic;

// Sprites
let spritesheet, imgWall, imgFloor;
let imgPlayerSheet;
let imgWeaponSheet;

// HUD Sprites
let imgHUDSheet;
let imgHPBarFrame, imgMPBarFrame, imgHPBarFill, imgMPBarFill, imgHPBarBack, imgMPBarBack;

// Enemy sprites
let imgSlimeSheet, imgNoodleSheet;
let slimeSprites = [];
let noodleSprites = {};

// Magic sprites
let imgFireballSheet;
let redFireFrames = [];


// --------------------------------------
// PRELOAD
// --------------------------------------
function preload() {
  spritesheet = loadImage("libraries/Assets/Enviroment/enviroment.png");
  imgPlayerSheet = loadImage("libraries/Assets/Player/player.png");
  imgWeaponSheet = loadImage("libraries/Assets/Player/Key-Blade.png");
  imgHUDSheet = loadImage("libraries/Assets/Player/HPMPBar.png");

  applesound = loadSound("libraries/Assets/Sounds/20279__koops__apple_crunch_16.wav");
  swingsound = loadSound("libraries/Assets/Sounds/sword-swing-whoosh-2-SBA-300463384.mp3");
  swingsound.setVolume(0.2);

  fireballsound = loadSound("libraries/Assets/Sounds/magical-fireball-whoosh-SBA-300156509.mp3");
  healsound = loadSound("libraries/Assets/Sounds/ascend-flutter-SBA-300148979.mp3");
  footstepsound = loadSound("libraries/Assets/Sounds/fast-footsteps.mp3");
  footstepsound.setVolume(0.2);

  bossmusic = loadSound("libraries/Assets/Sounds/dubstep-trap-hype-music-274575.mp3",
    () => console.log("Boss music LOADED!"),
    () => console.error("FAILED to load boss music!")
  );
  bossmusic.setVolume(0.6);

  dungeonmusic = loadSound("libraries/Assets/Sounds/8-bit-dungeon-251388.mp3");
  dungeonmusic.setVolume(0.2);

  // Enemy sheets
  imgSlimeSheet = loadImage("libraries/Assets/Enemies/slimes.png");
  imgNoodleSheet = loadImage("libraries/Assets/Enemies/Noodle.png");

  // Magic sprites
  imgFireballSheet = loadImage("libraries/Assets/Player/firewall.png");
}


// --------------------------------------
// MUSIC HELPERS
// --------------------------------------
function playDungeonMusic() {
  if (dungeonmusic && dungeonmusic.isLoaded() && !dungeonmusic.isPlaying()) {
    dungeonmusic.loop();
  }
  if (bossmusic && bossmusic.isPlaying()) bossmusic.stop();
}

function stopDungeonMusic() {
  if (dungeonmusic && dungeonmusic.isPlaying()) dungeonmusic.stop();
}


// --------------------------------------
// SETUP
// --------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);

  imgWall = spritesheet.get(0, 0, 32, 32);
  imgFloor = spritesheet.get(32, 0, 32, 32);

  // HUD slicing
  if (imgHUDSheet) {
    let h = imgHUDSheet.height / 6;
    let w = imgHUDSheet.width;
    imgHPBarFrame = imgHUDSheet.get(0, 0, w, h);
    imgMPBarFrame = imgHUDSheet.get(0, h, w, h);
    imgHPBarFill = imgHUDSheet.get(0, h * 2, w, h);
    imgMPBarFill = imgHUDSheet.get(0, h * 3, w, h);
    imgHPBarBack = imgHUDSheet.get(0, h * 4, w, h);
    imgMPBarBack = imgHUDSheet.get(0, h * 5, w, h);
  }

  // Slime frames
  if (imgSlimeSheet) {
    let sw = imgSlimeSheet.width / 2;
    let sh = imgSlimeSheet.height / 4;
    const f = (c, r) => imgSlimeSheet.get(c * sw, r * sh, sw, sh);
    slimeSprites.push([f(0, 0), f(0, 2)]);
    slimeSprites.push([f(1, 0), f(1, 2)]);
    slimeSprites.push([f(0, 1), f(0, 3)]);
    slimeSprites.push([f(1, 1), f(1, 3)]);
  }

  // Boss frames
  if (imgNoodleSheet) {
    let w = imgNoodleSheet.width / 3;
    let h = imgNoodleSheet.height / 3;
    noodleSprites.head_blue = imgNoodleSheet.get(0, 0, w, h);
    noodleSprites.body_blue = imgNoodleSheet.get(w, 0, w, h);
    noodleSprites.head_yellow = imgNoodleSheet.get(0, h, w, h);
    noodleSprites.body_yellow = imgNoodleSheet.get(w, h, w, h);
    noodleSprites.tail_standard = imgNoodleSheet.get(w, h * 2, w, h);
    noodleSprites.apple = imgNoodleSheet.get(w * 2, h * 2, w, h);
  }

  // Magic frames
  if (imgFireballSheet) {
    let fw = imgFireballSheet.width / 4;
    let fh = imgFireballSheet.height / 4;
    redFireFrames.push(imgFireballSheet.get(0, 0, fw, fh));
    redFireFrames.push(imgFireballSheet.get(2 * fw, 0, fw, fh));
    redFireFrames.push(imgFireballSheet.get(0, 2 * fh, fw, fh));
    redFireFrames.push(imgFireballSheet.get(2 * fw, 2 * fh, fw, fh));
  }
}


// --------------------------------------
// DRAW LOOP
// --------------------------------------
function draw() {
  background(0);

  // Not running
  if (!player || !gameRunning) {
    textSize(50);
    fill("white");
    textAlign(CENTER, CENTER);
    text("Click to Start!", width / 2, height / 2);
    return;
  }

  if (player.hp <= 0) dead = true;

  if (dead) {
    fill("black");
    rect(0, 0, width, height);
    textSize(50);
    fill("white");
    text("GAME OVER", width / 2, height / 2);
    text("Click to Restart!", width / 2, height / 2 + 60);
    return;
  }

  border();
  level();

  // Draw map
  for (let i = 0; i < cells.cells.length; i++) {
    for (let j = 0; j < cells.cells[i].length; j++) cells.cells[i][j].show();
  }

  // Projectiles
  for (let i = magicProjectiles.length - 1; i >= 0; i--) {
    let p = magicProjectiles[i];
    if (!transitioning) p.update();
    p.draw();
    if (!p.active) magicProjectiles.splice(i, 1);
  }

  // Player
  player.base();
  player.item.drawAttack(player.x, player.y, player.direction);
  player.item.update();

  // Enemies
  for (let e of enemies) {
    if (!transitioning) e.update();
    e.draw();
  }

  if (!transitioning) player.movement();

  // Room transition fade
  if (transitioning) drawRoomTransition();

  // HUD
  if (player.drawHUD) player.drawHUD();
}


// --------------------------------------
// ROOM TRANSITION EFFECT
// --------------------------------------
function drawRoomTransition() {
  transitionTimer += deltaTime / 1000;

  if (transitionTimer < 0.4) {
    transitionAlpha = map(transitionTimer, 0, 0.4, 0, 255);
  } else if (transitionTimer < 0.8) {
    if (!player.transitionHandled) {
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
      return;
    }
  }

  fill(0, 0, 0, transitionAlpha);
  noStroke();

  let gridSize = Math.min(windowWidth, windowHeight) / 20;
  const gridPixels = gridSize * 16;
  const offsetX = (windowWidth - gridPixels) / 2;
  const offsetY = (windowHeight - gridPixels) / 2;

  rect(offsetX, offsetY, gridPixels, gridPixels);
}


// --------------------------------------
// INPUT
// --------------------------------------
function mousePressed() {
  if (getAudioContext().state !== "running") getAudioContext().resume();

  if (!gameRunning || dead) {
    gameRunning = true;
    dead = false;

    roomCount = 0;
    resetLevel();

    player = new Player();

    cells = new Cells();
    cells.create();
    cells.change();

    enemies = [];

    playDungeonMusic();
  }
}

function keyPressed() {
  if (keyCode === 32 && gameRunning) {
    player.attack();
    if (swingsound.isLoaded()) {
      swingsound.stop();
      swingsound.play();
    }
  }

  if (!gameRunning) return;

  if (key === "J") player.takeDamage?.(1);
  if (key === "K") player.heal?.(1);
  if (key === 'L') player.setMaxHP?.(player.maxHP + 1);


  if (key && key.toLowerCase() === "m") {
    if (player.mana >= 1) {

        player.mana--;

        if (fireballsound.isLoaded()) {
            fireballsound.stop();
            fireballsound.play();
        }

        magicProjectiles.push(new MagicProjectile(player.x, player.y, player.direction));
      }
  }


}


// --------------------------------------
// WINDOW RESIZE
// --------------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// --------------------------------------
// BOSS ROOM CREATION
// --------------------------------------
function createSnakeBossRoom() {
  console.log("Entering BOSS ROOM!");

  stopDungeonMusic();

  enemies = [];
  cells.create();
  cells.clearInterior();
  cells.exitSide = null;

  // Border walls
  for (let x = 0; x < 16; x++) {
    cells.cells[x][0].setType("wall");
    cells.cells[x][15].setType("wall");
  }
  for (let y = 0; y < 16; y++) {
    cells.cells[0][y].setType("wall");
    cells.cells[15][y].setType("wall");
  }

  // Start boss music
  if (bossmusic.isLoaded()) {
    bossmusic.setVolume(0.5);
    bossmusic.loop();
  }

  enemies.push(new SnakeBoss(width / 2, height / 2));

  console.log("Boss room created, audio state:", getAudioContext().state);
}
