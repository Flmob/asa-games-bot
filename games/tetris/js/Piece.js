class Piece {
  constructor(options = {}) {
    const {
      tetromino,
      color,
      ctx,
      board,
      onLock = () => {},
      onGameOver = () => {},
    } = options;

    this.onLock = onLock;
    this.onGameOver = onGameOver;

    this.ctx = ctx;
    this.board = board;
    this.tetromino = tetromino;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.color = color;
    this.x = 3;
    this.y = -2;
    this.length = this.activeTetromino.length;
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
          drawSquare(this.ctx, c + this.x, r + this.y, color);
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
    }
  }

  moveRight() {
    if (!this.collision(1, 0, this.activeTetromino)) {
      this.unDraw();
      this.x++;
      this.draw();
    }
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
