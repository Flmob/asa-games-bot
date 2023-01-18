class Tile {
  constructor({ x, y, value, size = 100, ctx }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.size = size;
    this.ctx = ctx;

    this.setValue(value);
  }

  setValue(value = 0) {
    this.value = value;
    this.outline = { ...defaultOutline };

    if (!value) this.outline.isPlaying = false;
  }

  draw() {
    this.ctx.strokeStyle = tileColors[this.value] || defaultTileColor;
    this.ctx.fillStyle = tileColors[this.value] || defaultTileColor;

    const x = this.x * this.size;
    const y = this.y * this.size;

    roundRect(
      this.ctx,
      x + tilePadding - this.outline.width,
      y + tilePadding - this.outline.width,
      this.size - tilePadding * 2 + this.outline.width * 2,
      this.size - tilePadding * 2 + this.outline.width * 2,
      true
    );

    if (this.value) {
      const textX = x + this.size / 2;
      const textY = y + this.size / 2 + 10;
      this.ctx.font = `${this.size / 6}pt Arial`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = textColor;
      this.ctx.fillText(this.value, textX, textY);
    }
  }

  updateOutline() {
    if (!this.outline.isPlaying) return;

    if (this.outline.isUp) {
      this.outline.width += outlineStep;

      if (this.outline.width >= 4) {
        this.outline.width = 4;
        this.outline.isUp = false;
      }
    } else {
      this.outline.width -= outlineStep;

      if (this.outline.width <= 0) {
        this.outline.width = 0;
        this.outline.isUp = true;

        this.outline.isPlaying = false;
      }
    }
  }
}
