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
};

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

const defaultOutline = {
  isPlaying: true,
  width: 0,
  isUp: true,
};
