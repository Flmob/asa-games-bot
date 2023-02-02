class FlappyBird {
  canvas;
  ctx;
  canvasRect;

  onGameReady = () => {};
  onScoreChange = () => {};
  onGameOver = () => {};

  hasAction = false; // to detect screen was touched or clicked

  backgroundOffset = 0;
  floorOffset = 0;
  spritesObj = {};
  sounds = {};

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

  //for FPS control
  animationFrameRequest;
  then;
  now;

  pipes = [
    { x: 0, y: 0, passed: false },
    { x: 0, y: 0, passed: false },
    { x: 0, y: 0, passed: false },
  ];

  constructor(canvas, events) {
    this.canvas = canvas;
    this.setupCanvas();

    const {
      onGameReady = () => {},
      onScoreChange = () => {},
      onGameOver = () => {},
    } = events;

    this.onGameReady = onGameReady;
    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;

    this.initData();
  }

  setupCanvas(canvas) {
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

    soundsNames.forEach((name) => {
      const shortName = name.split("_")[1];

      this.sounds[shortName] = new Audio(
        `${soundsPath}/${name}.${audioExtension}`
      );
      this.sounds[shortName].volume = 0.1;
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

    this.logoX = this.canvasRect.width / 2 - logoWidth / 2;
    this.tutorialX = this.canvasRect.width / 2 - tutorialWidth / 2;
    this.tutorialY = (this.canvasRect.height / 4) * 3 - tutorialHeight / 2;
    this.getReadyTextX = this.canvasRect.width / 2 - getReadyTextWidth / 2;
    this.getReadyTextY = getReadyTextDefaultY;
    this.getReadyTextDelay = getReadyDefaultDelay;
    this.gameOverTextX = this.canvasRect.width / 2 - gameOverTextWidth / 2;
  }

  initGame() {
    this.gameScore = 0;
    this.birdX = this.canvasRect.width / 2 - birdRadius * 3;
    this.birdY = this.canvasRect.height / 2 - birdRadius;
    this.birdAngle = 0;
    this.birdVelocity = 0;

    this.pipes = this.pipes.map((_, i) => ({
      x: i * pipesRenderGap + this.canvasRect.width,
      y: getRandomInt(
        birdDiameter * 1.5,
        this.canvasRect.height - (floorHeight + pipesGapH + birdDiameter * 1.5)
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
      this.canvasRect.width,
      this.canvasRect.height
    );
    this.spritesObj.day_back.draw(
      this.backgroundOffset - this.canvasRect.width,
      0,
      this.canvasRect.width,
      this.canvasRect.height
    );

    this.ctx.imageSmoothingEnabled = false;
  }

  calcBackground() {
    this.backgroundOffset -= backgroundSpeed;

    if (this.backgroundOffset < 0) {
      this.backgroundOffset = this.canvasRect.width;
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
          birdDiameter * 1.5,
          this.canvasRect.height -
            (floorHeight + pipesGapH + birdDiameter * 1.5)
        ),
        passed: false,
      });
      this.pipes.shift();
    }
  }

  drawFloor() {
    this.spritesObj.floor.draw(
      this.floorOffset,
      this.canvasRect.height - floorHeight,
      this.canvasRect.width,
      100
    );
    this.spritesObj.floor.draw(
      this.floorOffset - this.canvasRect.width + 1, // +1 to remove 1px gap
      this.canvasRect.height - floorHeight,
      this.canvasRect.width,
      100
    );
  }

  calcFloor() {
    this.floorOffset -= floorSpeed;

    if (this.floorOffset < 0) {
      this.floorOffset = this.canvasRect.width;
    }
  }

  drawBird() {
    this.birdSprites[Math.floor(this.birdSpriteIndex)].drawAndRotate(
      this.birdX - birdRadius,
      this.birdY - birdRadius,
      this.birdAngle,
      birdSpriteWidth,
      birdDiameter
    );
  }

  calcBird() {
    if (this.gameState === gameStates.startScreen) {
      this.birdSpriteIndex += birdSpritesSpeed;
    }

    if (this.gameState === gameStates.playing) {
      if (this.hasAction) {
        this.sounds.flap.play();
        this.birdVelocity = actionVelocity;
      }

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
    const leftPadding = (this.canvasRect.width - scoreWidth) / 2;

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
    const birdBottomY = this.birdY + birdRadius;

    if (birdBottomY >= this.canvasRect.height - floorHeight) {
      this.sounds.die.play();
      this.gameState = gameStates.gameOver;
      return;
    }

    this.pipes.forEach(({ x, y, passed }, i) => {
      if (passed) return;

      if (
        isRectCircleCollision(
          { x: this.birdX, y: this.birdY, r: birdRadius },
          { x: x, y: y - pipeHeadHeight, w: pipeHeadWidth, h: pipeHeadHeight }
        ) ||
        isRectCircleCollision(
          { x: this.birdX, y: this.birdY, r: birdRadius },
          { x: x, y: y + pipesGapH, w: pipeHeadWidth, h: pipeHeadHeight }
        ) ||
        isRectCircleCollision(
          { x: this.birdX, y: this.birdY, r: birdRadius },
          {
            x: x + pipeHeadGap,
            y: y - this.canvasRect.height,
            w: pipeWidth,
            h: this.canvasRect.height,
          }
        ) ||
        isRectCircleCollision(
          { x: this.birdX, y: this.birdY, r: birdRadius },
          {
            x: x + pipeHeadGap,
            y: y + pipesGapH,
            w: pipeWidth,
            h: this.canvasRect.height,
          }
        )
      ) {
        this.sounds.hit.play();
        this.gameState = gameStates.gameOver;
        this.onGameOver(this.gameScore);
      }

      if (x + pipeHeadWidth < this.birdX) {
        this.gameScore++;
        this.sounds.point.play();
        this.pipes[i].passed = true;
      }
    });
  }

  calc() {
    if (this.gameState === gameStates.startScreen) {
      if (this.hasAction) {
        this.initGame();
        this.sounds.swooshing.play();
        this.gameState = gameStates.playing;
      }

      this.calcBackground();
      this.calcFloor();
      this.calcBird();
      this.calcTutorial();
    }

    if (this.gameState === gameStates.playing) {
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
      this.drawGameScore();
    }
  }

  step() {
    this.calc();
    this.draw();
  }

  // functions that will be used outside of the class
  // should be arrow to not lose context
  animate = () => {
    this.now = Date.now();
    const elapsed = this.now - this.then;

    if (elapsed > fpsInterval) {
      this.then = this.now - (elapsed % fpsInterval);
      this.step();
    }

    requestAnimationFrame(this.animate);
  };

  start() {
    this.initData();
    this.initGame();

    cancelAnimationFrame(this.animationFrameRequest);
    this.then = Date.now();
    this.animate();
  }

  onAction = () => {
    this.hasAction = true;
  };
}
