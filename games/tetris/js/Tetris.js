class Tetris {
  board = [];
  isPaused = false;
  isGameOver = false;
  currentPiece;
  nextPiece;
  score = 0;
  action = "";
  squareSize = 20;
  boardMargin = 0;
  nextBigPieceBoardMargin = 0;
  nextSmallPieceBoardMargin = 0;

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

  setScale = () => {
    this.squareSize = this.canvas.height / rowsCount;
    const boardWidth = this.squareSize * columnsCount;
    this.boardMargin = (this.canvas.width - boardWidth) / 2;

    const bigPieceBoardWidth = this.squareSize * 4; // 4 - max tetromino length
    const smallPieceBoardWidth = this.squareSize * 3; // 3 - min tetromino length

    this.nextBigPieceBoardMargin =
      this.boardMargin +
      boardWidth +
      (this.boardMargin - bigPieceBoardWidth) / 2;
    this.nextSmallPieceBoardMargin =
      this.boardMargin +
      boardWidth +
      (this.boardMargin - smallPieceBoardWidth) / 2;

    this.currentPiece.setNewOptions({
      squareSize: this.squareSize,
      marginX: this.boardMargin,
      marginY: 0,
    });

    this.nextPiece.setNewOptions({
      squareSize: this.squareSize,
      marginX:
        this.nextPiece.length === 4
          ? this.nextBigPieceBoardMargin
          : this.nextSmallPieceBoardMargin,
      marginY:
        this.nextPiece.length === 4 ? this.squareSize : this.squareSize * 2.5,
    });

    this.drawBoard();
    this.currentPiece.draw();
    this.drawNextPiece();
  };

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
      row.forEach((color, x) =>
        drawSquare({
          ctx: this.ctx,
          x,
          y,
          color,
          squareSize: this.squareSize,
          marginX: this.boardMargin,
        })
      )
    );
  }

  drawNextPiece() {
    const nextPieceBoardSize = this.squareSize * 4;

    this.ctx.fillStyle = vacantColor;
    this.ctx.fillRect(
      this.nextBigPieceBoardMargin,
      this.squareSize,
      nextPieceBoardSize,
      nextPieceBoardSize
    );
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(
      this.nextBigPieceBoardMargin,
      this.squareSize,
      nextPieceBoardSize,
      nextPieceBoardSize
    );

    this.nextPiece.draw();
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

  getRandomPiece(isNextPiece) {
    const newPiece = pieces[getRandomInt(0, pieces.length)];

    const marginX = isNextPiece
      ? newPiece[0][0].length === 4
        ? this.nextBigPieceBoardMargin
        : this.nextSmallPieceBoardMargin
      : this.boardMargin;

    const marginY = isNextPiece
      ? newPiece[0][0].length === 4
        ? this.squareSize
        : this.squareSize * 2.5
      : 0;

    return new Piece({
      tetromino: newPiece[0],
      color: newPiece[1],
      ctx: this.ctx,
      board: this.board,
      squareSize: this.squareSize,
      marginX,
      marginY,
      x: isNextPiece ? 0 : 3,
      y: isNextPiece ? 0 : -2,
      onLock: () => {
        if (this.isGameOver) return;
        cancelAnimationFrame(this.animationFrameRequest);
        this.removeFullRow();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece(true);
        this.currentPiece.setNewOptions({
          marginX: this.boardMargin,
          marginY: 0,
          x: 3,
          y: -2,
        });
        this.currentPiece.draw();
        this.drawNextPiece();
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

    this.nextPiece = this.getRandomPiece(true);
    this.drawNextPiece();
    this.currentPiece = this.getRandomPiece();
    this.currentPiece.draw();

    this.score = 0;
    this.onScoreChange(this.score);

    this.animate();
  }
}
