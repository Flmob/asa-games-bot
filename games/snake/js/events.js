const canvas = document.querySelector("#canvas");

const canvasWrapper = document.querySelector(".canvas-wrapper");
const scoreSpan = document.querySelector(".score");
const restartBtn = document.querySelector(".restart");
const keyboardToggleBtn = document.querySelector(".keyboard-toggle");
const keyboard = document.querySelector(".keyboard");

const upBtn = document.querySelector(".up");
const downBtn = document.querySelector(".down");
const leftBtn = document.querySelector(".left");
const rightBtn = document.querySelector(".right");
const centerBtn = document.querySelector(".center");

const modal = document.querySelector(".modal-backdrop");
const modalBody = document.querySelector(".modal-body");
const modalRestart = document.querySelector(".modal-action.restart");
const modalCancel = document.querySelector(".modal-action.cancel");
const modalSubmit = document.querySelector(".modal-action.submit");

const url = new URL(location.href);
const params = Object.fromEntries(url.searchParams);

let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

let isKeyboardVisible = false;

modalCancel.onclick = () => {
  modal.classList.add("closed");
};

const onScoreChange = (score) => {
  scoreSpan.innerHTML = score;
};

const onGameOver = (score) => {
  if (!score && score !== 0) return;

  const message = `You've lost! Your score is ${score}.`;
  const scoreComment = score <= 5 ? " Are you serious?" : "";
  const scoreSending = "\nSaving your score. Please, wait...";
  const scoreSaved = "\nYour score was saved.";
  const errorMessageEnding = "\nSorry, couldn't save your new score.";

  let resultMessage = `${message}${scoreComment}${scoreSending}`;
  modalBody.innerHTML = resultMessage;

  modalRestart.classList.remove("hidden");
  modalCancel.classList.add("hidden");
  modal.classList.remove("closed");

  modalSubmit.onclick = () => {
    modal.classList.add("closed");
  };

  fetch("/setscore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, score }),
  })
    .then((res) => {
      resultMessage = `${message}${scoreComment}${scoreSaved}`;
    })
    .catch((err) => {
      resultMessage = `${message}${scoreComment}${errorMessageEnding}`;
    })
    .finally(() => {
      modalBody.innerHTML = resultMessage;
    });
};

const snake = new Snake(canvas, { onScoreChange, onGameOver });

const setCanvasSize = () => {
  setTimeout(() => {
    canvas.width = canvasWrapper.clientWidth - 2;
    canvas.height = canvasWrapper.clientWidth * 0.5 - 2;

    snake.setScale();
  }, 50);
};

snake.start();
setCanvasSize();

document.addEventListener("keyup", (e) => {
  snake.setDirection(actions[e.key] || "");
});

modalRestart.addEventListener("click", () => {
  modal.classList.add("closed");
  snake.start();
});

restartBtn.addEventListener("click", () => {
  const message = "Do you really want to restart?";
  modalBody.innerHTML = message;

  modalRestart.classList.add("hidden");
  modalCancel.classList.remove("hidden");
  modal.classList.remove("closed");

  modalSubmit.onclick = () => {
    modal.classList.add("closed");
    snake.start();
  };
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

centerBtn.addEventListener("touchend", () =>
  snake.setDirection(actions.ACTION)
);
centerBtn.addEventListener("click", () => snake.setDirection(actions.ACTION));

const handleGesture = () => {
  if (isKeyboardVisible) return;

  const xDiff = Math.abs(touchstartX - touchendX);
  const yDiff = Math.abs(touchstartY - touchendY);

  if (xDiff === 0 && yDiff === 0) {
    snake.setDirection(actions.ACTION);
  } else if (xDiff > yDiff) {
    if (touchendX < touchstartX) snake.setDirection(actions.LEFT);
    if (touchendX > touchstartX) snake.setDirection(actions.RIGHT);
  } else {
    if (touchendY < touchstartY) snake.setDirection(actions.UP);
    if (touchendY > touchstartY) snake.setDirection(actions.DOWN);
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

window.addEventListener("resize", setCanvasSize, true);
