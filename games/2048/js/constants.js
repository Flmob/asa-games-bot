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
  0: "#FFFFFF",
  2: "#E6D6FF",
  4: "#C7ABF5",
  8: "#B76ED1",
  16: "#7C3795",
  32: "#452C7C",
  64: "#1D2D63",
  128: "#80E352",
  256: "#80B824",
  512: "#D8D116",
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
