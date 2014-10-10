require=
// modules are defined as an array
// [ module function, map of requireuires ]
//
// map of requireuires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the requireuire for previous bundles

(function outer (modules, cache, entry) {
    // Save the require from previous bundle to this closure if any
    var previousRequire = typeof require == "function" && require;

    function newRequire(name, jumped){
        if(!cache[name]) {
            if(!modules[name]) {
                // if we cannot find the the module within our internal map or
                // cache jump to the current global require ie. the last bundle
                // that was added to the page.
                var currentRequire = typeof require == "function" && require;
                if (!jumped && currentRequire) return currentRequire(name, true);

                // If there are other bundles on this page the require from the
                // previous one is saved to 'previousRequire'. Repeat this as
                // many times as there are bundles until the module is found or
                // we exhaust the require chain.
                if (previousRequire) return previousRequire(name, true);
                var err = new Error('Cannot find module \'' + name + '\'');
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            var m = cache[name] = {exports:{}};
            modules[name][0].call(m.exports, function(x){
                var id = modules[name][1][x];
                return newRequire(id ? id : x);
            },m,m.exports,outer,modules,cache,entry);
        }
        return cache[name].exports;
    }
    for(var i=0;i<entry.length;i++) newRequire(entry[i]);

    // Override the current require with this new one
    return newRequire;
})
({"/js/javascript-nodejs/node_modules/auth/client/authModal.js":[function(require,module,exports){
var xhr = require('client/xhr');

var delegate = require('client/delegate');
var Modal = require('client/head').Modal;
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
    this.setContent(clientRender(forgotForm));
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

    var request = this.request({
      method: 'POST',
      url:    '/auth/reverify'
    });

    var self = this;
    request.addEventListener('success', function(event) {

      if (this.status == 200) {
        self.showFormMessage("Письмо-подтверждение отправлено.", 'success');
      } else {
        self.showFormMessage(event.result, 'error');
      }

    });

    var payload = new FormData();
    payload.append("email", event.delegateTarget.dataset.actionVerifyEmail);

    request.send(payload);
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

  var request = this.request({
    method:          'POST',
    url:             '/auth/register',
    successStatuses: [201, 400]
  });

  var self = this;
  request.addEventListener('success', function(event) {

    if (this.status == 201) {
      self.setContent(clientRender(loginForm));
      self.showFormMessage(
          "Сейчас вам придёт email с адреса <code>inform@javascript.ru</code> " +
          "со ссылкой-подтверждением. Если письмо не пришло в течение минуты, можно " +
          "<a href='#' data-action-verify-email='" + form.elements.email.value + "'>перезапросить подтверждение</a>.",
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

  var payload = new FormData(form);
  payload.append("successRedirect", this.options.successRedirect);
  request.send(payload);
};


AuthModal.prototype.submitForgotForm = function(form) {

  this.clearFormMessages();

  var hasErrors = false;
  if (!form.elements.email.value) {
    hasErrors = true;
    this.showInputError(form.elements.email, 'Введите, пожалуста, email.');
  }

  if (hasErrors) return;

  var request = this.request({
    method: 'POST',
    url:    '/auth/forgot'
  });

  var self = this;
  request.addEventListener('success', function(event) {

    if (this.status == 200) {
      self.setContent(clientRender(loginForm));
      self.showFormMessage(event.result, 'success');
    } else {
      self.showFormMessage(event.result, 'error');
    }
  });

  var payload = new FormData(form);
  payload.append("successRedirect", this.options.successRedirect);
  request.send(payload);
};


AuthModal.prototype.showInputError = function(input, error) {
  input.parentNode.classList.add('text-input_invalid');
  var errorSpan = document.createElement('span');
  errorSpan.className = 'text-input__err';
  errorSpan.innerHTML = error;
  input.parentNode.appendChild(errorSpan);
};

AuthModal.prototype.showFormMessage = function(message, type) {
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
    url:    '/auth/login/local'
  });

  var self = this;
  request.addEventListener('success', function(event) {

    if (this.status != 200) {
      self.onAuthFailure(event.result.message);
      return;
    }

    self.onAuthSuccess();
  });

  request.send(new FormData(form));
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
AuthModal.prototype.onAuthSuccess = function() {
  this.options.callback();
};


AuthModal.prototype.onAuthFailure = function(errorMessage) {
  this.showFormMessage(errorMessage || "Отказ в авторизации", 'error');
};


module.exports = AuthModal;

},{"../templates/forgot-form.jade":"/js/javascript-nodejs/node_modules/auth/templates/forgot-form.jade","../templates/login-form.jade":"/js/javascript-nodejs/node_modules/auth/templates/login-form.jade","../templates/register-form.jade":"/js/javascript-nodejs/node_modules/auth/templates/register-form.jade","client/clientRender":"/js/javascript-nodejs/node_modules/client/clientRender.js","client/delegate":"/js/javascript-nodejs/node_modules/client/delegate.js","client/head":"client/head","client/spinner":"/js/javascript-nodejs/node_modules/client/spinner.js","client/xhr":"/js/javascript-nodejs/node_modules/client/xhr.js"}],"/js/javascript-nodejs/node_modules/auth/templates/forgot-form.jade":[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bem) {
buf.push("");
var bem_chain = [];
var bem_chain_contexts = ['block'];
jade_mixins["b"] = function(tag, isElement){
var block = (this && this.block), attributes = (this && this.attributes) || {};
bem.call(this, buf, bem_chain, bem_chain_contexts, tag, isElement)
};
jade_mixins["e"] = function(tag){
var block = (this && this.block), attributes = (this && this.attributes) || {};
jade_mixins["b"].call({
block: function(){
block && block();
},
attributes: jade.merge([attributes])
}, tag, true);
};
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Восстановление пароля");
},
attributes: {"class": "title"}
}, 'h4');
},
attributes: {"class": "line __header"}
});
jade_mixins["e"].call({
attributes: {"data-notification": true,"class": "line __notification"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Имя пользователя или Email:");
},
attributes: {"for": "forgot-email","class": "label"}
}, 'label');
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"id": "forgot-email","name": "email","autofocus": true,"class": "control"}
}, 'input');
},
attributes: {"class": "text-input __input"}
}, 'span');
},
attributes: {"class": "line"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Восстановить пароль");
},
attributes: {"class": "text"}
}, 'span');
},
attributes: {"type": "submit","class": "submit-button _small __submit"}
}, 'button');
},
attributes: {"class": "line"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Вход");
},
attributes: {"data-switch": "login-form","class": "button-link"}
}, 'button');
buf.push(" ");
jade_mixins["e"].call({
block: function(){
buf.push("/");
},
attributes: {"class": "separator"}
}, 'span');
buf.push(" ");
jade_mixins["e"].call({
block: function(){
buf.push("Регистрация");
},
attributes: {"data-switch": "register-form","class": "button-link"}
}, 'button');
},
attributes: {"class": "line __footer"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Вход через социальные сети");
},
attributes: {"class": "social-logins-title"}
}, 'h5');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Facebook");
},
attributes: {"data-provider": "facebook","class": "social-login _facebook __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Google+");
},
attributes: {"data-provider": "google","class": "social-login _google __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Вконтакте");
},
attributes: {"data-provider": "vkontakte","class": "social-login _vkontakte __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Github");
},
attributes: {"data-provider": "github","class": "social-login _github __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Яндекс");
},
attributes: {"data-provider": "yandex","class": "social-login _yandex __social-login"}
}, 'button');
},
attributes: {"class": "line __social-logins"}
});
jade_mixins["b"].call({
attributes: {"type": "button","title": "закрыть","class": "close-button __close"}
}, 'button');
},
attributes: {"action": "#","data-form": "forgot","class": "form"}
}, 'form');
},
attributes: {"class": "login-form"}
});}.call(this,"bem" in locals_for_with?locals_for_with.bem:typeof bem!=="undefined"?bem:undefined));;return buf.join("");
}
)(params); }

},{"jade/lib/runtime.js":"/js/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/js/javascript-nodejs/node_modules/auth/templates/login-form.jade":[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bem) {
buf.push("");
var bem_chain = [];
var bem_chain_contexts = ['block'];
jade_mixins["b"] = function(tag, isElement){
var block = (this && this.block), attributes = (this && this.attributes) || {};
bem.call(this, buf, bem_chain, bem_chain_contexts, tag, isElement)
};
jade_mixins["e"] = function(tag){
var block = (this && this.block), attributes = (this && this.attributes) || {};
jade_mixins["b"].call({
block: function(){
block && block();
},
attributes: jade.merge([attributes])
}, tag, true);
};
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Вход в систему");
},
attributes: {"class": "title"}
}, 'h4');
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("регистрация");
},
attributes: {"data-switch": "register-form","class": "button-link __register"}
}, 'button');
},
attributes: {"class": "header-aside"}
});
},
attributes: {"class": "line __header"}
});
jade_mixins["e"].call({
attributes: {"data-notification": true,"class": "line __notification"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Имя пользователя или Email:");
},
attributes: {"for": "login","class": "label"}
}, 'label');
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"id": "login","name": "login","class": "control"}
}, 'input');
},
attributes: {"class": "text-input __input"}
}, 'span');
},
attributes: {"class": "line"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Пароль:");
},
attributes: {"for": "password","class": "label"}
}, 'label');
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"id": "password","type": "password","name": "password","class": "control"}
}, 'input');
},
attributes: {"class": "text-input __input __input_with-aside"}
}, 'span');
jade_mixins["e"].call({
block: function(){
buf.push("Забыли?");
},
attributes: {"data-switch": "forgot-form","class": "button-link __forgot"}
}, 'button');
},
attributes: {"class": "line"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Войти");
},
attributes: {"class": "text"}
}, 'span');
},
attributes: {"type": "submit","class": "submit-button _small __submit"}
}, 'button');
},
attributes: {"class": "line __footer"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Вход через социальные сети");
},
attributes: {"class": "social-logins-title"}
}, 'h5');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Facebook");
},
attributes: {"data-provider": "facebook","class": "social-login _facebook __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Google+");
},
attributes: {"data-provider": "google","class": "social-login _google __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Вконтакте");
},
attributes: {"data-provider": "vkontakte","class": "social-login _vkontakte __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Github");
},
attributes: {"data-provider": "github","class": "social-login _github __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Яндекс");
},
attributes: {"data-provider": "yandex","class": "social-login _yandex __social-login"}
}, 'button');
},
attributes: {"class": "line __social-logins"}
});
jade_mixins["b"].call({
attributes: {"type": "button","title": "закрыть","class": "close-button __close"}
}, 'button');
},
attributes: {"action": "#","class": "form"}
}, 'form');
},
attributes: {"data-form": "login","class": "login-form"}
});}.call(this,"bem" in locals_for_with?locals_for_with.bem:typeof bem!=="undefined"?bem:undefined));;return buf.join("");
}
)(params); }

},{"jade/lib/runtime.js":"/js/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/js/javascript-nodejs/node_modules/auth/templates/register-form.jade":[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bem) {
buf.push("");
var bem_chain = [];
var bem_chain_contexts = ['block'];
jade_mixins["b"] = function(tag, isElement){
var block = (this && this.block), attributes = (this && this.attributes) || {};
bem.call(this, buf, bem_chain, bem_chain_contexts, tag, isElement)
};
jade_mixins["e"] = function(tag){
var block = (this && this.block), attributes = (this && this.attributes) || {};
jade_mixins["b"].call({
block: function(){
block && block();
},
attributes: jade.merge([attributes])
}, tag, true);
};
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Регистрация");
},
attributes: {"class": "title"}
}, 'h4');
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("вход");
},
attributes: {"data-switch": "login-form","class": "button-link"}
}, 'button');
},
attributes: {"class": "header-aside"}
});
},
attributes: {"class": "line __header"}
});
jade_mixins["e"].call({
attributes: {"data-notification": true,"class": "line __notification"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Email:");
},
attributes: {"for": "register-email","class": "label"}
}, 'label');
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"id": "register-email","name": "email","type": "email","required": true,"autofocus": true,"class": "control"}
}, 'input');
},
attributes: {"class": "text-input __input"}
}, 'span');
},
attributes: {"class": "line"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Имя пользователя:");
},
attributes: {"for": "register-displayName","class": "label"}
}, 'label');
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"id": "register-displayName","name": "displayName","required": true,"class": "control"}
}, 'input');
},
attributes: {"class": "text-input __input"}
}, 'span');
},
attributes: {"class": "line"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Пароль:");
},
attributes: {"for": "register-password","class": "label"}
}, 'label');
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"id": "register-password","type": "password","name": "password","required": true,"class": "control"}
}, 'input');
},
attributes: {"class": "text-input __input"}
}, 'span');
},
attributes: {"class": "line"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["b"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Зарегистрироваться");
},
attributes: {"class": "text"}
}, 'span');
},
attributes: {"type": "submit","class": "submit-button _small submit"}
}, 'button');
},
attributes: {"class": "line __footer"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
block: function(){
buf.push("Вход через социальные сети");
},
attributes: {"class": "social-logins-title"}
}, 'h5');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Facebook");
},
attributes: {"data-provider": "facebook","class": "social-login _facebook __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Google+");
},
attributes: {"data-provider": "google","class": "social-login _google __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Вконтакте");
},
attributes: {"data-provider": "vkontakte","class": "social-login _vkontakte __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Github");
},
attributes: {"data-provider": "github","class": "social-login _github __social-login"}
}, 'button');
buf.push(" ");
jade_mixins["b"].call({
block: function(){
buf.push("Яндекс");
},
attributes: {"data-provider": "yandex","class": "social-login _yandex __social-login"}
}, 'button');
},
attributes: {"class": "line __social-logins"}
});
jade_mixins["b"].call({
attributes: {"type": "button","title": "закрыть","class": "close-button __close"}
}, 'button');
},
attributes: {"action": "#","data-form": "register","class": "form"}
}, 'form');
},
attributes: {"class": "login-form"}
});}.call(this,"bem" in locals_for_with?locals_for_with.bem:typeof bem!=="undefined"?bem:undefined));;return buf.join("");
}
)(params); }

},{"jade/lib/runtime.js":"/js/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/js/javascript-nodejs/node_modules/bem-jade/index.js":[function(require,module,exports){
// Adapted from bemto.jade, copyright(c) 2012 Roman Komarov <kizu@kizu.ru>

/* jshint -W106 */

var jade = require('jade/lib/runtime');

module.exports = function(settings) {
  settings = settings || {};

  settings.prefix = settings.prefix || '';
  settings.element = settings.element || '__';
  settings.modifier = settings.modifier || '_';
  settings.default_tag = settings.default_tag || 'div';

  return function(buf, bem_chain, bem_chain_contexts, tag, isElement) {
    //console.log("-->", arguments);
    var block = this.block;
    var attributes = this.attributes || {};

    // Rewriting the class for elements and modifiers
    if (attributes.class) {
      var bem_classes = attributes.class;

      if (bem_classes instanceof Array) {
        bem_classes = bem_classes.join(' ');
      }
      bem_classes = bem_classes.split(' ');

      var bem_block;
      try {
        bem_block = bem_classes[0].match(new RegExp('^(((?!' + settings.element + '|' + settings.modifier + ').)+)'))[1];
      } catch (e) {
        throw new Error("Incorrect bem class: " + bem_classes[0]);
      }

      if (!isElement) {
        bem_chain[bem_chain.length] = bem_block;
        bem_classes[0] = bem_classes[0];
      } else {
        bem_classes[0] = bem_chain[bem_chain.length - 1] + settings.element + bem_classes[0];
      }

      var current_block = (isElement ? bem_chain[bem_chain.length - 1] + settings.element : '') + bem_block;

      // Adding the block if there is only modifier and/or element
      if (bem_classes.indexOf(current_block) === -1) {
        bem_classes[bem_classes.length] = current_block;
      }

      for (var i = 0; i < bem_classes.length; i++) {
        var klass = bem_classes[i];

        if (klass.match(new RegExp('^(?!' + settings.element + ')' + settings.modifier))) {
          // Expanding the modifiers
          bem_classes[i] = current_block + klass;
        } else if (klass.match(new RegExp('^' + settings.element))) {
          //- Expanding the mixed in elements
          if (bem_chain[bem_chain.length - 2]) {
            bem_classes[i] = bem_chain[bem_chain.length - 2] + klass;
          } else {
            bem_classes[i] = bem_chain[bem_chain.length - 1] + klass;
          }
        }

        // Adding prefixes
        if (bem_classes[i].match(new RegExp('^' + current_block + '($|(?=' + settings.element + '|' + settings.modifier + '))'))) {
          bem_classes[i] = settings.prefix + bem_classes[i];
        }
      }

      // Write modified classes to attributes in the correct order
      attributes.class = bem_classes.sort().join(' ');
    }

    bem_tag(buf, block, attributes, bem_chain, bem_chain_contexts, tag);

    // Closing actions (remove the current block from the chain)
    if (!isElement) {
      bem_chain.pop();
    }
    bem_chain_contexts.pop();
  };


  // used for tweaking what tag we are throwing and do we need to wrap anything here
  function bem_tag(buf, block, attributes, bem_chain, bem_chain_contexts, tag) {
    // rewriting tag name on different contexts
    var newTag = tag || settings.default_tag;
    var contextIndex = bem_chain_contexts.length;

    //Checks for contexts if no tag given
    //console.log(bem_chain_contexts, tag);
    if (!tag) {
      if (bem_chain_contexts[contextIndex - 1] === 'inline') {
        newTag = 'span';
      } else if (bem_chain_contexts[contextIndex - 1] === 'list') {
        newTag = 'li';
      }
      

      //Attributes context checks
      if (attributes.href) {
        newTag = 'a';
      } else if (attributes.for) {
        newTag = 'label';
      } else if (attributes.src) {
        newTag = 'img';
      }
    }

    //Contextual wrappers
    if (bem_chain_contexts[contextIndex - 1] === 'list' && newTag !== 'li') {
      buf.push('<li>');
    } else if (bem_chain_contexts[contextIndex - 1] !== 'list' && bem_chain_contexts[contextIndex - 1] !== 'pseudo-list' && newTag === 'li') {
      buf.push('<ul>');
      bem_chain_contexts[bem_chain_contexts.length] = 'pseudo-list';
    } else if (bem_chain_contexts[contextIndex - 1] === 'pseudo-list' && newTag !== 'li') {
      buf.push('</ul>');
      bem_chain_contexts.pop();
    }

    //Setting context
    if (['a', 'abbr', 'acronym', 'b', 'br', 'code', 'em', 'font', 'i', 'img', 'ins', 'kbd', 'map', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'label', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(newTag) !== -1) {
      bem_chain_contexts[bem_chain_contexts.length] = 'inline';
    } else if (['ul', 'ol'].indexOf(newTag) !== -1) {
      bem_chain_contexts[bem_chain_contexts.length] = 'list';
    } else {
      bem_chain_contexts[bem_chain_contexts.length] = 'block';
    }

    switch (newTag) {
    case 'img':
      // If there is no title we don't need it to show even if there is some alt
      if (attributes.alt && !attributes.title) {
        attributes.title = '';
      }
      // If we have title, we must have it in alt if it's not set
      if (attributes.title && !attributes.alt) {
        attributes.alt = attributes.title;
      }
      if (!attributes.alt) {
        attributes.alt = '';
      }
      break;
    case 'input':
      if (!attributes.type) {
        attributes.type = "text";
      }
      break;
    case 'html':
      buf.push('<!DOCTYPE HTML>');
      break;
    case 'a':
      if (!attributes.href) {
        attributes.href = '#';
      }
    }

    buf.push('<' + newTag + jade.attrs(jade.merge([attributes]), true) + ">");

    if (block) block();

    if (['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'].indexOf(newTag) == -1) {
      buf.push('</' + newTag + '>');
    }

    // Closing all the wrapper tails
    if (bem_chain_contexts[contextIndex - 1] === 'list' && newTag != 'li') {
      buf.push('</li>');
    }
  }


};

},{"jade/lib/runtime":"/js/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/js/javascript-nodejs/node_modules/browserify/lib/_empty.js":[function(require,module,exports){

},{}],"/js/javascript-nodejs/node_modules/client/clientRender.js":[function(require,module,exports){
var bem = require('bem-jade')();

module.exports = function(template, locals) {
  locals = locals ? Object.create(locals) : {};
  addStandardHelpers(locals);

  return template(locals);
};

function addStandardHelpers(locals) {
  locals.bem = bem;
}


},{"bem-jade":"/js/javascript-nodejs/node_modules/bem-jade/index.js"}],"/js/javascript-nodejs/node_modules/client/delegate.js":[function(require,module,exports){
'use strict';

require('./polyfill');

function findDelegateTarget(event, selector) {
  var currentNode = event.target;
  while (currentNode) {
    if (currentNode.matches(selector)) {
      return currentNode;
    }

    if (currentNode == event.currentTarget) {
      break;
    }
    currentNode = currentNode.parentElement;
  }
  return null;
}

// delegate(table, 'th', click, handler)
// table
//   thead
//     th         ^*
//       code  <--
function delegate(topElement, selector, eventName, handler, context) {
  /* jshint -W040 */
  topElement.addEventListener(eventName, function(event) {
    var found = findDelegateTarget(event, selector);

    // .currentTarget is read only, I can not overwrite it to the "found" element
    // Object.create wrapper would break event.preventDefault()
    // so, keep in mind:
    // --> event.currentTarget is always the top-level (delegating) element!
    // use "this" to get the found target

    event.delegateTarget = found; // use instead of "this" in object methods

    if (found) {
      // if in context of object, use object as this,
      handler.call(context || this, event);
    }
  });
}

delegate.delegateMixin = function(obj) {
  obj.delegate = function(selector, eventName, handler) {
    delegate(this.elem, selector, eventName, handler, this);
  };
};

module.exports = delegate;


},{"./polyfill":"/js/javascript-nodejs/node_modules/client/polyfill/index.js"}],"/js/javascript-nodejs/node_modules/client/notify.js":[function(require,module,exports){
var humane = require('humane-js');

exports.info = humane.spawn({ addnCls: 'humane-libnotify-info', timeout: 1000 });
exports.error = humane.spawn({ addnCls: 'humane-libnotify-error', timeout: 3000 });

},{"humane-js":"/js/javascript-nodejs/node_modules/humane-js/humane.js"}],"/js/javascript-nodejs/node_modules/client/polyfill/dom4.js":[function(require,module,exports){
function textNodeIfString(node) {
  return typeof node === 'string' ? document.createTextNode(node) : node;
}

function mutationMacro(nodes) {
  if (nodes.length === 1) {
    return textNodeIfString(nodes[0]);
  }
  var fragment = document.createDocumentFragment();
  var list = [].slice.call(nodes);

  for (var i = 0; i < list.length; i++) {
    fragment.appendChild(textNodeIfString(list[i]));
  }
  return fragment;
}

var methods = {
  matches: Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector,
  remove: function() {
    var parentNode = this.parentNode;
    if (parentNode) {
      return parentNode.removeChild(this);
    }
  }
};

for (var methodName in methods) {
  if (!Element.prototype[methodName]) {
    Element.prototype[methodName] = methods[methodName];
  }
}

try {
  new CustomEvent("IE has CustomEvent, but doesn't support constructor");
} catch (e) {

  window.CustomEvent = function(event, params) {
    var evt;
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };

  CustomEvent.prototype = Object.create(window.Event.prototype);
}


},{}],"/js/javascript-nodejs/node_modules/client/polyfill/index.js":[function(require,module,exports){
require('./dom4');

},{"./dom4":"/js/javascript-nodejs/node_modules/client/polyfill/dom4.js"}],"/js/javascript-nodejs/node_modules/client/spinner.js":[function(require,module,exports){
// Usage:
//  1) new Spinner({ elem: elem}) -> start/stop()
//  2) new Spinner() -> somewhere.append(spinner.elem) -> start/stop
function Spinner(options) {
  options = options || {};
  this.elem = options.elem;
  this.size = options.size || 'medium';
  // any class to add to spinner (make spinner special here)
  this.class = options.class ? (' ' + options.class) : '';

  // any class to add to element (to hide it's content for instance)
  this.elemClass = options.elemClass;

  if (this.size != 'medium' && this.size != 'small') {
    throw new Error("Unsupported size: " + this.size);
  }

  if (!this.elem) {
    this.elem = document.createElement('div');
  }
}

Spinner.prototype.start = function() {
  if (this.elemClass) {
    this.elem.classList.toggle(this.elemClass);
  }

  this.elem.insertAdjacentHTML('beforeend', '<span class="spinner spinner_active spinner_' + this.size + this.class + '"><span class="spinner__dot spinner__dot_1"></span><span class="spinner__dot spinner__dot_2"></span><span class="spinner__dot spinner__dot_3"></span></span>');
};

Spinner.prototype.stop = function() {
  this.elem.removeChild(this.elem.querySelector('.spinner'));

  if (this.elemClass) {
    this.elem.classList.toggle(this.elemClass);
  }
};

module.exports = Spinner;

},{}],"/js/javascript-nodejs/node_modules/client/xhr-notify.js":[function(require,module,exports){
var notify = require('./notify');

document.addEventListener('xhrfail', function(event) {
  notify.error(event.reason);
});

},{"./notify":"/js/javascript-nodejs/node_modules/client/notify.js"}],"/js/javascript-nodejs/node_modules/client/xhr.js":[function(require,module,exports){
require('./polyfill');
require('./xhr-notify');

module.exports = xhr;

// Wrapper about XHR
// # Global Events
// triggers document.loadstart/loadend on communication start/end
//    --> unless options.noGlobalEvents is set
//
// # Events
// triggers fail/success on load end:
//    --> by default status=200 is ok, the others are failures
//    --> options.successStatuses = [201,409] allow given statuses
//    --> fail event has .reason field
//    --> success event has .result field
//
// # JSON
//    --> send(object) calls JSON.stringify
//    --> options.json adds Accept: json (we want json)
// if options.json or server returned json content type
//    --> autoparse json
//    --> fail if error
//
// # CSRF
//    --> GET/OPTIONS/HEAD requests get _csrf field from window.csrf

function xhr(options) {

  var request = new XMLHttpRequest();

  var method = options.method || 'GET';
  request.open(method, options.url, options.sync ? false : true);

  request.method = method;

  if (!options.noGlobalEvents) {
    request.addEventListener('loadstart', function(event) {
      var e = wrapEvent('xhrstart', event);
      document.dispatchEvent(e);
    });
    request.addEventListener('loadend', function(event) {
      var e = wrapEvent('xhrend', event);
      document.dispatchEvent(e);
    });
    request.addEventListener('success', function(event) {
      var e = wrapEvent('xhrsuccess', event);
      e.result = event.result;
      document.dispatchEvent(e);
    });
    request.addEventListener('fail', function(event) {
      var e = wrapEvent('xhrfail', event);
      e.reason = event.reason;
      document.dispatchEvent(e);
    });
  }

  if (options.json) { // means we want json
    request.setRequestHeader("Accept", "application/json");
  }

  request.setRequestHeader('X-Requested-With', "XMLHttpRequest");

  var successStatuses = options.successStatuses || [200];

  function wrapEvent(name, e) {
    var event = new CustomEvent(name);
    event.originalEvent = e;
    return event;
  }

  function fail(reason, originalEvent) {
    var e = wrapEvent("fail", originalEvent);
    e.reason = reason;
    request.dispatchEvent(e);
  }

  function success(result, originalEvent) {
    var e = wrapEvent("success", originalEvent);
    e.result = result;
    request.dispatchEvent(e);
  }

  request.addEventListener("error", function(e) {
    fail("Ошибка связи с сервером.", e);
  });

  request.addEventListener("timeout", function(e) {
    fail("Превышено максимально допустимое время ожидания ответа от сервера.", e);
  });

  request.addEventListener("abort", function(e) {
    fail("Запрос был прерван.", e);
  });

  request.addEventListener("load", function(e) {
    if (!this.status) { // does that ever happen?
      fail("Не получен ответ от сервера.", e);
      return;
    }

    if (successStatuses.indexOf(this.status) == -1) {
      fail("Ошибка на стороне сервера (код " + this.status + "), попытайтесь позднее", e);
      return;
    }

    var result = this.responseText;
    var contentType = this.getResponseHeader("Content-Type");
    if (contentType.match(/^application\/json/) || options.json) { // autoparse json if WANT or RECEIVED json
      try {
        result = JSON.parse(result);
      } catch (e) {
        fail("Некорректный формат ответа от сервера", e);
        return;
      }
    }

    success(result, e);
  });

  wrapCsrfSend(request);
  return request;
}

// All non-GET request get _csrf from window.csrf automatically
function wrapCsrfSend(request) {

  var send = request.send;
  request.send = function(body) {

    if (!~['GET', 'HEAD', 'OPTIONS'].indexOf(this.method)) {
      if (body instanceof FormData) {
        body.append("_csrf", window.csrf);
      }

      if ({}.toString.call(body) == '[object Object]') {
        body._csrf = window.csrf;
      }

      if (!body) {
        body = {_csrf: window.csrf};
      }
    }

    if ({}.toString.call(body) == '[object Object]') {
      this.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      body = JSON.stringify(body);
    }

    send.call(this, body);

  };

}

},{"./polyfill":"/js/javascript-nodejs/node_modules/client/polyfill/index.js","./xhr-notify":"/js/javascript-nodejs/node_modules/client/xhr-notify.js"}],"/js/javascript-nodejs/node_modules/humane-js/humane.js":[function(require,module,exports){
/**
 * humane.js
 * Humanized Messages for Notifications
 * @author Marc Harter (@wavded)
 * @example
 *   humane.log('hello world');
 * See more usage examples at: http://wavded.github.com/humane-js/
 */

;!function (name, context, definition) {
   if (typeof module !== 'undefined') module.exports = definition(name, context)
   else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition)
   else context[name] = definition(name, context)
}('humane', this, function (name, context) {
   var win = window
   var doc = document

   var ENV = {
      on: function (el, type, cb) {
         'addEventListener' in win ? el.addEventListener(type,cb,false) : el.attachEvent('on'+type,cb)
      },
      off: function (el, type, cb) {
         'removeEventListener' in win ? el.removeEventListener(type,cb,false) : el.detachEvent('on'+type,cb)
      },
      bind: function (fn, ctx) {
         return function () { fn.apply(ctx,arguments) }
      },
      isArray: Array.isArray || function (obj) { return Object.prototype.toString.call(obj) === '[object Array]' },
      config: function (preferred, fallback) {
         return preferred != null ? preferred : fallback
      },
      transSupport: false,
      useFilter: /msie [678]/i.test(navigator.userAgent), // sniff, sniff
      _checkTransition: function () {
         var el = doc.createElement('div')
         var vendors = { webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' }

         for (var vendor in vendors)
            if (vendor + 'Transition' in el.style) {
               this.vendorPrefix = vendors[vendor]
               this.transSupport = true
            }
      }
   }
   ENV._checkTransition()

   var Humane = function (o) {
      o || (o = {})
      this.queue = []
      this.baseCls = o.baseCls || 'humane'
      this.addnCls = o.addnCls || ''
      this.timeout = 'timeout' in o ? o.timeout : 2500
      this.waitForMove = o.waitForMove || false
      this.clickToClose = o.clickToClose || false
      this.timeoutAfterMove = o.timeoutAfterMove || false 
      this.container = o.container

      try { this._setupEl() } // attempt to setup elements
      catch (e) {
        ENV.on(win,'load',ENV.bind(this._setupEl, this)) // dom wasn't ready, wait till ready
      }
   }

   Humane.prototype = {
      constructor: Humane,
      _setupEl: function () {
         var el = doc.createElement('div')
         el.style.display = 'none'
         if (!this.container){
           if(doc.body) this.container = doc.body;
           else throw 'document.body is null'
         }
         this.container.appendChild(el)
         this.el = el
         this.removeEvent = ENV.bind(function(){ if (!this.timeoutAfterMove){this.remove()} else {setTimeout(ENV.bind(this.remove,this),this.timeout);}},this)
         this.transEvent = ENV.bind(this._afterAnimation,this)
         this._run()
      },
      _afterTimeout: function () {
         if (!ENV.config(this.currentMsg.waitForMove,this.waitForMove)) this.remove()

         else if (!this.removeEventsSet) {
            ENV.on(doc.body,'mousemove',this.removeEvent)
            ENV.on(doc.body,'click',this.removeEvent)
            ENV.on(doc.body,'keypress',this.removeEvent)
            ENV.on(doc.body,'touchstart',this.removeEvent)
            this.removeEventsSet = true
         }
      },
      _run: function () {
         if (this._animating || !this.queue.length || !this.el) return

         this._animating = true
         if (this.currentTimer) {
            clearTimeout(this.currentTimer)
            this.currentTimer = null
         }

         var msg = this.queue.shift()
         var clickToClose = ENV.config(msg.clickToClose,this.clickToClose)

         if (clickToClose) {
            ENV.on(this.el,'click',this.removeEvent)
            ENV.on(this.el,'touchstart',this.removeEvent)
         }

         var timeout = ENV.config(msg.timeout,this.timeout)

         if (timeout > 0)
            this.currentTimer = setTimeout(ENV.bind(this._afterTimeout,this), timeout)

         if (ENV.isArray(msg.html)) msg.html = '<ul><li>'+msg.html.join('<li>')+'</ul>'

         this.el.innerHTML = msg.html
         this.currentMsg = msg
         this.el.className = this.baseCls
         if (ENV.transSupport) {
            this.el.style.display = 'block'
            setTimeout(ENV.bind(this._showMsg,this),50)
         } else {
            this._showMsg()
         }

      },
      _setOpacity: function (opacity) {
         if (ENV.useFilter){
            try{
               this.el.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity*100
            } catch(err){}
         } else {
            this.el.style.opacity = String(opacity)
         }
      },
      _showMsg: function () {
         var addnCls = ENV.config(this.currentMsg.addnCls,this.addnCls)
         if (ENV.transSupport) {
            this.el.className = this.baseCls+' '+addnCls+' '+this.baseCls+'-animate'
         }
         else {
            var opacity = 0
            this.el.className = this.baseCls+' '+addnCls+' '+this.baseCls+'-js-animate'
            this._setOpacity(0) // reset value so hover states work
            this.el.style.display = 'block'

            var self = this
            var interval = setInterval(function(){
               if (opacity < 1) {
                  opacity += 0.1
                  if (opacity > 1) opacity = 1
                  self._setOpacity(opacity)
               }
               else clearInterval(interval)
            }, 30)
         }
      },
      _hideMsg: function () {
         var addnCls = ENV.config(this.currentMsg.addnCls,this.addnCls)
         if (ENV.transSupport) {
            this.el.className = this.baseCls+' '+addnCls
            ENV.on(this.el,ENV.vendorPrefix ? ENV.vendorPrefix+'TransitionEnd' : 'transitionend',this.transEvent)
         }
         else {
            var opacity = 1
            var self = this
            var interval = setInterval(function(){
               if(opacity > 0) {
                  opacity -= 0.1
                  if (opacity < 0) opacity = 0
                  self._setOpacity(opacity);
               }
               else {
                  self.el.className = self.baseCls+' '+addnCls
                  clearInterval(interval)
                  self._afterAnimation()
               }
            }, 30)
         }
      },
      _afterAnimation: function () {
         if (ENV.transSupport) ENV.off(this.el,ENV.vendorPrefix ? ENV.vendorPrefix+'TransitionEnd' : 'transitionend',this.transEvent)

         if (this.currentMsg.cb) this.currentMsg.cb()
         this.el.style.display = 'none'

         this._animating = false
         this._run()
      },
      remove: function (e) {
         var cb = typeof e == 'function' ? e : null

         ENV.off(doc.body,'mousemove',this.removeEvent)
         ENV.off(doc.body,'click',this.removeEvent)
         ENV.off(doc.body,'keypress',this.removeEvent)
         ENV.off(doc.body,'touchstart',this.removeEvent)
         ENV.off(this.el,'click',this.removeEvent)
         ENV.off(this.el,'touchstart',this.removeEvent)
         this.removeEventsSet = false

         if (cb && this.currentMsg) this.currentMsg.cb = cb
         if (this._animating) this._hideMsg()
         else if (cb) cb()
      },
      log: function (html, o, cb, defaults) {
         var msg = {}
         if (defaults)
           for (var opt in defaults)
               msg[opt] = defaults[opt]

         if (typeof o == 'function') cb = o
         else if (o)
            for (var opt in o) msg[opt] = o[opt]

         msg.html = html
         if (cb) msg.cb = cb
         this.queue.push(msg)
         this._run()
         return this
      },
      spawn: function (defaults) {
         var self = this
         return function (html, o, cb) {
            self.log.call(self,html,o,cb,defaults)
            return self
         }
      },
      create: function (o) { return new Humane(o) }
   }
   return new Humane()
})

},{}],"/js/javascript-nodejs/node_modules/jade/lib/runtime.js":[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":"/js/javascript-nodejs/node_modules/browserify/lib/_empty.js"}],"auth/client":[function(require,module,exports){
exports.AuthModal = require('./authModal');

},{"./authModal":"/js/javascript-nodejs/node_modules/auth/client/authModal.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9qcy9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXV0aC9jbGllbnQvYXV0aE1vZGFsLmpzIiwibm9kZV9tb2R1bGVzL2F1dGgvdGVtcGxhdGVzL2ZvcmdvdC1mb3JtLmphZGUiLCJub2RlX21vZHVsZXMvYXV0aC90ZW1wbGF0ZXMvbG9naW4tZm9ybS5qYWRlIiwibm9kZV9tb2R1bGVzL2F1dGgvdGVtcGxhdGVzL3JlZ2lzdGVyLWZvcm0uamFkZSIsIm5vZGVfbW9kdWxlcy9iZW0tamFkZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2NsaWVudFJlbmRlci5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvZGVsZWdhdGUuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L25vdGlmeS5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvcG9seWZpbGwvZG9tNC5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvcG9seWZpbGwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2xpZW50L3NwaW5uZXIuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L3hoci1ub3RpZnkuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L3hoci5qcyIsIm5vZGVfbW9kdWxlcy9odW1hbmUtanMvaHVtYW5lLmpzIiwibm9kZV9tb2R1bGVzL2phZGUvbGliL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvYXV0aC9jbGllbnQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBtb2R1bGVzIGFyZSBkZWZpbmVkIGFzIGFuIGFycmF5XG4vLyBbIG1vZHVsZSBmdW5jdGlvbiwgbWFwIG9mIHJlcXVpcmV1aXJlcyBdXG4vL1xuLy8gbWFwIG9mIHJlcXVpcmV1aXJlcyBpcyBzaG9ydCByZXF1aXJlIG5hbWUgLT4gbnVtZXJpYyByZXF1aXJlXG4vL1xuLy8gYW55dGhpbmcgZGVmaW5lZCBpbiBhIHByZXZpb3VzIGJ1bmRsZSBpcyBhY2Nlc3NlZCB2aWEgdGhlXG4vLyBvcmlnIG1ldGhvZCB3aGljaCBpcyB0aGUgcmVxdWlyZXVpcmUgZm9yIHByZXZpb3VzIGJ1bmRsZXNcblxuKGZ1bmN0aW9uIG91dGVyIChtb2R1bGVzLCBjYWNoZSwgZW50cnkpIHtcbiAgICAvLyBTYXZlIHRoZSByZXF1aXJlIGZyb20gcHJldmlvdXMgYnVuZGxlIHRvIHRoaXMgY2xvc3VyZSBpZiBhbnlcbiAgICB2YXIgcHJldmlvdXNSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG5cbiAgICBmdW5jdGlvbiBuZXdSZXF1aXJlKG5hbWUsIGp1bXBlZCl7XG4gICAgICAgIGlmKCFjYWNoZVtuYW1lXSkge1xuICAgICAgICAgICAgaWYoIW1vZHVsZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBjYW5ub3QgZmluZCB0aGUgdGhlIG1vZHVsZSB3aXRoaW4gb3VyIGludGVybmFsIG1hcCBvclxuICAgICAgICAgICAgICAgIC8vIGNhY2hlIGp1bXAgdG8gdGhlIGN1cnJlbnQgZ2xvYmFsIHJlcXVpcmUgaWUuIHRoZSBsYXN0IGJ1bmRsZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2FzIGFkZGVkIHRvIHRoZSBwYWdlLlxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuICAgICAgICAgICAgICAgIGlmICghanVtcGVkICYmIGN1cnJlbnRSZXF1aXJlKSByZXR1cm4gY3VycmVudFJlcXVpcmUobmFtZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgYnVuZGxlcyBvbiB0aGlzIHBhZ2UgdGhlIHJlcXVpcmUgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cyBvbmUgaXMgc2F2ZWQgdG8gJ3ByZXZpb3VzUmVxdWlyZScuIFJlcGVhdCB0aGlzIGFzXG4gICAgICAgICAgICAgICAgLy8gbWFueSB0aW1lcyBhcyB0aGVyZSBhcmUgYnVuZGxlcyB1bnRpbCB0aGUgbW9kdWxlIGlzIGZvdW5kIG9yXG4gICAgICAgICAgICAgICAgLy8gd2UgZXhoYXVzdCB0aGUgcmVxdWlyZSBjaGFpbi5cbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNSZXF1aXJlKSByZXR1cm4gcHJldmlvdXNSZXF1aXJlKG5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIG1vZHVsZSBcXCcnICsgbmFtZSArICdcXCcnKTtcbiAgICAgICAgICAgICAgICBlcnIuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbSA9IGNhY2hlW25hbWVdID0ge2V4cG9ydHM6e319O1xuICAgICAgICAgICAgbW9kdWxlc1tuYW1lXVswXS5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24oeCl7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gbW9kdWxlc1tuYW1lXVsxXVt4XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3UmVxdWlyZShpZCA/IGlkIDogeCk7XG4gICAgICAgICAgICB9LG0sbS5leHBvcnRzLG91dGVyLG1vZHVsZXMsY2FjaGUsZW50cnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIH1cbiAgICBmb3IodmFyIGk9MDtpPGVudHJ5Lmxlbmd0aDtpKyspIG5ld1JlcXVpcmUoZW50cnlbaV0pO1xuXG4gICAgLy8gT3ZlcnJpZGUgdGhlIGN1cnJlbnQgcmVxdWlyZSB3aXRoIHRoaXMgbmV3IG9uZVxuICAgIHJldHVybiBuZXdSZXF1aXJlO1xufSlcbiIsInZhciB4aHIgPSByZXF1aXJlKCdjbGllbnQveGhyJyk7XG5cbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2NsaWVudC9kZWxlZ2F0ZScpO1xudmFyIE1vZGFsID0gcmVxdWlyZSgnY2xpZW50L2hlYWQnKS5Nb2RhbDtcbnZhciBTcGlubmVyID0gcmVxdWlyZSgnY2xpZW50L3NwaW5uZXInKTtcblxudmFyIGxvZ2luRm9ybSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9sb2dpbi1mb3JtLmphZGUnKTtcbnZhciByZWdpc3RlckZvcm0gPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcmVnaXN0ZXItZm9ybS5qYWRlJyk7XG52YXIgZm9yZ290Rm9ybSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9mb3Jnb3QtZm9ybS5qYWRlJyk7XG5cbnZhciBjbGllbnRSZW5kZXIgPSByZXF1aXJlKCdjbGllbnQvY2xpZW50UmVuZGVyJyk7XG5cbi8qKlxuICogT3B0aW9uczpcbiAqICAgLSBjYWxsYmFjazogZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHN1Y2Nlc3NmdWwgbG9naW4gKGJ5IGRlZmF1bHQgLSBnbyB0byBzdWNjZXNzUmVkaXJlY3QpXG4gKiAgIC0gbWVzc2FnZTogZm9ybSBtZXNzYWdlIHRvIGJlIHNob3duIHdoZW4gdGhlIGxvZ2luIGZvcm0gYXBwZWFycyAoXCJMb2cgaW4gdG8gbGVhdmUgdGhlIGNvbW1lbnRcIilcbiAqICAgLSBzdWNjZXNzUmVkaXJlY3Q6IHRoZSBwYWdlIHRvIHJlZGlyZWN0IChjdXJyZW50IHBhZ2UgYnkgZGVmYXVsdClcbiAqICAgICAgIC0gYWZ0ZXIgaW1tZWRpYXRlIGxvZ2luXG4gKiAgICAgICAtIGFmdGVyIHJlZ2lzdHJhdGlvbiBmb3IgXCJjb25maXJtIGVtYWlsXCIgbGlua1xuICovXG5mdW5jdGlvbiBBdXRoTW9kYWwob3B0aW9ucykge1xuICBNb2RhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAoIW9wdGlvbnMuc3VjY2Vzc1JlZGlyZWN0KSB7XG4gICAgb3B0aW9ucy5zdWNjZXNzUmVkaXJlY3QgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgfVxuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKCFvcHRpb25zLmNhbGxiYWNrKSB7XG4gICAgb3B0aW9ucy5jYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5zdWNjZXNzUmVkaXJlY3QoKTtcbiAgICB9O1xuICB9XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5zZXRDb250ZW50KGNsaWVudFJlbmRlcihsb2dpbkZvcm0pKTtcblxuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5zaG93Rm9ybU1lc3NhZ2Uob3B0aW9ucy5tZXNzYWdlLCAnaW5mbycpO1xuICB9XG5cbiAgdGhpcy5pbml0RXZlbnRIYW5kbGVycygpO1xufVxuQXV0aE1vZGFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTW9kYWwucHJvdG90eXBlKTtcblxuZGVsZWdhdGUuZGVsZWdhdGVNaXhpbihBdXRoTW9kYWwucHJvdG90eXBlKTtcblxuQXV0aE1vZGFsLnByb3RvdHlwZS5zdWNjZXNzUmVkaXJlY3QgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmID09IHRoaXMub3B0aW9ucy5zdWNjZXNzUmVkaXJlY3QpIHtcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0aGlzLm9wdGlvbnMuc3VjY2Vzc1JlZGlyZWN0O1xuICB9XG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLmNsZWFyRm9ybU1lc3NhZ2VzID0gZnVuY3Rpb24oKSB7XG4gIC8qXG4gICByZW1vdmUgZXJyb3IgZm9yIHRoaXMgbm90YXRpb246XG4gICBzcGFuLnRleHQtaW5wdXQudGV4dC1pbnB1dF9pbnZhbGlkLmxvZ2luLWZvcm1fX2lucHV0XG4gICBpbnB1dC50ZXh0LWlucHV0X19jb250cm9sI3Bhc3N3b3JkKHR5cGU9XCJwYXNzd29yZFwiLCBuYW1lPVwicGFzc3dvcmRcIilcbiAgIHNwYW4udGV4dC1pbnB1eHRfX2VyciDQn9Cw0YDQvtC70Lgg0L3QtSDRgdC+0LLQv9Cw0LTQsNGO0YJcbiAgICovXG4gIFtdLmZvckVhY2guY2FsbCh0aGlzLmVsZW0ucXVlcnlTZWxlY3RvckFsbCgnLnRleHQtaW5wdXRfaW52YWxpZCcpLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCd0ZXh0LWlucHV0X2ludmFsaWQnKTtcbiAgfSk7XG5cbiAgW10uZm9yRWFjaC5jYWxsKHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCcudGV4dC1pbnB1dF9fZXJyJyksIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICBlbGVtLnJlbW92ZSgpO1xuICB9KTtcblxuICAvLyBjbGVhciBmb3JtLXdpZGUgbm90aWZpY2F0aW9uXG4gIHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1ub3RpZmljYXRpb25dJykuaW5uZXJIVE1MID0gJyc7XG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciByZXF1ZXN0ID0geGhyKG9wdGlvbnMpO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uRW5kID0gdGhpcy5zdGFydFJlcXVlc3RJbmRpY2F0aW9uKCk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkZW5kJywgb25FbmQpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuQXV0aE1vZGFsLnByb3RvdHlwZS5zdGFydFJlcXVlc3RJbmRpY2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2hvd092ZXJsYXkoKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciBzdWJtaXRCdXR0b24gPSB0aGlzLmVsZW0ucXVlcnlTZWxlY3RvcignW3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICBpZiAoc3VibWl0QnV0dG9uKSB7XG4gICAgdmFyIHNwaW5uZXIgPSBuZXcgU3Bpbm5lcih7XG4gICAgICBlbGVtOiAgICAgIHN1Ym1pdEJ1dHRvbixcbiAgICAgIHNpemU6ICAgICAgJ3NtYWxsJyxcbiAgICAgIGNsYXNzOiAgICAgJ3N1Ym1pdC1idXR0b25fX3NwaW5uZXInLFxuICAgICAgZWxlbUNsYXNzOiAnc3VibWl0LWJ1dHRvbl9wcm9ncmVzcydcbiAgICB9KTtcbiAgICBzcGlubmVyLnN0YXJ0KCk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gb25FbmQoKSB7XG4gICAgc2VsZi5oaWRlT3ZlcmxheSgpO1xuICAgIGlmIChzcGlubmVyKSBzcGlubmVyLnN0b3AoKTtcbiAgfTtcblxufTtcblxuQXV0aE1vZGFsLnByb3RvdHlwZS5pbml0RXZlbnRIYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuXG4gIHRoaXMuZGVsZWdhdGUoJ1tkYXRhLXN3aXRjaD1cInJlZ2lzdGVyLWZvcm1cIl0nLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuc2V0Q29udGVudChjbGllbnRSZW5kZXIocmVnaXN0ZXJGb3JtKSk7XG4gIH0pO1xuXG4gIHRoaXMuZGVsZWdhdGUoJ1tkYXRhLXN3aXRjaD1cImxvZ2luLWZvcm1cIl0nLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuc2V0Q29udGVudChjbGllbnRSZW5kZXIobG9naW5Gb3JtKSk7XG4gIH0pO1xuXG4gIHRoaXMuZGVsZWdhdGUoJ1tkYXRhLXN3aXRjaD1cImZvcmdvdC1mb3JtXCJdJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnNldENvbnRlbnQoY2xpZW50UmVuZGVyKGZvcmdvdEZvcm0pKTtcbiAgfSk7XG5cblxuICB0aGlzLmRlbGVnYXRlKCdbZGF0YS1mb3JtPVwibG9naW5cIl0nLCAnc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuc3VibWl0TG9naW5Gb3JtKGV2ZW50LnRhcmdldCk7XG4gIH0pO1xuXG5cbiAgdGhpcy5kZWxlZ2F0ZSgnW2RhdGEtZm9ybT1cInJlZ2lzdGVyXCJdJywgJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnN1Ym1pdFJlZ2lzdGVyRm9ybShldmVudC50YXJnZXQpO1xuICB9KTtcblxuICB0aGlzLmRlbGVnYXRlKCdbZGF0YS1mb3JtPVwiZm9yZ290XCJdJywgJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnN1Ym1pdEZvcmdvdEZvcm0oZXZlbnQudGFyZ2V0KTtcbiAgfSk7XG5cbiAgdGhpcy5kZWxlZ2F0ZShcIltkYXRhLXByb3ZpZGVyXVwiLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLm9wZW5BdXRoUG9wdXAoJy9hdXRoL2xvZ2luLycgKyBldmVudC5kZWxlZ2F0ZVRhcmdldC5kYXRhc2V0LnByb3ZpZGVyKTtcbiAgfSk7XG5cbiAgdGhpcy5kZWxlZ2F0ZSgnW2RhdGEtYWN0aW9uLXZlcmlmeS1lbWFpbF0nLCAnY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgcmVxdWVzdCA9IHRoaXMucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogICAgJy9hdXRoL3JldmVyaWZ5J1xuICAgIH0pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgc2VsZi5zaG93Rm9ybU1lc3NhZ2UoXCLQn9C40YHRjNC80L4t0L/QvtC00YLQstC10YDQttC00LXQvdC40LUg0L7RgtC/0YDQsNCy0LvQtdC90L4uXCIsICdzdWNjZXNzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLnNob3dGb3JtTWVzc2FnZShldmVudC5yZXN1bHQsICdlcnJvcicpO1xuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICB2YXIgcGF5bG9hZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIHBheWxvYWQuYXBwZW5kKFwiZW1haWxcIiwgZXZlbnQuZGVsZWdhdGVUYXJnZXQuZGF0YXNldC5hY3Rpb25WZXJpZnlFbWFpbCk7XG5cbiAgICByZXF1ZXN0LnNlbmQocGF5bG9hZCk7XG4gIH0pO1xufTtcblxuQXV0aE1vZGFsLnByb3RvdHlwZS5zdWJtaXRSZWdpc3RlckZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG5cbiAgdGhpcy5jbGVhckZvcm1NZXNzYWdlcygpO1xuXG4gIHZhciBoYXNFcnJvcnMgPSBmYWxzZTtcbiAgaWYgKCFmb3JtLmVsZW1lbnRzLmVtYWlsLnZhbHVlKSB7XG4gICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICB0aGlzLnNob3dJbnB1dEVycm9yKGZvcm0uZWxlbWVudHMuZW1haWwsICfQktCy0LXQtNC40YLQtSwg0L/QvtC20LDQu9GD0YHRgtCwLCBlbWFpbC4nKTtcbiAgfVxuXG4gIGlmICghZm9ybS5lbGVtZW50cy5kaXNwbGF5TmFtZS52YWx1ZSkge1xuICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgdGhpcy5zaG93SW5wdXRFcnJvcihmb3JtLmVsZW1lbnRzLmRpc3BsYXlOYW1lLCAn0JLQstC10LTQuNGC0LUsINC/0L7QttCw0LvRg9GB0YLQsCwg0LjQvNGPINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjy4nKTtcbiAgfVxuXG4gIGlmICghZm9ybS5lbGVtZW50cy5wYXNzd29yZC52YWx1ZSkge1xuICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgdGhpcy5zaG93SW5wdXRFcnJvcihmb3JtLmVsZW1lbnRzLnBhc3N3b3JkLCAn0JLQstC10LTQuNGC0LUsINC/0L7QttCw0LvRg9GB0YLQsCwg0L/QsNGA0L7Qu9GMLicpO1xuICB9XG5cbiAgaWYgKGhhc0Vycm9ycykgcmV0dXJuO1xuXG4gIHZhciByZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0KHtcbiAgICBtZXRob2Q6ICAgICAgICAgICdQT1NUJyxcbiAgICB1cmw6ICAgICAgICAgICAgICcvYXV0aC9yZWdpc3RlcicsXG4gICAgc3VjY2Vzc1N0YXR1c2VzOiBbMjAxLCA0MDBdXG4gIH0pO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDEpIHtcbiAgICAgIHNlbGYuc2V0Q29udGVudChjbGllbnRSZW5kZXIobG9naW5Gb3JtKSk7XG4gICAgICBzZWxmLnNob3dGb3JtTWVzc2FnZShcbiAgICAgICAgICBcItCh0LXQudGH0LDRgSDQstCw0Lwg0L/RgNC40LTRkdGCIGVtYWlsINGBINCw0LTRgNC10YHQsCA8Y29kZT5pbmZvcm1AamF2YXNjcmlwdC5ydTwvY29kZT4gXCIgK1xuICAgICAgICAgIFwi0YHQviDRgdGB0YvQu9C60L7QuS3Qv9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtdC8LiDQldGB0LvQuCDQv9C40YHRjNC80L4g0L3QtSDQv9GA0LjRiNC70L4g0LIg0YLQtdGH0LXQvdC40LUg0LzQuNC90YPRgtGLLCDQvNC+0LbQvdC+IFwiICtcbiAgICAgICAgICBcIjxhIGhyZWY9JyMnIGRhdGEtYWN0aW9uLXZlcmlmeS1lbWFpbD0nXCIgKyBmb3JtLmVsZW1lbnRzLmVtYWlsLnZhbHVlICsgXCInPtC/0LXRgNC10LfQsNC/0YDQvtGB0LjRgtGMINC/0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1PC9hPi5cIixcbiAgICAgICAgJ3N1Y2Nlc3MnXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSA0MDApIHtcbiAgICAgIGZvciAodmFyIGZpZWxkIGluIGV2ZW50LnJlc3VsdC5lcnJvcnMpIHtcbiAgICAgICAgc2VsZi5zaG93SW5wdXRFcnJvcihmb3JtLmVsZW1lbnRzW2ZpZWxkXSwgZXZlbnQucmVzdWx0LmVycm9yc1tmaWVsZF0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuc2hvd0Zvcm1NZXNzYWdlKFwi0J3QtdC40LfQstC10YHRgtC90YvQuSDRgdGC0LDRgtGD0YEg0L7RgtCy0LXRgtCwINGB0LXRgNCy0LXRgNCwXCIsICdlcnJvcicpO1xuICB9KTtcblxuICB2YXIgcGF5bG9hZCA9IG5ldyBGb3JtRGF0YShmb3JtKTtcbiAgcGF5bG9hZC5hcHBlbmQoXCJzdWNjZXNzUmVkaXJlY3RcIiwgdGhpcy5vcHRpb25zLnN1Y2Nlc3NSZWRpcmVjdCk7XG4gIHJlcXVlc3Quc2VuZChwYXlsb2FkKTtcbn07XG5cblxuQXV0aE1vZGFsLnByb3RvdHlwZS5zdWJtaXRGb3Jnb3RGb3JtID0gZnVuY3Rpb24oZm9ybSkge1xuXG4gIHRoaXMuY2xlYXJGb3JtTWVzc2FnZXMoKTtcblxuICB2YXIgaGFzRXJyb3JzID0gZmFsc2U7XG4gIGlmICghZm9ybS5lbGVtZW50cy5lbWFpbC52YWx1ZSkge1xuICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgdGhpcy5zaG93SW5wdXRFcnJvcihmb3JtLmVsZW1lbnRzLmVtYWlsLCAn0JLQstC10LTQuNGC0LUsINC/0L7QttCw0LvRg9GB0YLQsCwgZW1haWwuJyk7XG4gIH1cblxuICBpZiAoaGFzRXJyb3JzKSByZXR1cm47XG5cbiAgdmFyIHJlcXVlc3QgPSB0aGlzLnJlcXVlc3Qoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogICAgJy9hdXRoL2ZvcmdvdCdcbiAgfSk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgc2VsZi5zZXRDb250ZW50KGNsaWVudFJlbmRlcihsb2dpbkZvcm0pKTtcbiAgICAgIHNlbGYuc2hvd0Zvcm1NZXNzYWdlKGV2ZW50LnJlc3VsdCwgJ3N1Y2Nlc3MnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5zaG93Rm9ybU1lc3NhZ2UoZXZlbnQucmVzdWx0LCAnZXJyb3InKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBwYXlsb2FkID0gbmV3IEZvcm1EYXRhKGZvcm0pO1xuICBwYXlsb2FkLmFwcGVuZChcInN1Y2Nlc3NSZWRpcmVjdFwiLCB0aGlzLm9wdGlvbnMuc3VjY2Vzc1JlZGlyZWN0KTtcbiAgcmVxdWVzdC5zZW5kKHBheWxvYWQpO1xufTtcblxuXG5BdXRoTW9kYWwucHJvdG90eXBlLnNob3dJbnB1dEVycm9yID0gZnVuY3Rpb24oaW5wdXQsIGVycm9yKSB7XG4gIGlucHV0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgndGV4dC1pbnB1dF9pbnZhbGlkJyk7XG4gIHZhciBlcnJvclNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGVycm9yU3Bhbi5jbGFzc05hbWUgPSAndGV4dC1pbnB1dF9fZXJyJztcbiAgZXJyb3JTcGFuLmlubmVySFRNTCA9IGVycm9yO1xuICBpbnB1dC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGVycm9yU3Bhbik7XG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLnNob3dGb3JtTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpIHtcbiAgaWYgKFsnaW5mbycsICdlcnJvcicsICd3YXJuaW5nJywgJ3N1Y2Nlc3MnXS5pbmRleE9mKHR5cGUpID09IC0xKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgdHlwZTogXCIgKyB0eXBlKTtcbiAgfVxuXG5cbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb250YWluZXIuY2xhc3NOYW1lID0gJ2xvZ2luLWZvcm1fXycgKyB0eXBlO1xuICBjb250YWluZXIuaW5uZXJIVE1MID0gbWVzc2FnZTtcblxuICB0aGlzLmVsZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtbm90aWZpY2F0aW9uXScpLmlubmVySFRNTCA9ICcnO1xuICB0aGlzLmVsZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtbm90aWZpY2F0aW9uXScpLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLnN1Ym1pdExvZ2luRm9ybSA9IGZ1bmN0aW9uKGZvcm0pIHtcblxuICB0aGlzLmNsZWFyRm9ybU1lc3NhZ2VzKCk7XG5cbiAgdmFyIGhhc0Vycm9ycyA9IGZhbHNlO1xuICBpZiAoIWZvcm0uZWxlbWVudHMubG9naW4udmFsdWUpIHtcbiAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgIHRoaXMuc2hvd0lucHV0RXJyb3IoZm9ybS5lbGVtZW50cy5sb2dpbiwgJ9CS0LLQtdC00LjRgtC1LCDQv9C+0LbQsNC70YPRgdGC0LAsINC40LzRjyDQuNC70LggZW1haWwuJyk7XG4gIH1cblxuICBpZiAoIWZvcm0uZWxlbWVudHMucGFzc3dvcmQudmFsdWUpIHtcbiAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgIHRoaXMuc2hvd0lucHV0RXJyb3IoZm9ybS5lbGVtZW50cy5wYXNzd29yZCwgJ9CS0LLQtdC00LjRgtC1LCDQv9C+0LbQsNC70YPRgdGC0LAsINC/0LDRgNC+0LvRjC4nKTtcbiAgfVxuXG4gIGlmIChoYXNFcnJvcnMpIHJldHVybjtcblxuICB2YXIgcmVxdWVzdCA9IHRoaXMucmVxdWVzdCh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiAgICAnL2F1dGgvbG9naW4vbG9jYWwnXG4gIH0pO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSAyMDApIHtcbiAgICAgIHNlbGYub25BdXRoRmFpbHVyZShldmVudC5yZXN1bHQubWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZi5vbkF1dGhTdWNjZXNzKCk7XG4gIH0pO1xuXG4gIHJlcXVlc3Quc2VuZChuZXcgRm9ybURhdGEoZm9ybSkpO1xufTtcblxuQXV0aE1vZGFsLnByb3RvdHlwZS5vcGVuQXV0aFBvcHVwID0gZnVuY3Rpb24odXJsKSB7XG4gIGlmICh0aGlzLmF1dGhQb3B1cCAmJiAhdGhpcy5hdXRoUG9wdXAuY2xvc2VkKSB7XG4gICAgdGhpcy5hdXRoUG9wdXAuY2xvc2UoKTsgLy8gY2xvc2Ugb2xkIHBvcHVwIGlmIGFueVxuICB9XG4gIHZhciB3aWR0aCA9IDgwMCwgaGVpZ2h0ID0gNjAwO1xuICB2YXIgdG9wID0gKHdpbmRvdy5vdXRlckhlaWdodCAtIGhlaWdodCkgLyAyO1xuICB2YXIgbGVmdCA9ICh3aW5kb3cub3V0ZXJXaWR0aCAtIHdpZHRoKSAvIDI7XG4gIHdpbmRvdy5hdXRoTW9kYWwgPSB0aGlzO1xuICB0aGlzLmF1dGhQb3B1cCA9IHdpbmRvdy5vcGVuKHVybCwgJ2F1dGhNb2RhbCcsICd3aWR0aD0nICsgd2lkdGggKyAnLGhlaWdodD0nICsgaGVpZ2h0ICsgJyxzY3JvbGxiYXJzPTAsdG9wPScgKyB0b3AgKyAnLGxlZnQ9JyArIGxlZnQpO1xufTtcblxuLypcbiDQstGB0LUg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDQsNCy0YLQvtGA0LjQt9Cw0YbQuNC4ICjQstC60LvRjtGH0LDRjyBGYWNlYm9vayDQuNC3IHBvcHVwLdCwINC4INC70L7QutCw0LvRjNC90YvQuSlcbiDQsiDQuNGC0L7Qs9C1INGC0YDQuNCz0LPQtdGA0Y/RgiDQvtC00LjQvSDQuNC3INGN0YLQuNGFINC60LDQu9C70LHRjdC60L7QslxuICovXG5BdXRoTW9kYWwucHJvdG90eXBlLm9uQXV0aFN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vcHRpb25zLmNhbGxiYWNrKCk7XG59O1xuXG5cbkF1dGhNb2RhbC5wcm90b3R5cGUub25BdXRoRmFpbHVyZSA9IGZ1bmN0aW9uKGVycm9yTWVzc2FnZSkge1xuICB0aGlzLnNob3dGb3JtTWVzc2FnZShlcnJvck1lc3NhZ2UgfHwgXCLQntGC0LrQsNC3INCyINCw0LLRgtC+0YDQuNC30LDRhtC40LhcIiwgJ2Vycm9yJyk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aE1vZGFsO1xuIiwidmFyIGphZGUgPSByZXF1aXJlKCdqYWRlL2xpYi9ydW50aW1lLmpzJyk7XG5tb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihwYXJhbXMpIHsgaWYgKHBhcmFtcykge3BhcmFtcy5yZXF1aXJlID0gcmVxdWlyZTt9IHJldHVybiAoXG5mdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGJlbSkge1xuYnVmLnB1c2goXCJcIik7XG52YXIgYmVtX2NoYWluID0gW107XG52YXIgYmVtX2NoYWluX2NvbnRleHRzID0gWydibG9jayddO1xuamFkZV9taXhpbnNbXCJiXCJdID0gZnVuY3Rpb24odGFnLCBpc0VsZW1lbnQpe1xudmFyIGJsb2NrID0gKHRoaXMgJiYgdGhpcy5ibG9jayksIGF0dHJpYnV0ZXMgPSAodGhpcyAmJiB0aGlzLmF0dHJpYnV0ZXMpIHx8IHt9O1xuYmVtLmNhbGwodGhpcywgYnVmLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnLCBpc0VsZW1lbnQpXG59O1xuamFkZV9taXhpbnNbXCJlXCJdID0gZnVuY3Rpb24odGFnKXtcbnZhciBibG9jayA9ICh0aGlzICYmIHRoaXMuYmxvY2spLCBhdHRyaWJ1dGVzID0gKHRoaXMgJiYgdGhpcy5hdHRyaWJ1dGVzKSB8fCB7fTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYmxvY2sgJiYgYmxvY2soKTtcbn0sXG5hdHRyaWJ1dGVzOiBqYWRlLm1lcmdlKFthdHRyaWJ1dGVzXSlcbn0sIHRhZywgdHJ1ZSk7XG59O1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0L7RgdGB0YLQsNC90L7QstC70LXQvdC40LUg0L/QsNGA0L7Qu9GPXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidGl0bGVcIn1cbn0sICdoNCcpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZSBfX2hlYWRlclwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJkYXRhLW5vdGlmaWNhdGlvblwiOiB0cnVlLFwiY2xhc3NcIjogXCJsaW5lIF9fbm90aWZpY2F0aW9uXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCY0LzRjyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8g0LjQu9C4IEVtYWlsOlwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJmb3JcIjogXCJmb3Jnb3QtZW1haWxcIixcImNsYXNzXCI6IFwibGFiZWxcIn1cbn0sICdsYWJlbCcpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJpZFwiOiBcImZvcmdvdC1lbWFpbFwiLFwibmFtZVwiOiBcImVtYWlsXCIsXCJhdXRvZm9jdXNcIjogdHJ1ZSxcImNsYXNzXCI6IFwiY29udHJvbFwifVxufSwgJ2lucHV0Jyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0ZXh0LWlucHV0IF9faW5wdXRcIn1cbn0sICdzcGFuJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLQvtGB0YHRgtCw0L3QvtCy0LjRgtGMINC/0LDRgNC+0LvRjFwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRleHRcIn1cbn0sICdzcGFuJyk7XG59LFxuYXR0cmlidXRlczoge1widHlwZVwiOiBcInN1Ym1pdFwiLFwiY2xhc3NcIjogXCJzdWJtaXQtYnV0dG9uIF9zbWFsbCBfX3N1Ym1pdFwifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZVwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQktGF0L7QtFwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXN3aXRjaFwiOiBcImxvZ2luLWZvcm1cIixcImNsYXNzXCI6IFwiYnV0dG9uLWxpbmtcIn1cbn0sICdidXR0b24nKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCIvXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwic2VwYXJhdG9yXCJ9XG59LCAnc3BhbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCg0LXQs9C40YHRgtGA0LDRhtC40Y9cIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1zd2l0Y2hcIjogXCJyZWdpc3Rlci1mb3JtXCIsXCJjbGFzc1wiOiBcImJ1dHRvbi1saW5rXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9fZm9vdGVyXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0YXQvtC0INGH0LXRgNC10Lcg0YHQvtGG0LjQsNC70YzQvdGL0LUg0YHQtdGC0LhcIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJzb2NpYWwtbG9naW5zLXRpdGxlXCJ9XG59LCAnaDUnKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCJGYWNlYm9va1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwiZmFjZWJvb2tcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF9mYWNlYm9vayBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcIkdvb2dsZStcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcImdvb2dsZVwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2dvb2dsZSBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0LrQvtC90YLQsNC60YLQtVwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwidmtvbnRha3RlXCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfdmtvbnRha3RlIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwiR2l0aHViXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJnaXRodWJcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF9naXRodWIgX19zb2NpYWwtbG9naW5cIn1cbn0sICdidXR0b24nKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQr9C90LTQtdC60YFcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcInlhbmRleFwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX3lhbmRleCBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZSBfX3NvY2lhbC1sb2dpbnNcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1widHlwZVwiOiBcImJ1dHRvblwiLFwidGl0bGVcIjogXCLQt9Cw0LrRgNGL0YLRjFwiLFwiY2xhc3NcIjogXCJjbG9zZS1idXR0b24gX19jbG9zZVwifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImFjdGlvblwiOiBcIiNcIixcImRhdGEtZm9ybVwiOiBcImZvcmdvdFwiLFwiY2xhc3NcIjogXCJmb3JtXCJ9XG59LCAnZm9ybScpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibG9naW4tZm9ybVwifVxufSk7fS5jYWxsKHRoaXMsXCJiZW1cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmJlbTp0eXBlb2YgYmVtIT09XCJ1bmRlZmluZWRcIj9iZW06dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn1cbikocGFyYW1zKTsgfVxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lJdmFuTXZhbUYyWVhOamNtbHdkQzF1YjJSbGFuTXZibTlrWlY5dGIyUjFiR1Z6TDJGMWRHZ3ZkR1Z0Y0d4aGRHVnpMMlp2Y21kdmRDMW1iM0p0TG1waFpHVXVhbk1pTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2VzExOSIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS9saWIvcnVudGltZS5qcycpO1xubW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24ocGFyYW1zKSB7IGlmIChwYXJhbXMpIHtwYXJhbXMucmVxdWlyZSA9IHJlcXVpcmU7fSByZXR1cm4gKFxuZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChiZW0pIHtcbmJ1Zi5wdXNoKFwiXCIpO1xudmFyIGJlbV9jaGFpbiA9IFtdO1xudmFyIGJlbV9jaGFpbl9jb250ZXh0cyA9IFsnYmxvY2snXTtcbmphZGVfbWl4aW5zW1wiYlwiXSA9IGZ1bmN0aW9uKHRhZywgaXNFbGVtZW50KXtcbnZhciBibG9jayA9ICh0aGlzICYmIHRoaXMuYmxvY2spLCBhdHRyaWJ1dGVzID0gKHRoaXMgJiYgdGhpcy5hdHRyaWJ1dGVzKSB8fCB7fTtcbmJlbS5jYWxsKHRoaXMsIGJ1ZiwgYmVtX2NoYWluLCBiZW1fY2hhaW5fY29udGV4dHMsIHRhZywgaXNFbGVtZW50KVxufTtcbmphZGVfbWl4aW5zW1wiZVwiXSA9IGZ1bmN0aW9uKHRhZyl7XG52YXIgYmxvY2sgPSAodGhpcyAmJiB0aGlzLmJsb2NrKSwgYXR0cmlidXRlcyA9ICh0aGlzICYmIHRoaXMuYXR0cmlidXRlcykgfHwge307XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJsb2NrICYmIGJsb2NrKCk7XG59LFxuYXR0cmlidXRlczogamFkZS5tZXJnZShbYXR0cmlidXRlc10pXG59LCB0YWcsIHRydWUpO1xufTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQktGF0L7QtCDQsiDRgdC40YHRgtC10LzRg1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRpdGxlXCJ9XG59LCAnaDQnKTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItGA0LXQs9C40YHRgtGA0LDRhtC40Y9cIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1zd2l0Y2hcIjogXCJyZWdpc3Rlci1mb3JtXCIsXCJjbGFzc1wiOiBcImJ1dHRvbi1saW5rIF9fcmVnaXN0ZXJcIn1cbn0sICdidXR0b24nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImhlYWRlci1hc2lkZVwifVxufSk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9faGVhZGVyXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImRhdGEtbm90aWZpY2F0aW9uXCI6IHRydWUsXCJjbGFzc1wiOiBcImxpbmUgX19ub3RpZmljYXRpb25cIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JjQvNGPINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjyDQuNC70LggRW1haWw6XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcImxvZ2luXCIsXCJjbGFzc1wiOiBcImxhYmVsXCJ9XG59LCAnbGFiZWwnKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiaWRcIjogXCJsb2dpblwiLFwibmFtZVwiOiBcImxvZ2luXCIsXCJjbGFzc1wiOiBcImNvbnRyb2xcIn1cbn0sICdpbnB1dCcpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidGV4dC1pbnB1dCBfX2lucHV0XCJ9XG59LCAnc3BhbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZVwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQn9Cw0YDQvtC70Yw6XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcInBhc3N3b3JkXCIsXCJjbGFzc1wiOiBcImxhYmVsXCJ9XG59LCAnbGFiZWwnKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiaWRcIjogXCJwYXNzd29yZFwiLFwidHlwZVwiOiBcInBhc3N3b3JkXCIsXCJuYW1lXCI6IFwicGFzc3dvcmRcIixcImNsYXNzXCI6IFwiY29udHJvbFwifVxufSwgJ2lucHV0Jyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0ZXh0LWlucHV0IF9faW5wdXQgX19pbnB1dF93aXRoLWFzaWRlXCJ9XG59LCAnc3BhbicpO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCX0LDQsdGL0LvQuD9cIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1zd2l0Y2hcIjogXCJmb3Jnb3QtZm9ybVwiLFwiY2xhc3NcIjogXCJidXR0b24tbGluayBfX2ZvcmdvdFwifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZVwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0L7QudGC0LhcIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0ZXh0XCJ9XG59LCAnc3BhbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcInR5cGVcIjogXCJzdWJtaXRcIixcImNsYXNzXCI6IFwic3VibWl0LWJ1dHRvbiBfc21hbGwgX19zdWJtaXRcIn1cbn0sICdidXR0b24nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmUgX19mb290ZXJcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLRhdC+0LQg0YfQtdGA0LXQtyDRgdC+0YbQuNCw0LvRjNC90YvQtSDRgdC10YLQuFwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbnMtdGl0bGVcIn1cbn0sICdoNScpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcIkZhY2Vib29rXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJmYWNlYm9va1wiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2ZhY2Vib29rIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwiR29vZ2xlK1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwiZ29vZ2xlXCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfZ29vZ2xlIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLQutC+0L3RgtCw0LrRgtC1XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJ2a29udGFrdGVcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF92a29udGFrdGUgX19zb2NpYWwtbG9naW5cIn1cbn0sICdidXR0b24nKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCJHaXRodWJcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcImdpdGh1YlwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2dpdGh1YiBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCv0L3QtNC10LrRgVwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwieWFuZGV4XCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfeWFuZGV4IF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9fc29jaWFsLWxvZ2luc1wifVxufSk7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJ0eXBlXCI6IFwiYnV0dG9uXCIsXCJ0aXRsZVwiOiBcItC30LDQutGA0YvRgtGMXCIsXCJjbGFzc1wiOiBcImNsb3NlLWJ1dHRvbiBfX2Nsb3NlXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiYWN0aW9uXCI6IFwiI1wiLFwiY2xhc3NcIjogXCJmb3JtXCJ9XG59LCAnZm9ybScpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtZm9ybVwiOiBcImxvZ2luXCIsXCJjbGFzc1wiOiBcImxvZ2luLWZvcm1cIn1cbn0pO30uY2FsbCh0aGlzLFwiYmVtXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5iZW06dHlwZW9mIGJlbSE9PVwidW5kZWZpbmVkXCI/YmVtOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59XG4pKHBhcmFtcyk7IH1cbi8vQCBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklpSXNJbVpwYkdVaU9pSXZhbk12YW1GMllYTmpjbWx3ZEMxdWIyUmxhbk12Ym05a1pWOXRiMlIxYkdWekwyRjFkR2d2ZEdWdGNHeGhkR1Z6TDJ4dloybHVMV1p2Y20wdWFtRmtaUzVxY3lJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYlhYMD0iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUvbGliL3J1bnRpbWUuanMnKTtcbm1vZHVsZS5leHBvcnRzPWZ1bmN0aW9uKHBhcmFtcykgeyBpZiAocGFyYW1zKSB7cGFyYW1zLnJlcXVpcmUgPSByZXF1aXJlO30gcmV0dXJuIChcbmZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYmVtKSB7XG5idWYucHVzaChcIlwiKTtcbnZhciBiZW1fY2hhaW4gPSBbXTtcbnZhciBiZW1fY2hhaW5fY29udGV4dHMgPSBbJ2Jsb2NrJ107XG5qYWRlX21peGluc1tcImJcIl0gPSBmdW5jdGlvbih0YWcsIGlzRWxlbWVudCl7XG52YXIgYmxvY2sgPSAodGhpcyAmJiB0aGlzLmJsb2NrKSwgYXR0cmlidXRlcyA9ICh0aGlzICYmIHRoaXMuYXR0cmlidXRlcykgfHwge307XG5iZW0uY2FsbCh0aGlzLCBidWYsIGJlbV9jaGFpbiwgYmVtX2NoYWluX2NvbnRleHRzLCB0YWcsIGlzRWxlbWVudClcbn07XG5qYWRlX21peGluc1tcImVcIl0gPSBmdW5jdGlvbih0YWcpe1xudmFyIGJsb2NrID0gKHRoaXMgJiYgdGhpcy5ibG9jayksIGF0dHJpYnV0ZXMgPSAodGhpcyAmJiB0aGlzLmF0dHJpYnV0ZXMpIHx8IHt9O1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5ibG9jayAmJiBibG9jaygpO1xufSxcbmF0dHJpYnV0ZXM6IGphZGUubWVyZ2UoW2F0dHJpYnV0ZXNdKVxufSwgdGFnLCB0cnVlKTtcbn07XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0KDQtdCz0LjRgdGC0YDQsNGG0LjRj1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRpdGxlXCJ9XG59LCAnaDQnKTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCy0YXQvtC0XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtc3dpdGNoXCI6IFwibG9naW4tZm9ybVwiLFwiY2xhc3NcIjogXCJidXR0b24tbGlua1wifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwiaGVhZGVyLWFzaWRlXCJ9XG59KTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmUgX19oZWFkZXJcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiZGF0YS1ub3RpZmljYXRpb25cIjogdHJ1ZSxcImNsYXNzXCI6IFwibGluZSBfX25vdGlmaWNhdGlvblwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCJFbWFpbDpcIik7XG59LFxuYXR0cmlidXRlczoge1wiZm9yXCI6IFwicmVnaXN0ZXItZW1haWxcIixcImNsYXNzXCI6IFwibGFiZWxcIn1cbn0sICdsYWJlbCcpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJpZFwiOiBcInJlZ2lzdGVyLWVtYWlsXCIsXCJuYW1lXCI6IFwiZW1haWxcIixcInR5cGVcIjogXCJlbWFpbFwiLFwicmVxdWlyZWRcIjogdHJ1ZSxcImF1dG9mb2N1c1wiOiB0cnVlLFwiY2xhc3NcIjogXCJjb250cm9sXCJ9XG59LCAnaW5wdXQnKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRleHQtaW5wdXQgX19pbnB1dFwifVxufSwgJ3NwYW4nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmVcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JjQvNGPINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjzpcIik7XG59LFxuYXR0cmlidXRlczoge1wiZm9yXCI6IFwicmVnaXN0ZXItZGlzcGxheU5hbWVcIixcImNsYXNzXCI6IFwibGFiZWxcIn1cbn0sICdsYWJlbCcpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJpZFwiOiBcInJlZ2lzdGVyLWRpc3BsYXlOYW1lXCIsXCJuYW1lXCI6IFwiZGlzcGxheU5hbWVcIixcInJlcXVpcmVkXCI6IHRydWUsXCJjbGFzc1wiOiBcImNvbnRyb2xcIn1cbn0sICdpbnB1dCcpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidGV4dC1pbnB1dCBfX2lucHV0XCJ9XG59LCAnc3BhbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZVwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQn9Cw0YDQvtC70Yw6XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcInJlZ2lzdGVyLXBhc3N3b3JkXCIsXCJjbGFzc1wiOiBcImxhYmVsXCJ9XG59LCAnbGFiZWwnKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiaWRcIjogXCJyZWdpc3Rlci1wYXNzd29yZFwiLFwidHlwZVwiOiBcInBhc3N3b3JkXCIsXCJuYW1lXCI6IFwicGFzc3dvcmRcIixcInJlcXVpcmVkXCI6IHRydWUsXCJjbGFzc1wiOiBcImNvbnRyb2xcIn1cbn0sICdpbnB1dCcpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidGV4dC1pbnB1dCBfX2lucHV0XCJ9XG59LCAnc3BhbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZVwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCX0LDRgNC10LPQuNGB0YLRgNC40YDQvtCy0LDRgtGM0YHRj1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRleHRcIn1cbn0sICdzcGFuJyk7XG59LFxuYXR0cmlidXRlczoge1widHlwZVwiOiBcInN1Ym1pdFwiLFwiY2xhc3NcIjogXCJzdWJtaXQtYnV0dG9uIF9zbWFsbCBzdWJtaXRcIn1cbn0sICdidXR0b24nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmUgX19mb290ZXJcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLRhdC+0LQg0YfQtdGA0LXQtyDRgdC+0YbQuNCw0LvRjNC90YvQtSDRgdC10YLQuFwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbnMtdGl0bGVcIn1cbn0sICdoNScpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcIkZhY2Vib29rXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJmYWNlYm9va1wiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2ZhY2Vib29rIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwiR29vZ2xlK1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwiZ29vZ2xlXCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfZ29vZ2xlIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLQutC+0L3RgtCw0LrRgtC1XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJ2a29udGFrdGVcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF92a29udGFrdGUgX19zb2NpYWwtbG9naW5cIn1cbn0sICdidXR0b24nKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCJHaXRodWJcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcImdpdGh1YlwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2dpdGh1YiBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCv0L3QtNC10LrRgVwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwieWFuZGV4XCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfeWFuZGV4IF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9fc29jaWFsLWxvZ2luc1wifVxufSk7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJ0eXBlXCI6IFwiYnV0dG9uXCIsXCJ0aXRsZVwiOiBcItC30LDQutGA0YvRgtGMXCIsXCJjbGFzc1wiOiBcImNsb3NlLWJ1dHRvbiBfX2Nsb3NlXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiYWN0aW9uXCI6IFwiI1wiLFwiZGF0YS1mb3JtXCI6IFwicmVnaXN0ZXJcIixcImNsYXNzXCI6IFwiZm9ybVwifVxufSwgJ2Zvcm0nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxvZ2luLWZvcm1cIn1cbn0pO30uY2FsbCh0aGlzLFwiYmVtXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5iZW06dHlwZW9mIGJlbSE9PVwidW5kZWZpbmVkXCI/YmVtOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59XG4pKHBhcmFtcyk7IH1cbi8vQCBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklpSXNJbVpwYkdVaU9pSXZhbk12YW1GMllYTmpjbWx3ZEMxdWIyUmxhbk12Ym05a1pWOXRiMlIxYkdWekwyRjFkR2d2ZEdWdGNHeGhkR1Z6TDNKbFoybHpkR1Z5TFdadmNtMHVhbUZrWlM1cWN5SXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJYWDA9IiwiLy8gQWRhcHRlZCBmcm9tIGJlbXRvLmphZGUsIGNvcHlyaWdodChjKSAyMDEyIFJvbWFuIEtvbWFyb3YgPGtpenVAa2l6dS5ydT5cblxuLyoganNoaW50IC1XMTA2ICovXG5cbnZhciBqYWRlID0gcmVxdWlyZSgnamFkZS9saWIvcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gIHNldHRpbmdzID0gc2V0dGluZ3MgfHwge307XG5cbiAgc2V0dGluZ3MucHJlZml4ID0gc2V0dGluZ3MucHJlZml4IHx8ICcnO1xuICBzZXR0aW5ncy5lbGVtZW50ID0gc2V0dGluZ3MuZWxlbWVudCB8fCAnX18nO1xuICBzZXR0aW5ncy5tb2RpZmllciA9IHNldHRpbmdzLm1vZGlmaWVyIHx8ICdfJztcbiAgc2V0dGluZ3MuZGVmYXVsdF90YWcgPSBzZXR0aW5ncy5kZWZhdWx0X3RhZyB8fCAnZGl2JztcblxuICByZXR1cm4gZnVuY3Rpb24oYnVmLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnLCBpc0VsZW1lbnQpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiLS0+XCIsIGFyZ3VtZW50cyk7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5ibG9jaztcbiAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMuYXR0cmlidXRlcyB8fCB7fTtcblxuICAgIC8vIFJld3JpdGluZyB0aGUgY2xhc3MgZm9yIGVsZW1lbnRzIGFuZCBtb2RpZmllcnNcbiAgICBpZiAoYXR0cmlidXRlcy5jbGFzcykge1xuICAgICAgdmFyIGJlbV9jbGFzc2VzID0gYXR0cmlidXRlcy5jbGFzcztcblxuICAgICAgaWYgKGJlbV9jbGFzc2VzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgYmVtX2NsYXNzZXMgPSBiZW1fY2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgICBiZW1fY2xhc3NlcyA9IGJlbV9jbGFzc2VzLnNwbGl0KCcgJyk7XG5cbiAgICAgIHZhciBiZW1fYmxvY2s7XG4gICAgICB0cnkge1xuICAgICAgICBiZW1fYmxvY2sgPSBiZW1fY2xhc3Nlc1swXS5tYXRjaChuZXcgUmVnRXhwKCdeKCgoPyEnICsgc2V0dGluZ3MuZWxlbWVudCArICd8JyArIHNldHRpbmdzLm1vZGlmaWVyICsgJykuKSspJykpWzFdO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmNvcnJlY3QgYmVtIGNsYXNzOiBcIiArIGJlbV9jbGFzc2VzWzBdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0VsZW1lbnQpIHtcbiAgICAgICAgYmVtX2NoYWluW2JlbV9jaGFpbi5sZW5ndGhdID0gYmVtX2Jsb2NrO1xuICAgICAgICBiZW1fY2xhc3Nlc1swXSA9IGJlbV9jbGFzc2VzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVtX2NsYXNzZXNbMF0gPSBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDFdICsgc2V0dGluZ3MuZWxlbWVudCArIGJlbV9jbGFzc2VzWzBdO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudF9ibG9jayA9IChpc0VsZW1lbnQgPyBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDFdICsgc2V0dGluZ3MuZWxlbWVudCA6ICcnKSArIGJlbV9ibG9jaztcblxuICAgICAgLy8gQWRkaW5nIHRoZSBibG9jayBpZiB0aGVyZSBpcyBvbmx5IG1vZGlmaWVyIGFuZC9vciBlbGVtZW50XG4gICAgICBpZiAoYmVtX2NsYXNzZXMuaW5kZXhPZihjdXJyZW50X2Jsb2NrKSA9PT0gLTEpIHtcbiAgICAgICAgYmVtX2NsYXNzZXNbYmVtX2NsYXNzZXMubGVuZ3RoXSA9IGN1cnJlbnRfYmxvY2s7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmVtX2NsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtsYXNzID0gYmVtX2NsYXNzZXNbaV07XG5cbiAgICAgICAgaWYgKGtsYXNzLm1hdGNoKG5ldyBSZWdFeHAoJ14oPyEnICsgc2V0dGluZ3MuZWxlbWVudCArICcpJyArIHNldHRpbmdzLm1vZGlmaWVyKSkpIHtcbiAgICAgICAgICAvLyBFeHBhbmRpbmcgdGhlIG1vZGlmaWVyc1xuICAgICAgICAgIGJlbV9jbGFzc2VzW2ldID0gY3VycmVudF9ibG9jayArIGtsYXNzO1xuICAgICAgICB9IGVsc2UgaWYgKGtsYXNzLm1hdGNoKG5ldyBSZWdFeHAoJ14nICsgc2V0dGluZ3MuZWxlbWVudCkpKSB7XG4gICAgICAgICAgLy8tIEV4cGFuZGluZyB0aGUgbWl4ZWQgaW4gZWxlbWVudHNcbiAgICAgICAgICBpZiAoYmVtX2NoYWluW2JlbV9jaGFpbi5sZW5ndGggLSAyXSkge1xuICAgICAgICAgICAgYmVtX2NsYXNzZXNbaV0gPSBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDJdICsga2xhc3M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJlbV9jbGFzc2VzW2ldID0gYmVtX2NoYWluW2JlbV9jaGFpbi5sZW5ndGggLSAxXSArIGtsYXNzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZGluZyBwcmVmaXhlc1xuICAgICAgICBpZiAoYmVtX2NsYXNzZXNbaV0ubWF0Y2gobmV3IFJlZ0V4cCgnXicgKyBjdXJyZW50X2Jsb2NrICsgJygkfCg/PScgKyBzZXR0aW5ncy5lbGVtZW50ICsgJ3wnICsgc2V0dGluZ3MubW9kaWZpZXIgKyAnKSknKSkpIHtcbiAgICAgICAgICBiZW1fY2xhc3Nlc1tpXSA9IHNldHRpbmdzLnByZWZpeCArIGJlbV9jbGFzc2VzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFdyaXRlIG1vZGlmaWVkIGNsYXNzZXMgdG8gYXR0cmlidXRlcyBpbiB0aGUgY29ycmVjdCBvcmRlclxuICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGJlbV9jbGFzc2VzLnNvcnQoKS5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgYmVtX3RhZyhidWYsIGJsb2NrLCBhdHRyaWJ1dGVzLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnKTtcblxuICAgIC8vIENsb3NpbmcgYWN0aW9ucyAocmVtb3ZlIHRoZSBjdXJyZW50IGJsb2NrIGZyb20gdGhlIGNoYWluKVxuICAgIGlmICghaXNFbGVtZW50KSB7XG4gICAgICBiZW1fY2hhaW4ucG9wKCk7XG4gICAgfVxuICAgIGJlbV9jaGFpbl9jb250ZXh0cy5wb3AoKTtcbiAgfTtcblxuXG4gIC8vIHVzZWQgZm9yIHR3ZWFraW5nIHdoYXQgdGFnIHdlIGFyZSB0aHJvd2luZyBhbmQgZG8gd2UgbmVlZCB0byB3cmFwIGFueXRoaW5nIGhlcmVcbiAgZnVuY3Rpb24gYmVtX3RhZyhidWYsIGJsb2NrLCBhdHRyaWJ1dGVzLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnKSB7XG4gICAgLy8gcmV3cml0aW5nIHRhZyBuYW1lIG9uIGRpZmZlcmVudCBjb250ZXh0c1xuICAgIHZhciBuZXdUYWcgPSB0YWcgfHwgc2V0dGluZ3MuZGVmYXVsdF90YWc7XG4gICAgdmFyIGNvbnRleHRJbmRleCA9IGJlbV9jaGFpbl9jb250ZXh0cy5sZW5ndGg7XG5cbiAgICAvL0NoZWNrcyBmb3IgY29udGV4dHMgaWYgbm8gdGFnIGdpdmVuXG4gICAgLy9jb25zb2xlLmxvZyhiZW1fY2hhaW5fY29udGV4dHMsIHRhZyk7XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdpbmxpbmUnKSB7XG4gICAgICAgIG5ld1RhZyA9ICdzcGFuJztcbiAgICAgIH0gZWxzZSBpZiAoYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdID09PSAnbGlzdCcpIHtcbiAgICAgICAgbmV3VGFnID0gJ2xpJztcbiAgICAgIH1cbiAgICAgIFxuXG4gICAgICAvL0F0dHJpYnV0ZXMgY29udGV4dCBjaGVja3NcbiAgICAgIGlmIChhdHRyaWJ1dGVzLmhyZWYpIHtcbiAgICAgICAgbmV3VGFnID0gJ2EnO1xuICAgICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzLmZvcikge1xuICAgICAgICBuZXdUYWcgPSAnbGFiZWwnO1xuICAgICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzLnNyYykge1xuICAgICAgICBuZXdUYWcgPSAnaW1nJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL0NvbnRleHR1YWwgd3JhcHBlcnNcbiAgICBpZiAoYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdID09PSAnbGlzdCcgJiYgbmV3VGFnICE9PSAnbGknKSB7XG4gICAgICBidWYucHVzaCgnPGxpPicpO1xuICAgIH0gZWxzZSBpZiAoYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdICE9PSAnbGlzdCcgJiYgYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdICE9PSAncHNldWRvLWxpc3QnICYmIG5ld1RhZyA9PT0gJ2xpJykge1xuICAgICAgYnVmLnB1c2goJzx1bD4nKTtcbiAgICAgIGJlbV9jaGFpbl9jb250ZXh0c1tiZW1fY2hhaW5fY29udGV4dHMubGVuZ3RoXSA9ICdwc2V1ZG8tbGlzdCc7XG4gICAgfSBlbHNlIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdwc2V1ZG8tbGlzdCcgJiYgbmV3VGFnICE9PSAnbGknKSB7XG4gICAgICBidWYucHVzaCgnPC91bD4nKTtcbiAgICAgIGJlbV9jaGFpbl9jb250ZXh0cy5wb3AoKTtcbiAgICB9XG5cbiAgICAvL1NldHRpbmcgY29udGV4dFxuICAgIGlmIChbJ2EnLCAnYWJicicsICdhY3JvbnltJywgJ2InLCAnYnInLCAnY29kZScsICdlbScsICdmb250JywgJ2knLCAnaW1nJywgJ2lucycsICdrYmQnLCAnbWFwJywgJ3NhbXAnLCAnc21hbGwnLCAnc3BhbicsICdzdHJvbmcnLCAnc3ViJywgJ3N1cCcsICdsYWJlbCcsICdwJywgJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2J10uaW5kZXhPZihuZXdUYWcpICE9PSAtMSkge1xuICAgICAgYmVtX2NoYWluX2NvbnRleHRzW2JlbV9jaGFpbl9jb250ZXh0cy5sZW5ndGhdID0gJ2lubGluZSc7XG4gICAgfSBlbHNlIGlmIChbJ3VsJywgJ29sJ10uaW5kZXhPZihuZXdUYWcpICE9PSAtMSkge1xuICAgICAgYmVtX2NoYWluX2NvbnRleHRzW2JlbV9jaGFpbl9jb250ZXh0cy5sZW5ndGhdID0gJ2xpc3QnO1xuICAgIH0gZWxzZSB7XG4gICAgICBiZW1fY2hhaW5fY29udGV4dHNbYmVtX2NoYWluX2NvbnRleHRzLmxlbmd0aF0gPSAnYmxvY2snO1xuICAgIH1cblxuICAgIHN3aXRjaCAobmV3VGFnKSB7XG4gICAgY2FzZSAnaW1nJzpcbiAgICAgIC8vIElmIHRoZXJlIGlzIG5vIHRpdGxlIHdlIGRvbid0IG5lZWQgaXQgdG8gc2hvdyBldmVuIGlmIHRoZXJlIGlzIHNvbWUgYWx0XG4gICAgICBpZiAoYXR0cmlidXRlcy5hbHQgJiYgIWF0dHJpYnV0ZXMudGl0bGUpIHtcbiAgICAgICAgYXR0cmlidXRlcy50aXRsZSA9ICcnO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgaGF2ZSB0aXRsZSwgd2UgbXVzdCBoYXZlIGl0IGluIGFsdCBpZiBpdCdzIG5vdCBzZXRcbiAgICAgIGlmIChhdHRyaWJ1dGVzLnRpdGxlICYmICFhdHRyaWJ1dGVzLmFsdCkge1xuICAgICAgICBhdHRyaWJ1dGVzLmFsdCA9IGF0dHJpYnV0ZXMudGl0bGU7XG4gICAgICB9XG4gICAgICBpZiAoIWF0dHJpYnV0ZXMuYWx0KSB7XG4gICAgICAgIGF0dHJpYnV0ZXMuYWx0ID0gJyc7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBpZiAoIWF0dHJpYnV0ZXMudHlwZSkge1xuICAgICAgICBhdHRyaWJ1dGVzLnR5cGUgPSBcInRleHRcIjtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2h0bWwnOlxuICAgICAgYnVmLnB1c2goJzwhRE9DVFlQRSBIVE1MPicpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYSc6XG4gICAgICBpZiAoIWF0dHJpYnV0ZXMuaHJlZikge1xuICAgICAgICBhdHRyaWJ1dGVzLmhyZWYgPSAnIyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYnVmLnB1c2goJzwnICsgbmV3VGFnICsgamFkZS5hdHRycyhqYWRlLm1lcmdlKFthdHRyaWJ1dGVzXSksIHRydWUpICsgXCI+XCIpO1xuXG4gICAgaWYgKGJsb2NrKSBibG9jaygpO1xuXG4gICAgaWYgKFsnYXJlYScsICdiYXNlJywgJ2JyJywgJ2NvbCcsICdlbWJlZCcsICdocicsICdpbWcnLCAnaW5wdXQnLCAna2V5Z2VuJywgJ2xpbmsnLCAnbWVudWl0ZW0nLCAnbWV0YScsICdwYXJhbScsICdzb3VyY2UnLCAndHJhY2snLCAnd2JyJ10uaW5kZXhPZihuZXdUYWcpID09IC0xKSB7XG4gICAgICBidWYucHVzaCgnPC8nICsgbmV3VGFnICsgJz4nKTtcbiAgICB9XG5cbiAgICAvLyBDbG9zaW5nIGFsbCB0aGUgd3JhcHBlciB0YWlsc1xuICAgIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdsaXN0JyAmJiBuZXdUYWcgIT0gJ2xpJykge1xuICAgICAgYnVmLnB1c2goJzwvbGk+Jyk7XG4gICAgfVxuICB9XG5cblxufTtcbiIsbnVsbCwidmFyIGJlbSA9IHJlcXVpcmUoJ2JlbS1qYWRlJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0ZW1wbGF0ZSwgbG9jYWxzKSB7XG4gIGxvY2FscyA9IGxvY2FscyA/IE9iamVjdC5jcmVhdGUobG9jYWxzKSA6IHt9O1xuICBhZGRTdGFuZGFyZEhlbHBlcnMobG9jYWxzKTtcblxuICByZXR1cm4gdGVtcGxhdGUobG9jYWxzKTtcbn07XG5cbmZ1bmN0aW9uIGFkZFN0YW5kYXJkSGVscGVycyhsb2NhbHMpIHtcbiAgbG9jYWxzLmJlbSA9IGJlbTtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5cbmZ1bmN0aW9uIGZpbmREZWxlZ2F0ZVRhcmdldChldmVudCwgc2VsZWN0b3IpIHtcbiAgdmFyIGN1cnJlbnROb2RlID0gZXZlbnQudGFyZ2V0O1xuICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICBpZiAoY3VycmVudE5vZGUubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiBjdXJyZW50Tm9kZTtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudE5vZGUgPT0gZXZlbnQuY3VycmVudFRhcmdldCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucGFyZW50RWxlbWVudDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gZGVsZWdhdGUodGFibGUsICd0aCcsIGNsaWNrLCBoYW5kbGVyKVxuLy8gdGFibGVcbi8vICAgdGhlYWRcbi8vICAgICB0aCAgICAgICAgIF4qXG4vLyAgICAgICBjb2RlICA8LS1cbmZ1bmN0aW9uIGRlbGVnYXRlKHRvcEVsZW1lbnQsIHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQpIHtcbiAgLyoganNoaW50IC1XMDQwICovXG4gIHRvcEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGZvdW5kID0gZmluZERlbGVnYXRlVGFyZ2V0KGV2ZW50LCBzZWxlY3Rvcik7XG5cbiAgICAvLyAuY3VycmVudFRhcmdldCBpcyByZWFkIG9ubHksIEkgY2FuIG5vdCBvdmVyd3JpdGUgaXQgdG8gdGhlIFwiZm91bmRcIiBlbGVtZW50XG4gICAgLy8gT2JqZWN0LmNyZWF0ZSB3cmFwcGVyIHdvdWxkIGJyZWFrIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAvLyBzbywga2VlcCBpbiBtaW5kOlxuICAgIC8vIC0tPiBldmVudC5jdXJyZW50VGFyZ2V0IGlzIGFsd2F5cyB0aGUgdG9wLWxldmVsIChkZWxlZ2F0aW5nKSBlbGVtZW50IVxuICAgIC8vIHVzZSBcInRoaXNcIiB0byBnZXQgdGhlIGZvdW5kIHRhcmdldFxuXG4gICAgZXZlbnQuZGVsZWdhdGVUYXJnZXQgPSBmb3VuZDsgLy8gdXNlIGluc3RlYWQgb2YgXCJ0aGlzXCIgaW4gb2JqZWN0IG1ldGhvZHNcblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgLy8gaWYgaW4gY29udGV4dCBvZiBvYmplY3QsIHVzZSBvYmplY3QgYXMgdGhpcyxcbiAgICAgIGhhbmRsZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIGV2ZW50KTtcbiAgICB9XG4gIH0pO1xufVxuXG5kZWxlZ2F0ZS5kZWxlZ2F0ZU1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gIG9iai5kZWxlZ2F0ZSA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICBkZWxlZ2F0ZSh0aGlzLmVsZW0sIHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIsIHRoaXMpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWxlZ2F0ZTtcblxuIiwidmFyIGh1bWFuZSA9IHJlcXVpcmUoJ2h1bWFuZS1qcycpO1xuXG5leHBvcnRzLmluZm8gPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWxpYm5vdGlmeS1pbmZvJywgdGltZW91dDogMTAwMCB9KTtcbmV4cG9ydHMuZXJyb3IgPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWxpYm5vdGlmeS1lcnJvcicsIHRpbWVvdXQ6IDMwMDAgfSk7XG4iLCJmdW5jdGlvbiB0ZXh0Tm9kZUlmU3RyaW5nKG5vZGUpIHtcbiAgcmV0dXJuIHR5cGVvZiBub2RlID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpIDogbm9kZTtcbn1cblxuZnVuY3Rpb24gbXV0YXRpb25NYWNybyhub2Rlcykge1xuICBpZiAobm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHRleHROb2RlSWZTdHJpbmcobm9kZXNbMF0pO1xuICB9XG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIGxpc3QgPSBbXS5zbGljZS5jYWxsKG5vZGVzKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0ZXh0Tm9kZUlmU3RyaW5nKGxpc3RbaV0pKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbnZhciBtZXRob2RzID0ge1xuICBtYXRjaGVzOiBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yLFxuICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnROb2RlID0gdGhpcy5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm4gcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gIH1cbn07XG5cbmZvciAodmFyIG1ldGhvZE5hbWUgaW4gbWV0aG9kcykge1xuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBtZXRob2RzW21ldGhvZE5hbWVdO1xuICB9XG59XG5cbnRyeSB7XG4gIG5ldyBDdXN0b21FdmVudChcIklFIGhhcyBDdXN0b21FdmVudCwgYnV0IGRvZXNuJ3Qgc3VwcG9ydCBjb25zdHJ1Y3RvclwiKTtcbn0gY2F0Y2ggKGUpIHtcblxuICB3aW5kb3cuQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbihldmVudCwgcGFyYW1zKSB7XG4gICAgdmFyIGV2dDtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgcmV0dXJuIGV2dDtcbiAgfTtcblxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHdpbmRvdy5FdmVudC5wcm90b3R5cGUpO1xufVxuXG4iLCJyZXF1aXJlKCcuL2RvbTQnKTtcbiIsIi8vIFVzYWdlOlxuLy8gIDEpIG5ldyBTcGlubmVyKHsgZWxlbTogZWxlbX0pIC0+IHN0YXJ0L3N0b3AoKVxuLy8gIDIpIG5ldyBTcGlubmVyKCkgLT4gc29tZXdoZXJlLmFwcGVuZChzcGlubmVyLmVsZW0pIC0+IHN0YXJ0L3N0b3BcbmZ1bmN0aW9uIFNwaW5uZXIob3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5lbGVtID0gb3B0aW9ucy5lbGVtO1xuICB0aGlzLnNpemUgPSBvcHRpb25zLnNpemUgfHwgJ21lZGl1bSc7XG4gIC8vIGFueSBjbGFzcyB0byBhZGQgdG8gc3Bpbm5lciAobWFrZSBzcGlubmVyIHNwZWNpYWwgaGVyZSlcbiAgdGhpcy5jbGFzcyA9IG9wdGlvbnMuY2xhc3MgPyAoJyAnICsgb3B0aW9ucy5jbGFzcykgOiAnJztcblxuICAvLyBhbnkgY2xhc3MgdG8gYWRkIHRvIGVsZW1lbnQgKHRvIGhpZGUgaXQncyBjb250ZW50IGZvciBpbnN0YW5jZSlcbiAgdGhpcy5lbGVtQ2xhc3MgPSBvcHRpb25zLmVsZW1DbGFzcztcblxuICBpZiAodGhpcy5zaXplICE9ICdtZWRpdW0nICYmIHRoaXMuc2l6ZSAhPSAnc21hbGwnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgc2l6ZTogXCIgKyB0aGlzLnNpemUpO1xuICB9XG5cbiAgaWYgKCF0aGlzLmVsZW0pIHtcbiAgICB0aGlzLmVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgfVxufVxuXG5TcGlubmVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5lbGVtQ2xhc3MpIHtcbiAgICB0aGlzLmVsZW0uY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmVsZW1DbGFzcyk7XG4gIH1cblxuICB0aGlzLmVsZW0uaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCAnPHNwYW4gY2xhc3M9XCJzcGlubmVyIHNwaW5uZXJfYWN0aXZlIHNwaW5uZXJfJyArIHRoaXMuc2l6ZSArIHRoaXMuY2xhc3MgKyAnXCI+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzFcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzJcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzNcIj48L3NwYW4+PC9zcGFuPicpO1xufTtcblxuU3Bpbm5lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW0ucmVtb3ZlQ2hpbGQodGhpcy5lbGVtLnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyJykpO1xuXG4gIGlmICh0aGlzLmVsZW1DbGFzcykge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuZWxlbUNsYXNzKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGlubmVyO1xuIiwidmFyIG5vdGlmeSA9IHJlcXVpcmUoJy4vbm90aWZ5Jyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3hocmZhaWwnLCBmdW5jdGlvbihldmVudCkge1xuICBub3RpZnkuZXJyb3IoZXZlbnQucmVhc29uKTtcbn0pO1xuIiwicmVxdWlyZSgnLi9wb2x5ZmlsbCcpO1xucmVxdWlyZSgnLi94aHItbm90aWZ5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0geGhyO1xuXG4vLyBXcmFwcGVyIGFib3V0IFhIUlxuLy8gIyBHbG9iYWwgRXZlbnRzXG4vLyB0cmlnZ2VycyBkb2N1bWVudC5sb2Fkc3RhcnQvbG9hZGVuZCBvbiBjb21tdW5pY2F0aW9uIHN0YXJ0L2VuZFxuLy8gICAgLS0+IHVubGVzcyBvcHRpb25zLm5vR2xvYmFsRXZlbnRzIGlzIHNldFxuLy9cbi8vICMgRXZlbnRzXG4vLyB0cmlnZ2VycyBmYWlsL3N1Y2Nlc3Mgb24gbG9hZCBlbmQ6XG4vLyAgICAtLT4gYnkgZGVmYXVsdCBzdGF0dXM9MjAwIGlzIG9rLCB0aGUgb3RoZXJzIGFyZSBmYWlsdXJlc1xuLy8gICAgLS0+IG9wdGlvbnMuc3VjY2Vzc1N0YXR1c2VzID0gWzIwMSw0MDldIGFsbG93IGdpdmVuIHN0YXR1c2VzXG4vLyAgICAtLT4gZmFpbCBldmVudCBoYXMgLnJlYXNvbiBmaWVsZFxuLy8gICAgLS0+IHN1Y2Nlc3MgZXZlbnQgaGFzIC5yZXN1bHQgZmllbGRcbi8vXG4vLyAjIEpTT05cbi8vICAgIC0tPiBzZW5kKG9iamVjdCkgY2FsbHMgSlNPTi5zdHJpbmdpZnlcbi8vICAgIC0tPiBvcHRpb25zLmpzb24gYWRkcyBBY2NlcHQ6IGpzb24gKHdlIHdhbnQganNvbilcbi8vIGlmIG9wdGlvbnMuanNvbiBvciBzZXJ2ZXIgcmV0dXJuZWQganNvbiBjb250ZW50IHR5cGVcbi8vICAgIC0tPiBhdXRvcGFyc2UganNvblxuLy8gICAgLS0+IGZhaWwgaWYgZXJyb3Jcbi8vXG4vLyAjIENTUkZcbi8vICAgIC0tPiBHRVQvT1BUSU9OUy9IRUFEIHJlcXVlc3RzIGdldCBfY3NyZiBmaWVsZCBmcm9tIHdpbmRvdy5jc3JmXG5cbmZ1bmN0aW9uIHhocihvcHRpb25zKSB7XG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICB2YXIgbWV0aG9kID0gb3B0aW9ucy5tZXRob2QgfHwgJ0dFVCc7XG4gIHJlcXVlc3Qub3BlbihtZXRob2QsIG9wdGlvbnMudXJsLCBvcHRpb25zLnN5bmMgPyBmYWxzZSA6IHRydWUpO1xuXG4gIHJlcXVlc3QubWV0aG9kID0gbWV0aG9kO1xuXG4gIGlmICghb3B0aW9ucy5ub0dsb2JhbEV2ZW50cykge1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlID0gd3JhcEV2ZW50KCd4aHJzdGFydCcsIGV2ZW50KTtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlID0gd3JhcEV2ZW50KCd4aHJlbmQnLCBldmVudCk7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyc3VjY2VzcycsIGV2ZW50KTtcbiAgICAgIGUucmVzdWx0ID0gZXZlbnQucmVzdWx0O1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2ZhaWwnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocmZhaWwnLCBldmVudCk7XG4gICAgICBlLnJlYXNvbiA9IGV2ZW50LnJlYXNvbjtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5qc29uKSB7IC8vIG1lYW5zIHdlIHdhbnQganNvblxuICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIkFjY2VwdFwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gIH1cblxuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ1gtUmVxdWVzdGVkLVdpdGgnLCBcIlhNTEh0dHBSZXF1ZXN0XCIpO1xuXG4gIHZhciBzdWNjZXNzU3RhdHVzZXMgPSBvcHRpb25zLnN1Y2Nlc3NTdGF0dXNlcyB8fCBbMjAwXTtcblxuICBmdW5jdGlvbiB3cmFwRXZlbnQobmFtZSwgZSkge1xuICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChuYW1lKTtcbiAgICBldmVudC5vcmlnaW5hbEV2ZW50ID0gZTtcbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBmYWlsKHJlYXNvbiwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gd3JhcEV2ZW50KFwiZmFpbFwiLCBvcmlnaW5hbEV2ZW50KTtcbiAgICBlLnJlYXNvbiA9IHJlYXNvbjtcbiAgICByZXF1ZXN0LmRpc3BhdGNoRXZlbnQoZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdWNjZXNzKHJlc3VsdCwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gd3JhcEV2ZW50KFwic3VjY2Vzc1wiLCBvcmlnaW5hbEV2ZW50KTtcbiAgICBlLnJlc3VsdCA9IHJlc3VsdDtcbiAgICByZXF1ZXN0LmRpc3BhdGNoRXZlbnQoZSk7XG4gIH1cblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihlKSB7XG4gICAgZmFpbChcItCe0YjQuNCx0LrQsCDRgdCy0Y/Qt9C4INGBINGB0LXRgNCy0LXRgNC+0LwuXCIsIGUpO1xuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0aW1lb3V0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBmYWlsKFwi0J/RgNC10LLRi9GI0LXQvdC+INC80LDQutGB0LjQvNCw0LvRjNC90L4g0LTQvtC/0YPRgdGC0LjQvNC+0LUg0LLRgNC10LzRjyDQvtC20LjQtNCw0L3QuNGPINC+0YLQstC10YLQsCDQvtGCINGB0LXRgNCy0LXRgNCwLlwiLCBlKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgZnVuY3Rpb24oZSkge1xuICAgIGZhaWwoXCLQl9Cw0L/RgNC+0YEg0LHRi9C7INC/0YDQtdGA0LLQsNC9LlwiLCBlKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCF0aGlzLnN0YXR1cykgeyAvLyBkb2VzIHRoYXQgZXZlciBoYXBwZW4/XG4gICAgICBmYWlsKFwi0J3QtSDQv9C+0LvRg9GH0LXQvSDQvtGC0LLQtdGCINC+0YIg0YHQtdGA0LLQtdGA0LAuXCIsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzdWNjZXNzU3RhdHVzZXMuaW5kZXhPZih0aGlzLnN0YXR1cykgPT0gLTEpIHtcbiAgICAgIGZhaWwoXCLQntGI0LjQsdC60LAg0L3QsCDRgdGC0L7RgNC+0L3QtSDRgdC10YDQstC10YDQsCAo0LrQvtC0IFwiICsgdGhpcy5zdGF0dXMgKyBcIiksINC/0L7Qv9GL0YLQsNC50YLQtdGB0Ywg0L/QvtC30LTQvdC10LVcIiwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucmVzcG9uc2VUZXh0O1xuICAgIHZhciBjb250ZW50VHlwZSA9IHRoaXMuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIik7XG4gICAgaWYgKGNvbnRlbnRUeXBlLm1hdGNoKC9eYXBwbGljYXRpb25cXC9qc29uLykgfHwgb3B0aW9ucy5qc29uKSB7IC8vIGF1dG9wYXJzZSBqc29uIGlmIFdBTlQgb3IgUkVDRUlWRUQganNvblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmYWlsKFwi0J3QtdC60L7RgNGA0LXQutGC0L3Ri9C5INGE0L7RgNC80LDRgiDQvtGC0LLQtdGC0LAg0L7RgiDRgdC10YDQstC10YDQsFwiLCBlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN1Y2Nlc3MocmVzdWx0LCBlKTtcbiAgfSk7XG5cbiAgd3JhcENzcmZTZW5kKHJlcXVlc3QpO1xuICByZXR1cm4gcmVxdWVzdDtcbn1cblxuLy8gQWxsIG5vbi1HRVQgcmVxdWVzdCBnZXQgX2NzcmYgZnJvbSB3aW5kb3cuY3NyZiBhdXRvbWF0aWNhbGx5XG5mdW5jdGlvbiB3cmFwQ3NyZlNlbmQocmVxdWVzdCkge1xuXG4gIHZhciBzZW5kID0gcmVxdWVzdC5zZW5kO1xuICByZXF1ZXN0LnNlbmQgPSBmdW5jdGlvbihib2R5KSB7XG5cbiAgICBpZiAoIX5bJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnXS5pbmRleE9mKHRoaXMubWV0aG9kKSkge1xuICAgICAgaWYgKGJvZHkgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuICAgICAgICBib2R5LmFwcGVuZChcIl9jc3JmXCIsIHdpbmRvdy5jc3JmKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoYm9keSkgPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgYm9keS5fY3NyZiA9IHdpbmRvdy5jc3JmO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IHtfY3NyZjogd2luZG93LmNzcmZ9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGJvZHkpID09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICB0aGlzLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLThcIik7XG4gICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgfVxuXG4gICAgc2VuZC5jYWxsKHRoaXMsIGJvZHkpO1xuXG4gIH07XG5cbn1cbiIsIi8qKlxuICogaHVtYW5lLmpzXG4gKiBIdW1hbml6ZWQgTWVzc2FnZXMgZm9yIE5vdGlmaWNhdGlvbnNcbiAqIEBhdXRob3IgTWFyYyBIYXJ0ZXIgKEB3YXZkZWQpXG4gKiBAZXhhbXBsZVxuICogICBodW1hbmUubG9nKCdoZWxsbyB3b3JsZCcpO1xuICogU2VlIG1vcmUgdXNhZ2UgZXhhbXBsZXMgYXQ6IGh0dHA6Ly93YXZkZWQuZ2l0aHViLmNvbS9odW1hbmUtanMvXG4gKi9cblxuOyFmdW5jdGlvbiAobmFtZSwgY29udGV4dCwgZGVmaW5pdGlvbikge1xuICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24obmFtZSwgY29udGV4dClcbiAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgID09PSAnb2JqZWN0JykgZGVmaW5lKGRlZmluaXRpb24pXG4gICBlbHNlIGNvbnRleHRbbmFtZV0gPSBkZWZpbml0aW9uKG5hbWUsIGNvbnRleHQpXG59KCdodW1hbmUnLCB0aGlzLCBmdW5jdGlvbiAobmFtZSwgY29udGV4dCkge1xuICAgdmFyIHdpbiA9IHdpbmRvd1xuICAgdmFyIGRvYyA9IGRvY3VtZW50XG5cbiAgIHZhciBFTlYgPSB7XG4gICAgICBvbjogZnVuY3Rpb24gKGVsLCB0eXBlLCBjYikge1xuICAgICAgICAgJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbiA/IGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSxjYixmYWxzZSkgOiBlbC5hdHRhY2hFdmVudCgnb24nK3R5cGUsY2IpXG4gICAgICB9LFxuICAgICAgb2ZmOiBmdW5jdGlvbiAoZWwsIHR5cGUsIGNiKSB7XG4gICAgICAgICAncmVtb3ZlRXZlbnRMaXN0ZW5lcicgaW4gd2luID8gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLGNiLGZhbHNlKSA6IGVsLmRldGFjaEV2ZW50KCdvbicrdHlwZSxjYilcbiAgICAgIH0sXG4gICAgICBiaW5kOiBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkoY3R4LGFyZ3VtZW50cykgfVxuICAgICAgfSxcbiAgICAgIGlzQXJyYXk6IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XScgfSxcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHByZWZlcnJlZCwgZmFsbGJhY2spIHtcbiAgICAgICAgIHJldHVybiBwcmVmZXJyZWQgIT0gbnVsbCA/IHByZWZlcnJlZCA6IGZhbGxiYWNrXG4gICAgICB9LFxuICAgICAgdHJhbnNTdXBwb3J0OiBmYWxzZSxcbiAgICAgIHVzZUZpbHRlcjogL21zaWUgWzY3OF0vaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLCAvLyBzbmlmZiwgc25pZmZcbiAgICAgIF9jaGVja1RyYW5zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgdmFyIHZlbmRvcnMgPSB7IHdlYmtpdDogJ3dlYmtpdCcsIE1vejogJycsIE86ICdvJywgbXM6ICdNUycgfVxuXG4gICAgICAgICBmb3IgKHZhciB2ZW5kb3IgaW4gdmVuZG9ycylcbiAgICAgICAgICAgIGlmICh2ZW5kb3IgKyAnVHJhbnNpdGlvbicgaW4gZWwuc3R5bGUpIHtcbiAgICAgICAgICAgICAgIHRoaXMudmVuZG9yUHJlZml4ID0gdmVuZG9yc1t2ZW5kb3JdXG4gICAgICAgICAgICAgICB0aGlzLnRyYW5zU3VwcG9ydCA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgIH1cbiAgIH1cbiAgIEVOVi5fY2hlY2tUcmFuc2l0aW9uKClcblxuICAgdmFyIEh1bWFuZSA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICBvIHx8IChvID0ge30pXG4gICAgICB0aGlzLnF1ZXVlID0gW11cbiAgICAgIHRoaXMuYmFzZUNscyA9IG8uYmFzZUNscyB8fCAnaHVtYW5lJ1xuICAgICAgdGhpcy5hZGRuQ2xzID0gby5hZGRuQ2xzIHx8ICcnXG4gICAgICB0aGlzLnRpbWVvdXQgPSAndGltZW91dCcgaW4gbyA/IG8udGltZW91dCA6IDI1MDBcbiAgICAgIHRoaXMud2FpdEZvck1vdmUgPSBvLndhaXRGb3JNb3ZlIHx8IGZhbHNlXG4gICAgICB0aGlzLmNsaWNrVG9DbG9zZSA9IG8uY2xpY2tUb0Nsb3NlIHx8IGZhbHNlXG4gICAgICB0aGlzLnRpbWVvdXRBZnRlck1vdmUgPSBvLnRpbWVvdXRBZnRlck1vdmUgfHwgZmFsc2UgXG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG8uY29udGFpbmVyXG5cbiAgICAgIHRyeSB7IHRoaXMuX3NldHVwRWwoKSB9IC8vIGF0dGVtcHQgdG8gc2V0dXAgZWxlbWVudHNcbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIEVOVi5vbih3aW4sJ2xvYWQnLEVOVi5iaW5kKHRoaXMuX3NldHVwRWwsIHRoaXMpKSAvLyBkb20gd2Fzbid0IHJlYWR5LCB3YWl0IHRpbGwgcmVhZHlcbiAgICAgIH1cbiAgIH1cblxuICAgSHVtYW5lLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBIdW1hbmUsXG4gICAgICBfc2V0dXBFbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICBpZiAoIXRoaXMuY29udGFpbmVyKXtcbiAgICAgICAgICAgaWYoZG9jLmJvZHkpIHRoaXMuY29udGFpbmVyID0gZG9jLmJvZHk7XG4gICAgICAgICAgIGVsc2UgdGhyb3cgJ2RvY3VtZW50LmJvZHkgaXMgbnVsbCdcbiAgICAgICAgIH1cbiAgICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKVxuICAgICAgICAgdGhpcy5lbCA9IGVsXG4gICAgICAgICB0aGlzLnJlbW92ZUV2ZW50ID0gRU5WLmJpbmQoZnVuY3Rpb24oKXsgaWYgKCF0aGlzLnRpbWVvdXRBZnRlck1vdmUpe3RoaXMucmVtb3ZlKCl9IGVsc2Uge3NldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5yZW1vdmUsdGhpcyksdGhpcy50aW1lb3V0KTt9fSx0aGlzKVxuICAgICAgICAgdGhpcy50cmFuc0V2ZW50ID0gRU5WLmJpbmQodGhpcy5fYWZ0ZXJBbmltYXRpb24sdGhpcylcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICB9LFxuICAgICAgX2FmdGVyVGltZW91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgaWYgKCFFTlYuY29uZmlnKHRoaXMuY3VycmVudE1zZy53YWl0Rm9yTW92ZSx0aGlzLndhaXRGb3JNb3ZlKSkgdGhpcy5yZW1vdmUoKVxuXG4gICAgICAgICBlbHNlIGlmICghdGhpcy5yZW1vdmVFdmVudHNTZXQpIHtcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwnbW91c2Vtb3ZlJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwna2V5cHJlc3MnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICBFTlYub24oZG9jLmJvZHksJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50c1NldCA9IHRydWVcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfcnVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAodGhpcy5fYW5pbWF0aW5nIHx8ICF0aGlzLnF1ZXVlLmxlbmd0aCB8fCAhdGhpcy5lbCkgcmV0dXJuXG5cbiAgICAgICAgIHRoaXMuX2FuaW1hdGluZyA9IHRydWVcbiAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVyKVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZXIgPSBudWxsXG4gICAgICAgICB9XG5cbiAgICAgICAgIHZhciBtc2cgPSB0aGlzLnF1ZXVlLnNoaWZ0KClcbiAgICAgICAgIHZhciBjbGlja1RvQ2xvc2UgPSBFTlYuY29uZmlnKG1zZy5jbGlja1RvQ2xvc2UsdGhpcy5jbGlja1RvQ2xvc2UpXG5cbiAgICAgICAgIGlmIChjbGlja1RvQ2xvc2UpIHtcbiAgICAgICAgICAgIEVOVi5vbih0aGlzLmVsLCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbih0aGlzLmVsLCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgfVxuXG4gICAgICAgICB2YXIgdGltZW91dCA9IEVOVi5jb25maWcobXNnLnRpbWVvdXQsdGhpcy50aW1lb3V0KVxuXG4gICAgICAgICBpZiAodGltZW91dCA+IDApXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lciA9IHNldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5fYWZ0ZXJUaW1lb3V0LHRoaXMpLCB0aW1lb3V0KVxuXG4gICAgICAgICBpZiAoRU5WLmlzQXJyYXkobXNnLmh0bWwpKSBtc2cuaHRtbCA9ICc8dWw+PGxpPicrbXNnLmh0bWwuam9pbignPGxpPicpKyc8L3VsPidcblxuICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSBtc2cuaHRtbFxuICAgICAgICAgdGhpcy5jdXJyZW50TXNnID0gbXNnXG4gICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNsc1xuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICAgICAgICAgIHNldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5fc2hvd01zZyx0aGlzKSw1MClcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TXNnKClcbiAgICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIF9zZXRPcGFjaXR5OiBmdW5jdGlvbiAob3BhY2l0eSkge1xuICAgICAgICAgaWYgKEVOVi51c2VGaWx0ZXIpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgdGhpcy5lbC5maWx0ZXJzLml0ZW0oJ0RYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkFscGhhJykuT3BhY2l0eSA9IG9wYWNpdHkqMTAwXG4gICAgICAgICAgICB9IGNhdGNoKGVycil7fVxuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUub3BhY2l0eSA9IFN0cmluZyhvcGFjaXR5KVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9zaG93TXNnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgYWRkbkNscyA9IEVOVi5jb25maWcodGhpcy5jdXJyZW50TXNnLmFkZG5DbHMsdGhpcy5hZGRuQ2xzKVxuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzKycgJyt0aGlzLmJhc2VDbHMrJy1hbmltYXRlJ1xuICAgICAgICAgfVxuICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3BhY2l0eSA9IDBcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzKycgJyt0aGlzLmJhc2VDbHMrJy1qcy1hbmltYXRlJ1xuICAgICAgICAgICAgdGhpcy5fc2V0T3BhY2l0eSgwKSAvLyByZXNldCB2YWx1ZSBzbyBob3ZlciBzdGF0ZXMgd29ya1xuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICBpZiAob3BhY2l0eSA8IDEpIHtcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gMC4xXG4gICAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSA+IDEpIG9wYWNpdHkgPSAxXG4gICAgICAgICAgICAgICAgICBzZWxmLl9zZXRPcGFjaXR5KG9wYWNpdHkpXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNlIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgICAgICB9LCAzMClcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfaGlkZU1zZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGFkZG5DbHMgPSBFTlYuY29uZmlnKHRoaXMuY3VycmVudE1zZy5hZGRuQ2xzLHRoaXMuYWRkbkNscylcbiAgICAgICAgIGlmIChFTlYudHJhbnNTdXBwb3J0KSB7XG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNscysnICcrYWRkbkNsc1xuICAgICAgICAgICAgRU5WLm9uKHRoaXMuZWwsRU5WLnZlbmRvclByZWZpeCA/IEVOVi52ZW5kb3JQcmVmaXgrJ1RyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnLHRoaXMudHJhbnNFdmVudClcbiAgICAgICAgIH1cbiAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAxXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICBpZihvcGFjaXR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgb3BhY2l0eSAtPSAwLjFcbiAgICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5IDwgMCkgb3BhY2l0eSA9IDBcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3NldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZWwuY2xhc3NOYW1lID0gc2VsZi5iYXNlQ2xzKycgJythZGRuQ2xzXG4gICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKVxuICAgICAgICAgICAgICAgICAgc2VsZi5fYWZ0ZXJBbmltYXRpb24oKVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzApXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX2FmdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkgRU5WLm9mZih0aGlzLmVsLEVOVi52ZW5kb3JQcmVmaXggPyBFTlYudmVuZG9yUHJlZml4KydUcmFuc2l0aW9uRW5kJyA6ICd0cmFuc2l0aW9uZW5kJyx0aGlzLnRyYW5zRXZlbnQpXG5cbiAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRNc2cuY2IpIHRoaXMuY3VycmVudE1zZy5jYigpXG4gICAgICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICAgICAgdGhpcy5fYW5pbWF0aW5nID0gZmFsc2VcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICB9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgdmFyIGNiID0gdHlwZW9mIGUgPT0gJ2Z1bmN0aW9uJyA/IGUgOiBudWxsXG5cbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ21vdXNlbW92ZScsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwna2V5cHJlc3MnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKGRvYy5ib2R5LCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZih0aGlzLmVsLCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYodGhpcy5lbCwndG91Y2hzdGFydCcsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRzU2V0ID0gZmFsc2VcblxuICAgICAgICAgaWYgKGNiICYmIHRoaXMuY3VycmVudE1zZykgdGhpcy5jdXJyZW50TXNnLmNiID0gY2JcbiAgICAgICAgIGlmICh0aGlzLl9hbmltYXRpbmcpIHRoaXMuX2hpZGVNc2coKVxuICAgICAgICAgZWxzZSBpZiAoY2IpIGNiKClcbiAgICAgIH0sXG4gICAgICBsb2c6IGZ1bmN0aW9uIChodG1sLCBvLCBjYiwgZGVmYXVsdHMpIHtcbiAgICAgICAgIHZhciBtc2cgPSB7fVxuICAgICAgICAgaWYgKGRlZmF1bHRzKVxuICAgICAgICAgICBmb3IgKHZhciBvcHQgaW4gZGVmYXVsdHMpXG4gICAgICAgICAgICAgICBtc2dbb3B0XSA9IGRlZmF1bHRzW29wdF1cblxuICAgICAgICAgaWYgKHR5cGVvZiBvID09ICdmdW5jdGlvbicpIGNiID0gb1xuICAgICAgICAgZWxzZSBpZiAobylcbiAgICAgICAgICAgIGZvciAodmFyIG9wdCBpbiBvKSBtc2dbb3B0XSA9IG9bb3B0XVxuXG4gICAgICAgICBtc2cuaHRtbCA9IGh0bWxcbiAgICAgICAgIGlmIChjYikgbXNnLmNiID0gY2JcbiAgICAgICAgIHRoaXMucXVldWUucHVzaChtc2cpXG4gICAgICAgICB0aGlzLl9ydW4oKVxuICAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIH0sXG4gICAgICBzcGF3bjogZnVuY3Rpb24gKGRlZmF1bHRzKSB7XG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoaHRtbCwgbywgY2IpIHtcbiAgICAgICAgICAgIHNlbGYubG9nLmNhbGwoc2VsZixodG1sLG8sY2IsZGVmYXVsdHMpXG4gICAgICAgICAgICByZXR1cm4gc2VsZlxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG5ldyBIdW1hbmUobykgfVxuICAgfVxuICAgcmV0dXJuIG5ldyBIdW1hbmUoKVxufSlcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcclxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcclxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcclxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gYVxyXG4gKiBAcGFyYW0ge09iamVjdH0gYlxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcclxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgdmFyIGF0dHJzID0gYVswXTtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhdHRycztcclxuICB9XHJcbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcclxuICB2YXIgYmMgPSBiWydjbGFzcyddO1xyXG5cclxuICBpZiAoYWMgfHwgYmMpIHtcclxuICAgIGFjID0gYWMgfHwgW107XHJcbiAgICBiYyA9IGJjIHx8IFtdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xyXG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XHJcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcclxuICAgICAgYVtrZXldID0gYltrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGE7XHJcbn07XHJcblxyXG4vKipcclxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcclxuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcclxufVxyXG5cclxuLyoqXHJcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWxcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xyXG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykuZmlsdGVyKG51bGxzKS5qb2luKCcgJykgOiB2YWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcclxuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xyXG4gIHZhciBidWYgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcclxuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XHJcbiAgaWYgKHRleHQubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuICcnO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XHJcbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XHJcbiAgICBpZiAodmFsKSB7XHJcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcclxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XHJcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XHJcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XHJcbiAgdmFyIGJ1ZiA9IFtdO1xyXG5cclxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XHJcblxyXG4gIGlmIChrZXlzLmxlbmd0aCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXHJcbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcclxuXHJcbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xyXG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XHJcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLmVzY2FwZSA9IGZ1bmN0aW9uIGVzY2FwZShodG1sKXtcclxuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpXHJcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxyXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcclxuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xyXG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcclxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcclxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcclxuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcclxuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XHJcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcclxuICAgIHRocm93IGVycjtcclxuICB9XHJcbiAgdHJ5IHtcclxuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxyXG4gIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxyXG4gIH1cclxuICB2YXIgY29udGV4dCA9IDNcclxuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXHJcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcclxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcclxuXHJcbiAgLy8gRXJyb3IgY29udGV4dFxyXG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xyXG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xyXG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcclxuICAgICAgKyBjdXJyXHJcbiAgICAgICsgJ3wgJ1xyXG4gICAgICArIGxpbmU7XHJcbiAgfSkuam9pbignXFxuJyk7XHJcblxyXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXHJcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcclxuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXHJcbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XHJcbiAgdGhyb3cgZXJyO1xyXG59O1xyXG4iLCJleHBvcnRzLkF1dGhNb2RhbCA9IHJlcXVpcmUoJy4vYXV0aE1vZGFsJyk7XG4iXX0=
