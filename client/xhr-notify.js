import notify from 'client/notify';

document.addEventListener('xhrfail', function(event) {
  new notify.Error(event.reason);
});
