// Usage:
//  1) new Spinner({ elem: elem}) -> start/stop()
//  2) new Spinner() -> somewhere.append(spinner.elem) -> start/stop
function Spinner(options) {
  options = options || {};
  this.elem = options.elem;
  this.size = options.size || 'medium';
  this.mixClass = options.mixClass ? ' ' + options.mixClass : '';
  // replaceContent true means we remove content and add spinner
  // false means we just append spinner
  if (typeof options.replaceContent != 'undefined') {
    this.replaceContent = options.replaceContent;
  } else {
    this.replaceContent = true;
  }
  // class to be toggled on elem when spinner added
  this.rootClass = options.rootClass;

  if (this.size != 'medium' && this.size != 'small') {
    throw new Error("Unsupported size: " + this.size);
  }

  if (!this.elem) {
    this.elem = document.createElement('div');
  }
}

Spinner.prototype.start = function() {
  if (this.replaceContent) {
    this.savedHTML = this.elem.innerHTML;
    this.elem.innerHTML = '';
  }

  if (this.rootClass) {
    this.elem.classList.toggle(this.rootClass)
  }

  this.elem.insertAdjacentHTML('beforeend', '<span class="spinner spinner_active spinner_' + this.size + this.mixClass + '"><span class="spinner__dot spinner__dot_1"></span><span class="spinner__dot spinner__dot_2"></span><span class="spinner__dot spinner__dot_3"></span></span>');
};

Spinner.prototype.stop = function() {
  if (this.replaceContent) {
    this.elem.innerHTML = this.savedHTML;
  } else {
    this.elem.removeChild(this.elem.getElementsByClassName('spinner')[0]);
  }

  if (this.rootClass) {
    this.elem.classList.toggle(this.rootClass)
  }
};

module.exports = Spinner;
