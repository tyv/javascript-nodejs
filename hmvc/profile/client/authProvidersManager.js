var delegate = require('client/delegate');
var notify = require('client/notify');
var xhr = require('client/xhr');

function AuthProvidersManager() {
  this.elem = document.body;

  this.delegate('[data-action="provider-add"]', 'click', function(event) {
    event.preventDefault();
    this.addProvider(event.delegateTarget.dataset.provider);
  });

  this.delegate('[data-action="provider-remove"]', 'click', function(event) {
    event.preventDefault();
    this.removeProvider(event.delegateTarget.dataset.provider);
  });

}


AuthProvidersManager.prototype.addProvider = function(providerName) {
  this.openAuthPopup('/auth/connect/' + providerName);
};

AuthProvidersManager.prototype.removeProvider = function(providerName) {
  var request = xhr({
    method: 'POST',
    url: '/auth/disconnect/' + providerName
  });

  request.addEventListener('success', function() {
    window.location.reload();
  });

  request.send();

};



AuthProvidersManager.prototype.openAuthPopup = function(url) {
  if (this.authPopup && !this.authPopup.closed) {
    this.authPopup.close(); // close old popup if any
  }
  var width = 800, height = 600;
  var top = (window.outerHeight - height) / 2;
  var left = (window.outerWidth - width) / 2;

  window.authProvidersManager = this;
  this.authPopup = window.open(url, 'authProvidersManager', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
};

/*
 все обработчики авторизации (включая Facebook из popup-а и локальный)
 в итоге триггерят один из этих каллбэков
 */
AuthProvidersManager.prototype.onAuthSuccess = function() {
  window.location.reload();
};

AuthProvidersManager.prototype.onAuthFailure = function(errorMessage) {
  notify.error(errorMessage || "Отказ в авторизации.", 'error');
};


delegate.delegateMixin(AuthProvidersManager.prototype);

module.exports = AuthProvidersManager;
