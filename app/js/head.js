require('./polyfill');

var login = require('./login');

document.on('click', 'a.user__entrance', function(e) {
  e.preventDefault();

  login();
});
