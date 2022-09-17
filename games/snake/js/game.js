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

  onScoreChange;
  onGameOver;

  constructor(canvas, events) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    const { onScoreChange = () => {}, onGameOver = () => {} } = events;

    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;
  }

  setScale = () => {
    this.scale = Math.max(
      this.canvas.width / this.fieldWidth,
      this.canvas.height / this.fieldHeight
    );

    this.drawField();
    this.drawSnake(true);
    this.drawFood();
  };

  setDirection(action = "") {
    this.direction = action;
  }

  isCollisionWithSnake(obj) {
    return this.snake.some((s) => s.x === obj.x && s.y === obj.y);
  }

  drawField() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "rgb(0, 255, 17)";

    for (let x = 0; x < this.fieldWidth; x++) {
      this.ctx.moveTo(x * this.scale - 0.5, 0);
      this.ctx.lineTo(x * this.scale - 0.5, this.canvas.width);
    }

    for (let y = 0; y < this.fieldHeight; y++) {
      this.ctx.moveTo(0, y * this.scale - 0.5);
      this.ctx.lineTo(this.canvas.width, y * this.scale - 0.5);
    }

    this.ctx.stroke();
  }

  clearCell(x, y) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);

    this.ctx.strokeStyle = "rgb(0, 255, 17)";
    this.ctx.strokeRect(
      x * this.scale - 0.5,
      y * this.scale - 0.5,
      this.scale,
      this.scale
    );
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

    this.ctx.fillStyle = "red";

    const size = this.scale - maxOutline * 2 + outlineWidth * 2;

    this.ctx.fillRect(
      x * this.scale + maxOutline - outlineWidth - 0.5,
      y * this.scale + maxOutline - outlineWidth - 0.5,
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

  togglePause() {
    this.isPaused = !this.isPaused;
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

  drawSnake(forceDraw = false) {
    if (this.snakeRemovedTail && !forceDraw) {
      const { x, y } = this.snakeRemovedTail;
      this.clearCell(x, y);

      this.ctx.fillStyle = "green";
      this.ctx.fillRect(
        this.snake[0].x * this.scale,
        this.snake[0].y * this.scale,
        this.scale,
        this.scale
      );

      this.ctx.fillStyle = "darkgreen";
      this.ctx.fillRect(
        this.snake[1].x * this.scale,
        this.snake[1].y * this.scale,
        this.scale,
        this.scale
      );
    } else {
      this.snake.forEach(({ x, y }, index) => {
        this.ctx.fillStyle = index ? "darkgreen" : "green";
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
      this.togglePause();
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
    this.isPaused = true;
    this.score = 0;
    this.snakeRemovedTail = null;

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
