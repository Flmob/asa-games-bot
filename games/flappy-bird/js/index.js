const canvasWrapper = document.querySelector(".canvas_wrapper");
const muteButton = document.querySelector(".mute_btn");
const volumeIcon = document.querySelector(".volume-icon");
const volumeMutedIcon = document.querySelector(".volume-muted-icon");
const canvas = document.querySelector("canvas");
const loadingIndicator = document.querySelector(".loading");

const url = new URL(location.href);
const params = Object.fromEntries(url.searchParams);
let lastSavedScore = 0;

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

const onGameOver = (score) => {
  if (!score && score !== 0) return;

  const message = `You've lost! Your score is ${score}.`;

  saveScore(score)
    .then(() => {
      console.log(message);
    })
    .catch(() => {
      console.log(`${message}\nSorry, couldn't save your new score`);
    });
};

volumeMutedIcon.style.display = "none";
const onIsMutedChanged = (isMuted = false) => {
  if (isMuted) {
    volumeIcon.style.display = "none";
    volumeMutedIcon.style.display = "inline";
  } else {
    volumeIcon.style.display = "inline";
    volumeMutedIcon.style.display = "none";
  }
};

const flappyBird = new FlappyBird(canvas, { onGameOver, onIsMutedChanged });

muteButton.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  flappyBird.toggleIsMuted();
});
muteButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  e.stopPropagation();
  flappyBird.toggleIsMuted();
});
muteButton.addEventListener("touchend", (e) => e.preventDefault());

document.addEventListener("keypress", (e) => {
  keys[e.code] && flappyBird.onAction();

  e.code === "KeyM" && flappyBird.toggleIsMuted();
});

document.addEventListener("click", flappyBird.onAction);
document.addEventListener("touchstart", flappyBird.onAction);
document.addEventListener("touchend", (e) => e.preventDefault());

flappyBird.start();
