var init = require('./init');
var insertNonBlockingScript = require('./insertNonBlockingScript');
var Modal = require('./modal');

init.addHandler("login", function() {

  var link = document.querySelector('a.user__entrance');
  link.onclick = function(e) {
    e.preventDefault();
    login();
  };
  link.classList.remove('unready');

});

function login(options) {
  var modal = new Modal();
  modal.setContent('<progress></progress>');
  var script = insertNonBlockingScript('/js/auth/authModal.js');
  script.onload = function() {
    modal.remove();
    var AuthModal = require('auth/client/authModal');
    window.authModal = new AuthModal();
  };
}

module.exports = login;
