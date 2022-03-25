const canvas = document.querySelector("#canv");
const ctx = canvas.getContext("2d");

const scoreSpan = document.querySelector(".score");
const restartBtn = document.querySelector(".restart");
const keyboardToggleBtn = document.querySelector(".keyboard-toggle");
const keyboard = document.querySelector(".keyboard");

const upBtn = document.querySelector(".up");
const downBtn = document.querySelector(".down");
const leftBtn = document.querySelector(".left");
const rightBtn = document.querySelector(".right");

let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

let isGameOver = false;
let isKeyboardVisible = false;

const onScoreChange = (score) => {
  scoreSpan.innerHTML = score;
};

const onGameEnd = (score) => {
  const message = `You've lost! Your score is ${score}`;
  isGameOver = true;
  restartBtn.disabled = false;
  // alert(message);
  console.log(message);
  // game2048.start();
};

const game2048 = new Game2048(canvas, {
  onScoreChange,
  onGameEnd,
});

game2048.start();

document.addEventListener("keyup", (e) => {
  game2048.moveName = (!game2048.moveName && actions[e.key]) || "";
});

restartBtn.addEventListener("click", () => {
  if (isGameOver) isGameOver = false;

  game2048.start();
  restartBtn.disabled = true;
});

keyboardToggleBtn.addEventListener("click", () => {
  isKeyboardVisible = !isKeyboardVisible;

  keyboardToggleBtn.classList.toggle("toggled", isKeyboardVisible);
  keyboard.classList.toggle("hidden", !isKeyboardVisible);
});

upBtn.addEventListener("touchend", () => (game2048.moveName = actions.UP));
upBtn.addEventListener("click", () => (game2048.moveName = actions.UP));

downBtn.addEventListener("touchend", () => (game2048.moveName = actions.DOWN));
downBtn.addEventListener("click", () => (game2048.moveName = actions.DOWN));

leftBtn.addEventListener("touchend", () => (game2048.moveName = actions.LEFT));
leftBtn.addEventListener("click", () => (game2048.moveName = actions.LEFT));

rightBtn.addEventListener(
  "touchend",
  () => (game2048.moveName = actions.RIGHT)
);
rightBtn.addEventListener("click", () => (game2048.moveName = actions.RIGHT));

const handleGesture = () => {
  const xDiff = Math.abs(touchstartX - touchendX);
  const yDiff = Math.abs(touchstartY - touchendY);

  if (xDiff > yDiff) {
    if (touchendX < touchstartX) game2048.moveName = actions.LEFT;
    if (touchendX > touchstartX) game2048.moveName = actions.RIGHT;
  } else {
    if (touchendY < touchstartY) game2048.moveName = actions.UP;
    if (touchendY > touchstartY) game2048.moveName = actions.DOWN;
  }
};

document.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
  touchstartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  touchendY = e.changedTouches[0].screenY;

  handleGesture();
});
