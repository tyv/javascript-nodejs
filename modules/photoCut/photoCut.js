const CanvasSelection = require('./canvasSelection');


class PhotoCut {

  constructor(canvas, {maxImageSize} = {}) {
    this.maxImageSize = maxImageSize || 200;

    this.canvas = canvas;

    this.canvas.onmousedown = event => this.onMouseDown(event);
    this.canvas.onmouseup = event => this.onMouseUp(event);
    this.canvas.onkeydown = event => this.onKeyDown(event);

    document.addEventListener('mousemove', (event) => this.onMouseMove(event));

    this.ctx = canvas.getContext('2d');

    this.state = false; // moving | selecting | modifying

    this.mouseDownShift = null; // remember initial mousedown for moving

    this.selectionStartCoords = null;

    this.rotation = 0; // no rotation by default, can be a number, 1 => 90deg, 2 => 180deg -1 => -90deg ...

    this.selection = null; // current CanvasSelection object (if any)

    this.cornerSize = 5;
  }

  setImage(img) {
    // fit into document & 400px

    this.img = img;

    // fit to canvas
    this.scale = Math.min(this.maxImageSize / img.width, this.maxImageSize / img.height);

    this.fullImageCanvas = document.createElement('canvas');
    this.fullImageCtx = this.fullImageCanvas.getContext('2d');

    this.renderFullImageRotated();

    this.render();
  }

  getEventCoordsRelativeCanvasImage(event) {
    return {
      x: event.clientX - this.canvas.getBoundingClientRect().left - this.cornerSize,
      y: event.clientY - this.canvas.getBoundingClientRect().top - this.cornerSize
    };
  }


  onKeyDown(event) {
    if (!this.selection) return;

    if (event.keyCode == 13) { // down
      this.canvas.dispatchEvent(new CustomEvent("submit"));
    }

    if (event.keyCode == 40) { // down
      if (this.selection.bottom < this.height) {
        this.setSelection({
          y: this.selection.y + 1
        });
      }
      event.preventDefault();
    }

    if (event.keyCode == 38) { // up
      if (this.selection.y > 0) {
        this.setSelection({
          y: this.selection.y - 1
        });
      }
      event.preventDefault();
    }

    if (event.keyCode == 37) { // left
      if (this.selection.x > 0) {
        this.setSelection({
          x: this.selection.x - 1
        });
      }
      event.preventDefault();
    }

    if (event.keyCode == 39) { // right
      if (this.selection.right < this.width) {
        this.setSelection({
          x: this.selection.x + 1
        });
      }
      event.preventDefault();
    }

  }

  onMouseDown(event) {
    event.preventDefault(); // don't start selection please
    var coords = this.getEventCoordsRelativeCanvasImage(event);

    var position = this.findCoordsInSelection(coords);

    switch (position) {
    case 'inside':
      // move selection
      this.state = 'moving';
      this.mouseDownShift = {
        x: coords.x - this.selection.x,
        y: coords.y - this.selection.y
      };
      break;
    case 'outside':
      this.setSelection(null);
      this.state = 'selecting';
      this.selectionStartCoords = coords;
      break;
    case 'nw':
    case 'ne':
    case 'sw':
    case 'se':
      this.state = 'modifying';
      break;
    default:
      throw new Error("Must never reach here");
    }
  }

  /**
   * Return the relative position of coords to this.selection
   * false - if outside
   * nesw - if near sides
   * inside - if inside far from sides
   * @param coords
   * @returns {*}
   */
  findCoordsInSelection(coords) {
    if (!this.selection) return 'outside';

    if (Math.abs(coords.x - this.selection.x) < this.cornerSize && Math.abs(coords.y - this.selection.y) < this.cornerSize) {
      return 'nw';
    }

    if (Math.abs(coords.x - this.selection.x) < this.cornerSize && Math.abs(coords.y - this.selection.bottom) < this.cornerSize) {
      return 'sw';
    }

    if (Math.abs(coords.x - this.selection.right) < this.cornerSize && Math.abs(coords.y - this.selection.bottom) < this.cornerSize) {
      return 'se';
    }

    if (Math.abs(coords.x - this.selection.right) < this.cornerSize && Math.abs(coords.y - this.selection.y) < this.cornerSize) {
      return 'ne';
    }

    if (coords.x >= this.selection.x && coords.x <= this.selection.right &&
      coords.y >= this.selection.y && coords.y <= this.selection.bottom
    ) return 'inside';

    return 'outside';

  }


  onMouseMove(event) {
    // coords may be anywhere in the document

    // recalculate relative to canvas image edge
    var coords = this.getEventCoordsRelativeCanvasImage(event);

    // force-fit into image
    if (coords.x < 0) coords.x = 0;
    if (coords.x > this.width) coords.x = this.width;
    if (coords.y < 0) coords.y = 0;
    if (coords.y > this.height) coords.y = this.height;

    switch (this.state) {
    case false:
      this.showCursorAtCoords(coords);
      break;
    case 'moving':
      this.moveSelection(coords);
      break;
    case 'selecting':
      this.createSelection(coords);
      break;
    case 'modifying':
      this.modifySelection(coords);
      break;
    default:
      throw new Error("Must never reach here");
    }

  }

  showCursorAtCoords(coords) {

    var cursorPosition = this.findCoordsInSelection(coords);
    if (cursorPosition == 'outside') {
      this.canvas.style.cursor = 'crosshair';
    } else if (cursorPosition == 'inside') {
      this.canvas.style.cursor = 'move';
    } else {
      this.canvas.style.cursor = cursorPosition + '-resize';
    }
  }

  modifySelection(coords) {
    var center = this.selection.center;
    var direction = coords.x < center.x && coords.y < center.y ? 'nw' :
      coords.x < center.x && coords.y >= center.y ? 'sw' :
        coords.x > center.x && coords.y < center.y ? 'ne' :
          'se';

    switch (direction) {
    case 'nw':
      this.selectionStartCoords = {
        x: this.selection.right,
        y: this.selection.bottom
      };
      break;
    case 'ne':
      this.selectionStartCoords = {
        x: this.selection.x,
        y: this.selection.bottom
      };
      break;
    case 'sw':
      this.selectionStartCoords = {
        x: this.selection.right,
        y: this.selection.y
      };
      break;
    case 'se':
      this.selectionStartCoords = {
        x: this.selection.x,
        y: this.selection.y
      };
      break;
    }

    this.createSelection(coords);
  }

  moveSelection(coords) {
    var x = Math.min(coords.x - this.mouseDownShift.x, this.width - this.selection.size);
    var y = Math.min(coords.y - this.mouseDownShift.y, this.height - this.selection.size);
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    this.setSelection({
      x:    x,
      y:    y,
      size: this.selection.size
    });
    this.canvas.style.cursor = 'move';
  }

  setSelection(selection) {
    if (selection) {
      selection = Object.create(selection);
      if (this.selection) {
        selection.x = selection.x || this.selection.x;
        selection.y = selection.y || this.selection.y;
        selection.size = selection.size || this.selection.size;
      }

      // round to make all rectangles pixel-perfect
      this.selection = new CanvasSelection(selection);
    } else {
      this.selection = null;
    }
    this.render();

    this.canvas.dispatchEvent(new CustomEvent("selection", {
      bubbles: true
    }));

  }

  createSelection(coords) {

    var maxDistance = Math.max(
      Math.abs(this.selectionStartCoords.x - coords.x),
      Math.abs(this.selectionStartCoords.y - coords.y)
    );

    var selection = {};

    if (coords.x >= this.selectionStartCoords.x) {
      if (coords.y >= this.selectionStartCoords.y) {
        this.canvas.style.cursor = 'se-resize';
        selection.size = Math.min(maxDistance, this.height - this.selectionStartCoords.y, this.width - this.selectionStartCoords.x);
        selection.x = this.selectionStartCoords.x;
        selection.y = this.selectionStartCoords.y;
      } else {
        this.canvas.style.cursor = 'ne-resize';
        selection.size = Math.min(maxDistance, this.selectionStartCoords.y, this.width - this.selectionStartCoords.x);
        selection.x = this.selectionStartCoords.x;
        selection.y = this.selectionStartCoords.y - selection.size;
      }
    } else {
      if (coords.y >= this.selectionStartCoords.y) {
        this.canvas.style.cursor = 'sw-resize';
        selection.size = Math.min(maxDistance, this.selectionStartCoords.x, this.height - this.selectionStartCoords.y);
        selection.x = this.selectionStartCoords.x - selection.size;
        selection.y = this.selectionStartCoords.y;
      } else {
        this.canvas.style.cursor = 'nw-resize';
        selection.size = Math.min(maxDistance, this.selectionStartCoords.x, this.selectionStartCoords.y);
        selection.x = this.selectionStartCoords.x - selection.size;
        selection.y = this.selectionStartCoords.y - selection.size;
      }
    }


    this.setSelection(selection);

  }

  onMouseUp(event) {
    if (!this.state) return;
    this.state = false;

    if (this.selection.size < this.cornerSize * 2 + 2) {
      // too small
      this.setSelection(null);
    }

    // must render to show corners after end of selection
    this.render();
  }

  renderFullImageRotated() {
    // translate context to center of canvas
    if (this.rotation % 2 === 0) {
      this.fullImageCanvas.width = this.img.width;
      this.fullImageCanvas.height = this.img.height;
    } else {
      this.fullImageCanvas.height = this.img.width;
      this.fullImageCanvas.width = this.img.height;
    }

    this.fullImageCtx.translate(this.fullImageCanvas.width / 2, this.fullImageCanvas.height / 2);

    this.fullImageCtx.rotate(this.rotation * Math.PI / 2);

    this.fullImageCtx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2, this.img.width, this.img.height);

    this.fullImageCtx.rotate(-this.rotation * Math.PI / 2);
    this.fullImageCtx.translate(-this.fullImageCanvas.width / 2, -this.fullImageCanvas.heigh / 2);
  }

  /**
   * Rotate
   * @param direction +1 for +90deg, -1 for -90deg
   */
  rotate() {
    this.rotation++;

    this.state = false;
    this.renderFullImageRotated();
    this.render(); // sets this.width/height props (need below)

    if (this.selection) {
      // translate selection to new coords
      this.setSelection({
        x: this.width - this.selection.bottom,
        y: this.selection.x
      });
    }

    // after resetting width/height - refocus
    this.canvas.focus();
  }


  render() {

    // resized image height
    this.width = this.fullImageCanvas.width * this.scale;
    this.height = this.fullImageCanvas.height * this.scale;

    // image + corner space
    this.canvas.width = this.width + this.cornerSize * 2;
    this.canvas.height = this.height + this.cornerSize * 2;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.cornerSize, this.cornerSize);

    this.ctx.drawImage(
      this.fullImageCanvas,
      0, 0,
      this.width, this.height
    );


    if (this.selection && this.selection.size) {

      var x = Math.floor(this.selection.x);
      var y = Math.floor(this.selection.y);
      var size = Math.ceil(this.selection.size);

      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, this.width, y); // up
      this.ctx.fillRect(0, y, x, this.height - y); // left
      this.ctx.fillRect(x + size, y, this.width - (x + size), size); // right
      this.ctx.fillRect(x, y + size, this.width - x, this.height - (y + size)); // bottom

      // corners
      this.renderCorner('nw');
      this.renderCorner('ne');
      this.renderCorner('sw');
      this.renderCorner('se');
    }

    this.ctx.translate(-this.cornerSize, -this.cornerSize);
  }

  renderCorner(corner) {

    var rect;
    switch (corner) {
    case 'nw':
      rect = {
        x: this.selection.x - this.cornerSize,
        y: this.selection.y - this.cornerSize
      };
      break;
    case 'ne':
      rect = {
        x: this.selection.right - this.cornerSize,
        y: this.selection.y - this.cornerSize
      };
      break;
    case 'sw':
      rect = {
        x: this.selection.x - this.cornerSize,
        y: this.selection.bottom - this.cornerSize
      };
      break;
    case 'se':
      rect = {
        x: this.selection.right - this.cornerSize,
        y: this.selection.bottom - this.cornerSize
      };
      break;
    }

    rect.width = this.cornerSize * 2;
    rect.height = this.cornerSize * 2;

    if (!this.state) {
      // usual "inactive" style
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    } else {
      if ((this.state == 'modifying' || this.state == 'selecting') && // starting point unless moving
        this.selectionStartCoords.x >= rect.x && this.selectionStartCoords.y >= rect.y &&
        this.selectionStartCoords.x <= rect.x + rect.width && this.selectionStartCoords.y <= rect.y + rect.height
      ) {
        // selection start corner is "fixed" when selecting
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      } else {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      }
    }

    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

  }

  getCanvasSelection() {
    if (!this.selection) return null;

    return {
      source: this.fullImageCanvas,
      x:      this.selection.x / this.scale,
      y:      this.selection.y / this.scale,
      size:   this.selection.size / this.scale
    };
  }
}

module.exports = PhotoCut;
