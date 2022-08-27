const keys = {
  Enter: true,
  Space: true,
};

const spritesPath = "./assets/atlas.png";

// px
const logoY = 80;
const logoHeight = 85;
const logoWidth = logoHeight * 3.7;
const tutorialHeight = 125;
const tutorialWidth = tutorialHeight * 1.15;
const tutorialOffsetStep = 1;
const getReadyTextDefaultY = logoY;
const getReadyTextHeight = 45;
const getReadyTextWidth = getReadyTextHeight * 4.5;
const gameOverTextY = logoY;
const gameOverTextHeight = 65;
const gameOverTextWidth = gameOverTextHeight * 4.46;
const floorHeight = 100;
const birdWidth = 48;
const birdHeight = 35;
const pipeHeadWidth = birdHeight * 2;
const pipeHeadHeight = 40;
const pipeHeadGap = 4; // gap of pipe 'head' on each side
const pipeWidth = pipeHeadWidth - pipeHeadGap * 2;
const pipeHeight = pipeHeadWidth * 6;
const pipesGapH = birdHeight * 3.7;
const pipesGapW = pipeHeadWidth * 2.5;
const pipesRenderGap = pipeHeadWidth + pipesGapW;
const bigNumberWidth = 30;
const bigNumberHeight = bigNumberWidth * 1.5;
const scoreY = 25;
const scoreWhitespace = 3; // whitespace between score numbers

const getReadyDefaultDelay = 5;
const backgroundSpeed = 0.05;
const floorSpeed = 1.6;
const birdSpritesSpeed = 0.2;
const birdUpMaxAngle = -35;
const birdDownMaxAngle = 90;
const gravityForce = 2;
const actionVelocity = 19;

const fps = 60;
const fpsInterval = 1000 / fps;

const gameStates = {
  startScreen: "startScreen",
  playing: "playing",
  gameOver: "gameOver",
};
