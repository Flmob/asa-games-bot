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
