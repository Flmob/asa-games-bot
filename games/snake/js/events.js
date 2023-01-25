const canvas = document.querySelector("#canvas");

const canvasWrapper = document.querySelector(".canvas-wrapper");
const loadingIndicator = document.querySelector(".loading");
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

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

let isKeyboardVisible = false;

const setLoadingState = (isLoading = false) => {
  if (isLoading) loadingIndicator.classList.remove("hidden");
  else loadingIndicator.classList.add("hidden");
};

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

  setLoadingState(true);
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
      setLoadingState(false);
    });
};

const snake = new Snake(canvas, { onScoreChange, onGameOver });

const setCanvasSize = () => {
  // fix for android horizontal page bug
  canvas.width = canvas.height = 0;

  setTimeout(() => {
    const { clientHeight, clientWidth } = canvasWrapper;

    canvas.width = clientWidth - 2;
    canvas.height = clientHeight - 2;

    snake.setScale(true);
  }, 50);
};

setCanvasSize();
snake.start();

document.addEventListener("keyup", (e) => {
  snake.setDirection(actions[e.code] || "");
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

  const xDiff = Math.abs(touchStartX - touchEndX);
  const yDiff = Math.abs(touchStartY - touchEndY);

  if (xDiff === 0 && yDiff === 0) {
    snake.setDirection(actions.ACTION);
  } else if (xDiff > yDiff) {
    if (touchEndX < touchStartX) snake.setDirection(actions.LEFT);
    if (touchEndX > touchStartX) snake.setDirection(actions.RIGHT);
  } else {
    if (touchEndY < touchStartY) snake.setDirection(actions.UP);
    if (touchEndY > touchStartY) snake.setDirection(actions.DOWN);
  }
};

const startGesture = (e) => {
  if (e.changedTouches) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  } else {
    touchStartX = e.screenX;
    touchStartY = e.screenY;
  }
};

const endGesture = (e) => {
  if (e.changedTouches) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
  } else {
    touchEndX = e.screenX;
    touchEndY = e.screenY;
  }

  handleGesture();
};

keyboard.addEventListener("touchstart", startGesture);
keyboard.addEventListener("touchend", endGesture);

keyboard.addEventListener("mousedown", startGesture);
keyboard.addEventListener("mouseup", endGesture);

canvas.addEventListener("touchstart", startGesture);
canvas.addEventListener("touchend", endGesture);

canvas.addEventListener("mousedown", startGesture);
canvas.addEventListener("mouseup", endGesture);

window.addEventListener("resize", setCanvasSize, true);
