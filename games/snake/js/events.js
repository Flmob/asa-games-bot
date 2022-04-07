const canvas = document.querySelector("#canvas");

const scoreSpan = document.querySelector(".score");
const restartBtn = document.querySelector(".restart");
const keyboardToggleBtn = document.querySelector(".keyboard-toggle");
const keyboard = document.querySelector(".keyboard");

const upBtn = document.querySelector(".up");
const downBtn = document.querySelector(".down");
const leftBtn = document.querySelector(".left");
const rightBtn = document.querySelector(".right");
const centerBtn = document.querySelector(".center");

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
  // isGameOver = true;
  // alert(message);
  console.log(message);
};

const snake = new Snake(canvas, { onScoreChange, onGameEnd });

snake.start();

document.addEventListener("keyup", (e) => {
  // console.log(e.key);
  snake.setDirection(actions[e.key] || "");
});

restartBtn.addEventListener("click", () => {
  if (isGameOver) isGameOver = false;

  snake.start();
});

keyboardToggleBtn.addEventListener("click", () => {
  isKeyboardVisible = !isKeyboardVisible;

  keyboardToggleBtn.classList.toggle("toggled", isKeyboardVisible);
  keyboard.classList.toggle("hidden", !isKeyboardVisible);
});

upBtn.addEventListener("touchend", () => snake.setDirection(actions.UP));
upBtn.addEventListener("click", () => snake.setDirection(actions.UP));

downBtn.addEventListener("touchend", () => snake.setDirection(actions.DOWN));
downBtn.addEventListener("click", () => snake.setDirection(actions.DOWN));

leftBtn.addEventListener("touchend", () => snake.setDirection(actions.LEFT));
leftBtn.addEventListener("click", () => snake.setDirection(actions.LEFT));

rightBtn.addEventListener("touchend", () => snake.setDirection(actions.RIGHT));
rightBtn.addEventListener("click", () => snake.setDirection(actions.RIGHT));

centerBtn.addEventListener("touchend", () => snake.setDirection(actions.ACTION));
centerBtn.addEventListener("click", () => snake.setDirection(actions.ACTION));

const handleGesture = () => {
  const xDiff = Math.abs(touchstartX - touchendX);
  const yDiff = Math.abs(touchstartY - touchendY);

  if(xDiff === 0 && yDiff === 0) {
      snake.setDirection(actions.ACTION);
  }else if (xDiff > yDiff) {
    if (touchendX < touchstartX) snake.setDirection(actions.LEFT);
    if (touchendX > touchstartX) snake.setDirection(actions.RIGHT);
  } else {
    if (touchendY < touchstartY) snake.setDirection(actions.UP);
    if (touchendY > touchstartY) snake.setDirection(actions.DOWN);
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