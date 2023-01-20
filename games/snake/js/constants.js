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
  Space: ACTION,
  KeyW: UP,
  KeyD: RIGHT,
  KeyS: DOWN,
  KeyA: LEFT,
};

// for food animation
const maxOutline = 4;
const defaultOutline = {
  width: maxOutline,
  isUp: true,
};

const defaultSnakeSize = 3;

const fps = 9;
const fpsInterval = 1000 / fps;
