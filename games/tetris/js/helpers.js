const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const drawSquare = (ctx, x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
};
