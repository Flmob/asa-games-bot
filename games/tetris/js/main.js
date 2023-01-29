const canvas = document.getElementById("tetris");

const canvasWrapper = document.querySelector(".canvas-wrapper");
const pausedIndicator = document.querySelector(".paused");
const loadingIndicator = document.querySelector(".loading");
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

const onIsPausedChange = (isPaused = false) => {
  if (isPaused) pausedIndicator.classList.remove("hidden");
  else pausedIndicator.classList.add("hidden");
};

const onGameOver = (score) => {
  if (!score && score !== 0) return;

  const message = `You've lost! Your score is ${score}.`;
  const scoreComment = score <= 10 ? " Are you serious?" : "";
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

const tetris = new Tetris(canvas, { onIsPausedChange, onGameOver });

const setCanvasSize = () => {
  // fix for android horizontal page bug
  canvas.width = canvas.height = 0;

  setTimeout(() => {
    const { clientHeight, clientWidth } = canvasWrapper;

    canvas.width = clientWidth - 2;
    canvas.height = clientHeight - 2;

    tetris.setScale(true);
  }, 50);
};

setCanvasSize();
tetris.start();

document.addEventListener("keydown", (e) => {
  tetris.setAction(actions[e.code] || "");
});

modalRestart.addEventListener("click", () => {
  modal.classList.add("closed");
  tetris.start();
});

restartBtn.addEventListener("click", () => {
  const message = "Do you really want to restart?";
  modalBody.innerHTML = message;

  modalRestart.classList.add("hidden");
  modalCancel.classList.remove("hidden");
  modal.classList.remove("closed");

  modalSubmit.onclick = () => {
    saveScore(tetris.score);
    modal.classList.add("closed");
    tetris.start();
  };
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

  const xDiff = Math.abs(touchStartX - touchEndX);
  const yDiff = Math.abs(touchStartY - touchEndY);

  if (xDiff === 0 && yDiff === 0) {
    tetris.setAction(actions.ACTION);
  } else if (xDiff > yDiff) {
    if (touchEndX < touchStartX) tetris.setAction(actions.LEFT);
    if (touchEndX > touchStartX) tetris.setAction(actions.RIGHT);
  } else {
    if (touchEndY < touchStartY) tetris.setAction(actions.UP);
    if (touchEndY > touchStartY) tetris.setAction(actions.DOWN);
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
