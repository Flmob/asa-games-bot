const canvas = document.querySelector("canvas");

const url = new URL(location.href);
const params = Object.fromEntries(url.searchParams);

const onGameEnd = (score) => {
  const message = `You've lost! Your score is ${score}.`;

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
    });
};

const flappyBird = new FlappyBird(canvas, { onGameEnd });

document.addEventListener("keypress", (e) => {
  keys[e.code] && flappyBird.onAction();
});

canvas.addEventListener("click", flappyBird.onAction);
canvas.addEventListener("touchend", flappyBird.onAction);

flappyBird.start();
