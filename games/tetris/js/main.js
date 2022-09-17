const canvas = document.getElementById("tetris");

const scoreSpan = document.querySelector(".score");
const restartBtn = document.querySelector(".restart");
const keyboardToggleBtn = document.querySelector(".keyboard-toggle");
const keyboard = document.querySelector(".keyboard");

const upBtn = document.querySelector(".up");
const downBtn = document.querySelector(".down");
const leftBtn = document.querySelector(".left");
const rightBtn = document.querySelector(".right");
const centerBtn = document.querySelector(".center");

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

const onGameOver = (score) => {
  const message = `You've lost! Your score is ${score}.`;

  if (!score) return;

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

const tetris = new Tetris(canvas, { onScoreChange, onGameOver });
tetris.start();

document.addEventListener("keydown", (e) => {
  tetris.setAction(actions[e.key] || "");
});

restartBtn.addEventListener("click", () => {
  const response = confirm("Do you really want to restart?");
  if (response) tetris.start();
});

keyboardToggleBtn.addEventListener("click", () => {
  isKeyboardVisible = !isKeyboardVisible;

  keyboardToggleBtn.classList.toggle("toggled", isKeyboardVisible);
  keyboard.classList.toggle("hidden", !isKeyboardVisible);
});

upBtn.addEventListener("touch", () => tetris.setAction(actions.UP));
upBtn.addEventListener("click", () => tetris.setAction(actions.UP));

downBtn.addEventListener("touch", () => tetris.setAction(actions.DOWN));
downBtn.addEventListener("click", () => tetris.setAction(actions.DOWN));

leftBtn.addEventListener("touch", () => tetris.setAction(actions.LEFT));
leftBtn.addEventListener("click", () => tetris.setAction(actions.LEFT));

rightBtn.addEventListener("touch", () => tetris.setAction(actions.RIGHT));
rightBtn.addEventListener("click", () => tetris.setAction(actions.RIGHT));

centerBtn.addEventListener("touch", () => tetris.setAction(actions.ACTION));
centerBtn.addEventListener("click", () => tetris.setAction(actions.ACTION));

const handleGesture = () => {
  if (isKeyboardVisible) return;

  const xDiff = Math.abs(touchstartX - touchendX);
  const yDiff = Math.abs(touchstartY - touchendY);

  if (xDiff === 0 && yDiff === 0) {
    tetris.setAction(actions.ACTION);
  } else if (xDiff > yDiff) {
    if (touchendX < touchstartX) tetris.setAction(actions.LEFT);
    if (touchendX > touchstartX) tetris.setAction(actions.RIGHT);
  } else {
    if (touchendY < touchstartY) tetris.setAction(actions.UP);
    if (touchendY > touchstartY) tetris.setAction(actions.DOWN);
  }
};

keyboard.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
  touchstartY = e.changedTouches[0].screenY;
});

keyboard.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  touchendY = e.changedTouches[0].screenY;

  handleGesture();
});

canvas.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
  touchstartY = e.changedTouches[0].screenY;
});

canvas.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  touchendY = e.changedTouches[0].screenY;

  handleGesture();
});
