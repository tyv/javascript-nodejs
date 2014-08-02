
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

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/auth/form', true);
  xhr.onloadend = function() {
    if (this.status != 200 || !this.responseText) {
      alert("Извините, ошибка на сервере");
      return;
    }
    authModal.innerHTML = this.responseText;
    initAuthModal(authCallback);
  };

  xhr.send();

};

function initAuthModal(authCallback) {

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
    loginForm.querySelector('.auth-error').innerHTML = errorMessage;
  };

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/auth/login/local', true);
    xhr.onloadend = function() {
      if (!this.status) {
        window.onAuthFailure("Ошибка соединения с сервером");
        return;
      } else if (this.status >= 500 || !this.responseText) {
        window.onAuthFailure("Ошибка на сервере, попробуйте позднее");
        return;
      }

      if (this.status == 403) {
        window.onAuthFailure(this.responseText);
        return;
      }

      window.onAuthSuccess();
    };

    xhr.send(new FormData(loginForm));
  });

  loginForm.on("click", ".facebook", function(event) {
    openAuthPopup('/auth/login/facebook');
  });

}

function openAuthPopup(url) {
  var width = 800, height = 600;
  var top = (window.outerHeight - height) / 2;
  var left = (window.outerWidth - width) / 2;
  window.open(url, 'auth_popup', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
}
