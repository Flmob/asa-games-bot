class Tetris {
  board = [];
  isPaused = false;
  isGameOver = false;
  currentPiece;
  nextPiece;
  score = 0;
  combo = 0;
  level = 0;
  action = "";
  squareSize = 20;
  boardMargin = 0;
  nextBigPieceBoardMargin = 0;
  nextSmallPieceBoardMargin = 0;
  clearedRows = 0;
  speed = defaultSpeed;

  animationFrameRequest;
  previousTimestamp = 0;

  canvas;
  ctx;
  canvasRect;

  onScoreChange;
  onGameOver;

  constructor(canvas, events = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    const {
      onScoreChange = () => {},
      onIsPausedChange = () => {},
      onGameOver = () => {},
    } = events;

    this.onScoreChange = onScoreChange;
    this.onIsPausedChange = onIsPausedChange;
    this.onGameOver = onGameOver;
  }

  setupCanvas() {
    this.ctx.resetTransform();
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1;
    // Get and save the size of the canvas in CSS pixels.
    this.canvasRect = this.canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    this.canvas.width = Math.floor(this.canvasRect.width * dpr);
    this.canvas.height = Math.floor(this.canvasRect.height * dpr);
    const ctx = this.canvas.getContext("2d");
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    // scale everything down using CSS
    this.canvas.style.width = this.canvasRect.width + "px";
    this.canvas.style.height = this.canvasRect.height + "px";
    this.ctx = ctx;
  }

  setScale = (isWithRedraw = false) => {
    this.setupCanvas();

    this.squareSize = this.canvasRect.height / rowsCount;
    const boardWidth = this.squareSize * columnsCount;
    this.boardMargin = (this.canvasRect.width - boardWidth) / 2;

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
        this.nextPiece.length === 4
          ? this.squareSize * 2
          : this.squareSize * 3.5,
    });

    if (isWithRedraw) {
      this.clearCanvas();
      this.drawBoard();
      this.currentPiece.draw();
      this.drawNextPiece(true);

      this.writeScore(true);
      this.writeCombo(true);
      this.writeLevel(true);
    }
  };

  setIsPaused(isPaused) {
    this.isPaused = isPaused;
    this.onIsPausedChange(this.isPaused);
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
        this.currentPiece.moveLeft() && (this.previousTimestamp = 0);
        break;
      }
      case RIGHT: {
        this.currentPiece.moveRight() && (this.previousTimestamp = 0);
        break;
      }
      case ACTION: {
        if (this.isGameOver) {
          this.start();
          break;
        }
        this.setIsPaused(!this.isPaused);
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

  clearCanvas() {
    this.ctx.fillStyle = vacantColor;
    this.ctx.fillRect(0, 0, this.canvasRect.width, this.canvasRect.height);
  }

  drawNextPiece(withLabel = false) {
    const nextPieceBoardY = this.squareSize * 2;
    const nextPieceBoardSize = this.squareSize * 4;

    if (withLabel) {
      this.ctx.textBaseline = "top";
      this.ctx.font = `${this.squareSize}px serif`;

      this.ctx.fillStyle = "black";
      this.ctx.fillText(
        "NEXT",
        this.nextBigPieceBoardMargin,
        this.squareSize,
        this.boardMargin - this.squareSize
      );
    }

    this.ctx.fillStyle = vacantColor;
    this.ctx.fillRect(
      this.nextBigPieceBoardMargin,
      nextPieceBoardY,
      nextPieceBoardSize,
      nextPieceBoardSize
    );
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(
      this.nextBigPieceBoardMargin,
      nextPieceBoardY,
      nextPieceBoardSize,
      nextPieceBoardSize
    );

    this.nextPiece.draw();
  }

  writeInfo({ label, value, line, updateLabel }) {
    this.ctx.textBaseline = "top";
    this.ctx.font = `${this.squareSize}px serif`;

    if (updateLabel) {
      this.ctx.fillStyle = vacantColor;
      this.ctx.fillRect(
        this.squareSize,
        this.squareSize * line,
        this.boardMargin - this.squareSize - 2,
        this.squareSize
      );
      this.ctx.fillStyle = "black";
      this.ctx.fillText(
        label,
        this.squareSize,
        this.squareSize * line,
        this.boardMargin - this.squareSize
      );
    }
    this.ctx.fillStyle = vacantColor;
    this.ctx.fillRect(
      this.squareSize,
      this.squareSize * (line + 1),
      this.boardMargin - this.squareSize - 2,
      this.squareSize
    );
    this.ctx.fillStyle = "black";
    this.ctx.fillText(
      value,
      this.squareSize,
      this.squareSize * (line + 1),
      this.boardMargin - this.squareSize
    );
  }

  writeScore(updateLabel = false) {
    this.writeInfo({ label: "SCORE", value: this.score, line: 1, updateLabel });
  }

  writeCombo(updateLabel = false) {
    this.writeInfo({ label: "COMBO", value: this.combo, line: 3, updateLabel });
  }

  writeLevel(updateLabel = false) {
    this.writeInfo({ label: "LEVEL", value: this.level, line: 5, updateLabel });
  }

  removeFullRow() {
    let clearedRows = 0;

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

        clearedRows++;
      }
    }

    if (clearedRows) {
      this.score += 10 * clearedRows;
      this.clearedRows += clearedRows;
      this.combo += clearedRows;
      this.level = Math.floor(this.clearedRows / 10);

      const speedIncrease = this.level * 10;
      this.speed = defaultSpeed - speedIncrease;
      if (this.speed < minSpeed) this.speed = minSpeed;

      this.writeScore();
      this.writeCombo();
      this.writeLevel();
      this.drawBoard();
    } else {
      if (this.combo > 2) {
        this.score += 50 * this.combo;
      }

      this.combo = 0;

      this.writeScore();
      this.writeCombo();
    }
  }

  getRandomPiece(isNextPiece = false) {
    const newPiece = pieces[getRandomInt(0, pieces.length - 1)];

    const marginX = isNextPiece
      ? newPiece[0][0].length === 4
        ? this.nextBigPieceBoardMargin
        : this.nextSmallPieceBoardMargin
      : this.boardMargin;

    const marginY = isNextPiece
      ? newPiece[0][0].length === 4
        ? this.squareSize * 2
        : this.squareSize * 3.5
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

    if (progress > this.speed && !this.isPaused && !this.isGameOver) {
      this.currentPiece.moveDown();
      this.previousTimestamp = 0;
    }

    this.animationFrameRequest = requestAnimationFrame(this.animate);
  };

  start() {
    this.isGameOver = false;

    this.score = 0;
    this.combo = 0;
    this.level = 0;
    this.clearedRows = 0;
    this.speed = defaultSpeed;

    this.setIsPaused(false);
    this.initBoard();
    this.nextPiece = this.getRandomPiece(true);
    this.currentPiece = this.getRandomPiece();

    this.setScale();

    this.drawBoard();
    this.drawNextPiece();
    this.currentPiece.draw();

    this.writeScore();
    this.writeCombo();
    this.writeLevel();

    this.animate();
  }
}
