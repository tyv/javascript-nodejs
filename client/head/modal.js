function Modal() {
  document.body.insertAdjacentHTML('beforeEnd', '<div class="modal"><div class="modal-dialog"></div></div>');

  this.elem = document.body.lastChild;
  this.contentElem = this.elem.lastChild;

  this.onClick = this.onClick.bind(this);
  this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

  this.elem.addEventListener("click", this.onClick);
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
  var autofocus = this.contentElem.querySelector('[autofocus]');
  if (autofocus) autofocus.focus();
};

Modal.prototype.remove = function() {
  document.body.removeChild(this.elem);
  document.removeEventListener("keydown", this.onDocumentKeyDown);
};

module.exports = Modal;
