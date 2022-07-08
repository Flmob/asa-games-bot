class Sprite {
  constructor(context, filename, onReadyClb, spriteParams = null) {
    if (!context || !filename) throw new Error("No context or filename");
    if (
      spriteParams &&
      (typeof spriteParams.sx === "undefined" ||
        typeof spriteParams.sy === "undefined" ||
        typeof spriteParams.sw === "undefined" ||
        typeof spriteParams.sh === "undefined")
    ) {
      throw new Error("Sprite params data missing (sx, sy, sw or sh)");
    }

    this.sObj = spriteParams;
    this.image = new Image();
    this.image.src = filename;
    this.image.onload = (data) => {
      onReadyClb(this);
    };
    this.context = context;

    this.TO_RADIANS = Math.PI / 180;

    this.draw = this.sObj
      ? (x, y, w, h) => {
          h = h || w;
          const { sy, sx, sw, sh } = this.sObj;
          this.context.drawImage(this.image, sx, sy, sw, sh, x, y, w, h);
        }
      : (x, y, w, h) => {
          h = h || w;
          this.context.drawImage(
            this.image,
            x,
            y,
            w || this.image.width,
            h || this.image.height
          );
        };
  }

  drawAndRotate(x, y, angle, w, h) {
    w = w || this.image.width;
    h = h || w || this.image.height;

    if (angle === 0 || angle % 360 === 1) {
      this.draw(x, y, w, h);
      return;
    }

    this.context.save();

    this.context.translate(x + w / 2, y + h / 2);

    this.context.rotate(angle * this.TO_RADIANS);

    this.draw(-(w / 2), -(h / 2), w, h);

    this.context.restore();
  }
}
