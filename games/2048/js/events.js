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

const modal = document.querySelector(".modal-backdrop");
const modalBody = document.querySelector(".modal-body");
const modalRestart = document.querySelector(".modal-action.restart");
const modalCancel = document.querySelector(".modal-action.cancel");
const modalSubmit = document.querySelector(".modal-action.submit");

const url = new URL(location.href);
const params = Object.fromEntries(url.searchParams);
let lastSavedScore = 0;

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

let isKeyboardVisible = false;

const setLoadingState = (isLoading = false) => {
  if (isLoading) loadingIndicator.classList.remove("hidden");
  else loadingIndicator.classList.add("hidden");
};

const saveScore = (score = 0) => {
  setLoadingState(true);

  if (!score || lastSavedScore > score) {
    return Promise.resolve().then(() => setLoadingState(false));
  }

  return fetch("/setscore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, score }),
  })
    .then((res) => {
      lastSavedScore = score;
      setLoadingState(false);
    })
    .catch((err) => {
      setLoadingState(false);
      throw err;
    });
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
  const scoreComment = score <= 100 ? " Are you serious?" : "";
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

  saveScore(score)
    .then(() => {
      resultMessage = `${message}${scoreComment}${scoreSaved}`;
    })
    .catch(() => {
      resultMessage = `${message}${scoreComment}${errorMessageEnding}`;
    })
    .finally(() => {
      modalBody.innerHTML = resultMessage;
    });
};

const onGameWin = (score) => {
  saveScore(score);

  const message = `You've won! Your score is ${score}.`;

  modalBody.innerHTML = message;
  modalCancel.classList.add("hidden");
  modalSubmit.onclick = () => {
    modal.classList.add("closed");
  };
  modal.classList.remove("closed");
};

const game2048 = new Game2048(
  canvas,
  {
    onScoreChange,
    onGameOver,
    onGameWin,
  },
  { fieldSize: params.extended && 5 }
);

const setCanvasSize = () => {
  // fix for android horizontal page bug
  canvas.width = canvas.height = 0;

  setTimeout(() => {
    const { clientHeight, clientWidth } = canvasWrapper;

    canvas.width = clientWidth - 2;
    canvas.height = clientHeight - 2;

    game2048.setScale(true);
  }, 50);
};

setCanvasSize();
game2048.start();

document.addEventListener("keyup", (e) => {
  game2048.setDirection(actions[e.code] || "");
});

modalRestart.addEventListener("click", () => {
  modal.classList.add("closed");
  game2048.start();
});

restartBtn.addEventListener("click", () => {
  const message = "Do you really want to restart?";
  modalBody.innerHTML = message;

  modalRestart.classList.add("hidden");
  modalCancel.classList.remove("hidden");
  modal.classList.remove("closed");

  modalSubmit.onclick = () => {
    saveScore(game2048.score);
    modal.classList.add("closed");
    game2048.start();
  };
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
  if (isKeyboardVisible) return;

  const xDiff = Math.abs(touchStartX - touchEndX);
  const yDiff = Math.abs(touchStartY - touchEndY);

  if (xDiff > yDiff) {
    if (touchEndX < touchStartX) game2048.setDirection(actions.LEFT);
    if (touchEndX > touchStartX) game2048.setDirection(actions.RIGHT);
  } else {
    if (touchEndY < touchStartY) game2048.setDirection(actions.UP);
    if (touchEndY > touchStartY) game2048.setDirection(actions.DOWN);
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
    e.preventDefault();

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
