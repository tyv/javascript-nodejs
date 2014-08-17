// Usage:
//  1) new Spinner({ elem: elem}) -> start/stop()
//  2) new Spinner() -> somewhere.append(spinner.elem) -> start/stop
function Spinner(options) {
  options = options || {};
  this.elem = options.elem;
  this.size = options.size || 'medium';

  if (this.size != 'medium' && this.size != 'small') {
    throw new Error("Unsupported size: " + this.size);
  }

  if (!this.elem) {
    this.elem = document.createElement('div');
  }
}

Spinner.prototype.start = function() {
  this.savedHTML = this.elem.innerHTML;
  this.elem.innerHTML = '<div class="spinner spinner__' + this.size+ '"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
};

Spinner.prototype.stop = function() {
  this.elem.innerHTML = this.savedHTML;
};

module.exports = Spinner;
