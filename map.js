//Map Functions
function border() {
  stroke(0);
  rectMode(CORNERS);
  fill('black');
  rect(0, 0, width, height / 12);
  rect(0, height - height / 12, width, height);
  rect(0, 0, width / 12, height)
  rect(width - width / 12, 0, width, height);
}


let gridSize = 20;

function drawGrid() {
  stroke(180);
  for (let x = 0; x < width; x += gridSize) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += gridSize) {
    line(0, y, width, y);
  }
  
}