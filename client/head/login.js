var Modal = require('./modal');
var Spinner = require('client/spinner');

document.addEventListener("click", function(event) {
  if (!event.target.hasAttribute('data-action-login')) {
    return;
  }

  event.preventDefault();
  login();

});

function login() {
  var modal = new Modal();
  var spinner = new Spinner();
  modal.setContent(spinner.elem);
  spinner.start();

  require.ensure('auth/client', function() {
    modal.remove();
    var AuthModal = require('auth/client').AuthModal;
    new AuthModal();
  }, 'authClient');

}

module.exports = login;
