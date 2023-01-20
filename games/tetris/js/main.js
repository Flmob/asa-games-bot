const canvas = document.getElementById("tetris");

const canvasWrapper = document.querySelector(".canvas-wrapper");
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

const tetris = new Tetris(canvas, { onGameOver });

const setCanvasSize = () => {
  setTimeout(() => {
    canvas.height = canvasWrapper.clientHeight;
    canvas.width = canvasWrapper.clientHeight * (450 / 400);

    tetris.setScale();
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

window.addEventListener("resize", setCanvasSize, true);
