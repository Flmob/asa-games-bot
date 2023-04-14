class T2048 {
  board = [];
  isPaused = true;
  isGameOver = false;
  isMerging = false;
  score = 0;
  currentTile;
  tileSize = 100;
  xTileOffset = 0;
  yTileOffset = 0;
  tileSpeed = defaultTileSpeed;

  animationFrameRequest;
  previousTimestamp = 0;

  backgroundCanvas;
  backgroundCanvasRect;
  backgroundCtx;

  mainCanvas;
  mainCanvasRect;
  mainCtx;

  onScoreChange;
  onGameOver;

  constructor({ backgroundCanvas, mainCanvas }, events = {}) {
    this.mainCanvas = mainCanvas;
    this.mainCtx = this.mainCanvas.getContext("2d");

    this.backgroundCanvas = backgroundCanvas;
    this.backgroundCtx = this.backgroundCanvas.getContext("2d");

    const {
      onScoreChange = () => {},
      onGameOver = () => {},
      onIsPausedChange = () => {},
    } = events;

    this.onScoreChange = onScoreChange;
    this.onIsPausedChange = onIsPausedChange;
    this.onGameOver = onGameOver;
  }

  setupCanvas() {
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1;

    // main canvas
    this.mainCtx.resetTransform();
    // Get and save the size of the canvas in CSS pixels.
    this.mainCanvasRect = this.mainCanvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    this.mainCanvas.width = Math.floor(this.mainCanvasRect.width * dpr);
    this.mainCanvas.height = Math.floor(this.mainCanvasRect.height * dpr);
    const mainCtx = this.mainCanvas.getContext("2d");
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    mainCtx.scale(dpr, dpr);
    // scale everything down using CSS
    this.mainCanvas.style.width = this.mainCanvasRect.width + "px";
    this.mainCanvas.style.height = this.mainCanvasRect.height + "px";

    this.mainCtx = mainCtx;

    // do the same with background canvas
    this.backgroundCtx.resetTransform();
    this.backgroundCanvasRect = this.backgroundCanvas.getBoundingClientRect();
    this.backgroundCanvas.width = Math.floor(
      this.backgroundCanvasRect.width * dpr
    );
    this.backgroundCanvas.height = Math.floor(
      this.backgroundCanvasRect.height * dpr
    );
    const backgroundCtx = this.backgroundCanvas.getContext("2d");
    backgroundCtx.scale(dpr, dpr);
    this.backgroundCanvas.style.width = this.backgroundCanvasRect.width + "px";
    this.backgroundCanvas.style.height =
      this.backgroundCanvasRect.height + "px";
    this.backgroundCtx = backgroundCtx;
  }

  setScale = (isWithRedraw = false) => {
    this.setupCanvas();

    this.tileSize = Math.min(
      this.mainCanvasRect.height / rowsCount,
      this.mainCanvasRect.width / columnsCount
    );

    this.xTileOffset =
      (this.mainCanvasRect.width - this.tileSize * columnsCount) / 2;
    this.yTileOffset =
      (this.mainCanvasRect.height - this.tileSize * rowsCount) / 2;

    this.board.forEach((column, x) =>
      column.forEach((rowItem, y) => {
        rowItem &&
          rowItem.setSize(this.tileSize, this.xTileOffset, this.yTileOffset);
      })
    );

    this.currentTile &&
      this.currentTile.setSize(
        this.tileSize,
        this.xTileOffset,
        this.yTileOffset
      );

    if (isWithRedraw) {
      this.drawBackground();
      this.drawBoard();
      this.currentTile && this.currentTile.draw();
    }
  };

  async drawBackground() {
    this.backgroundCtx.fillStyle = backgroundColor;
    this.backgroundCtx.fillRect(
      0,
      0,
      this.mainCanvasRect.width,
      this.mainCanvasRect.height
    );

    const y = this.tileSize * endGameRow + this.yTileOffset;

    this.backgroundCtx.strokeStyle = "red";
    this.backgroundCtx.lineWidth = 5;

    this.backgroundCtx.beginPath();
    this.backgroundCtx.moveTo(0, y);
    this.backgroundCtx.lineTo(this.backgroundCanvasRect.width, y);
    this.backgroundCtx.stroke();
  }

  initBoard() {
    this.board = new Array(columnsCount)
      .fill([])
      .map((_) => new Array(rowsCount).fill(undefined));
  }

  drawBoard() {
    this.mainCtx.clearRect(
      0,
      0,
      this.mainCanvasRect.width,
      this.mainCanvasRect.height
    );

    this.board.forEach((column, x) =>
      column.forEach((rowItem, y) => {
        rowItem && rowItem.draw();
      })
    );
  }

  setIsPaused(isPaused) {
    this.isPaused = isPaused;
    this.onIsPausedChange(this.isPaused);
  }

  setScore(score = 0) {
    this.score = score;
    this.onScoreChange(score);
  }

  setAction(action = "") {
    if (this.isPaused && action !== ACTION) return;

    if (this.isGameOver) {
      if (action === ACTION) {
        this.start();
      }
      return;
    }

    switch (action) {
      case LEFT: {
        this.currentTile.moveLeft();
        break;
      }
      case RIGHT: {
        this.currentTile.moveRight();
        break;
      }
      case ACTION: {
        this.setIsPaused(!this.isPaused);
      }
    }
  }

  async mergeCurrentTile(mergeDirection = "") {
    if (!mergeDirection) return Promise.reject("No merge direction provided");

    const { column, row } = this.currentTile;

    this.isMerging = true;

    switch (mergeDirection) {
      case directions.LEFT:
        await this.currentTile.slideLeft();
        break;
      case directions.RIGHT:
        await this.currentTile.slideRight();
        break;
      case directions.DOWN:
        await this.currentTile.slideDown();
    }

    const newValue = this.currentTile.value * 2;
    this.setScore(this.score + newValue);
    this.currentTile.setValue(newValue);
    await this.currentTile.turnOutlineOn();
    this.board[column][row] = undefined;
    this.isMerging = false;
  }

  moveTilesDown() {
    this.board.forEach((column) => {
      let moved = true;

      while (moved) {
        moved = false;
        for (let row = 0; row < column.length - 1; row++) {
          if (!column[row]) continue;
          if (!column[row + 1]) {
            moved = true;
            column[row].setRow(row + 1);
            [column[row], column[row + 1]] = [column[row + 1], column[row]];
          }
        }
      }
    });
  }

  addCurrentTile() {
    this.currentTile = new Tile({
      column: getRandomInt(0, this.board.length - 1),
      row: 0,
      ctx: this.mainCtx,
      value: Math.random() > 0.1 ? 2 : 4,
      size: this.tileSize,
      xTileOffset: this.xTileOffset,
      yTileOffset: this.yTileOffset,
      board: this.board,
      onLock: this.onTileLock,
      speed: this.tileSpeed,
    });
  }

  updateIsGameOver() {
    for (let column = 0; column < columnsCount - 1; column++) {
      if (this.isGameOver) break;

      for (let row = 0; row < endGameRow; row++) {
        if (this.board[column][row]) {
          this.isGameOver = true;
          this.onGameOver(this.score);
          break;
        }
      }
    }
  }

  onTileLock = async () => {
    let mergeDirection = this.currentTile.getDirectionOfNearWithSameValue();

    if (mergeDirection) {
      this.tileSpeed += 0.1;
    }

    while (mergeDirection) {
      await this.mergeCurrentTile(mergeDirection).catch((err) =>
        console.log({ err })
      );
      mergeDirection = this.currentTile.getDirectionOfNearWithSameValue();
    }

    this.moveTilesDown();

    const { column, row } = this.currentTile;
    this.board[column][row] = this.currentTile;
    this.drawBoard();

    this.updateIsGameOver();

    !this.isGameOver && this.addCurrentTile();
  };

  animate = (timestamp = 0) => {
    if (!this.previousTimestamp) this.previousTimestamp = timestamp;

    const elapsed = timestamp - this.previousTimestamp;

    if (elapsed > fpsInterval && !this.isPaused && !this.isGameOver) {
      !this.isMerging && this.currentTile.moveDown();

      this.previousTimestamp = 0;
    }

    this.animationFrameRequest = requestAnimationFrame(this.animate);
  };

  start() {
    this.isGameOver = false;

    this.setScore(0);
    this.setScale();
    this.setIsPaused(false);
    this.drawBackground();
    this.initBoard();
    this.drawBoard();

    this.addCurrentTile();
    this.currentTile.draw();

    cancelAnimationFrame(this.animationFrameRequest);
    this.animate();
  }
}
