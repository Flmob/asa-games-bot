class Game2048 {
  field;
  tileSize;
  score = 0;
  direction = ""; //up, down, left, right
  isFieldUpdated = false;
  isNewTileNeeded = false;
  isGameOver = false;
  isWon = false;
  isOnGameWinFired = false;

  animationFrameRequest;

  canvas;
  ctx;

  fieldSize;

  onScoreChange;
  onGameOver;
  onGameWin;

  constructor(canvas, events = {}, params = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    const {
      onScoreChange = () => {},
      onGameOver = () => {},
      onGameWin = () => {},
    } = events;

    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;
    this.onGameWin = onGameWin;

    const { fieldSize = 4 } = params;

    this.fieldSize = fieldSize;
  }

  setDirection(action) {
    this.direction = this.direction || action;
  }

  getEmptyTiles() {
    const emptyTiles = [];

    this.field.forEach((line, y) => {
      line.forEach((tile, x) => {
        if (!tile.value) emptyTiles.push({ x, y });
      });
    });

    return emptyTiles;
  }

  isTileWithSameNear() {
    let result = false;

    for (let y = 0; y < this.fieldSize; y++) {
      for (let x = 0; x < this.fieldSize; x++) {
        const currentTile = this.field[y][x];

        //check up
        if (y > 0) {
          if (this.field[y - 1][x].value === currentTile.value) {
            result = true;
            break;
          }
        }

        //check right
        if (x < this.fieldSize - 1) {
          if (this.field[y][x + 1].value === currentTile.value) {
            result = true;
            break;
          }
        }

        //check down
        if (y < this.fieldSize - 1) {
          if (this.field[y + 1][x].value === currentTile.value) {
            result = true;
            break;
          }
        }

        //check left
        if (x > 0) {
          if (this.field[y][x - 1].value === currentTile.value) {
            result = true;
            break;
          }
        }
      }
    }

    return result;
  }

  addRandomTile(emptyTiles) {
    if (!emptyTiles.length) return;

    const value = Math.random() > 0.1 ? 2 : 4;
    const randomIndex = getRandomInt(0, emptyTiles.length - 1);
    const { x, y } = emptyTiles[randomIndex];
    this.field[y][x].setValue(value);
  }

  moveTiles = () => {
    const { fieldSize } = this;

    let moved = false;

    const updateTiles = (currentTile, targetTile) => {
      if (!targetTile.value) {
        targetTile.setValue(currentTile.value);
        currentTile.setValue(0);

        moved = true;
        this.isNewTileNeeded = true;
        this.isFieldUpdated = true;
      } else if (targetTile.value === currentTile.value) {
        const value = currentTile.value * 2;

        targetTile.setValue(value);
        currentTile.setValue(0);

        this.score += value;
        moved = true;
        this.isNewTileNeeded = true;
        this.isFieldUpdated = true;
      }
    };

    const moveUp = () => {
      for (let x = 0; x < fieldSize; x++) {
        moved = true;

        while (moved) {
          moved = false;

          for (let y = 1; y < fieldSize; y++) {
            const currentTile = this.field[y][x];
            const targetTile = this.field[y - 1][x];

            if (!currentTile.value) continue;

            updateTiles(currentTile, targetTile);
          }
        }
      }
    };
    const moveDown = () => {
      for (let x = 0; x < fieldSize; x++) {
        moved = true;

        while (moved) {
          moved = false;

          for (let y = fieldSize - 2; y >= 0; y--) {
            const currentTile = this.field[y][x];
            const targetTile = this.field[y + 1][x];

            if (!currentTile.value) continue;

            updateTiles(currentTile, targetTile);
          }
        }
      }
    };
    const moveLeft = () => {
      for (let y = 0; y < fieldSize; y++) {
        moved = true;

        while (moved) {
          moved = false;

          for (let x = 1; x < fieldSize; x++) {
            const currentTile = this.field[y][x];
            const targetTile = this.field[y][x - 1];

            if (!currentTile.value) continue;

            updateTiles(currentTile, targetTile);
          }
        }
      }
    };
    const moveRight = () => {
      for (let y = 0; y < fieldSize; y++) {
        moved = true;

        while (moved) {
          moved = false;

          for (let x = fieldSize - 2; x >= 0; x--) {
            const currentTile = this.field[y][x];
            const targetTile = this.field[y][x + 1];

            if (!currentTile.value) continue;

            updateTiles(currentTile, targetTile);
          }
        }
      }
    };

    switch (this.direction) {
      case UP:
        moveUp();
        break;
      case DOWN:
        moveDown();
        break;
      case LEFT:
        moveLeft();
        break;
      case RIGHT:
        moveRight();
        break;
    }
  };

  calc() {
    if (this.direction) {
      this.moveTiles();
      this.direction = "";

      if (this.isNewTileNeeded) {
        this.isNewTileNeeded = false;
        const emptyTiles = this.getEmptyTiles();

        this.addRandomTile(emptyTiles);

        if (emptyTiles.length === 1 && !this.isTileWithSameNear()) {
          this.isGameOver = true;
        }
      }
    }

    this.field.forEach((line) => {
      line.forEach((tile) => {
        tile.updateOutline();

        if (tile.outline.isPlaying) {
          this.isFieldUpdated = true;
        }

        if (!this.isWon && tile.value === 2048) {
          this.isWon = true;
        }
      });
    });
  }

  draw() {
    this.ctx.fillStyle = "rgb(187,173,159)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.field.forEach((line, y) => {
      line.forEach((tile, x) => {
        tile.draw();
      });
    });
  }

  step() {
    this.calc();

    if (this.isFieldUpdated) {
      this.draw();
      this.isFieldUpdated = false;
    } else if (this.isWon && !this.isOnGameWinFired) {
      this.onGameWin(this.score);
      this.isOnGameWinFired = true;
    }

    if (this.isGameOver) {
      this.onGameOver(this.score);
      this.isGameOver = false;
    }

    this.onScoreChange(this.score);
  }

  animate = () => {
    this.step();

    this.animationFrameRequest = requestAnimationFrame(this.animate);
  };

  start() {
    this.isGameOver = false;
    this.isWon = false;
    this.isOnGameWinFired = false;
    this.score = 0;
    this.tileSize = Math.min(
      this.canvas.width / this.fieldSize,
      this.canvas.height / this.fieldSize
    );

    this.field = new Array(this.fieldSize)
      .fill(undefined)
      .map((_, y) =>
        new Array(this.fieldSize)
          .fill(undefined)
          .map((_, x) => new Tile({ x, y, ctx: this.ctx }))
      );

    this.addRandomTile(this.getEmptyTiles());
    this.addRandomTile(this.getEmptyTiles());
    this.draw();

    cancelAnimationFrame(this.animationFrameRequest);
    this.animate();
  }
}
