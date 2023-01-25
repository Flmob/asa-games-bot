const canvas = document.querySelector("canvas");
const loadingIndicator = document.querySelector(".loading");

const url = new URL(location.href);
const params = Object.fromEntries(url.searchParams);

const setLoadingState = (isLoading = false) => {
  if (isLoading) loadingIndicator.classList.remove("hidden");
  else loadingIndicator.classList.add("hidden");
};

const onGameOver = (score) => {
  const message = `You've lost! Your score is ${score}.`;

  if (!score) return;

  setLoadingState(true);
  fetch("/setscore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, score }),
  })
    .then((res) => {
      console.log(message);
    })
    .catch((err) => {
      console.log(`${message}\nSorry, couldn't save your new score`);
    })
    .finally(() => {
      setLoadingState(false);
    });
};

const flappyBird = new FlappyBird(canvas, { onGameOver });

document.addEventListener("keypress", (e) => {
  keys[e.code] && flappyBird.onAction();
});

document.addEventListener("click", flappyBird.onAction);
document.addEventListener("touchend", flappyBird.onAction);

flappyBird.start();
