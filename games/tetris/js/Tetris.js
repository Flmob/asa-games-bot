class Tetris {
  board = [];
  isPaused = false;
  isGameOver = false;
  currentPiece;
  score = 0;
  action = "";

  animationFrameRequest;
  previousTimestamp = 0;

  canvas;
  ctx;

  onScoreChange;
  onGameOver;

  constructor(canvas, events = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    const { onScoreChange = () => {}, onGameOver = () => {} } = events;

    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;
  }

  setAction(action = "") {
    if (this.isPaused && action !== ACTION) return;

    switch (action) {
      case UP: {
        this.currentPiece.rotate();
        this.previousTimestamp = 0;
        break;
      }
      case DOWN: {
        this.currentPiece.moveDown();
        break;
      }
      case LEFT: {
        this.currentPiece.moveLeft();
        this.previousTimestamp = 0;
        break;
      }
      case RIGHT: {
        this.currentPiece.moveRight();
        this.previousTimestamp = 0;
        break;
      }
      case ACTION: {
        if (this.isGameOver) {
          this.start();
          break;
        }
        this.isPaused = !this.isPaused;
      }
    }
  }

  initBoard() {
    this.board = new Array(rowsCount)
      .fill([])
      .map((_) => new Array(columnsCount).fill(vacantColor));
  }

  drawBoard() {
    this.board.forEach((row, y) =>
      row.forEach((color, x) => drawSquare(this.ctx, x, y, color))
    );
  }

  removeFullRow() {
    for (let r = 0; r < rowsCount; r++) {
      let isRowFull = true;

      for (let c = 0; c < columnsCount; c++) {
        if (this.board[r][c] === vacantColor) {
          isRowFull = false;
          break;
        }
      }

      if (isRowFull) {
        this.board.splice(r, 1);
        this.board.unshift(new Array(columnsCount).fill(vacantColor));

        this.score += 10;
        this.onScoreChange(this.score);
      }
    }

    this.drawBoard();
  }

  getRandomPiece() {
    const newPiece = pieces[getRandomInt(0, pieces.length)];
    return new Piece({
      tetromino: newPiece[0],
      color: newPiece[1],
      ctx: this.ctx,
      board: this.board,
      onLock: () => {
        if (this.isGameOver) return;
        cancelAnimationFrame(this.animationFrameRequest);
        this.removeFullRow();
        this.currentPiece = this.getRandomPiece();
        this.currentPiece.draw();
        this.animate();
      },
      onGameOver: () => {
        this.isGameOver = true;
        this.onGameOver(this.score);
      },
    });
  }

  animate = (timestamp = 0) => {
    if (!this.previousTimestamp) this.previousTimestamp = timestamp;

    const progress = timestamp - this.previousTimestamp;

    if (progress > 300 && !this.isPaused && !this.isGameOver) {
      this.currentPiece.moveDown();
      this.previousTimestamp = 0;
    }

    this.animationFrameRequest = requestAnimationFrame(this.animate);
  };

  start() {
    this.isGameOver = false;
    this.isPaused = false;

    this.initBoard();
    this.drawBoard();

    this.currentPiece = this.getRandomPiece();
    this.currentPiece.draw();

    this.score = 0;
    this.onScoreChange(this.score);

    this.animate();
  }
}
