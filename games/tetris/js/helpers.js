const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const drawSquare = ({
  ctx,
  x,
  y,
  color,
  squareSize = 20,
  marginX = 0,
  marginY = 0,
}) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * squareSize + marginX,
    y * squareSize + marginY,
    squareSize,
    squareSize
  );
  ctx.strokeStyle = "black";
  ctx.strokeRect(
    x * squareSize + marginX,
    y * squareSize + marginY,
    squareSize,
    squareSize
  );
};
