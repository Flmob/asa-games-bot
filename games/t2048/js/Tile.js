class Tile {
  x = 0;
  y = 0;
  row = 0;
  column = 0;
  isSliding = 0;
  yStep = 1;

  constructor({
    column = 0,
    row = 0,
    value,
    size = 100,
    speed = defaultTileSpeed,
    xTileOffset = 0,
    yTileOffset = 0,
    ctx,
    onLock = () => {},
    board = [],
  }) {
    this.onLock = onLock;

    this.value = value;
    this.size = size;
    this.xTileOffset = xTileOffset;
    this.yTileOffset = yTileOffset;
    this.ctx = ctx;
    this.isLocked = false;
    this.board = board;

    this.yStep = this.size / 100;

    this.setValue(value);
    this.setSpeed(speed);
    this.setColumn(column);
    this.setRow(row);
  }

  setSize(
    size = 100,
    xTileOffset = this.xTileOffset,
    yTileOffset = this.yTileOffset
  ) {
    this.size = size;
    this.yStep = this.size / 100;
    this.xTileOffset = xTileOffset;
    this.yTileOffset = yTileOffset;
    this.setRow(this.row);
    this.setColumn(this.column);
  }

  setValue(value = 0) {
    this.value = value;
    this.outline = { ...defaultOutline };

    if (!value) this.outline.isPlaying = false;
  }

  setSpeed(speed = defaultTileSpeed) {
    this.speed = speed;
  }

  setRow(row) {
    if (row || row === 0) {
      this.y = row * this.size;
      this.row = row;
    } else {
      this.row = Math.floor(this.y / this.size);
    }
  }

  setColumn(column) {
    if (column || column === 0) {
      this.x = column * this.size;
      this.column = column;
    } else {
      this.column = Math.floor(this.x / this.size);
    }
  }

  unDraw(x = this.column * this.size, y = this.y) {
    this.ctx.clearRect(
      x - this.outline.width + this.xTileOffset,
      y - this.outline.width + this.yTileOffset,
      this.size + this.outline.width * 2,
      this.size + this.outline.width * 2
    );
  }

  draw(x = this.column * this.size, y = this.y) {
    this.ctx.strokeStyle = tileColors[this.value] || defaultTileColor;
    this.ctx.fillStyle = tileColors[this.value] || defaultTileColor;

    roundRect(
      this.ctx,
      x + tilePadding - this.outline.width + this.xTileOffset,
      y + tilePadding - this.outline.width + this.yTileOffset,
      this.size - tilePadding * 2 + this.outline.width * 2,
      this.size - tilePadding * 2 + this.outline.width * 2,
      true
    );

    if (this.value) {
      const textX = x + this.size / 2 + this.xTileOffset;
      const textY = y + this.size / 2 + this.yTileOffset;
      this.ctx.font = `${this.size / 6}pt Arial`;
      this.ctx.textBaseline = "middle";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = textColor;
      let { actualBoundingBoxAscent, actualBoundingBoxDescent } =
        this.ctx.measureText(this.value);
      this.ctx.fillText(
        this.value,
        textX,
        textY + (actualBoundingBoxAscent - actualBoundingBoxDescent) / 2
      );
    }
  }

  updateOutline() {
    if (!this.outline.isPlaying) return;

    if (this.outline.isUp) {
      this.outline.width += outlineStep;

      if (this.outline.width >= maxOutline) {
        this.outline.width = maxOutline;
        this.outline.isUp = false;
      }
    } else {
      this.outline.width -= outlineStep;

      if (this.outline.width <= 0) {
        this.outline.width = 0;
        this.outline.isUp = true;

        this.outline.isPlaying = false;
      }
    }
  }

  turnOutlineOn() {
    return new Promise((resolve) => {
      this.outline.isPlaying = true;

      const step = () => {
        this.unDraw();
        this.updateOutline();
        this.draw();

        if (this.outline.isPlaying) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };

      step();
    });
  }

  getDirectionOfNearWithSameValue() {
    if (this.column > 0) {
      const slot = this.board[this.column - 1][this.row];
      if (slot && slot.value === this.value) return directions.LEFT;
    }

    if (this.row > 0) {
      const slot = this.board[this.column][this.row - 1];
      if (slot && slot.value === this.value) return directions.UP;
    }

    if (this.column < this.board.length - 1) {
      const slot = this.board[this.column + 1][this.row];
      if (slot && slot.value === this.value) return directions.RIGHT;
    }

    if (this.row < this.board[0].length - 1) {
      const slot = this.board[this.column][this.row + 1];
      if (slot && slot.value === this.value) return directions.DOWN;
    }

    return "";
  }

  moveLeft() {
    if (this.isSliding) return;

    if (this.column > 0 && !this.board[this.column - 1][this.row + 1]) {
      this.unDraw();
      this.setColumn(this.column - 1);
      this.draw();
    }
  }

  moveRight() {
    if (this.isSliding) return;

    if (
      this.column < columnsCount - 1 &&
      !this.board[this.column + 1][this.row + 1]
    ) {
      this.unDraw();
      this.setColumn(this.column + 1);
      this.draw();
    }
  }

  moveDown() {
    if (this.isSliding) return;

    const step = this.yStep * this.speed;

    if (this.row < rowsCount - 1 && !this.board[this.column][this.row + 1]) {
      this.unDraw();
      this.y += step;
      this.setRow();
      this.draw();
    } else {
      this.isLocked = true;
      this.unDraw();
      this.turnOutlineOn();
      this.y = this.row * this.size;
      this.onLock();
    }
  }

  slideLeft() {
    if (this.column === 0) return Promise.reject("Can't move left");

    this.isSliding = true;

    return new Promise((resolve, reject) => {
      let x = this.column * this.size;
      const targetX = (this.column - 1) * this.size;

      const step = () => {
        this.unDraw(x);
        x -= tileSlideSpeed;
        this.draw(x);

        if (x > targetX) {
          requestAnimationFrame(step);
        } else {
          this.setColumn(this.column - 1);
          this.isSliding = false;
          resolve();
        }
      };

      step();
    });
  }

  slideRight() {
    if (this.column >= this.board.length - 1)
      return Promise.reject("Can't move right");

    this.isSliding = true;

    return new Promise((resolve, reject) => {
      let x = this.column * this.size;
      const targetX = (this.column + 1) * this.size;

      const step = () => {
        this.unDraw(x);
        x += tileSlideSpeed;
        this.draw(x);

        if (x < targetX) {
          requestAnimationFrame(step);
        } else {
          this.setColumn(this.column + 1);
          this.isSliding = false;
          resolve();
        }
      };

      step();
    });
  }

  slideDown() {
    if (this.row >= this.board[0].length - 1)
      return Promise.reject("Can't move down");

    this.isSliding = true;

    return new Promise((resolve, reject) => {
      const targetY = (this.row + 1) * this.size;

      const step = () => {
        this.unDraw();
        this.y += tileSlideSpeed;
        this.draw();

        if (this.y < targetY) {
          requestAnimationFrame(step);
        } else {
          this.row++;
          this.isSliding = false;
          resolve();
        }
      };

      step();
    });
  }

  slideUp() {
    if (this.row === 0) return Promise.reject("Can't move down");

    this.isSliding = true;

    return new Promise((resolve, reject) => {
      const targetY = (this.row - 1) * this.size;

      const step = () => {
        this.unDraw();
        y -= tileSlideSpeed;
        this.draw();

        if (this.y < targetY) {
          requestAnimationFrame(step);
        } else {
          this.row--;
          this.isSliding = false;
          resolve();
        }
      };

      step();
    });
  }
}
