const keyboardToggleBtn = document.querySelector(".keyboard-toggle");

const keyboard = document.querySelector(".keyboard");

const upBtn = document.querySelector(".up");
const downBtn = document.querySelector(".down");
const leftBtn = document.querySelector(".left");
const rightBtn = document.querySelector(".right");

let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

document.addEventListener("keyup", (e) => {
  const keyName = e.key;
  moveName = (!moveName && actions[e.key]) || "";
});

let isKeyboardVisible = false;

keyboardToggleBtn.addEventListener("click", () => {
  console.log("click");
  isKeyboardVisible = !isKeyboardVisible;

  keyboardToggleBtn.classList.toggle("toggled", isKeyboardVisible);
  keyboard.classList.toggle("hidden", !isKeyboardVisible);
});

upBtn.addEventListener("touchend", () => (moveName = actions.UP));
upBtn.addEventListener("click", () => (moveName = actions.UP));

downBtn.addEventListener("touchend", () => (moveName = actions.DOWN));
downBtn.addEventListener("click", () => (moveName = actions.DOWN));

leftBtn.addEventListener("touchend", () => (moveName = actions.LEFT));
leftBtn.addEventListener("click", () => (moveName = actions.LEFT));

rightBtn.addEventListener("touchend", () => (moveName = actions.RIGHT));
rightBtn.addEventListener("click", () => (moveName = actions.RIGHT));

const handleGesture = () => {
  const xDiff = Math.abs(touchstartX - touchendX);
  const yDiff = Math.abs(touchstartY - touchendY);

  if (xDiff > yDiff) {
    if (touchendX < touchstartX) moveName = actions.LEFT;
    if (touchendX > touchstartX) moveName = actions.RIGHT;
  } else {
    if (touchendY < touchstartY) moveName = actions.UP;
    if (touchendY > touchstartY) moveName = actions.DOWN;
  }
};

document.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
  touchstartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  touchendY = e.changedTouches[0].screenY;

  handleGesture();
});
