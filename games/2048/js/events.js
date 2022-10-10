const canvas = document.querySelector("#canvas");

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

const onGameWin = (score) => {
  const message = `You've won! Your score is ${score}.`;

  modalBody.innerHTML = message;
  modalCancel.classList.add("hidden");
  modalSubmit.onclick = () => {
    modal.classList.add("closed");
  };
  modal.classList.remove("closed");
};

const game2048 = new Game2048(canvas, {
  onScoreChange,
  onGameOver,
  onGameWin,
});

game2048.start();

document.addEventListener("keyup", (e) => {
  game2048.setDirection(actions[e.key] || "");
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
