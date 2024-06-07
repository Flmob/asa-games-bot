const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const updateTileOutline = (tile, outlineStep = 0.4) => {
  if (tile.outline.isUp) {
    tile.outline.width += outlineStep;

    if (tile.outline.width >= maxOutline) {
      tile.outline.width = maxOutline;
      tile.outline.isUp = false;
    }
  } else {
    tile.outline.width -= outlineStep;

    if (tile.outline.width <= 0) {
      tile.outline.width = 0;
      tile.outline.isUp = true;

      tile.outline.isPlaying = false;
    }
  }

  return tile;
};

const drawCircle = ({
  ctx,
  x = 0,
  y = 0,
  radius = 0,
  fillStyle,
  strokeStyle,
  strokeWidth = 1,
}) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  if (strokeStyle) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }

  ctx.closePath();
};
