const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

const actions = {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
  ArrowLeft: LEFT,
  KeyW: UP,
  KeyD: RIGHT,
  KeyS: DOWN,
  KeyA: LEFT,
};

const backgroundColor = "#FCD9AF";
const defaultTileColor = "#80B824";
const textColor = "#000000";

const tileColors = {
  0: "#FFF5E1",
  2: "#E6D6FF",
  4: "#CCB1F9",
  8: "#E19AF9",
  16: "#B35FD1",
  32: "#8963D8",
  64: "#526CC5",
  128: "#52B0C5",
  256: "#52C5B0",
  512: "#62DD8C",
  1024: "#FFF968",
  2048: "#FFCA63",
  4096: "#FFB423",
  8192: "#FF8023",
  16384: "#FF5912",
};

const defaultOutline = {
  isPlaying: true,
  width: 0,
  isUp: true,
};
const outlineStep = 0.4;

const tilePadding = 4;
