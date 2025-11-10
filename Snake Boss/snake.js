
import { AppleTimer } from './appleTimer.js';

// === p5.js Snake Pathfinding AI ===
// Grid-based snake with BFS to apple, safety check (head->tail), and 5s apple auto-reposition.

// -------------------- TUNABLE SETTINGS --------------------
const COLS = 20;      // grid width  (number of cells)
const ROWS = 20;      // grid height (number of cells)
const CELL = 24;      // pixel size of each cell
const STEP_DELAY = 6; // frames per movement step

// Colors / basic style
const BG_COLOR = 30;
const GRID_COLOR = 60;
const SNAKE_HEAD_COLOR = [0, 200, 255];
const SNAKE_BODY_COLOR = [0, 150, 200];
const APPLE_COLOR = [255, 80, 80];

// -------------------- GAME STATE --------------------
let snake;       // array of {x,y}, [0] is head
let apple;       // {x,y}
let pendingGrow; // grow counter after eating
let gameOver;    // bool
let lastStepFrame; // movement pacing

// 5-second apple timer (separate module)
const appleTimer = new AppleTimer(5000);

// -------------------- P5 LIFECYCLE --------------------
function setup() {
  createCanvas(COLS * CELL, ROWS * CELL);
  resetGame();
}

function resetGame() {
  snake = [
    { x: floor(COLS / 2), y: floor(ROWS / 2) },
    { x: floor(COLS / 2) - 1, y: floor(ROWS / 2) },
    { x: floor(COLS / 2) - 2, y: floor(ROWS / 2) }
  ];
  pendingGrow = 0;
  gameOver = false;
  placeApple();              // also resets timer
  lastStepFrame = 0;
}

function draw() {
  background(BG_COLOR);
  drawGrid();
  drawApple();
  drawSnake();

  // Auto-move apple if not eaten within 5 seconds
  appleTimer.tick(() => placeApple(), !gameOver);

  if (!gameOver && frameCount - lastStepFrame >= STEP_DELAY) {
    aiStep();
    lastStepFrame = frameCount;
  }

  if (gameOver) {
    drawGameOver();
  }
}

// -------------------- DRAW HELPERS --------------------
function drawGrid() {
  stroke(GRID_COLOR);
  strokeWeight(1);
  for (let x = 0; x <= COLS; x++) line(x * CELL, 0, x * CELL, ROWS * CELL);
  for (let y = 0; y <= ROWS; y++) line(0, y * CELL, COLS * CELL, y * CELL);
}

function drawSnake() {
  noStroke();
  fill(SNAKE_HEAD_COLOR);
  rect(snake[0].x * CELL, snake[0].y * CELL, CELL, CELL, 4);
  fill(SNAKE_BODY_COLOR);
  for (let i = 1; i < snake.length; i++) {
    rect(snake[i].x * CELL, snake[i].y * CELL, CELL, CELL, 4);
  }
}

function drawApple() {
  noStroke();
  fill(APPLE_COLOR);
  rect(apple.x * CELL, apple.y * CELL, CELL, CELL, 6);
}

function drawGameOver() {
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("GAME OVER\npress R to restart", width / 2, height / 2);
  pop();
}

// -------------------- CORE GAME LOGIC --------------------
// 1) Try shortest path to apple
// 2) Simulate following it; ensure virtual head can still reach tail
// 3) Else, chase tail; else, safe random neighbor
function aiStep() {
  if (snake.length === COLS * ROWS) return; // filled board

  const head = snake[0];
  const tail = snake[snake.length - 1];

  const pathToApple = bfsPath(head, apple, snake, true);
  let chosenPath = null;

  if (pathToApple && pathToApple.length > 1) {
    const { virtualSnake, ateApple } = simulateFollowPath(snake, pathToApple);
    if (ateApple) {
      const vHead = virtualSnake[0];
      const vTail = virtualSnake[virtualSnake.length - 1];
      const pathHeadToTail = bfsPath(vHead, vTail, virtualSnake, true);
      if (pathHeadToTail && pathHeadToTail.length > 1) chosenPath = pathToApple;
    } else {
      chosenPath = pathToApple; // trivial safe
    }
  }

  if (!chosenPath || chosenPath.length < 2) {
    const pathToTail = bfsPath(head, tail, snake, true);
    if (pathToTail && pathToTail.length > 1) chosenPath = pathToTail;
  }

  if (!chosenPath || chosenPath.length < 2) {
    const fallbackStep = safeNeighborStep(head, snake);
    if (!fallbackStep) { gameOver = true; return; }
    moveSnakeTo(fallbackStep);
    return;
  }

  moveSnakeTo(chosenPath[1]);
}

function moveSnakeTo(nextPos) {
  if (
    nextPos.x < 0 || nextPos.x >= COLS ||
    nextPos.y < 0 || nextPos.y >= ROWS ||
    collidesWithBody(nextPos, snake.slice(0, snake.length - 1))
  ) {
    gameOver = true;
    return;
  }

  snake.unshift({ x: nextPos.x, y: nextPos.y });

  if (nextPos.x === apple.x && nextPos.y === apple.y) {
    pendingGrow += 1;
    placeApple();            // also resets the apple timer
  }

  if (pendingGrow > 0) {
    pendingGrow -= 1;
  } else {
    snake.pop();
  }
}

function safeNeighborStep(head, snakeBody) {
  const nbrs = neighbors(head);
  for (let n of nbrs) {
    if (
      n.x >= 0 && n.x < COLS &&
      n.y >= 0 && n.y < ROWS &&
      !collidesWithBody(n, snakeBody.slice(0, snakeBody.length - 1))
    ) return n;
  }
  return null;
}

// -------------------- BFS PATHFINDING --------------------
function bfsPath(start, goal, snakeBody, allowTail) {
  const blocked = new Set();
  for (let i = 0; i < snakeBody.length; i++) {
    const seg = snakeBody[i];
    if (!(seg.x === start.x && seg.y === start.y)) {
      if (allowTail && i === snakeBody.length - 1) {
        // tail allowed to be stepped on
      } else {
        blocked.add(cellKey(seg.x, seg.y));
      }
    }
  }

  const q = [];
  const visited = new Set();
  const parent = {};

  q.push(start);
  visited.add(cellKey(start.x, start.y));

  let found = false;
  while (q.length > 0) {
    const cur = q.shift();
    if (cur.x === goal.x && cur.y === goal.y) { found = true; break; }
    for (let nb of neighbors(cur)) {
      const k = cellKey(nb.x, nb.y);
      if (
        nb.x >= 0 && nb.x < COLS &&
        nb.y >= 0 && nb.y < ROWS &&
        !blocked.has(k) &&
        !visited.has(k)
      ) {
        visited.add(k);
        parent[k] = cur;
        q.push(nb);
      }
    }
  }
  if (!found) return null;

  const path = [];
  let cur = goal;
  path.unshift(cur);
  while (!(cur.x === start.x && cur.y === start.y)) {
    const p = parent[cellKey(cur.x, cur.y)];
    if (!p) return null;
    path.unshift(p);
    cur = p;
  }
  return path;
}

function simulateFollowPath(realSnake, path) {
  const vsnake = realSnake.map(seg => ({ x: seg.x, y: seg.y }));
  let vGrow = 0;
  let ateApple = false;

  for (let i = 1; i < path.length; i++) {
    const nextCell = path[i];
    vsnake.unshift({ x: nextCell.x, y: nextCell.y });
    if (i === path.length - 1) { ateApple = true; vGrow += 1; }
    if (vGrow > 0) vGrow -= 1;
    else vsnake.pop();
  }
  return { virtualSnake: vsnake, ateApple };
}

// -------------------- UTILITIES --------------------
function placeApple() {
  const occupied = new Set(snake.map(s => cellKey(s.x, s.y)));
  const freeCells = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const k = cellKey(x, y);
      if (!occupied.has(k)) freeCells.push({ x, y });
    }
  }
  if (freeCells.length === 0) { gameOver = true; return; }
  apple = random(freeCells);

  // Reset the 5-second timer whenever we place an apple
  appleTimer.reset();
}

function collidesWithBody(pos, bodyArr) {
  for (let seg of bodyArr) if (seg.x === pos.x && seg.y === pos.y) return true;
  return false;
}

function cellKey(x, y) { return x + "," + y; }

function neighbors(cell) {
  return [
    { x: cell.x + 1, y: cell.y },
    { x: cell.x - 1, y: cell.y },
    { x: cell.x, y: cell.y + 1 },
    { x: cell.x, y: cell.y - 1 }
  ];
}

// -------------------- INPUT --------------------
function keyPressed() {
  if (gameOver && (key === 'r' || key === 'R')) resetGame();
}

// expose p5 functions
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
