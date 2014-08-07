require('./polyfill');
require('./xhr-notify');

var login = require('auth/frontend/login');


window.addInitHandler("login", function() {

  var link = document.querySelector('a.user__entrance');
  link.onclick = function(e) {
    e.preventDefault();
    login();
  };
  link.classList.remove('unready');

});
