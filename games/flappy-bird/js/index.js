const canvas = document.querySelector("canvas");

const flappyBird = new FlappyBird(canvas, {});

document.addEventListener("keypress", (e) => {
  keys[e.code] && flappyBird.onAction();
});

canvas.addEventListener("click", flappyBird.onAction);
canvas.addEventListener("touchend", flappyBird.onAction);

flappyBird.start();
