var xhr = require('client/xhr');

var delegate = require('client/delegate');
var Modal = require('client/head').Modal;
var Spinner = require('client/spinner');
var TutorialMap = require('./tutorialMap');

/**
 * Options:
 *   - callback: function to be called after successful login (by default - go to successRedirect)
 *   - message: form message to be shown when the login form appears ("Log in to leave the comment")
 *   - successRedirect: the page to redirect (current page by default)
 *       - after immediate login
 *       - after registration for "confirm email" link
 */
function TutorialMapModal() {
  Modal.apply(this, arguments);

  var spinner = new Spinner();
  this.setContent(spinner.elem);
  spinner.start();

  var request = this.request({
    url: '/tutorial/map'
  });

  var self = this;
  request.addEventListener('success', function(event) {
    var wrapper = document.createElement('div');
    wrapper.className = 'tutorial-map-overlay';
    wrapper.innerHTML = event.result + '<button class="close-button tutorial-map-overlay__close"></button>';
    self.setContent(wrapper);
    new TutorialMap(self.contentElem.firstElementChild);
  });

  request.addEventListener('fail', function() {
    self.remove();
  });

  request.send();
}

TutorialMapModal.prototype = Object.create(Modal.prototype);

delegate.delegateMixin(TutorialMapModal.prototype);

TutorialMapModal.prototype.render = function() {
  Modal.prototype.render.apply(this, arguments);
  document.body.classList.add('tutorial-map_on');
};

TutorialMapModal.prototype.remove = function() {
  Modal.prototype.remove.apply(this, arguments);
  document.body.classList.remove('tutorial-map_on');
};

TutorialMapModal.prototype.request = function(options) {
  var request = xhr(options);

  request.addEventListener('loadstart', function() {
    var onEnd = this.startRequestIndication();
    request.addEventListener('loadend', onEnd);
  }.bind(this));

  return request;
};

TutorialMapModal.prototype.startRequestIndication = function() {
  this.showOverlay();
  var self = this;

  return function onEnd() {
    self.hideOverlay();
  };
};


module.exports = TutorialMapModal;
