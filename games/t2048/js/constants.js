const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";
const ACTION = "action";

const actions = {
  ACTION,
  RIGHT,
  DOWN,
  LEFT,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
  ArrowLeft: LEFT,
  Space: ACTION,
  KeyD: RIGHT,
  KeyS: DOWN,
  KeyA: LEFT,
};

const directions = {
  UP,
  RIGHT,
  DOWN,
  LEFT,
};

const rowsCount = 10;
const columnsCount = 6;
const endGameRow = 2;
const fpsInterval = 1000/60;
const defaultTileSpeed = 6;
const tileSlideSpeed = 1.5;

const backgroundColor = "black";
const defaultTileColor = "rgb(238,204,97)";
const textColor = "rgb(119,110,101)";

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
  1024: "rgb(238,204,97)",
  2048: "rgb(238,204,97)",
};

const defaultOutline = {
  isPlaying: false,
  width: 0,
  isUp: true,
};
const outlineStep = 0.5;
const maxOutline = 4;

const tilePadding = 5;
