/** 
TODO NEXT: 
handle assets loading
figure out what is wrong with numbers scaling
end screen
add delay for 'get ready' disappearing animation
configure params for proper jumping (height, speed and angle)
pipe collision logic
**/

class FlappyBird {
  canvas;
  ctx;

  onGameReady = () => {};
  onScoreChange = () => {};
  onGameEnd = () => {};

  hasAction = false; // to detect screen was touched or clicked

  backgroundOffset = 0;
  floorOffset = 0;
  spritesObj = {};

  birdSprites = [];
  birdSpriteIndex = 0;
  birdX = 0;
  birdY = 0;
  birdAngle = 0;
  birdVelocity = 0;

  bigNumbersSprites = [];
  gameScore = 0;

  logoX = 0;
  tutorialX = 0;
  tutorialY = 0;
  tutorialOffset = 0;
  tutorialOffsetTimer = 0;
  getReadyTextY = 0;
  getReadyTextDelay = 0;

  gameState = gameStates.startScreen;

  pipes = [
    { x: 0, y: 0, passed: false },
    { x: 0, y: 0, passed: false },
    { x: 0, y: 0, passed: false },
  ];

  constructor(canvas, events) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    const {
      onGameReady = () => {},
      onScoreChange = () => {},
      onGameEnd = () => {},
    } = events;

    this.onGameReady = onGameReady;
    this.onScoreChange = onScoreChange;
    this.onGameEnd = onGameEnd;

    this.initData();
  }

  initData() {
    this.ctx.imageSmoothingEnabled = false; // to prevent images blur

    const spritesNames = Object.keys(sprites);

    spritesNames.forEach((name) => {
      this.spritesObj[name] = new Sprite(
        this.ctx,
        spritesPath,
        this.onGameReady,
        sprites[name]
      );
    });

    this.birdSprites = [
      this.spritesObj.bird0,
      this.spritesObj.bird1,
      this.spritesObj.bird2,
      this.spritesObj.bird1,
    ];

    this.bigNumbersSprites = [
      this.spritesObj.numberBig0,
      this.spritesObj.numberBig1,
      this.spritesObj.numberBig2,
      this.spritesObj.numberBig3,
      this.spritesObj.numberBig4,
      this.spritesObj.numberBig5,
      this.spritesObj.numberBig6,
      this.spritesObj.numberBig7,
      this.spritesObj.numberBig8,
      this.spritesObj.numberBig9,
    ];

    this.logoX = this.canvas.width / 2 - logoWidth / 2;
    this.tutorialX = this.canvas.width / 2 - tutorialWidth / 2;
    this.tutorialY = (this.canvas.height / 4) * 3 - tutorialHeight / 2;
    this.getReadyTextX = this.canvas.width / 2 - getReadyTextWidth / 2;
    this.getReadyTextY = getReadyTextDefaultY;
    this.getReadyTextDelay = getReadyDefaultDelay;
    this.gameOverTextX = this.canvas.width / 2 - gameOverTextWidth / 2;
  }

  initGame() {
    this.gameScore = 0;
    this.birdX = this.canvas.width / 2 - birdWidth / 2;
    this.birdY = this.canvas.height / 2 - birdHeight;
    this.birdAngle = 0;
    this.birdVelocity = 0;

    this.pipes = this.pipes.map((_, i) => ({
      x: i * pipesRenderGap + this.canvas.width,
      y: getRandomInt(
        birdHeight * 1.5,
        this.canvas.height - (floorHeight + pipesGapH + birdHeight * 1.5)
      ),
      passed: false,
    }));
  }

  drawLogo() {
    this.spritesObj.logo.draw(this.logoX, logoY, logoWidth, logoHeight);
  }

  drawGameOverText() {
    this.spritesObj.gameOverText.draw(
      this.gameOverTextX,
      gameOverTextY,
      gameOverTextWidth,
      gameOverTextHeight
    );
  }

  drawGetReadyText() {
    this.spritesObj.getReadyText.draw(
      this.getReadyTextX,
      this.getReadyTextY,
      getReadyTextWidth,
      getReadyTextHeight
    );
  }

  calcGetReadyText() {
    if ((this.getReadyTextDelay -= 0.1) > 0) return;

    if (this.getReadyTextY > -getReadyTextHeight) {
      this.getReadyTextY -= getReadyTextDefaultY / 80;
    }
  }

  drawTutorial() {
    this.spritesObj.tutorial.draw(
      this.tutorialX + this.tutorialOffset,
      this.tutorialY + this.tutorialOffset,
      tutorialWidth,
      tutorialHeight
    );
  }

  calcTutorial() {
    this.tutorialOffsetTimer += tutorialOffsetStep / 20;

    if (this.tutorialOffsetTimer >= tutorialOffsetStep * 2) {
      this.tutorialOffset = 0;
      this.tutorialOffsetTimer = 0;
    } else if (this.tutorialOffsetTimer >= tutorialOffsetStep) {
      this.tutorialOffset = tutorialOffsetStep;
    }
  }

  drawBackground() {
    this.ctx.imageSmoothingEnabled = true;

    this.spritesObj.day_back.draw(
      this.backgroundOffset,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.spritesObj.day_back.draw(
      this.backgroundOffset - this.canvas.width,
      0,
      this.canvas.width,
      this.canvas.height
    );

    this.ctx.imageSmoothingEnabled = false;
  }

  calcBackground() {
    this.backgroundOffset -= backgroundSpeed;

    if (this.backgroundOffset < 0) {
      this.backgroundOffset = this.canvas.width;
    }
  }

  drawPipes() {
    this.pipes.forEach(({ x, y }) => {
      this.spritesObj.pipeUp.draw(
        x,
        0 - pipeHeight + y,
        pipeHeadWidth,
        pipeHeight
      );
      this.spritesObj.pipeDown.draw(
        x,
        y + pipesGapH,
        pipeHeadWidth,
        pipeHeight
      );
    });
  }

  calcPipes() {
    this.pipes = this.pipes.map((pipe) => ({
      ...pipe,
      x: pipe.x - floorSpeed,
    }));

    if (this.pipes[0].x + pipeHeadWidth <= 0) {
      this.pipes.push({
        x: this.pipes[2].x + pipeHeadWidth + pipesGapW,
        y: getRandomInt(
          birdHeight * 1.5,
          this.canvas.height - (floorHeight + pipesGapH + birdHeight * 1.5)
        ),
        passed: false,
      });
      this.pipes.shift();
    }
  }

  drawFloor() {
    this.spritesObj.floor.draw(
      this.floorOffset,
      this.canvas.height - floorHeight,
      this.canvas.width,
      100
    );
    this.spritesObj.floor.draw(
      this.floorOffset - this.canvas.width + 1, // +1 to remove 1px gap
      this.canvas.height - floorHeight,
      this.canvas.width,
      100
    );
  }

  calcFloor() {
    this.floorOffset -= floorSpeed;

    if (this.floorOffset < 0) {
      this.floorOffset = this.canvas.width;
    }
  }

  drawBird() {
    this.birdSprites[Math.floor(this.birdSpriteIndex)].drawAndRotate(
      this.birdX,
      this.birdY,
      this.birdAngle,
      birdWidth,
      birdHeight
    );
  }

  calcBird() {
    if (this.gameState === gameStates.startScreen) {
      this.birdSpriteIndex += birdSpritesSpeed;
    }

    if (this.gameState === gameStates.playing) {
      this.birdVelocity -= gravityForce;

      if (this.birdVelocity < -gravityForce * 2) {
        this.birdVelocity = -gravityForce * 2;
      }

      this.birdY -= this.birdVelocity;
      this.birdAngle -= this.birdVelocity;

      if (this.birdAngle < 0) {
        this.birdSpriteIndex += birdSpritesSpeed;
      }

      if (this.birdAngle < birdUpMaxAngle || this.hasAction) {
        this.birdAngle = birdUpMaxAngle;
      }
      if (this.birdAngle > birdDownMaxAngle) {
        this.birdAngle = birdDownMaxAngle;
      }
    }

    if (this.birdSpriteIndex >= this.birdSprites.length) {
      this.birdSpriteIndex = 0;
    }
  }

  drawGameScore() {
    const scoreArr = (this.gameScore + "").split("");
    const scoreWidth =
      scoreArr.length * bigNumberWidth +
      (scoreArr.length - 1) * scoreWhitespace;
    const leftPadding = (this.canvas.width - scoreWidth) / 2;

    scoreArr.forEach((number, i) => {
      const x = leftPadding + i * bigNumberWidth + i * scoreWhitespace;

      this.bigNumbersSprites[+number].draw(
        x,
        scoreY,
        bigNumberWidth,
        bigNumberHeight
      );
    });
  }

  calcGameState() {
    const birdBottomY = this.birdY + birdHeight;
    const birdRightX = this.birdX + birdWidth;

    if (birdBottomY >= this.canvas.height - floorHeight) {
      this.gameState = gameStates.gameOver;
    }

    this.pipes.forEach(({ x, y, passed }, i) => {
      const hasHorizontalCollision = () =>
        (this.birdX > x + pipeHeadGap &&
          this.birdX < x + pipeHeadGap + pipeWidth) ||
        (birdRightX > x + pipeHeadGap &&
          birdRightX < x + pipeHeadGap + pipeWidth);

      const hasVerticalCollision = () =>
        this.birdY < y || birdBottomY > y + pipesGapH;

      const hasHorizontalHeadCollision = () =>
        (this.birdX > x && this.birdX < x + pipeHeadWidth) ||
        (birdRightX > x && birdRightX < x + pipeHeadWidth);

      const hasVerticalHeadCollision = () =>
        (this.birdY < y && this.birdY > y - pipeHeadHeight) ||
        (this.birdY > y + pipesGapH &&
          this.birdY < y + pipesGapH + pipeHeadHeight) ||
        (birdBottomY < y && birdBottomY > y - pipeHeadHeight) ||
        (birdBottomY > y + pipesGapH &&
          birdBottomY < y + pipesGapH + pipeHeadHeight);

      if (
        !passed &&
        ((hasVerticalHeadCollision() && hasHorizontalHeadCollision()) ||
          (hasHorizontalCollision() && hasVerticalCollision()))
      ) {
        this.gameState = gameStates.gameOver;
      }

      if (!passed && x + pipeHeadWidth < this.birdX) {
        this.gameScore++;
        this.pipes[i].passed = true;
      }
    });
  }

  calc() {
    if (this.gameState === gameStates.startScreen) {
      if (this.hasAction) {
        this.initGame();
        this.gameState = gameStates.playing;
      }

      this.calcBackground();
      this.calcFloor();
      this.calcBird();
      this.calcTutorial();
    }

    if (this.gameState === gameStates.playing) {
      if (this.hasAction) {
        this.birdVelocity = actionVelocity;
      }

      this.calcBackground();
      this.calcPipes();
      this.calcFloor();
      this.calcBird();
      this.calcGetReadyText();

      this.calcGameState();
    }

    if (this.gameState === gameStates.gameOver) {
      if (this.hasAction) {
        this.initGame();
        this.gameState = gameStates.playing;
      }
    }

    this.hasAction = false;
  }

  draw() {
    this.drawBackground();

    if (this.gameState === gameStates.startScreen) {
      this.drawFloor();
      this.drawBird();
      this.drawLogo();
      this.drawTutorial();
    }

    if (this.gameState === gameStates.playing) {
      this.drawPipes();
      this.drawFloor();
      this.drawBird();
      this.drawGameScore();
      this.drawGetReadyText();
    }

    if (this.gameState === gameStates.gameOver) {
      this.drawPipes();
      this.drawFloor();
      this.drawBird();
      this.drawGameOverText();
    }
  }

  step() {
    this.calc();
    this.draw();
  }

  // functions that will be used outside of the class
  // should be arrow to not lose context
  animate = () => {
    this.step();

    requestAnimationFrame(this.animate);
  };

  start() {
    this.initData();
    this.initGame();
    this.animate();
  }

  onAction = () => {
    this.hasAction = true;
  };
}
