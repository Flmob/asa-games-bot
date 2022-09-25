class Piece {
  constructor(options = {}) {
    const {
      tetromino,
      color,
      ctx,
      board,
      squareSize,
      marginX,
      marginY,
      onLock = () => {},
      onGameOver = () => {},
      x = 0,
      y = 0,
    } = options;

    this.onLock = onLock;
    this.onGameOver = onGameOver;

    this.squareSize = squareSize;
    this.marginX = marginX;
    this.marginY = marginY;
    this.ctx = ctx;
    this.board = board;
    this.tetromino = tetromino;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.color = color;
    this.x = x;
    this.y = y;
    this.length = this.activeTetromino.length;
  }

  setNewOptions(options = {}) {
    const { squareSize, marginX, marginY, x, y } = options;

    if (squareSize) this.squareSize = squareSize;
    if (typeof marginX === "number") this.marginX = marginX;
    if (typeof marginY === "number") this.marginY = marginY;
    if (typeof x === "number") this.x = x;
    if (typeof y === "number") this.y = y;
  }

  collision(x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece.length; c++) {
        if (!piece[r][c]) {
          continue;
        }

        const newX = this.x + c + x;
        const newY = this.y + r + y;

        if (newX < 0 || newX >= columnsCount || newY >= rowsCount) {
          return true;
        }

        if (newY < 0) {
          continue;
        }

        if (this.board[newY][newX] !== vacantColor) {
          return true;
        }
      }
    }

    return false;
  }

  fill(color) {
    for (let r = 0; r < this.length; r++) {
      for (let c = 0; c < this.length; c++) {
        if (this.activeTetromino[r][c]) {
          drawSquare({
            ctx: this.ctx,
            x: c + this.x,
            y: r + this.y,
            color,
            squareSize: this.squareSize,
            marginX: this.marginX,
            marginY: this.marginY,
          });
        }
      }
    }
  }

  draw() {
    this.fill(this.color);
  }

  unDraw() {
    this.fill(vacantColor);
  }

  moveDown() {
    if (!this.collision(0, 1, this.activeTetromino)) {
      this.unDraw();
      this.y++;
      this.draw();
    } else {
      this.lock();
    }
  }

  moveLeft() {
    if (!this.collision(-1, 0, this.activeTetromino)) {
      this.unDraw();
      this.x--;
      this.draw();
      return true;
    }
    return false;
  }

  moveRight() {
    if (!this.collision(1, 0, this.activeTetromino)) {
      this.unDraw();
      this.x++;
      this.draw();
      return true;
    }
    return false;
  }

  rotate() {
    const nextPattern =
      this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
      if (this.x > columnsCount / 2) {
        kick = -1;
      } else {
        kick = 1;
      }
    }

    if (!this.collision(kick, 0, nextPattern)) {
      this.unDraw();
      this.x += kick;
      this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
      this.activeTetromino = this.tetromino[this.tetrominoN];
      this.draw();
    }
  }

  lock() {
    for (let r = 0; r < this.activeTetromino.length; r++) {
      for (let c = 0; c < this.activeTetromino.length; c++) {
        if (!this.activeTetromino[r][c]) {
          continue;
        }
        if (this.y + r < 0) {
          this.onGameOver();
          break;
        }
        this.board[this.y + r][this.x + c] = this.color;
      }
    }
    this.onLock();
  }
}
