var xhr = require('client/xhr');
var delegate = require('client/delegate');
var Modal = require('client/modal');
var inherits = require('inherits');
var _ = require('lodash');

// Run like this:
// login({whyMessage:.. followLinkMessage:..})
// login({whyMessage:.. followLinkMessage:.., callback: ...)
module.exports = function(options) {
  window.authModal = new AuthModal(options);
};

function AuthModal(options) {
  Modal.apply(this, arguments);

  this.options = options || {};

  this.setContent('<div class="progress large"></div>');

  this.load();
  this.initEventHandlers();
}
inherits(AuthModal, Modal);

AuthModal.prototype.delegate = delegate;

AuthModal.prototype.load = function() {
  var self = this;
  var request = xhr({ url: '/auth/login-register-form' });

  request.addEventListener('success', function(event) {
    self.template = event.result;
    self.setContent(self.template.login);
  });

  request.addEventListener('fail', function() {
    self.remove();
  });

  request.send();
};

AuthModal.prototype.clearFormErrors = function() {

  // remove error for this notation:
  //span.text-input.text-input_invalid.login-form__input
  //  input.text-input__control#password(type="password", name="password")
  //  span.text-inpuxt__err Пароли не совпадают

  [].forEach.call(this.elem.querySelectorAll('.text-input_invalid'), function(elem) {
    elem.classList.remove('text-input_invalid');
  });

  [].forEach.call(this.elem.querySelectorAll('.text-input__err'), function(elem) {
    elem.remove();
  });

  // clear form-wide notification
  this.elem.querySelector('[data-notification]').innerHTML = '';
};

AuthModal.prototype.initEventHandlers = function() {

  this.delegate(this.elem, '[href="#register-form"]', 'click', function(e) {
    e.preventDefault();
    this.setContent(this.template.register);
  });

  this.delegate(this.elem, '[href="#login-form"]', 'click', function(e) {
    e.preventDefault();
    this.setContent(this.template.login);
  });

  this.delegate(this.elem, '[href="#forgot-form"]', 'click', function(e) {
    e.preventDefault();
    this.setContent(this.template.forgot);
  });


  this.delegate(this.elem, '[data-form="login"]', 'submit', function(event) {
    event.preventDefault();
    this.submitLoginForm(event.target);
  });


  this.delegate(this.elem, "[data-provider]", "click", function(event) {
    event.preventDefault();
    debugger;
    this.openAuthPopup('/auth/login/' + event.delegateTarget.dataset.provider);
  });


};


AuthModal.prototype.showInputError = function(input, error) {
  input.parentNode.classList.add('text-input_invalid');
  var errorSpan = document.createElement('span');
  errorSpan.className = 'text-input__err';
  errorSpan.innerHTML = error;
  input.parentNode.appendChild(errorSpan);
};

AuthModal.prototype.showFormError = function(error) {
  var container = document.createElement('div');
  container.className = 'login-form__error';
  container.innerHTML = error;
  this.elem.querySelector('[data-notification]').innerHTML = '';
  this.elem.querySelector('[data-notification]').appendChild(container);
};

AuthModal.prototype.submitLoginForm = function(form) {

  this.clearFormErrors();

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

  var request = xhr({method: 'POST', url: '/auth/login/local'});

  var self = this;
  request.addEventListener('success', function(event) {

    if (this.status != 200) {
      window.authModal.onAuthFailure(event.result.message);
      return;
    }

    window.authModal.onAuthSuccess();
  });

  request.send(new FormData(form));
};

AuthModal.prototype.openAuthPopup = function(url) {
  var width = 800, height = 600;
  var top = (window.outerHeight - height) / 2;
  var left = (window.outerWidth - width) / 2;
  window.open(url, 'auth_popup', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
};

// все обработчики авторизации (включая Facebook из popup-а и локальный)
// в итоге триггерят один из этих каллбэков
AuthModal.prototype.onAuthSuccess = function() {
  if (this.options.authCallback) {
    this.options.authCallback();
  } else {
    window.location.reload();
  }
};


AuthModal.prototype.onAuthFailure = function(errorMessage) {
  this.showFormError(errorMessage || "Отказ в авторизации");
};

/*
 document.on('click', '[data-action-verify-email]', function(event) {
 event.preventDefault();
 var request = xhr({method: 'POST', url: '/auth/verify-email'});
 request.addEventListener('success', function(event) {
 alert("OK");
 });

 request.send(JSON.stringify({email: this.dataset.actionVerifyEmail}));

 });
 */
