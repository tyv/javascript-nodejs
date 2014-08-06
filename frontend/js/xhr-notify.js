var notify = require('./notify');
document.addEventListener('xhrfail', function(event) {
  notify.error(event.reason);
});
