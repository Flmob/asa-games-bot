// TODO:
//  - create tile class
//  - optimize getEmptyTiles usage
//  - fix tiles positioning on some screens

class Game2048 {
  field;
  tileSize;
  outlineStep;
  score = 0;
  direction = ""; //up, down, left, right
  isFieldUpdated = false;
  isNewTileNeeded = false;
  isGameOver = false;
  isWon = false;
  isOnGameWinFired = false;

  canvas;
  ctx;

  fieldSize;

  onScoreChange;
  onGameEnd;
  onGameWin;

  constructor(canvas, events = {}, params = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    const {
      onScoreChange = () => {},
      onGameEnd = () => {},
      onGameWin = () => {},
    } = events;

    this.onScoreChange = onScoreChange;
    this.onGameEnd = onGameEnd;
    this.onGameWin = onGameWin;

    const { fieldSize = 4, outlineStep = 0.4 } = params;

    this.fieldSize = fieldSize;
    this.outlineStep = outlineStep;

    this.tileSize = Math.min(
      this.canvas.clientHeight / fieldSize,
      this.canvas.clientWidth / fieldSize
    );
  }

  setDirection(action) {
    this.direction = this.direction || action;
  }

  getEmptyTiles() {
    const emptyTiles = [];

    this.field.forEach((line, y) => {
      line.forEach((tile, x) => {
        if (!tile) emptyTiles.push({ x, y });
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
          if (this.field[y - 1][x]?.value === currentTile?.value) {
            result = true;
            break;
          }
        }

        //check right
        if (x < this.fieldSize - 1) {
          if (this.field[y][x + 1]?.value === currentTile?.value) {
            result = true;
            break;
          }
        }

        //check down
        if (y < this.fieldSize - 1) {
          if (this.field[y + 1][x]?.value === currentTile?.value) {
            result = true;
            break;
          }
        }

        //check left
        if (x > 0) {
          if (this.field[y][x - 1]?.value === currentTile?.value) {
            result = true;
            break;
          }
        }
      }
    }

    return result;
  }

  addRandomTile() {
    const value = Math.random() > 0.1 ? 2 : 4;

    const emptyTiles = this.getEmptyTiles();
    const randomIndex = getRandomInt(0, emptyTiles.length - 1);

    const { x, y } = emptyTiles[randomIndex];

    this.field[y][x] = { value, x, y, outline: { ...defaultOutline } };
  }

  drawTile(tile = 0, x, y, outline = 0) {
    this.ctx.strokeStyle = tileColors[tile] || "rgb(238,204,97)";
    this.ctx.fillStyle = tileColors[tile] || "rgb(238,204,97)";

    roundRect(
      this.ctx,
      x + 4 - outline,
      y + 4 - outline,
      this.tileSize - 8 + outline * 2,
      this.tileSize - 8 + outline * 2,
      true
    );

    if (tile) {
      const textX = x + this.tileSize / 2;
      const textY = y + this.tileSize / 2 + 10;
      this.ctx.font = `${this.tileSize / 6}pt Arial`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "rgb(119,110,101)";
      this.ctx.fillText(tile, textX, textY);
    }
  }

  moveTiles = () => {
    const { fieldSize } = this;

    let moved = false;

    const moveUp = () => {
      for (let x = 0; x < fieldSize; x++) {
        moved = true;

        while (moved) {
          moved = false;

          for (let y = 1; y < fieldSize; y++) {
            const currentTile = this.field[y][x];
            const targetTile = this.field[y - 1][x];

            if (currentTile) {
              if (!targetTile) {
                this.field[y - 1][x] = {
                  ...currentTile,
                  outline: { ...defaultOutline, isPlaying: false },
                  x,
                  y: y - 1,
                };
                this.field[y][x] = undefined;

                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              } else if (
                this.field[y - 1][x].value === this.field[y][x].value
              ) {
                const value = currentTile.value * 2;

                this.field[y - 1][x] = {
                  ...currentTile,
                  outline: { ...defaultOutline },
                  value,
                  x,
                  y: y - 1,
                };
                this.field[y][x] = undefined;

                this.score += value;
                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              }
            }
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

            if (currentTile) {
              if (!targetTile) {
                this.field[y + 1][x] = {
                  ...currentTile,
                  outline: { ...defaultOutline, isPlaying: false },
                  x,
                  y: y + 1,
                };
                this.field[y][x] = undefined;

                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              } else if (
                this.field[y + 1][x].value === this.field[y][x].value
              ) {
                const value = currentTile.value * 2;

                this.field[y + 1][x] = {
                  ...currentTile,
                  outline: { ...defaultOutline },
                  value,
                  x,
                  y: y + 1,
                };
                this.field[y][x] = undefined;

                this.score += value;
                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              }
            }
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

            if (currentTile) {
              if (!targetTile) {
                this.field[y][x - 1] = {
                  ...currentTile,
                  outline: { ...defaultOutline, isPlaying: false },
                  x: x - 1,
                  y,
                };
                this.field[y][x] = undefined;

                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              } else if (
                this.field[y][x - 1].value === this.field[y][x].value
              ) {
                const value = currentTile.value * 2;

                this.field[y][x - 1] = {
                  ...currentTile,
                  outline: { ...defaultOutline },
                  value,
                  x: x - 1,
                  y,
                };
                this.field[y][x] = undefined;

                this.score += value;
                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              }
            }
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

            if (currentTile) {
              if (!targetTile) {
                this.field[y][x + 1] = {
                  ...currentTile,
                  outline: { ...defaultOutline, isPlaying: false },
                  x: x + 1,
                  y,
                };
                this.field[y][x] = undefined;

                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              } else if (
                this.field[y][x + 1].value === this.field[y][x].value
              ) {
                const value = currentTile.value * 2;

                this.field[y][x + 1] = {
                  ...currentTile,
                  outline: { ...defaultOutline },
                  value,
                  x: x + 1,
                  y,
                };
                this.field[y][x] = undefined;

                this.score += value;
                moved = true;
                this.isNewTileNeeded = true;
                this.isFieldUpdated = true;
              }
            }
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
        this.addRandomTile();
        this.isNewTileNeeded = false;

        const emptyTiles = this.getEmptyTiles();
        if (!emptyTiles.length && !this.isTileWithSameNear()) {
          this.isGameOver = true;
        }
      }
    }

    this.field.forEach((line, y) => {
      line.forEach((tile, x) => {
        this.field[y][x] = tile
          ? updateTileOutline(tile, this.outlineStep)
          : tile;
        if (tile && tile.outline.isPlaying) {
          this.isFieldUpdated = true;
        }
        if (!this.isWon && tile && tile.value === 2048) {
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
        this.drawTile(
          tile?.value,
          x * this.tileSize,
          y * this.tileSize,
          tile?.outline.width
        );
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
      this.onGameEnd(this.score);
      this.isGameOver = false;
    }

    this.onScoreChange(this.score);
  }

  animate = () => {
    this.step();

    requestAnimationFrame(this.animate);
  };

  start() {
    this.isGameOver = false;
    this.isWon = false;
    this.isOnGameWinFired = false;
    this.score = 0;

    this.field = new Array(this.fieldSize)
      .fill(0)
      .map(() => new Array(this.fieldSize).fill(undefined));

    this.addRandomTile();
    this.addRandomTile();
    this.draw();
    this.animate();
  }
}
