function Modal() {

}

Modal.prototype.getElement = function() {
  if (!this.elem) this.render();
  return this.elem;
};

Modal.prototype.render = function() {
  var elem = this.elem = document.createElement('div');
  elem.className = 'modal';
  this.contentElem = document.createElement('div');
  this.contentElem.className = 'modal-dialog';
  elem.appendChild(this.contentElem);
};

Modal.prototype.setContent = function(html) {
  this.contentElem.innerHTML = html;
};

Modal.prototype.show = function() {
  document.body.appendChild(this.getElement());
};

Modal.prototype.hide = function() {
  this.elem.remove();
};


module.exports = Modal;
