const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";
const ACTION = "action";

const actions = {
  ACTION,
  UP,
  RIGHT,
  DOWN,
  LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
  ArrowLeft: LEFT,
  " ": ACTION,
};

const pieces = [
  [Z, "red"],
  [S, "green"],
  [T, "yellow"],
  [O, "blue"],
  [L, "purple"],
  [I, "cyan"],
  [J, "orange"],
];

squareSize = 20;
rowsCount = 20;
columnsCount = 10;
vacantColor = "lightgrey";
