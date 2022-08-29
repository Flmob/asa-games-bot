const canvas = document.querySelector("#canvas");

const scoreSpan = document.querySelector(".score");
const restartBtn = document.querySelector(".restart");
const keyboardToggleBtn = document.querySelector(".keyboard-toggle");
const keyboard = document.querySelector(".keyboard");

const upBtn = document.querySelector(".up");
const downBtn = document.querySelector(".down");
const leftBtn = document.querySelector(".left");
const rightBtn = document.querySelector(".right");

const url = new URL(location.href);
const params = Object.fromEntries(url.searchParams);

let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

let isKeyboardVisible = false;

const onScoreChange = (score) => {
  scoreSpan.innerHTML = score;
};

const onGameEnd = (score) => {
  const message = `You've lost! Your score is ${score}.`;

  fetch("/setscore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, score }),
  })
    .then((res) => {
      alert(message);
    })
    .catch((err) => {
      alert(`${message}\nSorry, couldn't save your new score`);
    });
};

const onGameWin = (score) => {
  const message = `You've won! Your score is ${score}.`;

  alert(message);
};

const game2048 = new Game2048(canvas, {
  onScoreChange,
  onGameEnd,
  onGameWin,
});

game2048.start();

document.addEventListener("keyup", (e) => {
  game2048.setDirection(actions[e.key] || "");
});

restartBtn.addEventListener("click", () => {
  const response = confirm("Do you really want to restart?");
  if (response) game2048.start();
});

keyboardToggleBtn.addEventListener("click", () => {
  isKeyboardVisible = !isKeyboardVisible;

  keyboardToggleBtn.classList.toggle("toggled", isKeyboardVisible);
  keyboard.classList.toggle("hidden", !isKeyboardVisible);
});

upBtn.addEventListener("touchend", () => game2048.setDirection(actions.UP));
upBtn.addEventListener("click", () => game2048.setDirection(actions.UP));

downBtn.addEventListener("touchend", () => game2048.setDirection(actions.DOWN));
downBtn.addEventListener("click", () => game2048.setDirection(actions.DOWN));

leftBtn.addEventListener("touchend", () => game2048.setDirection(actions.LEFT));
leftBtn.addEventListener("click", () => game2048.setDirection(actions.LEFT));

rightBtn.addEventListener("touchend", () =>
  game2048.setDirection(actions.RIGHT)
);
rightBtn.addEventListener("click", () => game2048.setDirection(actions.RIGHT));

const handleGesture = () => {
  const xDiff = Math.abs(touchstartX - touchendX);
  const yDiff = Math.abs(touchstartY - touchendY);

  if (xDiff > yDiff) {
    if (touchendX < touchstartX) game2048.setDirection(actions.LEFT);
    if (touchendX > touchstartX) game2048.setDirection(actions.RIGHT);
  } else {
    if (touchendY < touchstartY) game2048.setDirection(actions.UP);
    if (touchendY > touchstartY) game2048.setDirection(actions.DOWN);
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
