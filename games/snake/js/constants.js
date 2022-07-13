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

const maxOutline = 4;
const defaultOutline = {
  width: maxOutline,
  isUp: true,
};