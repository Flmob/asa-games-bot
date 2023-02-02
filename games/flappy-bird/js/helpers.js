const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
Checks if there is a collision between circle and rect
* @param {object} circle 
* @param {number} circle.x x of circle center
* @param {number} circle.y y of circle center
* @param {number} circle.r radius of circle
* @param {object} rect
* @param {number} rect.x x of rect top left corner
* @param {number} rect.y y of rect top left corner
* @param {number} rect.w width of rect
* @param {number} rect.h height of rect
*/
function isRectCircleCollision(circle, rect) {
  var distX = Math.abs(circle.x - rect.x - rect.w / 2);
  var distY = Math.abs(circle.y - rect.y - rect.h / 2);

  if (distX > rect.w / 2 + circle.r) {
    return false;
  }
  if (distY > rect.h / 2 + circle.r) {
    return false;
  }

  if (distX <= rect.w / 2) {
    return true;
  }
  if (distY <= rect.h / 2) {
    return true;
  }

  var dx = distX - rect.w / 2;
  var dy = distY - rect.h / 2;
  return dx * dx + dy * dy <= circle.r * circle.r;
}
