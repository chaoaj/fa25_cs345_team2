//Environment Functions



function border() {
  stroke(0);
  rectMode(CORNERS);
  fill('black');
  rect(0, 0, windowWidth, windowHeight / 12);
  rect(0, windowHeight - windowHeight / 12, windowWidth, windowHeight);
  rect(0, 0, windowWidth / 12, windowHeight)
  rect(windowWidth - windowWidth / 12, 0, windowWidth, windowHeight);
}




function drawGrid() {
  let gridSize = windowHeight / 18;
  stroke(180);
  for (let x = windowWidth / 12; x < windowWidth - windowWidth / 12; x += gridSize) {
    line(x, 0, x, windowHeight);
  }
  for (let y = windowHeight / 12; y < windowHeight - windowHeight / 12; y += gridSize) {
    line(0, y, windowWidth, y);
  }
  
}

