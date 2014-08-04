var xhr = require('./xhr');

// Run like this:
// login()
// login({whyMessage:.. followLinkMessage:..})
// login({whyMessage:.. followLinkMessage:..}, callback)
module.exports = function(options, authCallback) {
  options = options || {};

  var authModal = document.createElement('div');
  authModal.className = "auth-modal";

  authModal.innerHTML = '<div class="progress large"></div>';
  document.body.append(authModal);

  var request = xhr({ url: '/auth/form' });
  request.addEventListener('success', function(event) {
    authModal.innerHTML = event.result;
    initAuthModal(authCallback);
    initRegister();
  });

  request.addEventListener('fail', function() {
    authModal.remove();
  });

  request.send();

};

function initAuthModal(authCallback) {
  initAuthLogin(authCallback);
  initAuthRegister();
}

function initAuthRegister() {
  // TODO
}

function initAuthLogin(authCallback) {

  var authModal = document.querySelector('.auth-modal');

  var loginForm = authModal.querySelector('.login-form');

  // все обработчики авторизации (включая Facebook из popup-а и локальный)
  // в итоге триггерят один из этих каллбэков
  window.onAuthSuccess = function() {
    if (authCallback) {
      authCallback();
    } else {
      window.location.reload();
    }
  };

  window.onAuthFailure = function(errorMessage) {
    loginForm.querySelector('.auth-error').innerHTML = errorMessage || "Отказ в авторизации";
  };

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (!loginForm.elements.email.value || !loginForm.elements.password.value) {
      // todo: show error
      return;
    }

    var request = xhr({method: 'POST', url: '/auth/login/local'});
    request.addEventListener('success', function(event) {

      if (this.status != 200) {
        window.onAuthFailure(this.responseText);
        return;
      }

      window.onAuthSuccess();
    });

    request.send(new FormData(loginForm));
  });

  loginForm.on("click", "[data-provider]", function(event) {
    event.preventDefault();
    openAuthPopup('/auth/login/' + this.dataset.provider);
  });

}

document.on('click', '[data-action-verify-email]', function(event) {
  event.preventDefault();
  var request = xhr({method: 'POST', url: '/auth/verify-email'});
  request.addEventListener('success', function(event) {
    alert("OK");
  });

  request.send(JSON.stringify({email: this.dataset.actionVerifyEmail}));

});


function openAuthPopup(url) {
  var width = 800, height = 600;
  var top = (window.outerHeight - height) / 2;
  var left = (window.outerWidth - width) / 2;
  window.open(url, 'auth_popup', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
}
