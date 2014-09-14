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
({"/root/javascript-nodejs/node_modules/auth/client/authModal.js":[function(require,module,exports){
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

},{"../templates/forgot-form.jade":"/root/javascript-nodejs/node_modules/auth/templates/forgot-form.jade","../templates/login-form.jade":"/root/javascript-nodejs/node_modules/auth/templates/login-form.jade","../templates/register-form.jade":"/root/javascript-nodejs/node_modules/auth/templates/register-form.jade","client/clientRender":"/root/javascript-nodejs/node_modules/client/clientRender.js","client/delegate":"/root/javascript-nodejs/node_modules/client/delegate.js","client/head":"client/head","client/spinner":"/root/javascript-nodejs/node_modules/client/spinner.js","client/xhr":"/root/javascript-nodejs/node_modules/client/xhr.js"}],"/root/javascript-nodejs/node_modules/auth/templates/forgot-form.jade":[function(require,module,exports){
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

},{"jade/lib/runtime.js":"/root/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/root/javascript-nodejs/node_modules/auth/templates/login-form.jade":[function(require,module,exports){
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

},{"jade/lib/runtime.js":"/root/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/root/javascript-nodejs/node_modules/auth/templates/register-form.jade":[function(require,module,exports){
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

},{"jade/lib/runtime.js":"/root/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/root/javascript-nodejs/node_modules/bem-jade/index.js":[function(require,module,exports){
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
    }

    //Attributes context checks
    if (attributes.href) {
      newTag = 'a';
    } else if (attributes.for) {
      newTag = 'label';
    } else if (attributes.src) {
      newTag = 'img';
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

},{"jade/lib/runtime":"/root/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/root/javascript-nodejs/node_modules/browserify/lib/_empty.js":[function(require,module,exports){

},{}],"/root/javascript-nodejs/node_modules/client/clientRender.js":[function(require,module,exports){
var bem = require('bem-jade')();

module.exports = function(template, locals) {
  locals = locals ? Object.create(locals) : {};
  addStandardHelpers(locals);

  return template(locals);
};

function addStandardHelpers(locals) {
  locals.bem = bem;
}


},{"bem-jade":"/root/javascript-nodejs/node_modules/bem-jade/index.js"}],"/root/javascript-nodejs/node_modules/client/delegate.js":[function(require,module,exports){
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


},{"./polyfill":"/root/javascript-nodejs/node_modules/client/polyfill/index.js"}],"/root/javascript-nodejs/node_modules/client/notify.js":[function(require,module,exports){
var humane = require('humane-js');

exports.info = humane.spawn({ addnCls: 'humane-libnotify-info', timeout: 1000 });
exports.error = humane.spawn({ addnCls: 'humane-libnotify-error', timeout: 3000 });

},{"humane-js":"/root/javascript-nodejs/node_modules/humane-js/humane.js"}],"/root/javascript-nodejs/node_modules/client/polyfill/dom4.js":[function(require,module,exports){
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


},{}],"/root/javascript-nodejs/node_modules/client/polyfill/index.js":[function(require,module,exports){
require('./dom4');

},{"./dom4":"/root/javascript-nodejs/node_modules/client/polyfill/dom4.js"}],"/root/javascript-nodejs/node_modules/client/spinner.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/client/xhr-notify.js":[function(require,module,exports){
var notify = require('./notify');

document.addEventListener('xhrfail', function(event) {
  notify.error(event.reason);
});

},{"./notify":"/root/javascript-nodejs/node_modules/client/notify.js"}],"/root/javascript-nodejs/node_modules/client/xhr.js":[function(require,module,exports){
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

},{"./polyfill":"/root/javascript-nodejs/node_modules/client/polyfill/index.js","./xhr-notify":"/root/javascript-nodejs/node_modules/client/xhr-notify.js"}],"/root/javascript-nodejs/node_modules/humane-js/humane.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/jade/lib/runtime.js":[function(require,module,exports){
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

},{"fs":"/root/javascript-nodejs/node_modules/browserify/lib/_empty.js"}],"auth/client":[function(require,module,exports){
exports.AuthModal = require('./authModal');

},{"./authModal":"/root/javascript-nodejs/node_modules/auth/client/authModal.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svcHJlbHVkZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9hdXRoL2NsaWVudC9hdXRoTW9kYWwuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvYXV0aC90ZW1wbGF0ZXMvZm9yZ290LWZvcm0uamFkZSIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9hdXRoL3RlbXBsYXRlcy9sb2dpbi1mb3JtLmphZGUiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvYXV0aC90ZW1wbGF0ZXMvcmVnaXN0ZXItZm9ybS5qYWRlIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2JlbS1qYWRlL2luZGV4LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbGliL19lbXB0eS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvY2xpZW50UmVuZGVyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9kZWxlZ2F0ZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvbm90aWZ5LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9wb2x5ZmlsbC9kb200LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9wb2x5ZmlsbC9pbmRleC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvc3Bpbm5lci5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQveGhyLW5vdGlmeS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQveGhyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2h1bWFuZS1qcy9odW1hbmUuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvamFkZS9saWIvcnVudGltZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9hdXRoL2NsaWVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIG1vZHVsZXMgYXJlIGRlZmluZWQgYXMgYW4gYXJyYXlcbi8vIFsgbW9kdWxlIGZ1bmN0aW9uLCBtYXAgb2YgcmVxdWlyZXVpcmVzIF1cbi8vXG4vLyBtYXAgb2YgcmVxdWlyZXVpcmVzIGlzIHNob3J0IHJlcXVpcmUgbmFtZSAtPiBudW1lcmljIHJlcXVpcmVcbi8vXG4vLyBhbnl0aGluZyBkZWZpbmVkIGluIGEgcHJldmlvdXMgYnVuZGxlIGlzIGFjY2Vzc2VkIHZpYSB0aGVcbi8vIG9yaWcgbWV0aG9kIHdoaWNoIGlzIHRoZSByZXF1aXJldWlyZSBmb3IgcHJldmlvdXMgYnVuZGxlc1xuXG4oZnVuY3Rpb24gb3V0ZXIgKG1vZHVsZXMsIGNhY2hlLCBlbnRyeSkge1xuICAgIC8vIFNhdmUgdGhlIHJlcXVpcmUgZnJvbSBwcmV2aW91cyBidW5kbGUgdG8gdGhpcyBjbG9zdXJlIGlmIGFueVxuICAgIHZhciBwcmV2aW91c1JlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcblxuICAgIGZ1bmN0aW9uIG5ld1JlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICAgICAgaWYoIWNhY2hlW25hbWVdKSB7XG4gICAgICAgICAgICBpZighbW9kdWxlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGNhbm5vdCBmaW5kIHRoZSB0aGUgbW9kdWxlIHdpdGhpbiBvdXIgaW50ZXJuYWwgbWFwIG9yXG4gICAgICAgICAgICAgICAgLy8gY2FjaGUganVtcCB0byB0aGUgY3VycmVudCBnbG9iYWwgcmVxdWlyZSBpZS4gdGhlIGxhc3QgYnVuZGxlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3YXMgYWRkZWQgdG8gdGhlIHBhZ2UuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG4gICAgICAgICAgICAgICAgaWYgKCFqdW1wZWQgJiYgY3VycmVudFJlcXVpcmUpIHJldHVybiBjdXJyZW50UmVxdWlyZShuYW1lLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciBidW5kbGVzIG9uIHRoaXMgcGFnZSB0aGUgcmVxdWlyZSBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzIG9uZSBpcyBzYXZlZCB0byAncHJldmlvdXNSZXF1aXJlJy4gUmVwZWF0IHRoaXMgYXNcbiAgICAgICAgICAgICAgICAvLyBtYW55IHRpbWVzIGFzIHRoZXJlIGFyZSBidW5kbGVzIHVudGlsIHRoZSBtb2R1bGUgaXMgZm91bmQgb3JcbiAgICAgICAgICAgICAgICAvLyB3ZSBleGhhdXN0IHRoZSByZXF1aXJlIGNoYWluLlxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c1JlcXVpcmUpIHJldHVybiBwcmV2aW91c1JlcXVpcmUobmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgbW9kdWxlIFxcJycgKyBuYW1lICsgJ1xcJycpO1xuICAgICAgICAgICAgICAgIGVyci5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtID0gY2FjaGVbbmFtZV0gPSB7ZXhwb3J0czp7fX07XG4gICAgICAgICAgICBtb2R1bGVzW25hbWVdWzBdLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbih4KXtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBtb2R1bGVzW25hbWVdWzFdW3hdO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdSZXF1aXJlKGlkID8gaWQgOiB4KTtcbiAgICAgICAgICAgIH0sbSxtLmV4cG9ydHMsb3V0ZXIsbW9kdWxlcyxjYWNoZSxlbnRyeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlW25hbWVdLmV4cG9ydHM7XG4gICAgfVxuICAgIGZvcih2YXIgaT0wO2k8ZW50cnkubGVuZ3RoO2krKykgbmV3UmVxdWlyZShlbnRyeVtpXSk7XG5cbiAgICAvLyBPdmVycmlkZSB0aGUgY3VycmVudCByZXF1aXJlIHdpdGggdGhpcyBuZXcgb25lXG4gICAgcmV0dXJuIG5ld1JlcXVpcmU7XG59KVxuIiwidmFyIHhociA9IHJlcXVpcmUoJ2NsaWVudC94aHInKTtcblxudmFyIGRlbGVnYXRlID0gcmVxdWlyZSgnY2xpZW50L2RlbGVnYXRlJyk7XG52YXIgTW9kYWwgPSByZXF1aXJlKCdjbGllbnQvaGVhZCcpLk1vZGFsO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKCdjbGllbnQvc3Bpbm5lcicpO1xuXG52YXIgbG9naW5Gb3JtID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL2xvZ2luLWZvcm0uamFkZScpO1xudmFyIHJlZ2lzdGVyRm9ybSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9yZWdpc3Rlci1mb3JtLmphZGUnKTtcbnZhciBmb3Jnb3RGb3JtID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL2ZvcmdvdC1mb3JtLmphZGUnKTtcblxudmFyIGNsaWVudFJlbmRlciA9IHJlcXVpcmUoJ2NsaWVudC9jbGllbnRSZW5kZXInKTtcblxuLyoqXG4gKiBPcHRpb25zOlxuICogICAtIGNhbGxiYWNrOiBmdW5jdGlvbiB0byBiZSBjYWxsZWQgYWZ0ZXIgc3VjY2Vzc2Z1bCBsb2dpbiAoYnkgZGVmYXVsdCAtIGdvIHRvIHN1Y2Nlc3NSZWRpcmVjdClcbiAqICAgLSBtZXNzYWdlOiBmb3JtIG1lc3NhZ2UgdG8gYmUgc2hvd24gd2hlbiB0aGUgbG9naW4gZm9ybSBhcHBlYXJzIChcIkxvZyBpbiB0byBsZWF2ZSB0aGUgY29tbWVudFwiKVxuICogICAtIHN1Y2Nlc3NSZWRpcmVjdDogdGhlIHBhZ2UgdG8gcmVkaXJlY3QgKGN1cnJlbnQgcGFnZSBieSBkZWZhdWx0KVxuICogICAgICAgLSBhZnRlciBpbW1lZGlhdGUgbG9naW5cbiAqICAgICAgIC0gYWZ0ZXIgcmVnaXN0cmF0aW9uIGZvciBcImNvbmZpcm0gZW1haWxcIiBsaW5rXG4gKi9cbmZ1bmN0aW9uIEF1dGhNb2RhbChvcHRpb25zKSB7XG4gIE1vZGFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGlmICghb3B0aW9ucy5zdWNjZXNzUmVkaXJlY3QpIHtcbiAgICBvcHRpb25zLnN1Y2Nlc3NSZWRpcmVjdCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB9XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAoIW9wdGlvbnMuY2FsbGJhY2spIHtcbiAgICBvcHRpb25zLmNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnN1Y2Nlc3NSZWRpcmVjdCgpO1xuICAgIH07XG4gIH1cblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLnNldENvbnRlbnQoY2xpZW50UmVuZGVyKGxvZ2luRm9ybSkpO1xuXG4gIGlmIChvcHRpb25zLm1lc3NhZ2UpIHtcbiAgICB0aGlzLnNob3dGb3JtTWVzc2FnZShvcHRpb25zLm1lc3NhZ2UsICdpbmZvJyk7XG4gIH1cblxuICB0aGlzLmluaXRFdmVudEhhbmRsZXJzKCk7XG59XG5BdXRoTW9kYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShNb2RhbC5wcm90b3R5cGUpO1xuXG5kZWxlZ2F0ZS5kZWxlZ2F0ZU1peGluKEF1dGhNb2RhbC5wcm90b3R5cGUpO1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLnN1Y2Nlc3NSZWRpcmVjdCA9IGZ1bmN0aW9uKCkge1xuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYgPT0gdGhpcy5vcHRpb25zLnN1Y2Nlc3NSZWRpcmVjdCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRoaXMub3B0aW9ucy5zdWNjZXNzUmVkaXJlY3Q7XG4gIH1cbn07XG5cbkF1dGhNb2RhbC5wcm90b3R5cGUuY2xlYXJGb3JtTWVzc2FnZXMgPSBmdW5jdGlvbigpIHtcbiAgLypcbiAgIHJlbW92ZSBlcnJvciBmb3IgdGhpcyBub3RhdGlvbjpcbiAgIHNwYW4udGV4dC1pbnB1dC50ZXh0LWlucHV0X2ludmFsaWQubG9naW4tZm9ybV9faW5wdXRcbiAgIGlucHV0LnRleHQtaW5wdXRfX2NvbnRyb2wjcGFzc3dvcmQodHlwZT1cInBhc3N3b3JkXCIsIG5hbWU9XCJwYXNzd29yZFwiKVxuICAgc3Bhbi50ZXh0LWlucHV4dF9fZXJyINCf0LDRgNC+0LvQuCDQvdC1INGB0L7QstC/0LDQtNCw0Y7RglxuICAgKi9cbiAgW10uZm9yRWFjaC5jYWxsKHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCcudGV4dC1pbnB1dF9pbnZhbGlkJyksIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ3RleHQtaW5wdXRfaW52YWxpZCcpO1xuICB9KTtcblxuICBbXS5mb3JFYWNoLmNhbGwodGhpcy5lbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJy50ZXh0LWlucHV0X19lcnInKSwgZnVuY3Rpb24oZWxlbSkge1xuICAgIGVsZW0ucmVtb3ZlKCk7XG4gIH0pO1xuXG4gIC8vIGNsZWFyIGZvcm0td2lkZSBub3RpZmljYXRpb25cbiAgdGhpcy5lbGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW5vdGlmaWNhdGlvbl0nKS5pbm5lckhUTUwgPSAnJztcbn07XG5cbkF1dGhNb2RhbC5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHJlcXVlc3QgPSB4aHIob3B0aW9ucyk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgb25FbmQgPSB0aGlzLnN0YXJ0UmVxdWVzdEluZGljYXRpb24oKTtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlbmQnLCBvbkVuZCk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLnN0YXJ0UmVxdWVzdEluZGljYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaG93T3ZlcmxheSgpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIHN1Ym1pdEJ1dHRvbiA9IHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yKCdbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gIGlmIChzdWJtaXRCdXR0b24pIHtcbiAgICB2YXIgc3Bpbm5lciA9IG5ldyBTcGlubmVyKHtcbiAgICAgIGVsZW06ICAgICAgc3VibWl0QnV0dG9uLFxuICAgICAgc2l6ZTogICAgICAnc21hbGwnLFxuICAgICAgY2xhc3M6ICAgICAnc3VibWl0LWJ1dHRvbl9fc3Bpbm5lcicsXG4gICAgICBlbGVtQ2xhc3M6ICdzdWJtaXQtYnV0dG9uX3Byb2dyZXNzJ1xuICAgIH0pO1xuICAgIHNwaW5uZXIuc3RhcnQoKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBvbkVuZCgpIHtcbiAgICBzZWxmLmhpZGVPdmVybGF5KCk7XG4gICAgaWYgKHNwaW5uZXIpIHNwaW5uZXIuc3RvcCgpO1xuICB9O1xuXG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLmluaXRFdmVudEhhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG5cbiAgdGhpcy5kZWxlZ2F0ZSgnW2RhdGEtc3dpdGNoPVwicmVnaXN0ZXItZm9ybVwiXScsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5zZXRDb250ZW50KGNsaWVudFJlbmRlcihyZWdpc3RlckZvcm0pKTtcbiAgfSk7XG5cbiAgdGhpcy5kZWxlZ2F0ZSgnW2RhdGEtc3dpdGNoPVwibG9naW4tZm9ybVwiXScsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5zZXRDb250ZW50KGNsaWVudFJlbmRlcihsb2dpbkZvcm0pKTtcbiAgfSk7XG5cbiAgdGhpcy5kZWxlZ2F0ZSgnW2RhdGEtc3dpdGNoPVwiZm9yZ290LWZvcm1cIl0nLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuc2V0Q29udGVudChjbGllbnRSZW5kZXIoZm9yZ290Rm9ybSkpO1xuICB9KTtcblxuXG4gIHRoaXMuZGVsZWdhdGUoJ1tkYXRhLWZvcm09XCJsb2dpblwiXScsICdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5zdWJtaXRMb2dpbkZvcm0oZXZlbnQudGFyZ2V0KTtcbiAgfSk7XG5cblxuICB0aGlzLmRlbGVnYXRlKCdbZGF0YS1mb3JtPVwicmVnaXN0ZXJcIl0nLCAnc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuc3VibWl0UmVnaXN0ZXJGb3JtKGV2ZW50LnRhcmdldCk7XG4gIH0pO1xuXG4gIHRoaXMuZGVsZWdhdGUoJ1tkYXRhLWZvcm09XCJmb3Jnb3RcIl0nLCAnc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuc3VibWl0Rm9yZ290Rm9ybShldmVudC50YXJnZXQpO1xuICB9KTtcblxuICB0aGlzLmRlbGVnYXRlKFwiW2RhdGEtcHJvdmlkZXJdXCIsIFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMub3BlbkF1dGhQb3B1cCgnL2F1dGgvbG9naW4vJyArIGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmRhdGFzZXQucHJvdmlkZXIpO1xuICB9KTtcblxuICB0aGlzLmRlbGVnYXRlKCdbZGF0YS1hY3Rpb24tdmVyaWZ5LWVtYWlsXScsICdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciByZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiAgICAnL2F1dGgvcmV2ZXJpZnknXG4gICAgfSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgICBzZWxmLnNob3dGb3JtTWVzc2FnZShcItCf0LjRgdGM0LzQvi3Qv9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtSDQvtGC0L/RgNCw0LLQu9C10L3Qvi5cIiwgJ3N1Y2Nlc3MnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuc2hvd0Zvcm1NZXNzYWdlKGV2ZW50LnJlc3VsdCwgJ2Vycm9yJyk7XG4gICAgICB9XG5cbiAgICB9KTtcblxuICAgIHZhciBwYXlsb2FkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgcGF5bG9hZC5hcHBlbmQoXCJlbWFpbFwiLCBldmVudC5kZWxlZ2F0ZVRhcmdldC5kYXRhc2V0LmFjdGlvblZlcmlmeUVtYWlsKTtcblxuICAgIHJlcXVlc3Quc2VuZChwYXlsb2FkKTtcbiAgfSk7XG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLnN1Ym1pdFJlZ2lzdGVyRm9ybSA9IGZ1bmN0aW9uKGZvcm0pIHtcblxuICB0aGlzLmNsZWFyRm9ybU1lc3NhZ2VzKCk7XG5cbiAgdmFyIGhhc0Vycm9ycyA9IGZhbHNlO1xuICBpZiAoIWZvcm0uZWxlbWVudHMuZW1haWwudmFsdWUpIHtcbiAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgIHRoaXMuc2hvd0lucHV0RXJyb3IoZm9ybS5lbGVtZW50cy5lbWFpbCwgJ9CS0LLQtdC00LjRgtC1LCDQv9C+0LbQsNC70YPRgdGC0LAsIGVtYWlsLicpO1xuICB9XG5cbiAgaWYgKCFmb3JtLmVsZW1lbnRzLmRpc3BsYXlOYW1lLnZhbHVlKSB7XG4gICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICB0aGlzLnNob3dJbnB1dEVycm9yKGZvcm0uZWxlbWVudHMuZGlzcGxheU5hbWUsICfQktCy0LXQtNC40YLQtSwg0L/QvtC20LDQu9GD0YHRgtCwLCDQuNC80Y8g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPLicpO1xuICB9XG5cbiAgaWYgKCFmb3JtLmVsZW1lbnRzLnBhc3N3b3JkLnZhbHVlKSB7XG4gICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICB0aGlzLnNob3dJbnB1dEVycm9yKGZvcm0uZWxlbWVudHMucGFzc3dvcmQsICfQktCy0LXQtNC40YLQtSwg0L/QvtC20LDQu9GD0YHRgtCwLCDQv9Cw0YDQvtC70YwuJyk7XG4gIH1cblxuICBpZiAoaGFzRXJyb3JzKSByZXR1cm47XG5cbiAgdmFyIHJlcXVlc3QgPSB0aGlzLnJlcXVlc3Qoe1xuICAgIG1ldGhvZDogICAgICAgICAgJ1BPU1QnLFxuICAgIHVybDogICAgICAgICAgICAgJy9hdXRoL3JlZ2lzdGVyJyxcbiAgICBzdWNjZXNzU3RhdHVzZXM6IFsyMDEsIDQwMF1cbiAgfSk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMSkge1xuICAgICAgc2VsZi5zZXRDb250ZW50KGNsaWVudFJlbmRlcihsb2dpbkZvcm0pKTtcbiAgICAgIHNlbGYuc2hvd0Zvcm1NZXNzYWdlKFxuICAgICAgICAgIFwi0KHQtdC50YfQsNGBINCy0LDQvCDQv9GA0LjQtNGR0YIgZW1haWwg0YEg0LDQtNGA0LXRgdCwIDxjb2RlPmluZm9ybUBqYXZhc2NyaXB0LnJ1PC9jb2RlPiBcIiArXG4gICAgICAgICAgXCLRgdC+INGB0YHRi9C70LrQvtC5LdC/0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC10LwuINCV0YHQu9C4INC/0LjRgdGM0LzQviDQvdC1INC/0YDQuNGI0LvQviDQsiDRgtC10YfQtdC90LjQtSDQvNC40L3Rg9GC0YssINC80L7QttC90L4gXCIgK1xuICAgICAgICAgIFwiPGEgaHJlZj0nIycgZGF0YS1hY3Rpb24tdmVyaWZ5LWVtYWlsPSdcIiArIGZvcm0uZWxlbWVudHMuZW1haWwudmFsdWUgKyBcIic+0L/QtdGA0LXQt9Cw0L/RgNC+0YHQuNGC0Ywg0L/QvtC00YLQstC10YDQttC00LXQvdC40LU8L2E+LlwiLFxuICAgICAgICAnc3VjY2VzcydcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IDQwMCkge1xuICAgICAgZm9yICh2YXIgZmllbGQgaW4gZXZlbnQucmVzdWx0LmVycm9ycykge1xuICAgICAgICBzZWxmLnNob3dJbnB1dEVycm9yKGZvcm0uZWxlbWVudHNbZmllbGRdLCBldmVudC5yZXN1bHQuZXJyb3JzW2ZpZWxkXSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZi5zaG93Rm9ybU1lc3NhZ2UoXCLQndC10LjQt9Cy0LXRgdGC0L3Ri9C5INGB0YLQsNGC0YPRgSDQvtGC0LLQtdGC0LAg0YHQtdGA0LLQtdGA0LBcIiwgJ2Vycm9yJyk7XG4gIH0pO1xuXG4gIHZhciBwYXlsb2FkID0gbmV3IEZvcm1EYXRhKGZvcm0pO1xuICBwYXlsb2FkLmFwcGVuZChcInN1Y2Nlc3NSZWRpcmVjdFwiLCB0aGlzLm9wdGlvbnMuc3VjY2Vzc1JlZGlyZWN0KTtcbiAgcmVxdWVzdC5zZW5kKHBheWxvYWQpO1xufTtcblxuXG5BdXRoTW9kYWwucHJvdG90eXBlLnN1Ym1pdEZvcmdvdEZvcm0gPSBmdW5jdGlvbihmb3JtKSB7XG5cbiAgdGhpcy5jbGVhckZvcm1NZXNzYWdlcygpO1xuXG4gIHZhciBoYXNFcnJvcnMgPSBmYWxzZTtcbiAgaWYgKCFmb3JtLmVsZW1lbnRzLmVtYWlsLnZhbHVlKSB7XG4gICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICB0aGlzLnNob3dJbnB1dEVycm9yKGZvcm0uZWxlbWVudHMuZW1haWwsICfQktCy0LXQtNC40YLQtSwg0L/QvtC20LDQu9GD0YHRgtCwLCBlbWFpbC4nKTtcbiAgfVxuXG4gIGlmIChoYXNFcnJvcnMpIHJldHVybjtcblxuICB2YXIgcmVxdWVzdCA9IHRoaXMucmVxdWVzdCh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiAgICAnL2F1dGgvZm9yZ290J1xuICB9KTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICBzZWxmLnNldENvbnRlbnQoY2xpZW50UmVuZGVyKGxvZ2luRm9ybSkpO1xuICAgICAgc2VsZi5zaG93Rm9ybU1lc3NhZ2UoZXZlbnQucmVzdWx0LCAnc3VjY2VzcycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLnNob3dGb3JtTWVzc2FnZShldmVudC5yZXN1bHQsICdlcnJvcicpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIHBheWxvYWQgPSBuZXcgRm9ybURhdGEoZm9ybSk7XG4gIHBheWxvYWQuYXBwZW5kKFwic3VjY2Vzc1JlZGlyZWN0XCIsIHRoaXMub3B0aW9ucy5zdWNjZXNzUmVkaXJlY3QpO1xuICByZXF1ZXN0LnNlbmQocGF5bG9hZCk7XG59O1xuXG5cbkF1dGhNb2RhbC5wcm90b3R5cGUuc2hvd0lucHV0RXJyb3IgPSBmdW5jdGlvbihpbnB1dCwgZXJyb3IpIHtcbiAgaW5wdXQucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCd0ZXh0LWlucHV0X2ludmFsaWQnKTtcbiAgdmFyIGVycm9yU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgZXJyb3JTcGFuLmNsYXNzTmFtZSA9ICd0ZXh0LWlucHV0X19lcnInO1xuICBlcnJvclNwYW4uaW5uZXJIVE1MID0gZXJyb3I7XG4gIGlucHV0LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZXJyb3JTcGFuKTtcbn07XG5cbkF1dGhNb2RhbC5wcm90b3R5cGUuc2hvd0Zvcm1NZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSkge1xuICBpZiAoWydpbmZvJywgJ2Vycm9yJywgJ3dhcm5pbmcnLCAnc3VjY2VzcyddLmluZGV4T2YodHlwZSkgPT0gLTEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCB0eXBlOiBcIiArIHR5cGUpO1xuICB9XG5cblxuICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGNvbnRhaW5lci5jbGFzc05hbWUgPSAnbG9naW4tZm9ybV9fJyArIHR5cGU7XG4gIGNvbnRhaW5lci5pbm5lckhUTUwgPSBtZXNzYWdlO1xuXG4gIHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1ub3RpZmljYXRpb25dJykuaW5uZXJIVE1MID0gJyc7XG4gIHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1ub3RpZmljYXRpb25dJykuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbn07XG5cbkF1dGhNb2RhbC5wcm90b3R5cGUuc3VibWl0TG9naW5Gb3JtID0gZnVuY3Rpb24oZm9ybSkge1xuXG4gIHRoaXMuY2xlYXJGb3JtTWVzc2FnZXMoKTtcblxuICB2YXIgaGFzRXJyb3JzID0gZmFsc2U7XG4gIGlmICghZm9ybS5lbGVtZW50cy5sb2dpbi52YWx1ZSkge1xuICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgdGhpcy5zaG93SW5wdXRFcnJvcihmb3JtLmVsZW1lbnRzLmxvZ2luLCAn0JLQstC10LTQuNGC0LUsINC/0L7QttCw0LvRg9GB0YLQsCwg0LjQvNGPINC40LvQuCBlbWFpbC4nKTtcbiAgfVxuXG4gIGlmICghZm9ybS5lbGVtZW50cy5wYXNzd29yZC52YWx1ZSkge1xuICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgdGhpcy5zaG93SW5wdXRFcnJvcihmb3JtLmVsZW1lbnRzLnBhc3N3b3JkLCAn0JLQstC10LTQuNGC0LUsINC/0L7QttCw0LvRg9GB0YLQsCwg0L/QsNGA0L7Qu9GMLicpO1xuICB9XG5cbiAgaWYgKGhhc0Vycm9ycykgcmV0dXJuO1xuXG4gIHZhciByZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0KHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6ICAgICcvYXV0aC9sb2dpbi9sb2NhbCdcbiAgfSk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IDIwMCkge1xuICAgICAgc2VsZi5vbkF1dGhGYWlsdXJlKGV2ZW50LnJlc3VsdC5tZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLm9uQXV0aFN1Y2Nlc3MoKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5zZW5kKG5ldyBGb3JtRGF0YShmb3JtKSk7XG59O1xuXG5BdXRoTW9kYWwucHJvdG90eXBlLm9wZW5BdXRoUG9wdXAgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKHRoaXMuYXV0aFBvcHVwICYmICF0aGlzLmF1dGhQb3B1cC5jbG9zZWQpIHtcbiAgICB0aGlzLmF1dGhQb3B1cC5jbG9zZSgpOyAvLyBjbG9zZSBvbGQgcG9wdXAgaWYgYW55XG4gIH1cbiAgdmFyIHdpZHRoID0gODAwLCBoZWlnaHQgPSA2MDA7XG4gIHZhciB0b3AgPSAod2luZG93Lm91dGVySGVpZ2h0IC0gaGVpZ2h0KSAvIDI7XG4gIHZhciBsZWZ0ID0gKHdpbmRvdy5vdXRlcldpZHRoIC0gd2lkdGgpIC8gMjtcbiAgd2luZG93LmF1dGhNb2RhbCA9IHRoaXM7XG4gIHRoaXMuYXV0aFBvcHVwID0gd2luZG93Lm9wZW4odXJsLCAnYXV0aE1vZGFsJywgJ3dpZHRoPScgKyB3aWR0aCArICcsaGVpZ2h0PScgKyBoZWlnaHQgKyAnLHNjcm9sbGJhcnM9MCx0b3A9JyArIHRvcCArICcsbGVmdD0nICsgbGVmdCk7XG59O1xuXG4vKlxuINCy0YHQtSDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INCw0LLRgtC+0YDQuNC30LDRhtC40LggKNCy0LrQu9GO0YfQsNGPIEZhY2Vib29rINC40LcgcG9wdXAt0LAg0Lgg0LvQvtC60LDQu9GM0L3Ri9C5KVxuINCyINC40YLQvtCz0LUg0YLRgNC40LPQs9C10YDRj9GCINC+0LTQuNC9INC40Lcg0Y3RgtC40YUg0LrQsNC70LvQsdGN0LrQvtCyXG4gKi9cbkF1dGhNb2RhbC5wcm90b3R5cGUub25BdXRoU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9wdGlvbnMuY2FsbGJhY2soKTtcbn07XG5cblxuQXV0aE1vZGFsLnByb3RvdHlwZS5vbkF1dGhGYWlsdXJlID0gZnVuY3Rpb24oZXJyb3JNZXNzYWdlKSB7XG4gIHRoaXMuc2hvd0Zvcm1NZXNzYWdlKGVycm9yTWVzc2FnZSB8fCBcItCe0YLQutCw0Lcg0LIg0LDQstGC0L7RgNC40LfQsNGG0LjQuFwiLCAnZXJyb3InKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoTW9kYWw7XG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUvbGliL3J1bnRpbWUuanMnKTtcbm1vZHVsZS5leHBvcnRzPWZ1bmN0aW9uKHBhcmFtcykgeyBpZiAocGFyYW1zKSB7cGFyYW1zLnJlcXVpcmUgPSByZXF1aXJlO30gcmV0dXJuIChcbmZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYmVtKSB7XG5idWYucHVzaChcIlwiKTtcbnZhciBiZW1fY2hhaW4gPSBbXTtcbnZhciBiZW1fY2hhaW5fY29udGV4dHMgPSBbJ2Jsb2NrJ107XG5qYWRlX21peGluc1tcImJcIl0gPSBmdW5jdGlvbih0YWcsIGlzRWxlbWVudCl7XG52YXIgYmxvY2sgPSAodGhpcyAmJiB0aGlzLmJsb2NrKSwgYXR0cmlidXRlcyA9ICh0aGlzICYmIHRoaXMuYXR0cmlidXRlcykgfHwge307XG5iZW0uY2FsbCh0aGlzLCBidWYsIGJlbV9jaGFpbiwgYmVtX2NoYWluX2NvbnRleHRzLCB0YWcsIGlzRWxlbWVudClcbn07XG5qYWRlX21peGluc1tcImVcIl0gPSBmdW5jdGlvbih0YWcpe1xudmFyIGJsb2NrID0gKHRoaXMgJiYgdGhpcy5ibG9jayksIGF0dHJpYnV0ZXMgPSAodGhpcyAmJiB0aGlzLmF0dHJpYnV0ZXMpIHx8IHt9O1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5ibG9jayAmJiBibG9jaygpO1xufSxcbmF0dHJpYnV0ZXM6IGphZGUubWVyZ2UoW2F0dHJpYnV0ZXNdKVxufSwgdGFnLCB0cnVlKTtcbn07XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLQvtGB0YHRgtCw0L3QvtCy0LvQtdC90LjQtSDQv9Cw0YDQvtC70Y9cIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0aXRsZVwifVxufSwgJ2g0Jyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9faGVhZGVyXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImRhdGEtbm90aWZpY2F0aW9uXCI6IHRydWUsXCJjbGFzc1wiOiBcImxpbmUgX19ub3RpZmljYXRpb25cIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JjQvNGPINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjyDQuNC70LggRW1haWw6XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcImZvcmdvdC1lbWFpbFwiLFwiY2xhc3NcIjogXCJsYWJlbFwifVxufSwgJ2xhYmVsJyk7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImlkXCI6IFwiZm9yZ290LWVtYWlsXCIsXCJuYW1lXCI6IFwiZW1haWxcIixcImF1dG9mb2N1c1wiOiB0cnVlLFwiY2xhc3NcIjogXCJjb250cm9sXCJ9XG59LCAnaW5wdXQnKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRleHQtaW5wdXQgX19pbnB1dFwifVxufSwgJ3NwYW4nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmVcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQktC+0YHRgdGC0LDQvdC+0LLQuNGC0Ywg0L/QsNGA0L7Qu9GMXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidGV4dFwifVxufSwgJ3NwYW4nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJ0eXBlXCI6IFwic3VibWl0XCIsXCJjbGFzc1wiOiBcInN1Ym1pdC1idXR0b24gX3NtYWxsIF9fc3VibWl0XCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0YXQvtC0XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtc3dpdGNoXCI6IFwibG9naW4tZm9ybVwiLFwiY2xhc3NcIjogXCJidXR0b24tbGlua1wifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcIi9cIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJzZXBhcmF0b3JcIn1cbn0sICdzcGFuJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0KDQtdCz0LjRgdGC0YDQsNGG0LjRj1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXN3aXRjaFwiOiBcInJlZ2lzdGVyLWZvcm1cIixcImNsYXNzXCI6IFwiYnV0dG9uLWxpbmtcIn1cbn0sICdidXR0b24nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmUgX19mb290ZXJcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLRhdC+0LQg0YfQtdGA0LXQtyDRgdC+0YbQuNCw0LvRjNC90YvQtSDRgdC10YLQuFwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbnMtdGl0bGVcIn1cbn0sICdoNScpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcIkZhY2Vib29rXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJmYWNlYm9va1wiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2ZhY2Vib29rIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwiR29vZ2xlK1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwiZ29vZ2xlXCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfZ29vZ2xlIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLQutC+0L3RgtCw0LrRgtC1XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJ2a29udGFrdGVcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF92a29udGFrdGUgX19zb2NpYWwtbG9naW5cIn1cbn0sICdidXR0b24nKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCJHaXRodWJcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcImdpdGh1YlwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2dpdGh1YiBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCv0L3QtNC10LrRgVwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwieWFuZGV4XCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfeWFuZGV4IF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9fc29jaWFsLWxvZ2luc1wifVxufSk7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJ0eXBlXCI6IFwiYnV0dG9uXCIsXCJ0aXRsZVwiOiBcItC30LDQutGA0YvRgtGMXCIsXCJjbGFzc1wiOiBcImNsb3NlLWJ1dHRvbiBfX2Nsb3NlXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiYWN0aW9uXCI6IFwiI1wiLFwiZGF0YS1mb3JtXCI6IFwiZm9yZ290XCIsXCJjbGFzc1wiOiBcImZvcm1cIn1cbn0sICdmb3JtJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsb2dpbi1mb3JtXCJ9XG59KTt9LmNhbGwodGhpcyxcImJlbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguYmVtOnR5cGVvZiBiZW0hPT1cInVuZGVmaW5lZFwiP2JlbTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufVxuKShwYXJhbXMpOyB9XG4vL0Agc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJaUlzSW1acGJHVWlPaUl2Y205dmRDOXFZWFpoYzJOeWFYQjBMVzV2WkdWcWN5OXViMlJsWDIxdlpIVnNaWE12WVhWMGFDOTBaVzF3YkdGMFpYTXZabTl5WjI5MExXWnZjbTB1YW1Ga1pTNXFjeUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiWFgwPSIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS9saWIvcnVudGltZS5qcycpO1xubW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24ocGFyYW1zKSB7IGlmIChwYXJhbXMpIHtwYXJhbXMucmVxdWlyZSA9IHJlcXVpcmU7fSByZXR1cm4gKFxuZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChiZW0pIHtcbmJ1Zi5wdXNoKFwiXCIpO1xudmFyIGJlbV9jaGFpbiA9IFtdO1xudmFyIGJlbV9jaGFpbl9jb250ZXh0cyA9IFsnYmxvY2snXTtcbmphZGVfbWl4aW5zW1wiYlwiXSA9IGZ1bmN0aW9uKHRhZywgaXNFbGVtZW50KXtcbnZhciBibG9jayA9ICh0aGlzICYmIHRoaXMuYmxvY2spLCBhdHRyaWJ1dGVzID0gKHRoaXMgJiYgdGhpcy5hdHRyaWJ1dGVzKSB8fCB7fTtcbmJlbS5jYWxsKHRoaXMsIGJ1ZiwgYmVtX2NoYWluLCBiZW1fY2hhaW5fY29udGV4dHMsIHRhZywgaXNFbGVtZW50KVxufTtcbmphZGVfbWl4aW5zW1wiZVwiXSA9IGZ1bmN0aW9uKHRhZyl7XG52YXIgYmxvY2sgPSAodGhpcyAmJiB0aGlzLmJsb2NrKSwgYXR0cmlidXRlcyA9ICh0aGlzICYmIHRoaXMuYXR0cmlidXRlcykgfHwge307XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJsb2NrICYmIGJsb2NrKCk7XG59LFxuYXR0cmlidXRlczogamFkZS5tZXJnZShbYXR0cmlidXRlc10pXG59LCB0YWcsIHRydWUpO1xufTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQktGF0L7QtCDQsiDRgdC40YHRgtC10LzRg1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRpdGxlXCJ9XG59LCAnaDQnKTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItGA0LXQs9C40YHRgtGA0LDRhtC40Y9cIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1zd2l0Y2hcIjogXCJyZWdpc3Rlci1mb3JtXCIsXCJjbGFzc1wiOiBcImJ1dHRvbi1saW5rIF9fcmVnaXN0ZXJcIn1cbn0sICdidXR0b24nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImhlYWRlci1hc2lkZVwifVxufSk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9faGVhZGVyXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImRhdGEtbm90aWZpY2F0aW9uXCI6IHRydWUsXCJjbGFzc1wiOiBcImxpbmUgX19ub3RpZmljYXRpb25cIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JjQvNGPINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjyDQuNC70LggRW1haWw6XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcImxvZ2luXCIsXCJjbGFzc1wiOiBcImxhYmVsXCJ9XG59LCAnbGFiZWwnKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiaWRcIjogXCJsb2dpblwiLFwibmFtZVwiOiBcImxvZ2luXCIsXCJjbGFzc1wiOiBcImNvbnRyb2xcIn1cbn0sICdpbnB1dCcpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidGV4dC1pbnB1dCBfX2lucHV0XCJ9XG59LCAnc3BhbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZVwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQn9Cw0YDQvtC70Yw6XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcInBhc3N3b3JkXCIsXCJjbGFzc1wiOiBcImxhYmVsXCJ9XG59LCAnbGFiZWwnKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiaWRcIjogXCJwYXNzd29yZFwiLFwidHlwZVwiOiBcInBhc3N3b3JkXCIsXCJuYW1lXCI6IFwicGFzc3dvcmRcIixcImNsYXNzXCI6IFwiY29udHJvbFwifVxufSwgJ2lucHV0Jyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0ZXh0LWlucHV0IF9faW5wdXQgX19pbnB1dF93aXRoLWFzaWRlXCJ9XG59LCAnc3BhbicpO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCX0LDQsdGL0LvQuD9cIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1zd2l0Y2hcIjogXCJmb3Jnb3QtZm9ybVwiLFwiY2xhc3NcIjogXCJidXR0b24tbGluayBfX2ZvcmdvdFwifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZVwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0L7QudGC0LhcIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0ZXh0XCJ9XG59LCAnc3BhbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcInR5cGVcIjogXCJzdWJtaXRcIixcImNsYXNzXCI6IFwic3VibWl0LWJ1dHRvbiBfc21hbGwgX19zdWJtaXRcIn1cbn0sICdidXR0b24nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmUgX19mb290ZXJcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLRhdC+0LQg0YfQtdGA0LXQtyDRgdC+0YbQuNCw0LvRjNC90YvQtSDRgdC10YLQuFwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbnMtdGl0bGVcIn1cbn0sICdoNScpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcIkZhY2Vib29rXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJmYWNlYm9va1wiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2ZhY2Vib29rIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwiR29vZ2xlK1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwiZ29vZ2xlXCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfZ29vZ2xlIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0JLQutC+0L3RgtCw0LrRgtC1XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJ2a29udGFrdGVcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF92a29udGFrdGUgX19zb2NpYWwtbG9naW5cIn1cbn0sICdidXR0b24nKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCJHaXRodWJcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcImdpdGh1YlwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2dpdGh1YiBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCv0L3QtNC10LrRgVwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwieWFuZGV4XCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfeWFuZGV4IF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9fc29jaWFsLWxvZ2luc1wifVxufSk7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJ0eXBlXCI6IFwiYnV0dG9uXCIsXCJ0aXRsZVwiOiBcItC30LDQutGA0YvRgtGMXCIsXCJjbGFzc1wiOiBcImNsb3NlLWJ1dHRvbiBfX2Nsb3NlXCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiYWN0aW9uXCI6IFwiI1wiLFwiY2xhc3NcIjogXCJmb3JtXCJ9XG59LCAnZm9ybScpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtZm9ybVwiOiBcImxvZ2luXCIsXCJjbGFzc1wiOiBcImxvZ2luLWZvcm1cIn1cbn0pO30uY2FsbCh0aGlzLFwiYmVtXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5iZW06dHlwZW9mIGJlbSE9PVwidW5kZWZpbmVkXCI/YmVtOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59XG4pKHBhcmFtcyk7IH1cbi8vQCBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklpSXNJbVpwYkdVaU9pSXZjbTl2ZEM5cVlYWmhjMk55YVhCMExXNXZaR1ZxY3k5dWIyUmxYMjF2WkhWc1pYTXZZWFYwYUM5MFpXMXdiR0YwWlhNdmJHOW5hVzR0Wm05eWJTNXFZV1JsTG1weklpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sdGRmUT09IiwidmFyIGphZGUgPSByZXF1aXJlKCdqYWRlL2xpYi9ydW50aW1lLmpzJyk7XG5tb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihwYXJhbXMpIHsgaWYgKHBhcmFtcykge3BhcmFtcy5yZXF1aXJlID0gcmVxdWlyZTt9IHJldHVybiAoXG5mdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGJlbSkge1xuYnVmLnB1c2goXCJcIik7XG52YXIgYmVtX2NoYWluID0gW107XG52YXIgYmVtX2NoYWluX2NvbnRleHRzID0gWydibG9jayddO1xuamFkZV9taXhpbnNbXCJiXCJdID0gZnVuY3Rpb24odGFnLCBpc0VsZW1lbnQpe1xudmFyIGJsb2NrID0gKHRoaXMgJiYgdGhpcy5ibG9jayksIGF0dHJpYnV0ZXMgPSAodGhpcyAmJiB0aGlzLmF0dHJpYnV0ZXMpIHx8IHt9O1xuYmVtLmNhbGwodGhpcywgYnVmLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnLCBpc0VsZW1lbnQpXG59O1xuamFkZV9taXhpbnNbXCJlXCJdID0gZnVuY3Rpb24odGFnKXtcbnZhciBibG9jayA9ICh0aGlzICYmIHRoaXMuYmxvY2spLCBhdHRyaWJ1dGVzID0gKHRoaXMgJiYgdGhpcy5hdHRyaWJ1dGVzKSB8fCB7fTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYmxvY2sgJiYgYmxvY2soKTtcbn0sXG5hdHRyaWJ1dGVzOiBqYWRlLm1lcmdlKFthdHRyaWJ1dGVzXSlcbn0sIHRhZywgdHJ1ZSk7XG59O1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCg0LXQs9C40YHRgtGA0LDRhtC40Y9cIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0aXRsZVwifVxufSwgJ2g0Jyk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQstGF0L7QtFwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXN3aXRjaFwiOiBcImxvZ2luLWZvcm1cIixcImNsYXNzXCI6IFwiYnV0dG9uLWxpbmtcIn1cbn0sICdidXR0b24nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImhlYWRlci1hc2lkZVwifVxufSk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9faGVhZGVyXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImRhdGEtbm90aWZpY2F0aW9uXCI6IHRydWUsXCJjbGFzc1wiOiBcImxpbmUgX19ub3RpZmljYXRpb25cIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwiRW1haWw6XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcInJlZ2lzdGVyLWVtYWlsXCIsXCJjbGFzc1wiOiBcImxhYmVsXCJ9XG59LCAnbGFiZWwnKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiaWRcIjogXCJyZWdpc3Rlci1lbWFpbFwiLFwibmFtZVwiOiBcImVtYWlsXCIsXCJ0eXBlXCI6IFwiZW1haWxcIixcInJlcXVpcmVkXCI6IHRydWUsXCJhdXRvZm9jdXNcIjogdHJ1ZSxcImNsYXNzXCI6IFwiY29udHJvbFwifVxufSwgJ2lucHV0Jyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0ZXh0LWlucHV0IF9faW5wdXRcIn1cbn0sICdzcGFuJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCY0LzRjyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y86XCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImZvclwiOiBcInJlZ2lzdGVyLWRpc3BsYXlOYW1lXCIsXCJjbGFzc1wiOiBcImxhYmVsXCJ9XG59LCAnbGFiZWwnKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1wiaWRcIjogXCJyZWdpc3Rlci1kaXNwbGF5TmFtZVwiLFwibmFtZVwiOiBcImRpc3BsYXlOYW1lXCIsXCJyZXF1aXJlZFwiOiB0cnVlLFwiY2xhc3NcIjogXCJjb250cm9sXCJ9XG59LCAnaW5wdXQnKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRleHQtaW5wdXQgX19pbnB1dFwifVxufSwgJ3NwYW4nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmVcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwi0J/QsNGA0L7Qu9GMOlwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJmb3JcIjogXCJyZWdpc3Rlci1wYXNzd29yZFwiLFwiY2xhc3NcIjogXCJsYWJlbFwifVxufSwgJ2xhYmVsJyk7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImlkXCI6IFwicmVnaXN0ZXItcGFzc3dvcmRcIixcInR5cGVcIjogXCJwYXNzd29yZFwiLFwibmFtZVwiOiBcInBhc3N3b3JkXCIsXCJyZXF1aXJlZFwiOiB0cnVlLFwiY2xhc3NcIjogXCJjb250cm9sXCJ9XG59LCAnaW5wdXQnKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRleHQtaW5wdXQgX19pbnB1dFwifVxufSwgJ3NwYW4nKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImxpbmVcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQl9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y9cIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0ZXh0XCJ9XG59LCAnc3BhbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcInR5cGVcIjogXCJzdWJtaXRcIixcImNsYXNzXCI6IFwic3VibWl0LWJ1dHRvbiBfc21hbGwgc3VibWl0XCJ9XG59LCAnYnV0dG9uJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsaW5lIF9fZm9vdGVyXCJ9XG59KTtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0YXQvtC0INGH0LXRgNC10Lcg0YHQvtGG0LjQsNC70YzQvdGL0LUg0YHQtdGC0LhcIik7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJzb2NpYWwtbG9naW5zLXRpdGxlXCJ9XG59LCAnaDUnKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCJGYWNlYm9va1wiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwiZmFjZWJvb2tcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF9mYWNlYm9vayBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcIkdvb2dsZStcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcImdvb2dsZVwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX2dvb2dsZSBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xuYnVmLnB1c2goXCIgXCIpO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5idWYucHVzaChcItCS0LrQvtC90YLQsNC60YLQtVwiKTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXByb3ZpZGVyXCI6IFwidmtvbnRha3RlXCIsXCJjbGFzc1wiOiBcInNvY2lhbC1sb2dpbiBfdmtvbnRha3RlIF9fc29jaWFsLWxvZ2luXCJ9XG59LCAnYnV0dG9uJyk7XG5idWYucHVzaChcIiBcIik7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmJ1Zi5wdXNoKFwiR2l0aHViXCIpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImRhdGEtcHJvdmlkZXJcIjogXCJnaXRodWJcIixcImNsYXNzXCI6IFwic29jaWFsLWxvZ2luIF9naXRodWIgX19zb2NpYWwtbG9naW5cIn1cbn0sICdidXR0b24nKTtcbmJ1Zi5wdXNoKFwiIFwiKTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYnVmLnB1c2goXCLQr9C90LTQtdC60YFcIik7XG59LFxuYXR0cmlidXRlczoge1wiZGF0YS1wcm92aWRlclwiOiBcInlhbmRleFwiLFwiY2xhc3NcIjogXCJzb2NpYWwtbG9naW4gX3lhbmRleCBfX3NvY2lhbC1sb2dpblwifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwibGluZSBfX3NvY2lhbC1sb2dpbnNcIn1cbn0pO1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYXR0cmlidXRlczoge1widHlwZVwiOiBcImJ1dHRvblwiLFwidGl0bGVcIjogXCLQt9Cw0LrRgNGL0YLRjFwiLFwiY2xhc3NcIjogXCJjbG9zZS1idXR0b24gX19jbG9zZVwifVxufSwgJ2J1dHRvbicpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImFjdGlvblwiOiBcIiNcIixcImRhdGEtZm9ybVwiOiBcInJlZ2lzdGVyXCIsXCJjbGFzc1wiOiBcImZvcm1cIn1cbn0sICdmb3JtJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJsb2dpbi1mb3JtXCJ9XG59KTt9LmNhbGwodGhpcyxcImJlbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguYmVtOnR5cGVvZiBiZW0hPT1cInVuZGVmaW5lZFwiP2JlbTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufVxuKShwYXJhbXMpOyB9XG4vL0Agc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJaUlzSW1acGJHVWlPaUl2Y205dmRDOXFZWFpoYzJOeWFYQjBMVzV2WkdWcWN5OXViMlJsWDIxdlpIVnNaWE12WVhWMGFDOTBaVzF3YkdGMFpYTXZjbVZuYVhOMFpYSXRabTl5YlM1cVlXUmxMbXB6SWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2x0ZGZRPT0iLCIvLyBBZGFwdGVkIGZyb20gYmVtdG8uamFkZSwgY29weXJpZ2h0KGMpIDIwMTIgUm9tYW4gS29tYXJvdiA8a2l6dUBraXp1LnJ1PlxuXG4vKiBqc2hpbnQgLVcxMDYgKi9cblxudmFyIGphZGUgPSByZXF1aXJlKCdqYWRlL2xpYi9ydW50aW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcbiAgc2V0dGluZ3MgPSBzZXR0aW5ncyB8fCB7fTtcblxuICBzZXR0aW5ncy5wcmVmaXggPSBzZXR0aW5ncy5wcmVmaXggfHwgJyc7XG4gIHNldHRpbmdzLmVsZW1lbnQgPSBzZXR0aW5ncy5lbGVtZW50IHx8ICdfXyc7XG4gIHNldHRpbmdzLm1vZGlmaWVyID0gc2V0dGluZ3MubW9kaWZpZXIgfHwgJ18nO1xuICBzZXR0aW5ncy5kZWZhdWx0X3RhZyA9IHNldHRpbmdzLmRlZmF1bHRfdGFnIHx8ICdkaXYnO1xuXG4gIHJldHVybiBmdW5jdGlvbihidWYsIGJlbV9jaGFpbiwgYmVtX2NoYWluX2NvbnRleHRzLCB0YWcsIGlzRWxlbWVudCkge1xuICAgIC8vY29uc29sZS5sb2coXCItLT5cIiwgYXJndW1lbnRzKTtcbiAgICB2YXIgYmxvY2sgPSB0aGlzLmJsb2NrO1xuICAgIHZhciBhdHRyaWJ1dGVzID0gdGhpcy5hdHRyaWJ1dGVzIHx8IHt9O1xuXG4gICAgLy8gUmV3cml0aW5nIHRoZSBjbGFzcyBmb3IgZWxlbWVudHMgYW5kIG1vZGlmaWVyc1xuICAgIGlmIChhdHRyaWJ1dGVzLmNsYXNzKSB7XG4gICAgICB2YXIgYmVtX2NsYXNzZXMgPSBhdHRyaWJ1dGVzLmNsYXNzO1xuXG4gICAgICBpZiAoYmVtX2NsYXNzZXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBiZW1fY2xhc3NlcyA9IGJlbV9jbGFzc2VzLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICAgIGJlbV9jbGFzc2VzID0gYmVtX2NsYXNzZXMuc3BsaXQoJyAnKTtcblxuICAgICAgdmFyIGJlbV9ibG9jaztcbiAgICAgIHRyeSB7XG4gICAgICAgIGJlbV9ibG9jayA9IGJlbV9jbGFzc2VzWzBdLm1hdGNoKG5ldyBSZWdFeHAoJ14oKCg/IScgKyBzZXR0aW5ncy5lbGVtZW50ICsgJ3wnICsgc2V0dGluZ3MubW9kaWZpZXIgKyAnKS4pKyknKSlbMV07XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluY29ycmVjdCBiZW0gY2xhc3M6IFwiICsgYmVtX2NsYXNzZXNbMF0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzRWxlbWVudCkge1xuICAgICAgICBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aF0gPSBiZW1fYmxvY2s7XG4gICAgICAgIGJlbV9jbGFzc2VzWzBdID0gYmVtX2NsYXNzZXNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiZW1fY2xhc3Nlc1swXSA9IGJlbV9jaGFpbltiZW1fY2hhaW4ubGVuZ3RoIC0gMV0gKyBzZXR0aW5ncy5lbGVtZW50ICsgYmVtX2NsYXNzZXNbMF07XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50X2Jsb2NrID0gKGlzRWxlbWVudCA/IGJlbV9jaGFpbltiZW1fY2hhaW4ubGVuZ3RoIC0gMV0gKyBzZXR0aW5ncy5lbGVtZW50IDogJycpICsgYmVtX2Jsb2NrO1xuXG4gICAgICAvLyBBZGRpbmcgdGhlIGJsb2NrIGlmIHRoZXJlIGlzIG9ubHkgbW9kaWZpZXIgYW5kL29yIGVsZW1lbnRcbiAgICAgIGlmIChiZW1fY2xhc3Nlcy5pbmRleE9mKGN1cnJlbnRfYmxvY2spID09PSAtMSkge1xuICAgICAgICBiZW1fY2xhc3Nlc1tiZW1fY2xhc3Nlcy5sZW5ndGhdID0gY3VycmVudF9ibG9jaztcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiZW1fY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2xhc3MgPSBiZW1fY2xhc3Nlc1tpXTtcblxuICAgICAgICBpZiAoa2xhc3MubWF0Y2gobmV3IFJlZ0V4cCgnXig/IScgKyBzZXR0aW5ncy5lbGVtZW50ICsgJyknICsgc2V0dGluZ3MubW9kaWZpZXIpKSkge1xuICAgICAgICAgIC8vIEV4cGFuZGluZyB0aGUgbW9kaWZpZXJzXG4gICAgICAgICAgYmVtX2NsYXNzZXNbaV0gPSBjdXJyZW50X2Jsb2NrICsga2xhc3M7XG4gICAgICAgIH0gZWxzZSBpZiAoa2xhc3MubWF0Y2gobmV3IFJlZ0V4cCgnXicgKyBzZXR0aW5ncy5lbGVtZW50KSkpIHtcbiAgICAgICAgICAvLy0gRXhwYW5kaW5nIHRoZSBtaXhlZCBpbiBlbGVtZW50c1xuICAgICAgICAgIGlmIChiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDJdKSB7XG4gICAgICAgICAgICBiZW1fY2xhc3Nlc1tpXSA9IGJlbV9jaGFpbltiZW1fY2hhaW4ubGVuZ3RoIC0gMl0gKyBrbGFzcztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmVtX2NsYXNzZXNbaV0gPSBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDFdICsga2xhc3M7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkaW5nIHByZWZpeGVzXG4gICAgICAgIGlmIChiZW1fY2xhc3Nlc1tpXS5tYXRjaChuZXcgUmVnRXhwKCdeJyArIGN1cnJlbnRfYmxvY2sgKyAnKCR8KD89JyArIHNldHRpbmdzLmVsZW1lbnQgKyAnfCcgKyBzZXR0aW5ncy5tb2RpZmllciArICcpKScpKSkge1xuICAgICAgICAgIGJlbV9jbGFzc2VzW2ldID0gc2V0dGluZ3MucHJlZml4ICsgYmVtX2NsYXNzZXNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gV3JpdGUgbW9kaWZpZWQgY2xhc3NlcyB0byBhdHRyaWJ1dGVzIGluIHRoZSBjb3JyZWN0IG9yZGVyXG4gICAgICBhdHRyaWJ1dGVzLmNsYXNzID0gYmVtX2NsYXNzZXMuc29ydCgpLmpvaW4oJyAnKTtcbiAgICB9XG5cbiAgICBiZW1fdGFnKGJ1ZiwgYmxvY2ssIGF0dHJpYnV0ZXMsIGJlbV9jaGFpbiwgYmVtX2NoYWluX2NvbnRleHRzLCB0YWcpO1xuXG4gICAgLy8gQ2xvc2luZyBhY3Rpb25zIChyZW1vdmUgdGhlIGN1cnJlbnQgYmxvY2sgZnJvbSB0aGUgY2hhaW4pXG4gICAgaWYgKCFpc0VsZW1lbnQpIHtcbiAgICAgIGJlbV9jaGFpbi5wb3AoKTtcbiAgICB9XG4gICAgYmVtX2NoYWluX2NvbnRleHRzLnBvcCgpO1xuICB9O1xuXG5cbiAgLy8gdXNlZCBmb3IgdHdlYWtpbmcgd2hhdCB0YWcgd2UgYXJlIHRocm93aW5nIGFuZCBkbyB3ZSBuZWVkIHRvIHdyYXAgYW55dGhpbmcgaGVyZVxuICBmdW5jdGlvbiBiZW1fdGFnKGJ1ZiwgYmxvY2ssIGF0dHJpYnV0ZXMsIGJlbV9jaGFpbiwgYmVtX2NoYWluX2NvbnRleHRzLCB0YWcpIHtcbiAgICAvLyByZXdyaXRpbmcgdGFnIG5hbWUgb24gZGlmZmVyZW50IGNvbnRleHRzXG4gICAgdmFyIG5ld1RhZyA9IHRhZyB8fCBzZXR0aW5ncy5kZWZhdWx0X3RhZztcbiAgICB2YXIgY29udGV4dEluZGV4ID0gYmVtX2NoYWluX2NvbnRleHRzLmxlbmd0aDtcblxuICAgIC8vQ2hlY2tzIGZvciBjb250ZXh0cyBpZiBubyB0YWcgZ2l2ZW5cbiAgICAvL2NvbnNvbGUubG9nKGJlbV9jaGFpbl9jb250ZXh0cywgdGFnKTtcbiAgICBpZiAoIXRhZykge1xuICAgICAgaWYgKGJlbV9jaGFpbl9jb250ZXh0c1tjb250ZXh0SW5kZXggLSAxXSA9PT0gJ2lubGluZScpIHtcbiAgICAgICAgbmV3VGFnID0gJ3NwYW4nO1xuICAgICAgfSBlbHNlIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdsaXN0Jykge1xuICAgICAgICBuZXdUYWcgPSAnbGknO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vQXR0cmlidXRlcyBjb250ZXh0IGNoZWNrc1xuICAgIGlmIChhdHRyaWJ1dGVzLmhyZWYpIHtcbiAgICAgIG5ld1RhZyA9ICdhJztcbiAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZXMuZm9yKSB7XG4gICAgICBuZXdUYWcgPSAnbGFiZWwnO1xuICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlcy5zcmMpIHtcbiAgICAgIG5ld1RhZyA9ICdpbWcnO1xuICAgIH1cblxuICAgIC8vQ29udGV4dHVhbCB3cmFwcGVyc1xuICAgIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdsaXN0JyAmJiBuZXdUYWcgIT09ICdsaScpIHtcbiAgICAgIGJ1Zi5wdXNoKCc8bGk+Jyk7XG4gICAgfSBlbHNlIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gIT09ICdsaXN0JyAmJiBiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gIT09ICdwc2V1ZG8tbGlzdCcgJiYgbmV3VGFnID09PSAnbGknKSB7XG4gICAgICBidWYucHVzaCgnPHVsPicpO1xuICAgICAgYmVtX2NoYWluX2NvbnRleHRzW2JlbV9jaGFpbl9jb250ZXh0cy5sZW5ndGhdID0gJ3BzZXVkby1saXN0JztcbiAgICB9IGVsc2UgaWYgKGJlbV9jaGFpbl9jb250ZXh0c1tjb250ZXh0SW5kZXggLSAxXSA9PT0gJ3BzZXVkby1saXN0JyAmJiBuZXdUYWcgIT09ICdsaScpIHtcbiAgICAgIGJ1Zi5wdXNoKCc8L3VsPicpO1xuICAgICAgYmVtX2NoYWluX2NvbnRleHRzLnBvcCgpO1xuICAgIH1cblxuICAgIC8vU2V0dGluZyBjb250ZXh0XG4gICAgaWYgKFsnYScsICdhYmJyJywgJ2Fjcm9ueW0nLCAnYicsICdicicsICdjb2RlJywgJ2VtJywgJ2ZvbnQnLCAnaScsICdpbWcnLCAnaW5zJywgJ2tiZCcsICdtYXAnLCAnc2FtcCcsICdzbWFsbCcsICdzcGFuJywgJ3N0cm9uZycsICdzdWInLCAnc3VwJywgJ2xhYmVsJywgJ3AnLCAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnXS5pbmRleE9mKG5ld1RhZykgIT09IC0xKSB7XG4gICAgICBiZW1fY2hhaW5fY29udGV4dHNbYmVtX2NoYWluX2NvbnRleHRzLmxlbmd0aF0gPSAnaW5saW5lJztcbiAgICB9IGVsc2UgaWYgKFsndWwnLCAnb2wnXS5pbmRleE9mKG5ld1RhZykgIT09IC0xKSB7XG4gICAgICBiZW1fY2hhaW5fY29udGV4dHNbYmVtX2NoYWluX2NvbnRleHRzLmxlbmd0aF0gPSAnbGlzdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJlbV9jaGFpbl9jb250ZXh0c1tiZW1fY2hhaW5fY29udGV4dHMubGVuZ3RoXSA9ICdibG9jayc7XG4gICAgfVxuXG4gICAgc3dpdGNoIChuZXdUYWcpIHtcbiAgICBjYXNlICdpbWcnOlxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gdGl0bGUgd2UgZG9uJ3QgbmVlZCBpdCB0byBzaG93IGV2ZW4gaWYgdGhlcmUgaXMgc29tZSBhbHRcbiAgICAgIGlmIChhdHRyaWJ1dGVzLmFsdCAmJiAhYXR0cmlidXRlcy50aXRsZSkge1xuICAgICAgICBhdHRyaWJ1dGVzLnRpdGxlID0gJyc7XG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSBoYXZlIHRpdGxlLCB3ZSBtdXN0IGhhdmUgaXQgaW4gYWx0IGlmIGl0J3Mgbm90IHNldFxuICAgICAgaWYgKGF0dHJpYnV0ZXMudGl0bGUgJiYgIWF0dHJpYnV0ZXMuYWx0KSB7XG4gICAgICAgIGF0dHJpYnV0ZXMuYWx0ID0gYXR0cmlidXRlcy50aXRsZTtcbiAgICAgIH1cbiAgICAgIGlmICghYXR0cmlidXRlcy5hbHQpIHtcbiAgICAgICAgYXR0cmlidXRlcy5hbHQgPSAnJztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgIGlmICghYXR0cmlidXRlcy50eXBlKSB7XG4gICAgICAgIGF0dHJpYnV0ZXMudHlwZSA9IFwidGV4dFwiO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaHRtbCc6XG4gICAgICBidWYucHVzaCgnPCFET0NUWVBFIEhUTUw+Jyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhJzpcbiAgICAgIGlmICghYXR0cmlidXRlcy5ocmVmKSB7XG4gICAgICAgIGF0dHJpYnV0ZXMuaHJlZiA9ICcjJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBidWYucHVzaCgnPCcgKyBuZXdUYWcgKyBqYWRlLmF0dHJzKGphZGUubWVyZ2UoW2F0dHJpYnV0ZXNdKSwgdHJ1ZSkgKyBcIj5cIik7XG5cbiAgICBpZiAoYmxvY2spIGJsb2NrKCk7XG5cbiAgICBpZiAoWydhcmVhJywgJ2Jhc2UnLCAnYnInLCAnY29sJywgJ2VtYmVkJywgJ2hyJywgJ2ltZycsICdpbnB1dCcsICdrZXlnZW4nLCAnbGluaycsICdtZW51aXRlbScsICdtZXRhJywgJ3BhcmFtJywgJ3NvdXJjZScsICd0cmFjaycsICd3YnInXS5pbmRleE9mKG5ld1RhZykgPT0gLTEpIHtcbiAgICAgIGJ1Zi5wdXNoKCc8LycgKyBuZXdUYWcgKyAnPicpO1xuICAgIH1cblxuICAgIC8vIENsb3NpbmcgYWxsIHRoZSB3cmFwcGVyIHRhaWxzXG4gICAgaWYgKGJlbV9jaGFpbl9jb250ZXh0c1tjb250ZXh0SW5kZXggLSAxXSA9PT0gJ2xpc3QnICYmIG5ld1RhZyAhPSAnbGknKSB7XG4gICAgICBidWYucHVzaCgnPC9saT4nKTtcbiAgICB9XG4gIH1cblxuXG59O1xuIixudWxsLCJ2YXIgYmVtID0gcmVxdWlyZSgnYmVtLWphZGUnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRlbXBsYXRlLCBsb2NhbHMpIHtcbiAgbG9jYWxzID0gbG9jYWxzID8gT2JqZWN0LmNyZWF0ZShsb2NhbHMpIDoge307XG4gIGFkZFN0YW5kYXJkSGVscGVycyhsb2NhbHMpO1xuXG4gIHJldHVybiB0ZW1wbGF0ZShsb2NhbHMpO1xufTtcblxuZnVuY3Rpb24gYWRkU3RhbmRhcmRIZWxwZXJzKGxvY2Fscykge1xuICBsb2NhbHMuYmVtID0gYmVtO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vcG9seWZpbGwnKTtcblxuZnVuY3Rpb24gZmluZERlbGVnYXRlVGFyZ2V0KGV2ZW50LCBzZWxlY3Rvcikge1xuICB2YXIgY3VycmVudE5vZGUgPSBldmVudC50YXJnZXQ7XG4gIHdoaWxlIChjdXJyZW50Tm9kZSkge1xuICAgIGlmIChjdXJyZW50Tm9kZS5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnROb2RlO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Tm9kZSA9PSBldmVudC5jdXJyZW50VGFyZ2V0KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnRFbGVtZW50O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBkZWxlZ2F0ZSh0YWJsZSwgJ3RoJywgY2xpY2ssIGhhbmRsZXIpXG4vLyB0YWJsZVxuLy8gICB0aGVhZFxuLy8gICAgIHRoICAgICAgICAgXipcbi8vICAgICAgIGNvZGUgIDwtLVxuZnVuY3Rpb24gZGVsZWdhdGUodG9wRWxlbWVudCwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCkge1xuICAvKiBqc2hpbnQgLVcwNDAgKi9cbiAgdG9wRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZm91bmQgPSBmaW5kRGVsZWdhdGVUYXJnZXQoZXZlbnQsIHNlbGVjdG9yKTtcblxuICAgIC8vIC5jdXJyZW50VGFyZ2V0IGlzIHJlYWQgb25seSwgSSBjYW4gbm90IG92ZXJ3cml0ZSBpdCB0byB0aGUgXCJmb3VuZFwiIGVsZW1lbnRcbiAgICAvLyBPYmplY3QuY3JlYXRlIHdyYXBwZXIgd291bGQgYnJlYWsgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIC8vIHNvLCBrZWVwIGluIG1pbmQ6XG4gICAgLy8gLS0+IGV2ZW50LmN1cnJlbnRUYXJnZXQgaXMgYWx3YXlzIHRoZSB0b3AtbGV2ZWwgKGRlbGVnYXRpbmcpIGVsZW1lbnQhXG4gICAgLy8gdXNlIFwidGhpc1wiIHRvIGdldCB0aGUgZm91bmQgdGFyZ2V0XG5cbiAgICBldmVudC5kZWxlZ2F0ZVRhcmdldCA9IGZvdW5kOyAvLyB1c2UgaW5zdGVhZCBvZiBcInRoaXNcIiBpbiBvYmplY3QgbWV0aG9kc1xuXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICAvLyBpZiBpbiBjb250ZXh0IG9mIG9iamVjdCwgdXNlIG9iamVjdCBhcyB0aGlzLFxuICAgICAgaGFuZGxlci5jYWxsKGNvbnRleHQgfHwgdGhpcywgZXZlbnQpO1xuICAgIH1cbiAgfSk7XG59XG5cbmRlbGVnYXRlLmRlbGVnYXRlTWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgb2JqLmRlbGVnYXRlID0gZnVuY3Rpb24oc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIGRlbGVnYXRlKHRoaXMuZWxlbSwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgdGhpcyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlO1xuXG4iLCJ2YXIgaHVtYW5lID0gcmVxdWlyZSgnaHVtYW5lLWpzJyk7XG5cbmV4cG9ydHMuaW5mbyA9IGh1bWFuZS5zcGF3bih7IGFkZG5DbHM6ICdodW1hbmUtbGlibm90aWZ5LWluZm8nLCB0aW1lb3V0OiAxMDAwIH0pO1xuZXhwb3J0cy5lcnJvciA9IGh1bWFuZS5zcGF3bih7IGFkZG5DbHM6ICdodW1hbmUtbGlibm90aWZ5LWVycm9yJywgdGltZW91dDogMzAwMCB9KTtcbiIsImZ1bmN0aW9uIHRleHROb2RlSWZTdHJpbmcobm9kZSkge1xuICByZXR1cm4gdHlwZW9mIG5vZGUgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSkgOiBub2RlO1xufVxuXG5mdW5jdGlvbiBtdXRhdGlvbk1hY3JvKG5vZGVzKSB7XG4gIGlmIChub2Rlcy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gdGV4dE5vZGVJZlN0cmluZyhub2Rlc1swXSk7XG4gIH1cbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICB2YXIgbGlzdCA9IFtdLnNsaWNlLmNhbGwobm9kZXMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHRleHROb2RlSWZTdHJpbmcobGlzdFtpXSkpO1xuICB9XG4gIHJldHVybiBmcmFnbWVudDtcbn1cblxudmFyIG1ldGhvZHMgPSB7XG4gIG1hdGNoZXM6IEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IsXG4gIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmVudE5vZGUgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cbiAgfVxufTtcblxuZm9yICh2YXIgbWV0aG9kTmFtZSBpbiBtZXRob2RzKSB7XG4gIGlmICghRWxlbWVudC5wcm90b3R5cGVbbWV0aG9kTmFtZV0pIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZVttZXRob2ROYW1lXSA9IG1ldGhvZHNbbWV0aG9kTmFtZV07XG4gIH1cbn1cblxudHJ5IHtcbiAgbmV3IEN1c3RvbUV2ZW50KFwiSUUgaGFzIEN1c3RvbUV2ZW50LCBidXQgZG9lc24ndCBzdXBwb3J0IGNvbnN0cnVjdG9yXCIpO1xufSBjYXRjaCAoZSkge1xuXG4gIHdpbmRvdy5DdXN0b21FdmVudCA9IGZ1bmN0aW9uKGV2ZW50LCBwYXJhbXMpIHtcbiAgICB2YXIgZXZ0O1xuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7XG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgZGV0YWlsOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7XG4gICAgZXZ0LmluaXRDdXN0b21FdmVudChldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgICByZXR1cm4gZXZ0O1xuICB9O1xuXG4gIEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUod2luZG93LkV2ZW50LnByb3RvdHlwZSk7XG59XG5cbiIsInJlcXVpcmUoJy4vZG9tNCcpO1xuIiwiLy8gVXNhZ2U6XG4vLyAgMSkgbmV3IFNwaW5uZXIoeyBlbGVtOiBlbGVtfSkgLT4gc3RhcnQvc3RvcCgpXG4vLyAgMikgbmV3IFNwaW5uZXIoKSAtPiBzb21ld2hlcmUuYXBwZW5kKHNwaW5uZXIuZWxlbSkgLT4gc3RhcnQvc3RvcFxuZnVuY3Rpb24gU3Bpbm5lcihvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLmVsZW0gPSBvcHRpb25zLmVsZW07XG4gIHRoaXMuc2l6ZSA9IG9wdGlvbnMuc2l6ZSB8fCAnbWVkaXVtJztcbiAgLy8gYW55IGNsYXNzIHRvIGFkZCB0byBzcGlubmVyIChtYWtlIHNwaW5uZXIgc3BlY2lhbCBoZXJlKVxuICB0aGlzLmNsYXNzID0gb3B0aW9ucy5jbGFzcyA/ICgnICcgKyBvcHRpb25zLmNsYXNzKSA6ICcnO1xuXG4gIC8vIGFueSBjbGFzcyB0byBhZGQgdG8gZWxlbWVudCAodG8gaGlkZSBpdCdzIGNvbnRlbnQgZm9yIGluc3RhbmNlKVxuICB0aGlzLmVsZW1DbGFzcyA9IG9wdGlvbnMuZWxlbUNsYXNzO1xuXG4gIGlmICh0aGlzLnNpemUgIT0gJ21lZGl1bScgJiYgdGhpcy5zaXplICE9ICdzbWFsbCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBzaXplOiBcIiArIHRoaXMuc2l6ZSk7XG4gIH1cblxuICBpZiAoIXRoaXMuZWxlbSkge1xuICAgIHRoaXMuZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB9XG59XG5cblNwaW5uZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmVsZW1DbGFzcykge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuZWxlbUNsYXNzKTtcbiAgfVxuXG4gIHRoaXMuZWxlbS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsICc8c3BhbiBjbGFzcz1cInNwaW5uZXIgc3Bpbm5lcl9hY3RpdmUgc3Bpbm5lcl8nICsgdGhpcy5zaXplICsgdGhpcy5jbGFzcyArICdcIj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfMVwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfMlwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfM1wiPjwvc3Bhbj48L3NwYW4+Jyk7XG59O1xuXG5TcGlubmVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbS5yZW1vdmVDaGlsZCh0aGlzLmVsZW0ucXVlcnlTZWxlY3RvcignLnNwaW5uZXInKSk7XG5cbiAgaWYgKHRoaXMuZWxlbUNsYXNzKSB7XG4gICAgdGhpcy5lbGVtLmNsYXNzTGlzdC50b2dnbGUodGhpcy5lbGVtQ2xhc3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaW5uZXI7XG4iLCJ2YXIgbm90aWZ5ID0gcmVxdWlyZSgnLi9ub3RpZnknKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigneGhyZmFpbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIG5vdGlmeS5lcnJvcihldmVudC5yZWFzb24pO1xufSk7XG4iLCJyZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5yZXF1aXJlKCcuL3hoci1ub3RpZnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSB4aHI7XG5cbi8vIFdyYXBwZXIgYWJvdXQgWEhSXG4vLyAjIEdsb2JhbCBFdmVudHNcbi8vIHRyaWdnZXJzIGRvY3VtZW50LmxvYWRzdGFydC9sb2FkZW5kIG9uIGNvbW11bmljYXRpb24gc3RhcnQvZW5kXG4vLyAgICAtLT4gdW5sZXNzIG9wdGlvbnMubm9HbG9iYWxFdmVudHMgaXMgc2V0XG4vL1xuLy8gIyBFdmVudHNcbi8vIHRyaWdnZXJzIGZhaWwvc3VjY2VzcyBvbiBsb2FkIGVuZDpcbi8vICAgIC0tPiBieSBkZWZhdWx0IHN0YXR1cz0yMDAgaXMgb2ssIHRoZSBvdGhlcnMgYXJlIGZhaWx1cmVzXG4vLyAgICAtLT4gb3B0aW9ucy5zdWNjZXNzU3RhdHVzZXMgPSBbMjAxLDQwOV0gYWxsb3cgZ2l2ZW4gc3RhdHVzZXNcbi8vICAgIC0tPiBmYWlsIGV2ZW50IGhhcyAucmVhc29uIGZpZWxkXG4vLyAgICAtLT4gc3VjY2VzcyBldmVudCBoYXMgLnJlc3VsdCBmaWVsZFxuLy9cbi8vICMgSlNPTlxuLy8gICAgLS0+IHNlbmQob2JqZWN0KSBjYWxscyBKU09OLnN0cmluZ2lmeVxuLy8gICAgLS0+IG9wdGlvbnMuanNvbiBhZGRzIEFjY2VwdDoganNvbiAod2Ugd2FudCBqc29uKVxuLy8gaWYgb3B0aW9ucy5qc29uIG9yIHNlcnZlciByZXR1cm5lZCBqc29uIGNvbnRlbnQgdHlwZVxuLy8gICAgLS0+IGF1dG9wYXJzZSBqc29uXG4vLyAgICAtLT4gZmFpbCBpZiBlcnJvclxuLy9cbi8vICMgQ1NSRlxuLy8gICAgLS0+IEdFVC9PUFRJT05TL0hFQUQgcmVxdWVzdHMgZ2V0IF9jc3JmIGZpZWxkIGZyb20gd2luZG93LmNzcmZcblxuZnVuY3Rpb24geGhyKG9wdGlvbnMpIHtcblxuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHZhciBtZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCAnR0VUJztcbiAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgb3B0aW9ucy51cmwsIG9wdGlvbnMuc3luYyA/IGZhbHNlIDogdHJ1ZSk7XG5cbiAgcmVxdWVzdC5tZXRob2QgPSBtZXRob2Q7XG5cbiAgaWYgKCFvcHRpb25zLm5vR2xvYmFsRXZlbnRzKSB7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RhcnQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocnN0YXJ0JywgZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlbmQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocmVuZCcsIGV2ZW50KTtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlID0gd3JhcEV2ZW50KCd4aHJzdWNjZXNzJywgZXZlbnQpO1xuICAgICAgZS5yZXN1bHQgPSBldmVudC5yZXN1bHQ7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZmFpbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyZmFpbCcsIGV2ZW50KTtcbiAgICAgIGUucmVhc29uID0gZXZlbnQucmVhc29uO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmpzb24pIHsgLy8gbWVhbnMgd2Ugd2FudCBqc29uXG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgfVxuXG4gIHZhciBzdWNjZXNzU3RhdHVzZXMgPSBvcHRpb25zLnN1Y2Nlc3NTdGF0dXNlcyB8fCBbMjAwXTtcblxuICBmdW5jdGlvbiB3cmFwRXZlbnQobmFtZSwgZSkge1xuICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChuYW1lKTtcbiAgICBldmVudC5vcmlnaW5hbEV2ZW50ID0gZTtcbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBmYWlsKHJlYXNvbiwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gd3JhcEV2ZW50KFwiZmFpbFwiLCBvcmlnaW5hbEV2ZW50KTtcbiAgICBlLnJlYXNvbiA9IHJlYXNvbjtcbiAgICByZXF1ZXN0LmRpc3BhdGNoRXZlbnQoZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdWNjZXNzKHJlc3VsdCwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gd3JhcEV2ZW50KFwic3VjY2Vzc1wiLCBvcmlnaW5hbEV2ZW50KTtcbiAgICBlLnJlc3VsdCA9IHJlc3VsdDtcbiAgICByZXF1ZXN0LmRpc3BhdGNoRXZlbnQoZSk7XG4gIH1cblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihlKSB7XG4gICAgZmFpbChcItCe0YjQuNCx0LrQsCDRgdCy0Y/Qt9C4INGBINGB0LXRgNCy0LXRgNC+0LwuXCIsIGUpO1xuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0aW1lb3V0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBmYWlsKFwi0J/RgNC10LLRi9GI0LXQvdC+INC80LDQutGB0LjQvNCw0LvRjNC90L4g0LTQvtC/0YPRgdGC0LjQvNC+0LUg0LLRgNC10LzRjyDQvtC20LjQtNCw0L3QuNGPINC+0YLQstC10YLQsCDQvtGCINGB0LXRgNCy0LXRgNCwLlwiLCBlKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgZnVuY3Rpb24oZSkge1xuICAgIGZhaWwoXCLQl9Cw0L/RgNC+0YEg0LHRi9C7INC/0YDQtdGA0LLQsNC9LlwiLCBlKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCF0aGlzLnN0YXR1cykgeyAvLyBkb2VzIHRoYXQgZXZlciBoYXBwZW4/XG4gICAgICBmYWlsKFwi0J3QtSDQv9C+0LvRg9GH0LXQvSDQvtGC0LLQtdGCINC+0YIg0YHQtdGA0LLQtdGA0LAuXCIsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzdWNjZXNzU3RhdHVzZXMuaW5kZXhPZih0aGlzLnN0YXR1cykgPT0gLTEpIHtcbiAgICAgIGZhaWwoXCLQntGI0LjQsdC60LAg0L3QsCDRgdGC0L7RgNC+0L3QtSDRgdC10YDQstC10YDQsCAo0LrQvtC0IFwiICsgdGhpcy5zdGF0dXMgKyBcIiksINC/0L7Qv9GL0YLQsNC50YLQtdGB0Ywg0L/QvtC30LTQvdC10LVcIiwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucmVzcG9uc2VUZXh0O1xuICAgIHZhciBjb250ZW50VHlwZSA9IHRoaXMuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIik7XG4gICAgaWYgKGNvbnRlbnRUeXBlLm1hdGNoKC9eYXBwbGljYXRpb25cXC9qc29uLykgfHwgb3B0aW9ucy5qc29uKSB7IC8vIGF1dG9wYXJzZSBqc29uIGlmIFdBTlQgb3IgUkVDRUlWRUQganNvblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmYWlsKFwi0J3QtdC60L7RgNGA0LXQutGC0L3Ri9C5INGE0L7RgNC80LDRgiDQvtGC0LLQtdGC0LAg0L7RgiDRgdC10YDQstC10YDQsFwiLCBlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN1Y2Nlc3MocmVzdWx0LCBlKTtcbiAgfSk7XG5cbiAgd3JhcENzcmZTZW5kKHJlcXVlc3QpO1xuICByZXR1cm4gcmVxdWVzdDtcbn1cblxuLy8gQWxsIG5vbi1HRVQgcmVxdWVzdCBnZXQgX2NzcmYgZnJvbSB3aW5kb3cuY3NyZiBhdXRvbWF0aWNhbGx5XG5mdW5jdGlvbiB3cmFwQ3NyZlNlbmQocmVxdWVzdCkge1xuXG4gIHZhciBzZW5kID0gcmVxdWVzdC5zZW5kO1xuICByZXF1ZXN0LnNlbmQgPSBmdW5jdGlvbihib2R5KSB7XG5cbiAgICBpZiAoIX5bJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnXS5pbmRleE9mKHRoaXMubWV0aG9kKSkge1xuICAgICAgaWYgKGJvZHkgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuICAgICAgICBib2R5LmFwcGVuZChcIl9jc3JmXCIsIHdpbmRvdy5jc3JmKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoYm9keSkgPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgYm9keS5fY3NyZiA9IHdpbmRvdy5jc3JmO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IHtfY3NyZjogd2luZG93LmNzcmZ9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGJvZHkpID09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICB0aGlzLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLThcIik7XG4gICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgfVxuXG4gICAgc2VuZC5jYWxsKHRoaXMsIGJvZHkpO1xuXG4gIH07XG5cbn1cbiIsIi8qKlxuICogaHVtYW5lLmpzXG4gKiBIdW1hbml6ZWQgTWVzc2FnZXMgZm9yIE5vdGlmaWNhdGlvbnNcbiAqIEBhdXRob3IgTWFyYyBIYXJ0ZXIgKEB3YXZkZWQpXG4gKiBAZXhhbXBsZVxuICogICBodW1hbmUubG9nKCdoZWxsbyB3b3JsZCcpO1xuICogU2VlIG1vcmUgdXNhZ2UgZXhhbXBsZXMgYXQ6IGh0dHA6Ly93YXZkZWQuZ2l0aHViLmNvbS9odW1hbmUtanMvXG4gKi9cblxuOyFmdW5jdGlvbiAobmFtZSwgY29udGV4dCwgZGVmaW5pdGlvbikge1xuICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24obmFtZSwgY29udGV4dClcbiAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgID09PSAnb2JqZWN0JykgZGVmaW5lKGRlZmluaXRpb24pXG4gICBlbHNlIGNvbnRleHRbbmFtZV0gPSBkZWZpbml0aW9uKG5hbWUsIGNvbnRleHQpXG59KCdodW1hbmUnLCB0aGlzLCBmdW5jdGlvbiAobmFtZSwgY29udGV4dCkge1xuICAgdmFyIHdpbiA9IHdpbmRvd1xuICAgdmFyIGRvYyA9IGRvY3VtZW50XG5cbiAgIHZhciBFTlYgPSB7XG4gICAgICBvbjogZnVuY3Rpb24gKGVsLCB0eXBlLCBjYikge1xuICAgICAgICAgJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbiA/IGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSxjYixmYWxzZSkgOiBlbC5hdHRhY2hFdmVudCgnb24nK3R5cGUsY2IpXG4gICAgICB9LFxuICAgICAgb2ZmOiBmdW5jdGlvbiAoZWwsIHR5cGUsIGNiKSB7XG4gICAgICAgICAncmVtb3ZlRXZlbnRMaXN0ZW5lcicgaW4gd2luID8gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLGNiLGZhbHNlKSA6IGVsLmRldGFjaEV2ZW50KCdvbicrdHlwZSxjYilcbiAgICAgIH0sXG4gICAgICBiaW5kOiBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkoY3R4LGFyZ3VtZW50cykgfVxuICAgICAgfSxcbiAgICAgIGlzQXJyYXk6IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XScgfSxcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHByZWZlcnJlZCwgZmFsbGJhY2spIHtcbiAgICAgICAgIHJldHVybiBwcmVmZXJyZWQgIT0gbnVsbCA/IHByZWZlcnJlZCA6IGZhbGxiYWNrXG4gICAgICB9LFxuICAgICAgdHJhbnNTdXBwb3J0OiBmYWxzZSxcbiAgICAgIHVzZUZpbHRlcjogL21zaWUgWzY3OF0vaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLCAvLyBzbmlmZiwgc25pZmZcbiAgICAgIF9jaGVja1RyYW5zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgdmFyIHZlbmRvcnMgPSB7IHdlYmtpdDogJ3dlYmtpdCcsIE1vejogJycsIE86ICdvJywgbXM6ICdNUycgfVxuXG4gICAgICAgICBmb3IgKHZhciB2ZW5kb3IgaW4gdmVuZG9ycylcbiAgICAgICAgICAgIGlmICh2ZW5kb3IgKyAnVHJhbnNpdGlvbicgaW4gZWwuc3R5bGUpIHtcbiAgICAgICAgICAgICAgIHRoaXMudmVuZG9yUHJlZml4ID0gdmVuZG9yc1t2ZW5kb3JdXG4gICAgICAgICAgICAgICB0aGlzLnRyYW5zU3VwcG9ydCA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgIH1cbiAgIH1cbiAgIEVOVi5fY2hlY2tUcmFuc2l0aW9uKClcblxuICAgdmFyIEh1bWFuZSA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICBvIHx8IChvID0ge30pXG4gICAgICB0aGlzLnF1ZXVlID0gW11cbiAgICAgIHRoaXMuYmFzZUNscyA9IG8uYmFzZUNscyB8fCAnaHVtYW5lJ1xuICAgICAgdGhpcy5hZGRuQ2xzID0gby5hZGRuQ2xzIHx8ICcnXG4gICAgICB0aGlzLnRpbWVvdXQgPSAndGltZW91dCcgaW4gbyA/IG8udGltZW91dCA6IDI1MDBcbiAgICAgIHRoaXMud2FpdEZvck1vdmUgPSBvLndhaXRGb3JNb3ZlIHx8IGZhbHNlXG4gICAgICB0aGlzLmNsaWNrVG9DbG9zZSA9IG8uY2xpY2tUb0Nsb3NlIHx8IGZhbHNlXG4gICAgICB0aGlzLnRpbWVvdXRBZnRlck1vdmUgPSBvLnRpbWVvdXRBZnRlck1vdmUgfHwgZmFsc2UgXG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG8uY29udGFpbmVyXG5cbiAgICAgIHRyeSB7IHRoaXMuX3NldHVwRWwoKSB9IC8vIGF0dGVtcHQgdG8gc2V0dXAgZWxlbWVudHNcbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIEVOVi5vbih3aW4sJ2xvYWQnLEVOVi5iaW5kKHRoaXMuX3NldHVwRWwsIHRoaXMpKSAvLyBkb20gd2Fzbid0IHJlYWR5LCB3YWl0IHRpbGwgcmVhZHlcbiAgICAgIH1cbiAgIH1cblxuICAgSHVtYW5lLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBIdW1hbmUsXG4gICAgICBfc2V0dXBFbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICBpZiAoIXRoaXMuY29udGFpbmVyKXtcbiAgICAgICAgICAgaWYoZG9jLmJvZHkpIHRoaXMuY29udGFpbmVyID0gZG9jLmJvZHk7XG4gICAgICAgICAgIGVsc2UgdGhyb3cgJ2RvY3VtZW50LmJvZHkgaXMgbnVsbCdcbiAgICAgICAgIH1cbiAgICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKVxuICAgICAgICAgdGhpcy5lbCA9IGVsXG4gICAgICAgICB0aGlzLnJlbW92ZUV2ZW50ID0gRU5WLmJpbmQoZnVuY3Rpb24oKXsgaWYgKCF0aGlzLnRpbWVvdXRBZnRlck1vdmUpe3RoaXMucmVtb3ZlKCl9IGVsc2Uge3NldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5yZW1vdmUsdGhpcyksdGhpcy50aW1lb3V0KTt9fSx0aGlzKVxuICAgICAgICAgdGhpcy50cmFuc0V2ZW50ID0gRU5WLmJpbmQodGhpcy5fYWZ0ZXJBbmltYXRpb24sdGhpcylcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICB9LFxuICAgICAgX2FmdGVyVGltZW91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgaWYgKCFFTlYuY29uZmlnKHRoaXMuY3VycmVudE1zZy53YWl0Rm9yTW92ZSx0aGlzLndhaXRGb3JNb3ZlKSkgdGhpcy5yZW1vdmUoKVxuXG4gICAgICAgICBlbHNlIGlmICghdGhpcy5yZW1vdmVFdmVudHNTZXQpIHtcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwnbW91c2Vtb3ZlJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwna2V5cHJlc3MnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICBFTlYub24oZG9jLmJvZHksJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50c1NldCA9IHRydWVcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfcnVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAodGhpcy5fYW5pbWF0aW5nIHx8ICF0aGlzLnF1ZXVlLmxlbmd0aCB8fCAhdGhpcy5lbCkgcmV0dXJuXG5cbiAgICAgICAgIHRoaXMuX2FuaW1hdGluZyA9IHRydWVcbiAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVyKVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZXIgPSBudWxsXG4gICAgICAgICB9XG5cbiAgICAgICAgIHZhciBtc2cgPSB0aGlzLnF1ZXVlLnNoaWZ0KClcbiAgICAgICAgIHZhciBjbGlja1RvQ2xvc2UgPSBFTlYuY29uZmlnKG1zZy5jbGlja1RvQ2xvc2UsdGhpcy5jbGlja1RvQ2xvc2UpXG5cbiAgICAgICAgIGlmIChjbGlja1RvQ2xvc2UpIHtcbiAgICAgICAgICAgIEVOVi5vbih0aGlzLmVsLCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbih0aGlzLmVsLCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgfVxuXG4gICAgICAgICB2YXIgdGltZW91dCA9IEVOVi5jb25maWcobXNnLnRpbWVvdXQsdGhpcy50aW1lb3V0KVxuXG4gICAgICAgICBpZiAodGltZW91dCA+IDApXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lciA9IHNldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5fYWZ0ZXJUaW1lb3V0LHRoaXMpLCB0aW1lb3V0KVxuXG4gICAgICAgICBpZiAoRU5WLmlzQXJyYXkobXNnLmh0bWwpKSBtc2cuaHRtbCA9ICc8dWw+PGxpPicrbXNnLmh0bWwuam9pbignPGxpPicpKyc8L3VsPidcblxuICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSBtc2cuaHRtbFxuICAgICAgICAgdGhpcy5jdXJyZW50TXNnID0gbXNnXG4gICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNsc1xuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICAgICAgICAgIHNldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5fc2hvd01zZyx0aGlzKSw1MClcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TXNnKClcbiAgICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIF9zZXRPcGFjaXR5OiBmdW5jdGlvbiAob3BhY2l0eSkge1xuICAgICAgICAgaWYgKEVOVi51c2VGaWx0ZXIpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgdGhpcy5lbC5maWx0ZXJzLml0ZW0oJ0RYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkFscGhhJykuT3BhY2l0eSA9IG9wYWNpdHkqMTAwXG4gICAgICAgICAgICB9IGNhdGNoKGVycil7fVxuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUub3BhY2l0eSA9IFN0cmluZyhvcGFjaXR5KVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9zaG93TXNnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgYWRkbkNscyA9IEVOVi5jb25maWcodGhpcy5jdXJyZW50TXNnLmFkZG5DbHMsdGhpcy5hZGRuQ2xzKVxuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzKycgJyt0aGlzLmJhc2VDbHMrJy1hbmltYXRlJ1xuICAgICAgICAgfVxuICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3BhY2l0eSA9IDBcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzKycgJyt0aGlzLmJhc2VDbHMrJy1qcy1hbmltYXRlJ1xuICAgICAgICAgICAgdGhpcy5fc2V0T3BhY2l0eSgwKSAvLyByZXNldCB2YWx1ZSBzbyBob3ZlciBzdGF0ZXMgd29ya1xuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICBpZiAob3BhY2l0eSA8IDEpIHtcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gMC4xXG4gICAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSA+IDEpIG9wYWNpdHkgPSAxXG4gICAgICAgICAgICAgICAgICBzZWxmLl9zZXRPcGFjaXR5KG9wYWNpdHkpXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNlIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgICAgICB9LCAzMClcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfaGlkZU1zZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGFkZG5DbHMgPSBFTlYuY29uZmlnKHRoaXMuY3VycmVudE1zZy5hZGRuQ2xzLHRoaXMuYWRkbkNscylcbiAgICAgICAgIGlmIChFTlYudHJhbnNTdXBwb3J0KSB7XG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNscysnICcrYWRkbkNsc1xuICAgICAgICAgICAgRU5WLm9uKHRoaXMuZWwsRU5WLnZlbmRvclByZWZpeCA/IEVOVi52ZW5kb3JQcmVmaXgrJ1RyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnLHRoaXMudHJhbnNFdmVudClcbiAgICAgICAgIH1cbiAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAxXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICBpZihvcGFjaXR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgb3BhY2l0eSAtPSAwLjFcbiAgICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5IDwgMCkgb3BhY2l0eSA9IDBcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3NldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZWwuY2xhc3NOYW1lID0gc2VsZi5iYXNlQ2xzKycgJythZGRuQ2xzXG4gICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKVxuICAgICAgICAgICAgICAgICAgc2VsZi5fYWZ0ZXJBbmltYXRpb24oKVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzApXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX2FmdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkgRU5WLm9mZih0aGlzLmVsLEVOVi52ZW5kb3JQcmVmaXggPyBFTlYudmVuZG9yUHJlZml4KydUcmFuc2l0aW9uRW5kJyA6ICd0cmFuc2l0aW9uZW5kJyx0aGlzLnRyYW5zRXZlbnQpXG5cbiAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRNc2cuY2IpIHRoaXMuY3VycmVudE1zZy5jYigpXG4gICAgICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICAgICAgdGhpcy5fYW5pbWF0aW5nID0gZmFsc2VcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICB9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgdmFyIGNiID0gdHlwZW9mIGUgPT0gJ2Z1bmN0aW9uJyA/IGUgOiBudWxsXG5cbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ21vdXNlbW92ZScsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwna2V5cHJlc3MnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKGRvYy5ib2R5LCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZih0aGlzLmVsLCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYodGhpcy5lbCwndG91Y2hzdGFydCcsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRzU2V0ID0gZmFsc2VcblxuICAgICAgICAgaWYgKGNiICYmIHRoaXMuY3VycmVudE1zZykgdGhpcy5jdXJyZW50TXNnLmNiID0gY2JcbiAgICAgICAgIGlmICh0aGlzLl9hbmltYXRpbmcpIHRoaXMuX2hpZGVNc2coKVxuICAgICAgICAgZWxzZSBpZiAoY2IpIGNiKClcbiAgICAgIH0sXG4gICAgICBsb2c6IGZ1bmN0aW9uIChodG1sLCBvLCBjYiwgZGVmYXVsdHMpIHtcbiAgICAgICAgIHZhciBtc2cgPSB7fVxuICAgICAgICAgaWYgKGRlZmF1bHRzKVxuICAgICAgICAgICBmb3IgKHZhciBvcHQgaW4gZGVmYXVsdHMpXG4gICAgICAgICAgICAgICBtc2dbb3B0XSA9IGRlZmF1bHRzW29wdF1cblxuICAgICAgICAgaWYgKHR5cGVvZiBvID09ICdmdW5jdGlvbicpIGNiID0gb1xuICAgICAgICAgZWxzZSBpZiAobylcbiAgICAgICAgICAgIGZvciAodmFyIG9wdCBpbiBvKSBtc2dbb3B0XSA9IG9bb3B0XVxuXG4gICAgICAgICBtc2cuaHRtbCA9IGh0bWxcbiAgICAgICAgIGlmIChjYikgbXNnLmNiID0gY2JcbiAgICAgICAgIHRoaXMucXVldWUucHVzaChtc2cpXG4gICAgICAgICB0aGlzLl9ydW4oKVxuICAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIH0sXG4gICAgICBzcGF3bjogZnVuY3Rpb24gKGRlZmF1bHRzKSB7XG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoaHRtbCwgbywgY2IpIHtcbiAgICAgICAgICAgIHNlbGYubG9nLmNhbGwoc2VsZixodG1sLG8sY2IsZGVmYXVsdHMpXG4gICAgICAgICAgICByZXR1cm4gc2VsZlxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG5ldyBIdW1hbmUobykgfVxuICAgfVxuICAgcmV0dXJuIG5ldyBIdW1hbmUoKVxufSlcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKSA6IHZhbDtcbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xuICB2YXIgYnVmID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYnVmID0gW107XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG4gIGlmIChrZXlzLmxlbmd0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcbiAgfVxuICB2YXIgY29udGV4dCA9IDNcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcblxuICAvLyBFcnJvciBjb250ZXh0XG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxuICAgICAgKyBjdXJyXG4gICAgICArICd8ICdcbiAgICAgICsgbGluZTtcbiAgfSkuam9pbignXFxuJyk7XG5cbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcbiAgdGhyb3cgZXJyO1xufTtcbiIsImV4cG9ydHMuQXV0aE1vZGFsID0gcmVxdWlyZSgnLi9hdXRoTW9kYWwnKTtcbiJdfQ==
