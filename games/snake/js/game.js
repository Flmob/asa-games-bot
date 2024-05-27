class Snake {
  score = 0;
  snake = [];
  food;
  direction = "";
  snakeDirection = RIGHT;
  lastSnakeDirection = this.snakeDirection;
  snakeRemovedTail = null;

  fieldHeight = 18;
  fieldWidth = 36;
  scale = 0;

  isGameOver = false;
  isPaused = true;

  //for FPS control
  animationFrameRequest;
  then;
  now;

  canvas;
  ctx;
  canvasRect;

  onScoreChange;
  onIsPausedChange;
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

    this.scale = Math.max(
      this.canvasRect.width / this.fieldWidth,
      this.canvasRect.height / this.fieldHeight
    );

    if (isWithRedraw) {
      this.drawField();
      this.drawSnake(true);
      this.drawFood();
    }
  };

  setDirection(action = "") {
    this.direction = action;
  }

  isCollisionWithSnake(obj) {
    return this.snake.some((s) => s.x === obj.x && s.y === obj.y);
  }

  drawField() {
    this.ctx.strokeStyle = boardBorderColor;

    for (let x = 0; x <= this.fieldWidth; x++) {
      this.ctx.moveTo(x * this.scale, 0);
      this.ctx.lineTo(x * this.scale, this.canvasRect.width);
    }

    for (let y = 0; y <= this.fieldHeight; y++) {
      this.ctx.moveTo(0, y * this.scale);
      this.ctx.lineTo(this.canvasRect.width, y * this.scale);
    }

    this.ctx.stroke();
  }

  clearCell(x, y) {
    this.ctx.clearRect(x * this.scale, y * this.scale, this.scale, this.scale);

    this.ctx.strokeStyle = boardBorderColor;
    this.ctx.strokeRect(x * this.scale, y * this.scale, this.scale, this.scale);
  }

  dropFood() {
    do {
      this.food = {
        x: getRandomInt(0, this.fieldWidth - 1),
        y: getRandomInt(0, this.fieldHeight - 1),
        outline: { ...defaultOutline },
      };
    } while (this.isCollisionWithSnake(this.food));
  }

  drawFood() {
    const {
      x,
      y,
      outline: { width: outlineWidth },
    } = this.food;

    this.clearCell(x, y);

    this.ctx.fillStyle = foodColor;

    const size = this.scale - maxOutline * 2 + outlineWidth * 2;

    this.ctx.fillRect(
      x * this.scale + maxOutline - outlineWidth,
      y * this.scale + maxOutline - outlineWidth,
      size,
      size
    );
  }

  initSnake() {
    const y = getRandomInt(0, this.fieldHeight - 1);
    this.snake = new Array(defaultSnakeSize)
      .fill({ x: 0, y })
      .map((part, index) => ({ ...part, x: index }))
      .reverse();
  }

  setIsPaused(isPaused) {
    this.isPaused = isPaused;
    this.onIsPausedChange(this.isPaused);
  }

  updateSnakeAndFood() {
    if (!this.snakeDirection) return;

    this.lastSnakeDirection = this.snakeDirection;

    this.snakeRemovedTail = null;
    const oldHead = this.snake[0];
    let newHead;

    switch (this.snakeDirection) {
      case UP:
        newHead = {
          ...oldHead,
          y: oldHead.y ? oldHead.y - 1 : this.fieldHeight - 1,
        };
        break;
      case DOWN:
        newHead = {
          ...oldHead,
          y: oldHead.y === this.fieldHeight - 1 ? 0 : oldHead.y + 1,
        };
        break;
      case LEFT:
        newHead = {
          ...oldHead,
          x: oldHead.x ? oldHead.x - 1 : this.fieldWidth - 1,
        };
        break;
      case RIGHT:
        newHead = {
          ...oldHead,
          x: oldHead.x === this.fieldWidth - 1 ? 0 : oldHead.x + 1,
        };
        break;
    }

    if (this.isCollisionWithSnake(newHead)) {
      this.isGameOver = true;
      this.isPaused = true;
      return;
    }

    this.snake.unshift(newHead);

    if (this.isCollisionWithSnake(this.food)) {
      this.dropFood();
      this.onScoreChange(++this.score);
    } else {
      this.snakeRemovedTail = this.snake.pop();
    }
  }

  drawSnake(isForceDraw = false) {
    if (this.snakeRemovedTail && !isForceDraw) {
      const { x, y } = this.snakeRemovedTail;
      this.clearCell(x, y);

      this.ctx.fillStyle = snakeHeadColor;
      this.ctx.fillRect(
        this.snake[0].x * this.scale,
        this.snake[0].y * this.scale,
        this.scale,
        this.scale
      );

      this.ctx.fillStyle = snakeBodyColor;
      this.ctx.fillRect(
        this.snake[1].x * this.scale,
        this.snake[1].y * this.scale,
        this.scale,
        this.scale
      );
    } else {
      this.snake.forEach(({ x, y }, index) => {
        this.ctx.fillStyle = index ? snakeBodyColor : snakeHeadColor;
        this.ctx.fillRect(
          x * this.scale,
          y * this.scale,
          this.scale,
          this.scale
        );
      });
    }
  }

  updateInput() {
    if (this.direction === ACTION) {
      this.setIsPaused(!this.isPaused);
      this.direction = "";
    }

    if (this.isPaused) return;

    if (
      (this.lastSnakeDirection === UP && this.direction === DOWN) ||
      (this.lastSnakeDirection === DOWN && this.direction === UP) ||
      (this.lastSnakeDirection === LEFT && this.direction === RIGHT) ||
      (this.lastSnakeDirection === RIGHT && this.direction === LEFT)
    ) {
      this.direction = "";
    }

    this.snakeDirection = this.direction || this.snakeDirection;
    this.direction = "";
  }

  calc() {
    this.food = updateTileOutline(this.food);
    this.updateSnakeAndFood();
  }

  draw() {
    this.drawSnake();
    this.drawFood();
  }

  step() {
    this.calc();
    this.draw();
  }

  animate = () => {
    this.now = Date.now();
    const elapsed = this.now - this.then;

    this.updateInput();

    if (elapsed > fpsInterval) {
      this.then = this.now - (elapsed % fpsInterval);
      if (!this.isPaused) this.step();
    }

    if (this.isGameOver) {
      this.onGameOver(this.score);
      return;
    }

    this.animationFrameRequest = requestAnimationFrame(this.animate);
  };

  start() {
    this.direction = "";
    this.snakeDirection = RIGHT;
    this.lastSnakeDirection = this.snakeDirection;
    this.isGameOver = false;
    this.score = 0;
    this.snakeRemovedTail = null;

    this.setIsPaused(true);
    this.onScoreChange(this.score);
    this.initSnake();
    this.dropFood();
    this.setScale();
    this.drawField();
    this.draw();

    cancelAnimationFrame(this.animationFrameRequest);
    this.then = Date.now();
    this.animate();
  }
}
