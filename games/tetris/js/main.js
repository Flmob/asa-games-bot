const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const scoreSpan = document.querySelector(".score");
const restartBtn = document.querySelector(".restart");

const SQ = 20; // square size
const ROWS = 20;
const COLUMNS = 10;
const VACANT = "white";
let gameOver = false;
let score = 0;
let dropStart = Date.now();
let animationFrameRequest;

const pieces = [
  [Z, "red"],
  [S, "green"],
  [T, "yellow"],
  [O, "blue"],
  [L, "purple"],
  [I, "cyan"],
  [J, "orange"],
];

let board = [];

initBoard = () => {
  board = new Array(ROWS).fill([]).map((_) => new Array(COLUMNS).fill(VACANT));
};

const drawSquare = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
};

const drawBoard = () => {
  board.forEach((row, y) => row.forEach((color, x) => drawSquare(x, y, color)));
};

const removeFullRow = () => {
  for (let r = 0; r < ROWS; r++) {
    let isRowFull = true;

    for (let c = 0; c < COLUMNS; c++) {
      if (board[r][c] === VACANT) {
        isRowFull = false;
        break;
      }
    }

    if (isRowFull) {
      board.splice(r, 1);
      board.unshift(new Array(COLUMNS).fill(VACANT));
      score += 10;
      scoreSpan.innerHTML = score;
    }
  }

  drawBoard();
};

function control(e) {
  if (e.key === actions.ArrowLeft) {
    piece.moveLeft();
    dropStart = Date.now();
  } else if (e.key === actions.ArrowRight) {
    piece.moveRight();
    dropStart = Date.now();
  } else if (e.key === actions.ArrowDown) {
    piece.moveDown();
  } else if (e.key === actions.ArrowUp) {
    piece.rotate();
    dropStart = Date.now();
  }
}

document.addEventListener("keydown", control);

drawBoard();

const drop = () => {
  const now = Date.now();
  const delta = now - dropStart;

  if (delta > 300) {
    piece.moveDown();
    dropStart = now;
  }

  if (!gameOver) {
    animationFrameRequest = requestAnimationFrame(drop);
  }
};

const getRandomPiece = () => {
  const newPiece = pieces[getRandomInt(0, pieces.length)];
  return new Piece(newPiece[0], newPiece[1], {
    onLock: () => {
      if (gameOver) return;
      cancelAnimationFrame(animationFrameRequest);
      removeFullRow();
      piece = getRandomPiece();
      piece.draw();
      drop();
    },
    onGameOver: () => {
      gameOver = true;
    },
  });
};

const start = () => {
  gameOver = false;

  score = 0;
  scoreSpan.innerHTML = score;

  initBoard();
  drawBoard();

  piece = getRandomPiece();
  piece.draw();

  drop();
};

restartBtn.addEventListener("click", () => {
  const response = confirm("Do you really want to restart?");
  if (response) start();
});

start();
