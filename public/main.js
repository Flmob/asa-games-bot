const canvas = document.querySelector("#canv");
const ctx = canvas.getContext("2d");

const scoreSpan = document.querySelector('.score');

const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

let score = 0;
const defaultOutline = {
  isPlaying: true,
  width: 0,
  isUp: true,
};
const outlineStep = 0.4;
const fieldSize = 4;
const tileColors = {
  0: "rgb(205,192,179)",
  2: "rgb(237,228,218)",
  4: "rgb(237,224,200)",
  8: "rgb(242,177,120)",
  16: "rgb(245,150,98)",
  32: "rgb(246,125,95)",
  64: "rgb(246,94,58)",
  128: "rgb(237,207,113)",
  256: "rgb(238,204,97)",
  512: "rgb(238,204,97)",
  1024: "",
  2048: "",
};
let moveName = ""; //up, down, left, right
const actions = {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
  ArrowLeft: LEFT,
};
let isNewTileNeeded = false;

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(x, y, width, height, fill, radius = 5, stroke = true) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const updateTileOutline = (tile) => {
  if (!tile.outline.isPlaying) return tile;

  if (tile.outline.isUp) {
    tile.outline.width += outlineStep;

    if (tile.outline.width >= 4) {
      tile.outline.width = 4;
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

const field = new Array(fieldSize)
  .fill(0)
  .map(() => new Array(fieldSize).fill(undefined));

const tileSize = Math.min(
  canvas.clientHeight / fieldSize,
  canvas.clientWidth / fieldSize
);

const getEmptyTiles = () => {
  const emptyTiles = [];

  field.forEach((line, y) => {
    line.forEach((tile, x) => {
      if (!tile) emptyTiles.push({ x, y });
    });
  });

  return emptyTiles;
};

const addRandomTile = () => {
  const value = Math.random() > 0.1 ? 2 : 4;

  const emptyTiles = getEmptyTiles();
  const randomIndex = getRandomInt(0, emptyTiles.length - 1);

  const { x, y } = emptyTiles[randomIndex];

  field[y][x] = { value, x, y, outline: { ...defaultOutline } };
};

const drawTile = (tile = 0, x, y, outline = 0) => {
  ctx.strokeStyle = tileColors[tile] || "rgb(238,204,97)";
  ctx.fillStyle = tileColors[tile] || "rgb(238,204,97)";
  roundRect(
    x + 4 - outline,
    y + 4 - outline,
    tileSize - 8 + outline * 2,
    tileSize - 8 + outline * 2,
    true
  );

  if (tile) {
    const textX = x + tileSize / 2;
    const textY = y + tileSize / 2 + 10;
    ctx.font = `${tileSize/5}pt Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgb(119,110,101)";
    ctx.fillText(tile, textX, textY);
  }
};

const moveTiles = (direction) => {
  let moved = false;

  const moveUp = () => {
    for (let x = 0; x < fieldSize; x++) {
      moved = true;

      while (moved) {
        moved = false;

        for (let y = 1; y < fieldSize; y++) {
          const currentTile = field[y][x];
          const targetTile = field[y - 1][x];

          if (currentTile) {
            if (!targetTile) {
              field[y - 1][x] = {
                ...currentTile,
                outline: { ...defaultOutline, isPlaying: false },
                x,
                y: y - 1,
              };
              field[y][x] = undefined;

              moved = true;
              isNewTileNeeded = true;
            } else if (field[y - 1][x].value === field[y][x].value) {
              const value = currentTile.value * 2;

              field[y - 1][x] = {
                ...currentTile,
                outline: { ...defaultOutline },
                value,
                x,
                y: y - 1,
              };
              field[y][x] = undefined;

              score += value;
              moved = true;
              isNewTileNeeded = true;
            }
          }
        }
      }
    }
  };
  const moveDown = () => {
    for (let x = 0; x < fieldSize; x++) {
      moved = true;

      while (moved) {
        moved = false;

        for (let y = fieldSize - 2; y >= 0; y--) {
          const currentTile = field[y][x];
          const targetTile = field[y + 1][x];

          if (currentTile) {
            if (!targetTile) {
              field[y + 1][x] = {
                ...currentTile,
                outline: { ...defaultOutline, isPlaying: false },
                x,
                y: y + 1,
              };
              field[y][x] = undefined;

              moved = true;
              isNewTileNeeded = true;
            } else if (field[y + 1][x].value === field[y][x].value) {
              const value = currentTile.value * 2;

              field[y + 1][x] = {
                ...currentTile,
                outline: { ...defaultOutline },
                value,
                x,
                y: y + 1,
              };
              field[y][x] = undefined;

              score += value;
              moved = true;
              isNewTileNeeded = true;
            }
          }
        }
      }
    }
  };
  const moveLeft = () => {
    for (let y = 0; y < fieldSize; y++) {
      moved = true;

      while (moved) {
        moved = false;

        for (let x = 1; x < fieldSize; x++) {
          const currentTile = field[y][x];
          const targetTile = field[y][x - 1];

          if (currentTile) {
            if (!targetTile) {
              field[y][x - 1] = {
                ...currentTile,
                outline: { ...defaultOutline, isPlaying: false },
                x: x - 1,
                y,
              };
              field[y][x] = undefined;

              moved = true;
              isNewTileNeeded = true;
            } else if (field[y][x - 1].value === field[y][x].value) {
              const value = currentTile.value * 2;

              field[y][x - 1] = {
                ...currentTile,
                outline: { ...defaultOutline },
                value,
                x: x - 1,
                y,
              };
              field[y][x] = undefined;

              score += value;
              moved = true;
              isNewTileNeeded = true;
            }
          }
        }
      }
    }
  };
  const moveRight = () => {
    for (let y = 0; y < fieldSize; y++) {
      moved = true;

      while (moved) {
        moved = false;

        for (let x = fieldSize - 2; x >= 0; x--) {
          const currentTile = field[y][x];
          const targetTile = field[y][x + 1];

          if (currentTile) {
            if (!targetTile) {
              field[y][x + 1] = {
                ...currentTile,
                outline: { ...defaultOutline, isPlaying: false },
                x: x + 1,
                y,
              };
              field[y][x] = undefined;

              moved = true;
              isNewTileNeeded = true;
            } else if (field[y][x + 1].value === field[y][x].value) {
              const value = currentTile.value * 2;

              field[y][x + 1] = {
                ...currentTile,
                outline: { ...defaultOutline },
                value,
                x: x + 1,
                y,
              };
              field[y][x] = undefined;

              score += value;
              moved = true;
              isNewTileNeeded = true;
            }
          }
        }
      }
    }
  };

  switch (direction) {
    case UP:
      moveUp();
      break;
    case DOWN:
      moveDown();
      break;
    case LEFT:
      moveLeft();
      break;
    case RIGHT:
      moveRight();
      break;
  }
};

const calc = () => {
  if (moveName) {
    moveTiles(moveName);
    moveName = "";

    if (isNewTileNeeded) {
      addRandomTile();
      isNewTileNeeded = false;
    }
  }

  field.forEach((line, y) => {
    line.forEach((tile, x) => {
      field[y][x] = tile ? updateTileOutline(tile) : tile;
    });
  });
};

const draw = () => {
  ctx.fillStyle = "rgb(187,173,159)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  field.forEach((line, y) => {
    line.forEach((tile, x) => {
      drawTile(tile?.value, x * tileSize, y * tileSize, tile?.outline.width);
    });
  });

  scoreSpan.innerHTML = score;
};

const step = () => {
  calc();
  draw();
};

const animate = () => {
  step();

  requestAnimationFrame(animate);
};

addRandomTile();
addRandomTile();
animate();
