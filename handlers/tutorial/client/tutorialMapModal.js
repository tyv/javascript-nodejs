var xhr = require('client/xhr');

var delegate = require('client/delegate');
var Modal = require('client/head/modal');
var Spinner = require('client/spinner');
var TutorialMap = require('./tutorialMap');
var trackSticky = require('client/trackSticky');

/**
 * Options:
 *   - callback: function to be called after successful login (by default - go to successRedirect)
 *   - message: form message to be shown when the login form appears ("Log in to leave the comment")
 *   - successRedirect: the page to redirect (current page by default)
 *       - after immediate login
 *       - after registration for "confirm email" link
 */
function TutorialMapModal() {
  var modal = new Modal({hasClose: false});
  var spinner = new Spinner();
  modal.setContent(spinner.elem);
  spinner.start();

  var request = xhr({
    url: '/tutorial/map'
  });

  request.addEventListener('success', (event) => {
    modal.remove();
    document.body.insertAdjacentHTML('beforeEnd', '<div class="tutorial-map-overlay"></div>');
    this.elem = document.body.lastChild;
    this.elem.innerHTML = event.result +  '<button class="close-button tutorial-map-overlay__close"></button>';

    this.elem.addEventListener('click', (e) => {
      if (e.target.classList.contains('tutorial-map-overlay__close')) {
        this.remove();
      }
    });

    document.body.classList.add('tutorial-map_on');

    this.elem.addEventListener('scroll', trackSticky);

    new TutorialMap(this.elem.firstElementChild);
  });

  request.addEventListener('fail', () => modal.remove());

}

delegate.delegateMixin(TutorialMapModal.prototype);

TutorialMapModal.prototype.remove = function() {
  this.elem.remove();
  document.body.classList.remove('tutorial-map_on');
};


module.exports = TutorialMapModal;
