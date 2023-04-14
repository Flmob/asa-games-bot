const wrapper = document.querySelector(".wrapper");
const canvasWrapper = document.querySelector(".canvas-wrapper");
const backgroundCanvas = document.querySelector(".canvas.background");
const mainCanvas = document.querySelector(".canvas.main");

const pausedIndicator = document.querySelector(".paused");
const loadingIndicator = document.querySelector(".loading");
const scoreSpan = document.querySelector(".score");
const pauseBtn = document.querySelector(".pause");
const restartBtn = document.querySelector(".restart");

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

const onIsPausedChange = (isPaused = false) => {
  if (isPaused) {
    pausedIndicator.classList.remove("hidden");
    pauseBtn.innerHTML = "Play";
  } else {
    pausedIndicator.classList.add("hidden");
    pauseBtn.innerHTML = "Pause";
  }
};

const onScoreChange = (score) => {
  scoreSpan.innerHTML = score;
};

const onGameOver = (score) => {
  if (!score && score !== 0) return;

  const message = `You've lost! Your score is ${score}.`;
  const scoreComment = score <= 1000 ? " Are you serious?" : "";
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

const t2048 = new T2048(
  { mainCanvas, backgroundCanvas },
  { onIsPausedChange, onScoreChange, onGameOver }
);

modalCancel.addEventListener("click", (e) => {
  e.stopPropagation();
  t2048.setAction(actions.ACTION);
  modal.classList.add("closed");
});
modalCancel.addEventListener("touchend", (e) => {
  e.stopPropagation();
  e.preventDefault();
  t2048.setAction(actions.ACTION);
  modal.classList.add("closed");
});

const onWrapperClick = (e) => {
  e.preventDefault();

  let x = 0;

  if (e.type === "touchend") {
    x = e.changedTouches[0].screenX;
  } else {
    x = e.screenX;
  }

  if (x <= e.target.offsetWidth / 2) {
    t2048.setAction(actions.LEFT);
  } else {
    t2048.setAction(actions.RIGHT);
  }
};

modalRestart.addEventListener("click", () => {
  modal.classList.add("closed");
  t2048.start();
});
modalRestart.addEventListener("touchend", (e) => {
  e.preventDefault();
  modal.classList.add("closed");
  t2048.start();
});

pauseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  t2048.setAction(actions.ACTION);
});
pauseBtn.addEventListener("touchend", (e) => {
  e.stopPropagation();
  e.preventDefault();
  t2048.setAction(actions.ACTION);
});

const openRestartModal = () => {
  t2048.setAction(actions.ACTION);

  const message = "Do you really want to restart?";
  modalBody.innerHTML = message;

  modalRestart.classList.add("hidden");
  modalCancel.classList.remove("hidden");
  modal.classList.remove("closed");

  modalSubmit.onclick = modalSubmit.ontouchend = (e) => {
    e.stopPropagation();
    e.preventDefault();
    saveScore(t2048.score);
    modal.classList.add("closed");
    t2048.start();
  };
};

restartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openRestartModal();
});
restartBtn.addEventListener("touchend", (e) => {
  e.stopPropagation();
  openRestartModal();
});

wrapper.addEventListener("click", onWrapperClick);
wrapper.addEventListener("touchend", onWrapperClick);

const setCanvasSize = () => {
  // fix for android horizontal page bug
  backgroundCanvas.width = backgroundCanvas.height = 0;
  backgroundCanvas.style.width = backgroundCanvas.style.height = 0;

  mainCanvas.width = mainCanvas.height = 0;
  mainCanvas.style.width = mainCanvas.style.height = 0;

  setTimeout(() => {
    const { clientHeight, clientWidth } = canvasWrapper;

    let [canvasHeight, canvasWidth] = [clientHeight, clientWidth];

    if (clientHeight > clientWidth) {
      canvasHeight = (clientWidth / 2) * 3;
    } else {
      canvasWidth = (clientHeight / 3) * 2;
    }

    backgroundCanvas.width = canvasWidth;
    backgroundCanvas.height = canvasHeight;
    backgroundCanvas.style.width = `${canvasWidth}px`;
    backgroundCanvas.style.height = `${canvasHeight}px`;

    mainCanvas.width = canvasWidth;
    mainCanvas.height = canvasHeight;
    mainCanvas.style.width = `${canvasWidth}px`;
    mainCanvas.style.height = `${canvasHeight}px`;

    t2048.setScale(true);
  }, 50);
};

setCanvasSize();
t2048.start();

document.addEventListener("keydown", (e) => {
  t2048.setAction(actions[e.code] || "");
});

window.addEventListener("resize", setCanvasSize, true);
