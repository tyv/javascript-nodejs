function Modal() {
  this.render();

  this.onClick = this.onClick.bind(this);
  this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

  this.elem.addEventListener('click', this.onClick);

  document.addEventListener("keydown", this.onDocumentKeyDown);
}

Modal.prototype.render = function() {
  document.body.insertAdjacentHTML('beforeEnd', '<div class="modal"><div class="modal-dialog"></div></div>');
  this.elem = document.body.lastChild;
  this.contentElem = this.elem.lastChild;
};

Modal.prototype.onClick = function(event) {
  if (event.target.classList.contains('close-button')) {
    this.remove();
  }
};


Modal.prototype.onDocumentKeyDown = function(event) {
  if (event.keyCode == 27) {
    event.preventDefault();
    this.remove();
  }
};

Modal.prototype.showOverlay = function() {
  this.contentElem.classList.add('modal-overlay_light');
};

Modal.prototype.hideOverlay = function() {
  this.contentElem.classList.remove('modal-overlay_light');
};

Modal.prototype.setContent = function(htmlOrNode) {
  if (typeof htmlOrNode == 'string') {
    this.contentElem.innerHTML = htmlOrNode;
  } else {
    this.contentElem.innerHTML = '';
    this.contentElem.appendChild(htmlOrNode);
  }
  var autofocus = this.contentElem.querySelector('[autofocus]');
  if (autofocus) autofocus.focus();
};

Modal.prototype.remove = function() {
  document.body.removeChild(this.elem);
  document.removeEventListener("keydown", this.onDocumentKeyDown);
  this.elem.dispatchEvent(new CustomEvent("modalClose"));
};

module.exports = Modal;
