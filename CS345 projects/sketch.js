let cat;
const fw = 221;   // frame width
const fh = 154;   // frame height
const frames = 6; // use only the first 6 frames
let x = 0;        // cat's horizontal position
let speed = 4;    // speed in pixels per frame

function preload() {
  cat = loadImage('assets/cat-221-154-8.png');
}

function setup() {
  createCanvas(800, 300);
  frameRate(12);
  imageMode(CENTER);
}

function draw() {
  background(200, 240, 255);

  // pick frame (loop through first 6)
  const f = frameCount % frames;
  const sx = f * fw;

  // draw one frame of the sprite
  const scale = 0.6;
  image(cat, x, height / 2, fw * scale, fh * scale, sx, 0, fw, fh);

  // move the cat
  x += speed;

  // wrap around when offscreen
  if (x > width + (fw * scale) / 2) {
    x = - (fw * scale) / 2;
  }
}
