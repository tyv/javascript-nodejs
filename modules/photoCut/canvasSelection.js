class CanvasSelection {

  constructor({x, y, size}) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  get bottom() {
    return this.y + this.size;
  }

  get right() {
    return this.x + this.size;
  }

  get center() {
    return {
      x: this.x + this.size / 2,
      y: this.y + this.size / 2
    };
  }

}

module.exports = CanvasSelection;
