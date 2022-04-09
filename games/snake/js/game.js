const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";
const ACTION = "action";

const actions = {
  ACTION,
  UP,
  RIGHT,
  DOWN,
  LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
  ArrowLeft: LEFT,
  " ": ACTION,
};

class Snake {
  score = 0;
  snake = [];
  food;
  direction = "";
  snakeDirection = RIGHT;
  defaultSnakeSize = 3;

  fieldHeight = 18;
  fieldWidth = 36;
  scale = 0;

  isGameOver = false;
  isPaused = true;

  //for FPS control
  fps = 9;
  fpsInterval = 1000 / this.fps;
  then;
  now;

  canvas;
  ctx;

  onScoreChange;
  onGameEnd;

  constructor(canvas, events) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.scale = Math.max(
      this.canvas.width / this.fieldWidth,
      this.canvas.height / this.fieldHeight
    );

    const { onScoreChange = () => {}, onGameEnd = () => {} } = events;

    this.onScoreChange = onScoreChange;
    this.onGameEnd = onGameEnd;
  }

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

  dropFood() {
    do {
      this.food = {
        x: getRandomInt(0, this.fieldWidth - 1),
        y: getRandomInt(0, this.fieldHeight - 1),
      };
    } while (this.isCollisionWithSnake(this.food));
  }

  drawFood() {
    this.ctx.fillStyle = "red";

    const { x, y } = this.food;

    this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
  }

  initSnake() {
    const y = getRandomInt(0, this.fieldHeight - 1);
    this.snake = new Array(this.defaultSnakeSize)
      .fill({ x: 0, y })
      .map((part, index) => ({ ...part, x: index }))
      .reverse();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  updateSnakeAndFood() {
    if (!this.snakeDirection || this.isPaused) return;

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
    }

    this.snake.unshift(newHead);

    if (this.isCollisionWithSnake(this.food)) {
      this.dropFood();
      this.score++;
    } else {
      this.snake.pop();
    }
  }

  drawSnake() {
    this.snake.forEach(({ x, y }, index) => {
      this.ctx.fillStyle = index ? "darkgreen" : "green";
      this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
    });
  }

  calc() {
    if (this.direction === ACTION) {
      this.togglePause();
      this.direction = "";
    }

    if (this.isPaused) return;

    if (
      (this.snakeDirection === UP && this.direction === DOWN) ||
      (this.snakeDirection === DOWN && this.direction === UP) ||
      (this.snakeDirection === LEFT && this.direction === RIGHT) ||
      (this.snakeDirection === RIGHT && this.direction === LEFT)
    ) {
      this.direction = "";
    }

    this.snakeDirection = this.direction || this.snakeDirection;
    this.direction = "";

    this.updateSnakeAndFood();
  }

  draw() {
    this.drawField();
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

    if (elapsed > this.fpsInterval) {
      this.then = this.now - (elapsed % this.fpsInterval);

      this.step();
    }

    this.onScoreChange(this.score);
    if (this.isGameOver) {
      this.onGameEnd(this.score);
      return;
    }

    requestAnimationFrame(this.animate);
  };

  start() {
    this.direction = "";
    this.snakeDirection = RIGHT;
    this.isGameOver = false;
    this.isPaused = true;
    this.score = 0;

    this.initSnake();
    this.dropFood();

    this.then = Date.now();
    this.animate();
  }
}
