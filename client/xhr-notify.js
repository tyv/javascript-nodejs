import notification from 'client/notification';

document.addEventListener('xhrfail', function(event) {
  new notification.Error(event.reason);
});
