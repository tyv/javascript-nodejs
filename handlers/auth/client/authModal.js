var xhr = require('client/xhr');

var delegate = require('client/delegate');
var Modal = require('client/head/modal');
var Spinner = require('client/spinner');


var loginForm = require('../templates/login-form.jade');
var registerForm = require('../templates/register-form.jade');
var forgotForm = require('../templates/forgot-form.jade');

var clientRender = require('client/clientRender');

/**
 * Options:
 *   - callback: function to be called after successful login (by default - go to successRedirect)
 *   - message: form message to be shown when the login form appears ("Log in to leave the comment")
 *   - successRedirect: the page to redirect (current page by default)
 *       - after immediate login
 *       - after registration for "confirm email" link
 */
function AuthModal(options) {
  Modal.apply(this, arguments);
  options = options || {};

  if (!options.successRedirect) {
    options.successRedirect = window.location.href;
  }

  var self = this;
  if (!options.callback) {
    options.callback = function() {
      self.successRedirect();
    };
  }

  this.options = options;
  this.setContent(clientRender(loginForm));

  if (options.message) {
    this.showFormMessage(options.message, 'info');
  }

  this.initEventHandlers();
}
AuthModal.prototype = Object.create(Modal.prototype);


delegate.delegateMixin(AuthModal.prototype);

AuthModal.prototype.successRedirect = function() {
  if (window.location.href == this.options.successRedirect) {
    window.location.reload();
  } else {
    window.location.href = this.options.successRedirect;
  }
};

AuthModal.prototype.clearFormMessages = function() {
  /*
   remove error for this notation:
   span.text-input.text-input_invalid.login-form__input
   input.text-input__control#password(type="password", name="password")
   span.text-inpuxt__err Пароли не совпадают
   */
  [].forEach.call(this.elem.querySelectorAll('.text-input_invalid'), function(elem) {
    elem.classList.remove('text-input_invalid');
  });

  [].forEach.call(this.elem.querySelectorAll('.text-input__err'), function(elem) {
    elem.remove();
  });

  // clear form-wide notification
  this.elem.querySelector('[data-notification]').innerHTML = '';
};

AuthModal.prototype.request = function(options) {
  var request = xhr(options);

  request.addEventListener('loadstart', function() {
    var onEnd = this.startRequestIndication();
    request.addEventListener('loadend', onEnd);
  }.bind(this));

  return request;
};

AuthModal.prototype.startRequestIndication = function() {
  this.showOverlay();
  var self = this;

  var submitButton = this.elem.querySelector('[type="submit"]');

  if (submitButton) {
    var spinner = new Spinner({
      elem:      submitButton,
      size:      'small',
      class:     'submit-button__spinner',
      elemClass: 'submit-button_progress'
    });
    spinner.start();
  }

  return function onEnd() {
    self.hideOverlay();
    if (spinner) spinner.stop();
  };

};

AuthModal.prototype.initEventHandlers = function() {

  this.delegate('[data-switch="register-form"]', 'click', function(e) {
    e.preventDefault();
    this.setContent(clientRender(registerForm));
  });

  this.delegate('[data-switch="login-form"]', 'click', function(e) {
    e.preventDefault();
    this.setContent(clientRender(loginForm));
  });

  this.delegate('[data-switch="forgot-form"]', 'click', function(e) {
    e.preventDefault();

    // move currently entered email into forgotForm
    var oldEmailInput = this.elem.querySelector('[type="email"]');
    this.setContent(clientRender(forgotForm));
    var newEmailInput = this.elem.querySelector('[type="email"]');
    newEmailInput.value = oldEmailInput.value;
  });


  this.delegate('[data-form="login"]', 'submit', function(event) {
    event.preventDefault();
    this.submitLoginForm(event.target);
  });


  this.delegate('[data-form="register"]', 'submit', function(event) {
    event.preventDefault();
    this.submitRegisterForm(event.target);
  });

  this.delegate('[data-form="forgot"]', 'submit', function(event) {
    event.preventDefault();
    this.submitForgotForm(event.target);
  });

  this.delegate("[data-provider]", "click", function(event) {
    event.preventDefault();
    this.openAuthPopup('/auth/login/' + event.delegateTarget.dataset.provider);
  });

  this.delegate('[data-action-verify-email]', 'click', function(event) {
    event.preventDefault();

    var payload = new FormData();
    payload.append("email", event.delegateTarget.dataset.actionVerifyEmail);

    var request = this.request({
      method: 'POST',
      url:    '/auth/reverify',
      body: payload
    });

    var self = this;
    request.addEventListener('success', function(event) {

      if (this.status == 200) {
        self.showFormMessage("Письмо-подтверждение отправлено ещё раз.", 'success');
      } else {
        self.showFormMessage(event.result, 'error');
      }

    });

  });
};

AuthModal.prototype.submitRegisterForm = function(form) {

  this.clearFormMessages();

  var hasErrors = false;
  if (!form.elements.email.value) {
    hasErrors = true;
    this.showInputError(form.elements.email, 'Введите, пожалуста, email.');
  }

  if (!form.elements.displayName.value) {
    hasErrors = true;
    this.showInputError(form.elements.displayName, 'Введите, пожалуста, имя пользователя.');
  }

  if (!form.elements.password.value) {
    hasErrors = true;
    this.showInputError(form.elements.password, 'Введите, пожалуста, пароль.');
  }

  if (hasErrors) return;

  var payload = new FormData(form);
  payload.append("successRedirect", this.options.successRedirect);

  var request = this.request({
    method:          'POST',
    url:             '/auth/register',
    normalStatuses: [201, 400],
    body: payload
  });

  var self = this;
  request.addEventListener('success', function(event) {

    if (this.status == 201) {
      self.setContent(clientRender(loginForm));
      self.showFormMessage(
          "<p>Сейчас вам придёт email с адреса inform@javascript.ru со ссылкой-подтверждением.</p>" +
          "<p><a href='#' data-action-verify-email='" + form.elements.email.value + "'>перезапросить подтверждение.</a></p>",
        'success'
      );
      return;
    }

    if (this.status == 400) {
      for (var field in event.result.errors) {
        self.showInputError(form.elements[field], event.result.errors[field]);
      }
      return;
    }

    self.showFormMessage("Неизвестный статус ответа сервера", 'error');
  });

};


AuthModal.prototype.submitForgotForm = function(form) {

  this.clearFormMessages();

  var hasErrors = false;
  if (!form.elements.email.value) {
    hasErrors = true;
    this.showInputError(form.elements.email, 'Введите, пожалуста, email.');
  }

  if (hasErrors) return;

  var payload = new FormData(form);
  payload.append("successRedirect", this.options.successRedirect);

  var request = this.request({
    method: 'POST',
    url:    '/auth/forgot',
    normalStatuses: [200, 404],
    body: payload
  });

  var self = this;
  request.addEventListener('success', function(event) {

    if (this.status == 200) {
      self.setContent(clientRender(loginForm));
      self.showFormMessage(event.result, 'success');
    } else if (this.status == 404) {
      self.showFormMessage(event.result, 'error');
    }
  });

};


AuthModal.prototype.showInputError = function(input, error) {
  input.parentNode.classList.add('text-input_invalid');
  var errorSpan = document.createElement('span');
  errorSpan.className = 'text-input__err';
  errorSpan.innerHTML = error;
  input.parentNode.appendChild(errorSpan);
};

AuthModal.prototype.showFormMessage = function(message, type) {
  if (message.indexOf('<p>') !== 0) {
    message = '<p>' + message + '</p>';
  }

  if (['info', 'error', 'warning', 'success'].indexOf(type) == -1) {
    throw new Error("Unsupported type: " + type);
  }

  var container = document.createElement('div');
  container.className = 'login-form__' + type;
  container.innerHTML = message;

  this.elem.querySelector('[data-notification]').innerHTML = '';
  this.elem.querySelector('[data-notification]').appendChild(container);
};

AuthModal.prototype.submitLoginForm = function(form) {

  this.clearFormMessages();

  var hasErrors = false;
  if (!form.elements.login.value) {
    hasErrors = true;
    this.showInputError(form.elements.login, 'Введите, пожалуста, имя или email.');
  }

  if (!form.elements.password.value) {
    hasErrors = true;
    this.showInputError(form.elements.password, 'Введите, пожалуста, пароль.');
  }

  if (hasErrors) return;

  var request = this.request({
    method: 'POST',
    url:    '/auth/login/local',
    normalStatuses: [200, 401],
    body: new FormData(form)
  });

  var self = this;
  request.addEventListener('success', function(event) {

    if (this.status != 200) {
      self.onAuthFailure(event.result.message);
      return;
    }

    self.onAuthSuccess(event.result.user);
  });

};

AuthModal.prototype.openAuthPopup = function(url) {
  if (this.authPopup && !this.authPopup.closed) {
    this.authPopup.close(); // close old popup if any
  }
  var width = 800, height = 600;
  var top = (window.outerHeight - height) / 2;
  var left = (window.outerWidth - width) / 2;
  window.authModal = this;
  this.authPopup = window.open(url, 'authModal', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
};

/*
 все обработчики авторизации (включая Facebook из popup-а и локальный)
 в итоге триггерят один из этих каллбэков
 */
AuthModal.prototype.onAuthSuccess = function(user) {
  window.currentUser = user;
  this.options.callback();
};


AuthModal.prototype.onAuthFailure = function(errorMessage) {
  this.showFormMessage(errorMessage || "Отказ в авторизации.", 'error');
};


module.exports = AuthModal;
