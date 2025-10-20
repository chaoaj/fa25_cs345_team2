//Environment Functions
let gridSize;


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
  gridSize = windowHeight / 18;
  stroke(180);
  for (let x = windowWidth / 12; x < windowWidth - windowWidth / 12; x += gridSize) {
    line(x, 0, x, windowHeight);
  }
  for (let y = windowHeight / 12; y < windowHeight - windowHeight / 12; y += gridSize) {
    line(0, y, windowWidth, y);
  }
  
}

class Cells {
  constructor() {
    this.cells = [];
  }

  create() {
    let xIndex = 0;
    let yIndex = 0;
    let gridSize = windowHeight / 18;

    for (let x = windowWidth / 12; x < windowWidth - windowWidth / 12; x += gridSize) {
      this.cells[xIndex] = [];
      yIndex = 0;
      for (let y = windowHeight / 12; y < windowHeight - windowHeight / 12; y += gridSize) {
        this.cells[xIndex][yIndex] = new Cell(x, y);
        yIndex++;
      }
      xIndex++;
    }
  }

  change() {
    // ex. walls: will add preset layouts later
    let y = 5;
    for (let x = 8; x <= 12; x++) {
      this.cells[x][y].setType("wall");
      this.cells[x][y].show();
    }
  }
}

class Cell {

  constructor(x, y, type = "floor") {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  setType(type) {
    this.type = type;
  }

  isWall() {
    return this.type === "wall";
  }

  contains(px, py) {
    let gridSize = windowHeight / 18;
    return (
      px >= this.x &&
      px < this.x + gridSize &&
      py >= this.y &&
      py < this.y + gridSize
    );
  }

  show() {
    let gridSize = windowHeight / 18;
    if (this.type == "wall") {
      rectMode(CORNER);
      fill("black");
      square(this.x, this.y, gridSize);
    }
  }


}

