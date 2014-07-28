require('./polyfill');

var login = require('./login');

document.on('click', 'a.login', function(e) {
  e.preventDefault();

  login();
});
