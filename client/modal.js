function Modal() {
  var elem = this.elem = document.createElement('div');

  elem.className = 'modal';
  this.contentElem = document.createElement('div');
  this.contentElem.className = 'modal-dialog';
  elem.appendChild(this.contentElem);

  this.onClick = this.onClick.bind(this);
  this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

  document.body.appendChild(elem);
  elem.addEventListener("click", this.onClick);
  document.addEventListener("keydown", this.onDocumentKeyDown);
}

Modal.prototype.onClick = function(event) {
  if (event.target == this.elem) { // click on the outer element, outside of the window
    this.remove();
  }
};

Modal.prototype.onDocumentKeyDown = function(event) {
  if (event.keyCode == 27) {
    event.preventDefault();
    this.remove();
  }
};

Modal.prototype.setContent = function(html) {
  this.contentElem.innerHTML = html;
};

Modal.prototype.remove = function() {
  this.elem.remove();
  document.removeEventListener("keydown", this.onDocumentKeyDown);
};

module.exports = Modal;
