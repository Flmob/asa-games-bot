const canvas = document.getElementById("tetris");

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
  const message = `You've lost! Your score is ${score}.`;
  const errorMessageEnding = "\nSorry, couldn't save your new score.";
  let resultMessage = "";

  if (!score) return;

  fetch("/setscore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, score }),
  })
    .then((res) => {
      resultMessage = message;
    })
    .catch((err) => {
      resultMessage = message + errorMessageEnding;
    })
    .finally(() => {
      modalBody.innerHTML = resultMessage;
      modalCancel.classList.add("hidden");
      modalSubmit.onclick = () => {
        modal.classList.add("closed");
      };
      modal.classList.remove("closed");
    });
};

const tetris = new Tetris(canvas, { onScoreChange, onGameOver });

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
  tetris.setAction(actions[e.key] || "");
});

restartBtn.addEventListener("click", () => {
  const message = "Do you really want to restart?";

  modalBody.innerHTML = message;
  modalCancel.classList.remove("hidden");
  modalSubmit.onclick = () => {
    modal.classList.add("closed");
    tetris.start();
  };
  modal.classList.remove("closed");
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
