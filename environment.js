// Environment Functions
let gridSize;
let levelNumber = -1;

function level() {
fill('white')
    textSize(10)
    text('Level: ' + levelNumber, 1000, 20)
}

function border() {
  gridSize = Math.min(windowWidth, windowHeight) / 20; // Base grid cell size
  const gridPixels = gridSize * 16;

  const offsetX = (windowWidth - gridPixels) / 2;
  const offsetY = (windowHeight - gridPixels) / 2;

  stroke(0);
  fill('black');
  rectMode(CORNER);

  rect(0, 0, windowWidth, offsetY);
  rect(0, windowHeight - offsetY, windowWidth, offsetY);
  rect(0, 0, offsetX, windowHeight);
  rect(windowWidth - offsetX, 0, offsetX, windowHeight);

  fill
}

function drawGrid() {
  gridSize = Math.min(windowWidth, windowHeight) / 20;
  const gridPixels = gridSize * 16;
  const offsetX = (windowWidth - gridPixels) / 2;
  const offsetY = (windowHeight - gridPixels) / 2;

  stroke(180);
  for (let x = offsetX; x <= offsetX + gridPixels; x += gridSize) {
    line(x, offsetY, x, offsetY + gridPixels);
  }
  for (let y = offsetY; y <= offsetY + gridPixels; y += gridSize) {
    line(offsetX, y, offsetX + gridPixels, y);
  }
}

class Cells {
  constructor() {
    this.cells = [];
    this.exitSide = null;
    this.entranceSide = null;
    this.layout = null;
  }

  create() {
    this.cells = [];
    gridSize = Math.min(windowWidth, windowHeight) / 20;
    const gridPixels = gridSize * 16;
    const offsetX = (windowWidth - gridPixels) / 2;
    const offsetY = (windowHeight - gridPixels) / 2;

    for (let x = 0; x < 16; x++) {
      this.cells[x] = [];
      for (let y = 0; y < 16; y++) {
        const px = offsetX + x * gridSize;
        const py = offsetY + y * gridSize;
        this.cells[x][y] = new Cell(px, py);
      }
    }
  }

  loadLayout(name) {
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        this.cells[x][y].setType("floor");
      }
    }
    this.layout = name;
    levelNumber++;

    switch (name) {
      case "first":
        break;

      case "cross":
        for (let i = 3; i < 13; i++) {
          this.cells[8][i].setType("wall");
          this.cells[7][i].setType("wall");
          this.cells[i][7].setType("wall");
          this.cells[i][8].setType("wall");
        }
        break;

      case "box":
        for (let i = 0; i < 16; i++) {
          this.cells[i][0].setType("wall");
          this.cells[i][15].setType("wall");
          this.cells[0][i].setType("wall");
          this.cells[15][i].setType("wall");
        }
        break;

      case "apartments":
        for (let x = 3; x < 15; x += 3) {
          for (let y = 1; y < 15; y++) {
            if (y % 3 !== 0) this.cells[x][y].setType("wall");
          }
        }
        break;

      case "deuce":
        for (let x = 3; x <= 6; x++) {
          for (let y = 3; y <= 6; y++) {
            this.cells[x][y].setType("wall");
          }
        }
        for (let x = 9; x <= 12; x++) {
          for (let y = 9; y <= 12; y++) {
            this.cells[x][y].setType("wall");
          }
        }
        break;
    }

    
    if (this.entranceSide) {
      let entrance;
      if (this.entranceSide === "bottom") {
        entrance = [floor(random(0, 16)), 15];
      } else if (this.entranceSide === "left") {
        entrance = [0, floor(random(0, 16))];
      } else {
        entrance = [floor(random(0, 16)), 15];
      }
      const [ex, ey] = entrance;
      this.cells[ex][ey].setType("entrance");
    }

    let ex, ey;

    if (random() < 0.5) {
      // Top wall exit (two adjacent middle cells)
      ey = 0;
      ex = 7; // centered (cells 7 and 8)
      this.exitSide = "top";
      this.cells[ex][ey].setType("exit");
      this.cells[ex + 1][ey].setType("exit");
    } else {
      // Right wall exit (two adjacent middle cells)
      ex = 15;
      ey = 7; // centered (cells 7 and 8)
      this.exitSide = "right";
      this.cells[ex][ey].setType("exit");
      this.cells[ex][ey + 1].setType("exit");
    }
  }

  change() {
  if (firstRoom) {
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        this.cells[x][y].setType("floor");
      }
    }
    this.loadLayout("first");
    firstRoom = false;
    return;
  }



  const layouts = ["cross", "apartments", "deuce"];
  const valueToRemove = this.layout;

  const newLayouts = layouts.filter(item => item !== valueToRemove);
  const chosen = random(newLayouts);
  this.loadLayout(chosen);
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

  isExit() {
    return this.type === "exit";
  }

  contains(px, py) {
    gridSize = Math.min(windowWidth, windowHeight) / 20;
    return (
      px >= this.x &&
      px < this.x + gridSize &&
      py >= this.y &&
      py < this.y + gridSize
    );
  }

  show() {
    gridSize = Math.min(windowWidth, windowHeight) / 20;
    rectMode(CORNER);

    if (this.type === "wall") {
      fill("black");
      square(this.x, this.y, gridSize);
    } else if (this.type === "exit") {
      fill("green");
      square(this.x, this.y, gridSize);
    }
  }

}
