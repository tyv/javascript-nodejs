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
({"/root/javascript-nodejs/node_modules/client/delegate.js":[function(require,module,exports){
'use strict';

require('./polyfill/dom4');

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


},{"./polyfill/dom4":"/root/javascript-nodejs/node_modules/client/polyfill/dom4.js"}],"/root/javascript-nodejs/node_modules/client/imageUploader.js":[function(require,module,exports){
var xhr = require('client/xhr');

function ImageUploader(file) {
  this.file = file;
}

ImageUploader.prototype.upload = function() {
  var formData = new FormData();

//  imgur should check this, no?
//  if (!file.type.match(/image.*/)) {
//    throw new Error("Unsupported file type: " + file.type);
//  }

  formData.append("image", this.file);

  var request = xhr({
    method: 'POST',
    url: "https://api.imgur.com/3/image.json",
    json: true
  });

  // 400 when corrupt or invalid file
  request.successStatuses = [200, 400];

  request.setRequestHeader('Authorization', 'Client-ID 675c2d9b213e56b');

  setTimeout(function() {
    request.send(formData);
  }, 0);

  return request;

};

module.exports = ImageUploader;

},{"client/xhr":"/root/javascript-nodejs/node_modules/client/xhr.js"}],"/root/javascript-nodejs/node_modules/client/notify.js":[function(require,module,exports){
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


},{}],"/root/javascript-nodejs/node_modules/client/xhr-notify.js":[function(require,module,exports){
var notify = require('./notify');

document.addEventListener('xhrfail', function(event) {
  notify.error(event.reason);
});

},{"./notify":"/root/javascript-nodejs/node_modules/client/notify.js"}],"/root/javascript-nodejs/node_modules/client/xhr.js":[function(require,module,exports){
require('./polyfill/dom4');
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

},{"./polyfill/dom4":"/root/javascript-nodejs/node_modules/client/polyfill/dom4.js","./xhr-notify":"/root/javascript-nodejs/node_modules/client/xhr-notify.js"}],"/root/javascript-nodejs/node_modules/humane-js/humane.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/profile/client/authProvidersManager.js":[function(require,module,exports){
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
  notify.error(errorMessage || "Отказ в авторизации", 'error');
};


delegate.delegateMixin(AuthProvidersManager.prototype);

module.exports = AuthProvidersManager;

},{"client/delegate":"/root/javascript-nodejs/node_modules/client/delegate.js","client/notify":"/root/javascript-nodejs/node_modules/client/notify.js","client/xhr":"/root/javascript-nodejs/node_modules/client/xhr.js"}],"/root/javascript-nodejs/node_modules/profile/client/photoChanger.js":[function(require,module,exports){
var delegate = require('client/delegate');
var xhr = require('client/xhr');
var ImageUploader = require('client/imageUploader');
var notify = require('client/notify');

function PhotoChanger() {
  this.elem = document.body.querySelector('[data-action="photo-change"]');

  this.img = this.elem;
  this.elem.addEventListener('click', function(event) {
    event.preventDefault();
    this.changePhoto();
  }.bind(this));
}

PhotoChanger.prototype.changePhoto = function() {
  var fileInput = document.createElement('input');
  fileInput.type = 'file';

  var self = this;
  fileInput.onchange = function() {
    self.upload(this.files[0]);
  };
  fileInput.click();
};

PhotoChanger.prototype.updateUserPhoto = function(link) {

  var self = this;

  var request = xhr({
    method: 'PATCH',
    url: '/users/me'
  });

  request.send({photo: link});

  request.addEventListener('success', function(event) {
    self.img.src = event.result.photo.replace(/(\.\w+)$/, window.devicePixelRatio > 1 ? 'm$1' : 't$1');
  });

};


PhotoChanger.prototype.upload = function(file) {
  var request = new ImageUploader(file).upload();

  var self = this;
  request.addEventListener('success', function(e) {
    if (this.status == 400) {
      notify.error("Неверный тип файла или изображение повреждено.");
      return;
    }

    if (e.result.data.width < 160 || e.result.data.height < 160) {
      notify.error("Минимальное разрешение 160x160, лучше 320px.");
      return;
    }

    self.updateUserPhoto(e.result.data.link);
  });

};

delegate.delegateMixin(PhotoChanger.prototype);

module.exports = PhotoChanger;

},{"client/delegate":"/root/javascript-nodejs/node_modules/client/delegate.js","client/imageUploader":"/root/javascript-nodejs/node_modules/client/imageUploader.js","client/notify":"/root/javascript-nodejs/node_modules/client/notify.js","client/xhr":"/root/javascript-nodejs/node_modules/client/xhr.js"}],"profile/client":[function(require,module,exports){


var AuthProvidersManager = require('./authProvidersManager');
var PhotoChanger = require('./photoChanger');

exports.init = function() {
  new AuthProvidersManager();
  new PhotoChanger();
};

},{"./authProvidersManager":"/root/javascript-nodejs/node_modules/profile/client/authProvidersManager.js","./photoChanger":"/root/javascript-nodejs/node_modules/profile/client/photoChanger.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svcHJlbHVkZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvZGVsZWdhdGUuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L2ltYWdlVXBsb2FkZXIuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L25vdGlmeS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvcG9seWZpbGwvZG9tNC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQveGhyLW5vdGlmeS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQveGhyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2h1bWFuZS1qcy9odW1hbmUuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvcHJvZmlsZS9jbGllbnQvYXV0aFByb3ZpZGVyc01hbmFnZXIuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvcHJvZmlsZS9jbGllbnQvcGhvdG9DaGFuZ2VyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3Byb2ZpbGUvY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIG1vZHVsZXMgYXJlIGRlZmluZWQgYXMgYW4gYXJyYXlcbi8vIFsgbW9kdWxlIGZ1bmN0aW9uLCBtYXAgb2YgcmVxdWlyZXVpcmVzIF1cbi8vXG4vLyBtYXAgb2YgcmVxdWlyZXVpcmVzIGlzIHNob3J0IHJlcXVpcmUgbmFtZSAtPiBudW1lcmljIHJlcXVpcmVcbi8vXG4vLyBhbnl0aGluZyBkZWZpbmVkIGluIGEgcHJldmlvdXMgYnVuZGxlIGlzIGFjY2Vzc2VkIHZpYSB0aGVcbi8vIG9yaWcgbWV0aG9kIHdoaWNoIGlzIHRoZSByZXF1aXJldWlyZSBmb3IgcHJldmlvdXMgYnVuZGxlc1xuXG4oZnVuY3Rpb24gb3V0ZXIgKG1vZHVsZXMsIGNhY2hlLCBlbnRyeSkge1xuICAgIC8vIFNhdmUgdGhlIHJlcXVpcmUgZnJvbSBwcmV2aW91cyBidW5kbGUgdG8gdGhpcyBjbG9zdXJlIGlmIGFueVxuICAgIHZhciBwcmV2aW91c1JlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcblxuICAgIGZ1bmN0aW9uIG5ld1JlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICAgICAgaWYoIWNhY2hlW25hbWVdKSB7XG4gICAgICAgICAgICBpZighbW9kdWxlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGNhbm5vdCBmaW5kIHRoZSB0aGUgbW9kdWxlIHdpdGhpbiBvdXIgaW50ZXJuYWwgbWFwIG9yXG4gICAgICAgICAgICAgICAgLy8gY2FjaGUganVtcCB0byB0aGUgY3VycmVudCBnbG9iYWwgcmVxdWlyZSBpZS4gdGhlIGxhc3QgYnVuZGxlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3YXMgYWRkZWQgdG8gdGhlIHBhZ2UuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG4gICAgICAgICAgICAgICAgaWYgKCFqdW1wZWQgJiYgY3VycmVudFJlcXVpcmUpIHJldHVybiBjdXJyZW50UmVxdWlyZShuYW1lLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciBidW5kbGVzIG9uIHRoaXMgcGFnZSB0aGUgcmVxdWlyZSBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzIG9uZSBpcyBzYXZlZCB0byAncHJldmlvdXNSZXF1aXJlJy4gUmVwZWF0IHRoaXMgYXNcbiAgICAgICAgICAgICAgICAvLyBtYW55IHRpbWVzIGFzIHRoZXJlIGFyZSBidW5kbGVzIHVudGlsIHRoZSBtb2R1bGUgaXMgZm91bmQgb3JcbiAgICAgICAgICAgICAgICAvLyB3ZSBleGhhdXN0IHRoZSByZXF1aXJlIGNoYWluLlxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c1JlcXVpcmUpIHJldHVybiBwcmV2aW91c1JlcXVpcmUobmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgbW9kdWxlIFxcJycgKyBuYW1lICsgJ1xcJycpO1xuICAgICAgICAgICAgICAgIGVyci5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtID0gY2FjaGVbbmFtZV0gPSB7ZXhwb3J0czp7fX07XG4gICAgICAgICAgICBtb2R1bGVzW25hbWVdWzBdLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbih4KXtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBtb2R1bGVzW25hbWVdWzFdW3hdO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdSZXF1aXJlKGlkID8gaWQgOiB4KTtcbiAgICAgICAgICAgIH0sbSxtLmV4cG9ydHMsb3V0ZXIsbW9kdWxlcyxjYWNoZSxlbnRyeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlW25hbWVdLmV4cG9ydHM7XG4gICAgfVxuICAgIGZvcih2YXIgaT0wO2k8ZW50cnkubGVuZ3RoO2krKykgbmV3UmVxdWlyZShlbnRyeVtpXSk7XG5cbiAgICAvLyBPdmVycmlkZSB0aGUgY3VycmVudCByZXF1aXJlIHdpdGggdGhpcyBuZXcgb25lXG4gICAgcmV0dXJuIG5ld1JlcXVpcmU7XG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3BvbHlmaWxsL2RvbTQnKTtcblxuZnVuY3Rpb24gZmluZERlbGVnYXRlVGFyZ2V0KGV2ZW50LCBzZWxlY3Rvcikge1xuICB2YXIgY3VycmVudE5vZGUgPSBldmVudC50YXJnZXQ7XG4gIHdoaWxlIChjdXJyZW50Tm9kZSkge1xuICAgIGlmIChjdXJyZW50Tm9kZS5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnROb2RlO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Tm9kZSA9PSBldmVudC5jdXJyZW50VGFyZ2V0KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnRFbGVtZW50O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBkZWxlZ2F0ZSh0YWJsZSwgJ3RoJywgY2xpY2ssIGhhbmRsZXIpXG4vLyB0YWJsZVxuLy8gICB0aGVhZFxuLy8gICAgIHRoICAgICAgICAgXipcbi8vICAgICAgIGNvZGUgIDwtLVxuZnVuY3Rpb24gZGVsZWdhdGUodG9wRWxlbWVudCwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCkge1xuICAvKiBqc2hpbnQgLVcwNDAgKi9cbiAgdG9wRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZm91bmQgPSBmaW5kRGVsZWdhdGVUYXJnZXQoZXZlbnQsIHNlbGVjdG9yKTtcblxuICAgIC8vIC5jdXJyZW50VGFyZ2V0IGlzIHJlYWQgb25seSwgSSBjYW4gbm90IG92ZXJ3cml0ZSBpdCB0byB0aGUgXCJmb3VuZFwiIGVsZW1lbnRcbiAgICAvLyBPYmplY3QuY3JlYXRlIHdyYXBwZXIgd291bGQgYnJlYWsgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIC8vIHNvLCBrZWVwIGluIG1pbmQ6XG4gICAgLy8gLS0+IGV2ZW50LmN1cnJlbnRUYXJnZXQgaXMgYWx3YXlzIHRoZSB0b3AtbGV2ZWwgKGRlbGVnYXRpbmcpIGVsZW1lbnQhXG4gICAgLy8gdXNlIFwidGhpc1wiIHRvIGdldCB0aGUgZm91bmQgdGFyZ2V0XG5cbiAgICBldmVudC5kZWxlZ2F0ZVRhcmdldCA9IGZvdW5kOyAvLyB1c2UgaW5zdGVhZCBvZiBcInRoaXNcIiBpbiBvYmplY3QgbWV0aG9kc1xuXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICAvLyBpZiBpbiBjb250ZXh0IG9mIG9iamVjdCwgdXNlIG9iamVjdCBhcyB0aGlzLFxuICAgICAgaGFuZGxlci5jYWxsKGNvbnRleHQgfHwgdGhpcywgZXZlbnQpO1xuICAgIH1cbiAgfSk7XG59XG5cbmRlbGVnYXRlLmRlbGVnYXRlTWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgb2JqLmRlbGVnYXRlID0gZnVuY3Rpb24oc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIGRlbGVnYXRlKHRoaXMuZWxlbSwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgdGhpcyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlO1xuXG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnY2xpZW50L3hocicpO1xuXG5mdW5jdGlvbiBJbWFnZVVwbG9hZGVyKGZpbGUpIHtcbiAgdGhpcy5maWxlID0gZmlsZTtcbn1cblxuSW1hZ2VVcGxvYWRlci5wcm90b3R5cGUudXBsb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4vLyAgaW1ndXIgc2hvdWxkIGNoZWNrIHRoaXMsIG5vP1xuLy8gIGlmICghZmlsZS50eXBlLm1hdGNoKC9pbWFnZS4qLykpIHtcbi8vICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIGZpbGUgdHlwZTogXCIgKyBmaWxlLnR5cGUpO1xuLy8gIH1cblxuICBmb3JtRGF0YS5hcHBlbmQoXCJpbWFnZVwiLCB0aGlzLmZpbGUpO1xuXG4gIHZhciByZXF1ZXN0ID0geGhyKHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IFwiaHR0cHM6Ly9hcGkuaW1ndXIuY29tLzMvaW1hZ2UuanNvblwiLFxuICAgIGpzb246IHRydWVcbiAgfSk7XG5cbiAgLy8gNDAwIHdoZW4gY29ycnVwdCBvciBpbnZhbGlkIGZpbGVcbiAgcmVxdWVzdC5zdWNjZXNzU3RhdHVzZXMgPSBbMjAwLCA0MDBdO1xuXG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsICdDbGllbnQtSUQgNjc1YzJkOWIyMTNlNTZiJyk7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICByZXF1ZXN0LnNlbmQoZm9ybURhdGEpO1xuICB9LCAwKTtcblxuICByZXR1cm4gcmVxdWVzdDtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZVVwbG9hZGVyO1xuIiwidmFyIGh1bWFuZSA9IHJlcXVpcmUoJ2h1bWFuZS1qcycpO1xuXG5leHBvcnRzLmluZm8gPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWxpYm5vdGlmeS1pbmZvJywgdGltZW91dDogMTAwMCB9KTtcbmV4cG9ydHMuZXJyb3IgPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWxpYm5vdGlmeS1lcnJvcicsIHRpbWVvdXQ6IDMwMDAgfSk7XG4iLCJmdW5jdGlvbiB0ZXh0Tm9kZUlmU3RyaW5nKG5vZGUpIHtcbiAgcmV0dXJuIHR5cGVvZiBub2RlID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpIDogbm9kZTtcbn1cblxuZnVuY3Rpb24gbXV0YXRpb25NYWNybyhub2Rlcykge1xuICBpZiAobm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHRleHROb2RlSWZTdHJpbmcobm9kZXNbMF0pO1xuICB9XG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIGxpc3QgPSBbXS5zbGljZS5jYWxsKG5vZGVzKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0ZXh0Tm9kZUlmU3RyaW5nKGxpc3RbaV0pKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbnZhciBtZXRob2RzID0ge1xuICBtYXRjaGVzOiBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yLFxuICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnROb2RlID0gdGhpcy5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm4gcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gIH1cbn07XG5cbmZvciAodmFyIG1ldGhvZE5hbWUgaW4gbWV0aG9kcykge1xuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBtZXRob2RzW21ldGhvZE5hbWVdO1xuICB9XG59XG5cbnRyeSB7XG4gIG5ldyBDdXN0b21FdmVudChcIklFIGhhcyBDdXN0b21FdmVudCwgYnV0IGRvZXNuJ3Qgc3VwcG9ydCBjb25zdHJ1Y3RvclwiKTtcbn0gY2F0Y2ggKGUpIHtcblxuICB3aW5kb3cuQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbihldmVudCwgcGFyYW1zKSB7XG4gICAgdmFyIGV2dDtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgcmV0dXJuIGV2dDtcbiAgfTtcblxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHdpbmRvdy5FdmVudC5wcm90b3R5cGUpO1xufVxuXG4iLCJ2YXIgbm90aWZ5ID0gcmVxdWlyZSgnLi9ub3RpZnknKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigneGhyZmFpbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIG5vdGlmeS5lcnJvcihldmVudC5yZWFzb24pO1xufSk7XG4iLCJyZXF1aXJlKCcuL3BvbHlmaWxsL2RvbTQnKTtcbnJlcXVpcmUoJy4veGhyLW5vdGlmeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHhocjtcblxuLy8gV3JhcHBlciBhYm91dCBYSFJcbi8vICMgR2xvYmFsIEV2ZW50c1xuLy8gdHJpZ2dlcnMgZG9jdW1lbnQubG9hZHN0YXJ0L2xvYWRlbmQgb24gY29tbXVuaWNhdGlvbiBzdGFydC9lbmRcbi8vICAgIC0tPiB1bmxlc3Mgb3B0aW9ucy5ub0dsb2JhbEV2ZW50cyBpcyBzZXRcbi8vXG4vLyAjIEV2ZW50c1xuLy8gdHJpZ2dlcnMgZmFpbC9zdWNjZXNzIG9uIGxvYWQgZW5kOlxuLy8gICAgLS0+IGJ5IGRlZmF1bHQgc3RhdHVzPTIwMCBpcyBvaywgdGhlIG90aGVycyBhcmUgZmFpbHVyZXNcbi8vICAgIC0tPiBvcHRpb25zLnN1Y2Nlc3NTdGF0dXNlcyA9IFsyMDEsNDA5XSBhbGxvdyBnaXZlbiBzdGF0dXNlc1xuLy8gICAgLS0+IGZhaWwgZXZlbnQgaGFzIC5yZWFzb24gZmllbGRcbi8vICAgIC0tPiBzdWNjZXNzIGV2ZW50IGhhcyAucmVzdWx0IGZpZWxkXG4vL1xuLy8gIyBKU09OXG4vLyAgICAtLT4gc2VuZChvYmplY3QpIGNhbGxzIEpTT04uc3RyaW5naWZ5XG4vLyAgICAtLT4gb3B0aW9ucy5qc29uIGFkZHMgQWNjZXB0OiBqc29uICh3ZSB3YW50IGpzb24pXG4vLyBpZiBvcHRpb25zLmpzb24gb3Igc2VydmVyIHJldHVybmVkIGpzb24gY29udGVudCB0eXBlXG4vLyAgICAtLT4gYXV0b3BhcnNlIGpzb25cbi8vICAgIC0tPiBmYWlsIGlmIGVycm9yXG4vL1xuLy8gIyBDU1JGXG4vLyAgICAtLT4gR0VUL09QVElPTlMvSEVBRCByZXF1ZXN0cyBnZXQgX2NzcmYgZmllbGQgZnJvbSB3aW5kb3cuY3NyZlxuXG5mdW5jdGlvbiB4aHIob3B0aW9ucykge1xuXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgdmFyIG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnO1xuICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBvcHRpb25zLnVybCwgb3B0aW9ucy5zeW5jID8gZmFsc2UgOiB0cnVlKTtcblxuICByZXF1ZXN0Lm1ldGhvZCA9IG1ldGhvZDtcblxuICBpZiAoIW9wdGlvbnMubm9HbG9iYWxFdmVudHMpIHtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyc3RhcnQnLCBldmVudCk7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyZW5kJywgZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocnN1Y2Nlc3MnLCBldmVudCk7XG4gICAgICBlLnJlc3VsdCA9IGV2ZW50LnJlc3VsdDtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdmYWlsJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlID0gd3JhcEV2ZW50KCd4aHJmYWlsJywgZXZlbnQpO1xuICAgICAgZS5yZWFzb24gPSBldmVudC5yZWFzb247XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuanNvbikgeyAvLyBtZWFucyB3ZSB3YW50IGpzb25cbiAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoXCJBY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICB9XG5cbiAgdmFyIHN1Y2Nlc3NTdGF0dXNlcyA9IG9wdGlvbnMuc3VjY2Vzc1N0YXR1c2VzIHx8IFsyMDBdO1xuXG4gIGZ1bmN0aW9uIHdyYXBFdmVudChuYW1lLCBlKSB7XG4gICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KG5hbWUpO1xuICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSBlO1xuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZhaWwocmVhc29uLCBvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIGUgPSB3cmFwRXZlbnQoXCJmYWlsXCIsIG9yaWdpbmFsRXZlbnQpO1xuICAgIGUucmVhc29uID0gcmVhc29uO1xuICAgIHJlcXVlc3QuZGlzcGF0Y2hFdmVudChlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Y2Nlc3MocmVzdWx0LCBvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIGUgPSB3cmFwRXZlbnQoXCJzdWNjZXNzXCIsIG9yaWdpbmFsRXZlbnQpO1xuICAgIGUucmVzdWx0ID0gcmVzdWx0O1xuICAgIHJlcXVlc3QuZGlzcGF0Y2hFdmVudChlKTtcbiAgfVxuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBmYWlsKFwi0J7RiNC40LHQutCwINGB0LLRj9C30Lgg0YEg0YHQtdGA0LLQtdGA0L7QvC5cIiwgZSk7XG4gIH0pO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcihcInRpbWVvdXRcIiwgZnVuY3Rpb24oZSkge1xuICAgIGZhaWwoXCLQn9GA0LXQstGL0YjQtdC90L4g0LzQsNC60YHQuNC80LDQu9GM0L3QviDQtNC+0L/Rg9GB0YLQuNC80L7QtSDQstGA0LXQvNGPINC+0LbQuNC00LDQvdC40Y8g0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LAuXCIsIGUpO1xuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBmdW5jdGlvbihlKSB7XG4gICAgZmFpbChcItCX0LDQv9GA0L7RgSDQsdGL0Lsg0L/RgNC10YDQstCw0L0uXCIsIGUpO1xuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoIXRoaXMuc3RhdHVzKSB7IC8vIGRvZXMgdGhhdCBldmVyIGhhcHBlbj9cbiAgICAgIGZhaWwoXCLQndC1INC/0L7Qu9GD0YfQtdC9INC+0YLQstC10YIg0L7RgiDRgdC10YDQstC10YDQsC5cIiwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHN1Y2Nlc3NTdGF0dXNlcy5pbmRleE9mKHRoaXMuc3RhdHVzKSA9PSAtMSkge1xuICAgICAgZmFpbChcItCe0YjQuNCx0LrQsCDQvdCwINGB0YLQvtGA0L7QvdC1INGB0LXRgNCy0LXRgNCwICjQutC+0LQgXCIgKyB0aGlzLnN0YXR1cyArIFwiKSwg0L/QvtC/0YvRgtCw0LnRgtC10YHRjCDQv9C+0LfQtNC90LXQtVwiLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5yZXNwb25zZVRleHQ7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdGhpcy5nZXRSZXNwb25zZUhlYWRlcihcIkNvbnRlbnQtVHlwZVwiKTtcbiAgICBpZiAoY29udGVudFR5cGUubWF0Y2goL15hcHBsaWNhdGlvblxcL2pzb24vKSB8fCBvcHRpb25zLmpzb24pIHsgLy8gYXV0b3BhcnNlIGpzb24gaWYgV0FOVCBvciBSRUNFSVZFRCBqc29uXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZhaWwoXCLQndC10LrQvtGA0YDQtdC60YLQvdGL0Lkg0YTQvtGA0LzQsNGCINC+0YLQstC10YLQsCDQvtGCINGB0LXRgNCy0LXRgNCwXCIsIGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3VjY2VzcyhyZXN1bHQsIGUpO1xuICB9KTtcblxuICB3cmFwQ3NyZlNlbmQocmVxdWVzdCk7XG4gIHJldHVybiByZXF1ZXN0O1xufVxuXG4vLyBBbGwgbm9uLUdFVCByZXF1ZXN0IGdldCBfY3NyZiBmcm9tIHdpbmRvdy5jc3JmIGF1dG9tYXRpY2FsbHlcbmZ1bmN0aW9uIHdyYXBDc3JmU2VuZChyZXF1ZXN0KSB7XG5cbiAgdmFyIHNlbmQgPSByZXF1ZXN0LnNlbmQ7XG4gIHJlcXVlc3Quc2VuZCA9IGZ1bmN0aW9uKGJvZHkpIHtcblxuICAgIGlmICghflsnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUyddLmluZGV4T2YodGhpcy5tZXRob2QpKSB7XG4gICAgICBpZiAoYm9keSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICAgIGJvZHkuYXBwZW5kKFwiX2NzcmZcIiwgd2luZG93LmNzcmYpO1xuICAgICAgfVxuXG4gICAgICBpZiAoe30udG9TdHJpbmcuY2FsbChib2R5KSA9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICBib2R5Ll9jc3JmID0gd2luZG93LmNzcmY7XG4gICAgICB9XG5cbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICBib2R5ID0ge19jc3JmOiB3aW5kb3cuY3NyZn07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoYm9keSkgPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgIHRoaXMuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD1VVEYtOFwiKTtcbiAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcbiAgICB9XG5cbiAgICBzZW5kLmNhbGwodGhpcywgYm9keSk7XG5cbiAgfTtcblxufVxuIiwiLyoqXG4gKiBodW1hbmUuanNcbiAqIEh1bWFuaXplZCBNZXNzYWdlcyBmb3IgTm90aWZpY2F0aW9uc1xuICogQGF1dGhvciBNYXJjIEhhcnRlciAoQHdhdmRlZClcbiAqIEBleGFtcGxlXG4gKiAgIGh1bWFuZS5sb2coJ2hlbGxvIHdvcmxkJyk7XG4gKiBTZWUgbW9yZSB1c2FnZSBleGFtcGxlcyBhdDogaHR0cDovL3dhdmRlZC5naXRodWIuY29tL2h1bWFuZS1qcy9cbiAqL1xuXG47IWZ1bmN0aW9uIChuYW1lLCBjb250ZXh0LCBkZWZpbml0aW9uKSB7XG4gICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbihuYW1lLCBjb250ZXh0KVxuICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCAgPT09ICdvYmplY3QnKSBkZWZpbmUoZGVmaW5pdGlvbilcbiAgIGVsc2UgY29udGV4dFtuYW1lXSA9IGRlZmluaXRpb24obmFtZSwgY29udGV4dClcbn0oJ2h1bWFuZScsIHRoaXMsIGZ1bmN0aW9uIChuYW1lLCBjb250ZXh0KSB7XG4gICB2YXIgd2luID0gd2luZG93XG4gICB2YXIgZG9jID0gZG9jdW1lbnRcblxuICAgdmFyIEVOViA9IHtcbiAgICAgIG9uOiBmdW5jdGlvbiAoZWwsIHR5cGUsIGNiKSB7XG4gICAgICAgICAnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luID8gZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLGNiLGZhbHNlKSA6IGVsLmF0dGFjaEV2ZW50KCdvbicrdHlwZSxjYilcbiAgICAgIH0sXG4gICAgICBvZmY6IGZ1bmN0aW9uIChlbCwgdHlwZSwgY2IpIHtcbiAgICAgICAgICdyZW1vdmVFdmVudExpc3RlbmVyJyBpbiB3aW4gPyBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsY2IsZmFsc2UpIDogZWwuZGV0YWNoRXZlbnQoJ29uJyt0eXBlLGNiKVxuICAgICAgfSxcbiAgICAgIGJpbmQ6IGZ1bmN0aW9uIChmbiwgY3R4KSB7XG4gICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyBmbi5hcHBseShjdHgsYXJndW1lbnRzKSB9XG4gICAgICB9LFxuICAgICAgaXNBcnJheTogQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJyB9LFxuICAgICAgY29uZmlnOiBmdW5jdGlvbiAocHJlZmVycmVkLCBmYWxsYmFjaykge1xuICAgICAgICAgcmV0dXJuIHByZWZlcnJlZCAhPSBudWxsID8gcHJlZmVycmVkIDogZmFsbGJhY2tcbiAgICAgIH0sXG4gICAgICB0cmFuc1N1cHBvcnQ6IGZhbHNlLFxuICAgICAgdXNlRmlsdGVyOiAvbXNpZSBbNjc4XS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksIC8vIHNuaWZmLCBzbmlmZlxuICAgICAgX2NoZWNrVHJhbnNpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICB2YXIgdmVuZG9ycyA9IHsgd2Via2l0OiAnd2Via2l0JywgTW96OiAnJywgTzogJ28nLCBtczogJ01TJyB9XG5cbiAgICAgICAgIGZvciAodmFyIHZlbmRvciBpbiB2ZW5kb3JzKVxuICAgICAgICAgICAgaWYgKHZlbmRvciArICdUcmFuc2l0aW9uJyBpbiBlbC5zdHlsZSkge1xuICAgICAgICAgICAgICAgdGhpcy52ZW5kb3JQcmVmaXggPSB2ZW5kb3JzW3ZlbmRvcl1cbiAgICAgICAgICAgICAgIHRoaXMudHJhbnNTdXBwb3J0ID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgfVxuICAgfVxuICAgRU5WLl9jaGVja1RyYW5zaXRpb24oKVxuXG4gICB2YXIgSHVtYW5lID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgIG8gfHwgKG8gPSB7fSlcbiAgICAgIHRoaXMucXVldWUgPSBbXVxuICAgICAgdGhpcy5iYXNlQ2xzID0gby5iYXNlQ2xzIHx8ICdodW1hbmUnXG4gICAgICB0aGlzLmFkZG5DbHMgPSBvLmFkZG5DbHMgfHwgJydcbiAgICAgIHRoaXMudGltZW91dCA9ICd0aW1lb3V0JyBpbiBvID8gby50aW1lb3V0IDogMjUwMFxuICAgICAgdGhpcy53YWl0Rm9yTW92ZSA9IG8ud2FpdEZvck1vdmUgfHwgZmFsc2VcbiAgICAgIHRoaXMuY2xpY2tUb0Nsb3NlID0gby5jbGlja1RvQ2xvc2UgfHwgZmFsc2VcbiAgICAgIHRoaXMudGltZW91dEFmdGVyTW92ZSA9IG8udGltZW91dEFmdGVyTW92ZSB8fCBmYWxzZSBcbiAgICAgIHRoaXMuY29udGFpbmVyID0gby5jb250YWluZXJcblxuICAgICAgdHJ5IHsgdGhpcy5fc2V0dXBFbCgpIH0gLy8gYXR0ZW1wdCB0byBzZXR1cCBlbGVtZW50c1xuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgRU5WLm9uKHdpbiwnbG9hZCcsRU5WLmJpbmQodGhpcy5fc2V0dXBFbCwgdGhpcykpIC8vIGRvbSB3YXNuJ3QgcmVhZHksIHdhaXQgdGlsbCByZWFkeVxuICAgICAgfVxuICAgfVxuXG4gICBIdW1hbmUucHJvdG90eXBlID0ge1xuICAgICAgY29uc3RydWN0b3I6IEh1bWFuZSxcbiAgICAgIF9zZXR1cEVsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgICAgIGlmICghdGhpcy5jb250YWluZXIpe1xuICAgICAgICAgICBpZihkb2MuYm9keSkgdGhpcy5jb250YWluZXIgPSBkb2MuYm9keTtcbiAgICAgICAgICAgZWxzZSB0aHJvdyAnZG9jdW1lbnQuYm9keSBpcyBudWxsJ1xuICAgICAgICAgfVxuICAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICB0aGlzLmVsID0gZWxcbiAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnQgPSBFTlYuYmluZChmdW5jdGlvbigpeyBpZiAoIXRoaXMudGltZW91dEFmdGVyTW92ZSl7dGhpcy5yZW1vdmUoKX0gZWxzZSB7c2V0VGltZW91dChFTlYuYmluZCh0aGlzLnJlbW92ZSx0aGlzKSx0aGlzLnRpbWVvdXQpO319LHRoaXMpXG4gICAgICAgICB0aGlzLnRyYW5zRXZlbnQgPSBFTlYuYmluZCh0aGlzLl9hZnRlckFuaW1hdGlvbix0aGlzKVxuICAgICAgICAgdGhpcy5fcnVuKClcbiAgICAgIH0sXG4gICAgICBfYWZ0ZXJUaW1lb3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAoIUVOVi5jb25maWcodGhpcy5jdXJyZW50TXNnLndhaXRGb3JNb3ZlLHRoaXMud2FpdEZvck1vdmUpKSB0aGlzLnJlbW92ZSgpXG5cbiAgICAgICAgIGVsc2UgaWYgKCF0aGlzLnJlbW92ZUV2ZW50c1NldCkge1xuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCdtb3VzZW1vdmUnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICBFTlYub24oZG9jLmJvZHksJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCdrZXlwcmVzcycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwndG91Y2hzdGFydCcsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRzU2V0ID0gdHJ1ZVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9ydW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIGlmICh0aGlzLl9hbmltYXRpbmcgfHwgIXRoaXMucXVldWUubGVuZ3RoIHx8ICF0aGlzLmVsKSByZXR1cm5cblxuICAgICAgICAgdGhpcy5fYW5pbWF0aW5nID0gdHJ1ZVxuICAgICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZXIpXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lciA9IG51bGxcbiAgICAgICAgIH1cblxuICAgICAgICAgdmFyIG1zZyA9IHRoaXMucXVldWUuc2hpZnQoKVxuICAgICAgICAgdmFyIGNsaWNrVG9DbG9zZSA9IEVOVi5jb25maWcobXNnLmNsaWNrVG9DbG9zZSx0aGlzLmNsaWNrVG9DbG9zZSlcblxuICAgICAgICAgaWYgKGNsaWNrVG9DbG9zZSkge1xuICAgICAgICAgICAgRU5WLm9uKHRoaXMuZWwsJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKHRoaXMuZWwsJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICB9XG5cbiAgICAgICAgIHZhciB0aW1lb3V0ID0gRU5WLmNvbmZpZyhtc2cudGltZW91dCx0aGlzLnRpbWVvdXQpXG5cbiAgICAgICAgIGlmICh0aW1lb3V0ID4gMClcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWVyID0gc2V0VGltZW91dChFTlYuYmluZCh0aGlzLl9hZnRlclRpbWVvdXQsdGhpcyksIHRpbWVvdXQpXG5cbiAgICAgICAgIGlmIChFTlYuaXNBcnJheShtc2cuaHRtbCkpIG1zZy5odG1sID0gJzx1bD48bGk+Jyttc2cuaHRtbC5qb2luKCc8bGk+JykrJzwvdWw+J1xuXG4gICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9IG1zZy5odG1sXG4gICAgICAgICB0aGlzLmN1cnJlbnRNc2cgPSBtc2dcbiAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzXG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkge1xuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuICAgICAgICAgICAgc2V0VGltZW91dChFTlYuYmluZCh0aGlzLl9zaG93TXNnLHRoaXMpLDUwKVxuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNc2coKVxuICAgICAgICAgfVxuXG4gICAgICB9LFxuICAgICAgX3NldE9wYWNpdHk6IGZ1bmN0aW9uIChvcGFjaXR5KSB7XG4gICAgICAgICBpZiAoRU5WLnVzZUZpbHRlcil7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICB0aGlzLmVsLmZpbHRlcnMuaXRlbSgnRFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQWxwaGEnKS5PcGFjaXR5ID0gb3BhY2l0eSoxMDBcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXt9XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5vcGFjaXR5ID0gU3RyaW5nKG9wYWNpdHkpXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX3Nob3dNc2c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHZhciBhZGRuQ2xzID0gRU5WLmNvbmZpZyh0aGlzLmN1cnJlbnRNc2cuYWRkbkNscyx0aGlzLmFkZG5DbHMpXG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkge1xuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSB0aGlzLmJhc2VDbHMrJyAnK2FkZG5DbHMrJyAnK3RoaXMuYmFzZUNscysnLWFuaW1hdGUnXG4gICAgICAgICB9XG4gICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gMFxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSB0aGlzLmJhc2VDbHMrJyAnK2FkZG5DbHMrJyAnK3RoaXMuYmFzZUNscysnLWpzLWFuaW1hdGUnXG4gICAgICAgICAgICB0aGlzLl9zZXRPcGFjaXR5KDApIC8vIHJlc2V0IHZhbHVlIHNvIGhvdmVyIHN0YXRlcyB3b3JrXG4gICAgICAgICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgIGlmIChvcGFjaXR5IDwgMSkge1xuICAgICAgICAgICAgICAgICAgb3BhY2l0eSArPSAwLjFcbiAgICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5ID4gMSkgb3BhY2l0eSA9IDFcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3NldE9wYWNpdHkob3BhY2l0eSlcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGVsc2UgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcbiAgICAgICAgICAgIH0sIDMwKVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9oaWRlTXNnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgYWRkbkNscyA9IEVOVi5jb25maWcodGhpcy5jdXJyZW50TXNnLmFkZG5DbHMsdGhpcy5hZGRuQ2xzKVxuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzXG4gICAgICAgICAgICBFTlYub24odGhpcy5lbCxFTlYudmVuZG9yUHJlZml4ID8gRU5WLnZlbmRvclByZWZpeCsnVHJhbnNpdGlvbkVuZCcgOiAndHJhbnNpdGlvbmVuZCcsdGhpcy50cmFuc0V2ZW50KVxuICAgICAgICAgfVxuICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3BhY2l0eSA9IDFcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgIGlmKG9wYWNpdHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IDAuMVxuICAgICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkgPCAwKSBvcGFjaXR5ID0gMFxuICAgICAgICAgICAgICAgICAgc2VsZi5fc2V0T3BhY2l0eShvcGFjaXR5KTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc2VsZi5lbC5jbGFzc05hbWUgPSBzZWxmLmJhc2VDbHMrJyAnK2FkZG5DbHNcbiAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgICBzZWxmLl9hZnRlckFuaW1hdGlvbigpXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAzMClcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfYWZ0ZXJBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIGlmIChFTlYudHJhbnNTdXBwb3J0KSBFTlYub2ZmKHRoaXMuZWwsRU5WLnZlbmRvclByZWZpeCA/IEVOVi52ZW5kb3JQcmVmaXgrJ1RyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnLHRoaXMudHJhbnNFdmVudClcblxuICAgICAgICAgaWYgKHRoaXMuY3VycmVudE1zZy5jYikgdGhpcy5jdXJyZW50TXNnLmNiKClcbiAgICAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgICAgICB0aGlzLl9hbmltYXRpbmcgPSBmYWxzZVxuICAgICAgICAgdGhpcy5fcnVuKClcbiAgICAgIH0sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICB2YXIgY2IgPSB0eXBlb2YgZSA9PSAnZnVuY3Rpb24nID8gZSA6IG51bGxcblxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwnbW91c2Vtb3ZlJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwnY2xpY2snLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKGRvYy5ib2R5LCdrZXlwcmVzcycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKHRoaXMuZWwsJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZih0aGlzLmVsLCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgdGhpcy5yZW1vdmVFdmVudHNTZXQgPSBmYWxzZVxuXG4gICAgICAgICBpZiAoY2IgJiYgdGhpcy5jdXJyZW50TXNnKSB0aGlzLmN1cnJlbnRNc2cuY2IgPSBjYlxuICAgICAgICAgaWYgKHRoaXMuX2FuaW1hdGluZykgdGhpcy5faGlkZU1zZygpXG4gICAgICAgICBlbHNlIGlmIChjYikgY2IoKVxuICAgICAgfSxcbiAgICAgIGxvZzogZnVuY3Rpb24gKGh0bWwsIG8sIGNiLCBkZWZhdWx0cykge1xuICAgICAgICAgdmFyIG1zZyA9IHt9XG4gICAgICAgICBpZiAoZGVmYXVsdHMpXG4gICAgICAgICAgIGZvciAodmFyIG9wdCBpbiBkZWZhdWx0cylcbiAgICAgICAgICAgICAgIG1zZ1tvcHRdID0gZGVmYXVsdHNbb3B0XVxuXG4gICAgICAgICBpZiAodHlwZW9mIG8gPT0gJ2Z1bmN0aW9uJykgY2IgPSBvXG4gICAgICAgICBlbHNlIGlmIChvKVxuICAgICAgICAgICAgZm9yICh2YXIgb3B0IGluIG8pIG1zZ1tvcHRdID0gb1tvcHRdXG5cbiAgICAgICAgIG1zZy5odG1sID0gaHRtbFxuICAgICAgICAgaWYgKGNiKSBtc2cuY2IgPSBjYlxuICAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKG1zZylcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfSxcbiAgICAgIHNwYXduOiBmdW5jdGlvbiAoZGVmYXVsdHMpIHtcbiAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChodG1sLCBvLCBjYikge1xuICAgICAgICAgICAgc2VsZi5sb2cuY2FsbChzZWxmLGh0bWwsbyxjYixkZWZhdWx0cylcbiAgICAgICAgICAgIHJldHVybiBzZWxmXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY3JlYXRlOiBmdW5jdGlvbiAobykgeyByZXR1cm4gbmV3IEh1bWFuZShvKSB9XG4gICB9XG4gICByZXR1cm4gbmV3IEh1bWFuZSgpXG59KVxuIiwidmFyIGRlbGVnYXRlID0gcmVxdWlyZSgnY2xpZW50L2RlbGVnYXRlJyk7XG52YXIgbm90aWZ5ID0gcmVxdWlyZSgnY2xpZW50L25vdGlmeScpO1xudmFyIHhociA9IHJlcXVpcmUoJ2NsaWVudC94aHInKTtcblxuZnVuY3Rpb24gQXV0aFByb3ZpZGVyc01hbmFnZXIoKSB7XG4gIHRoaXMuZWxlbSA9IGRvY3VtZW50LmJvZHk7XG5cbiAgdGhpcy5kZWxlZ2F0ZSgnW2RhdGEtYWN0aW9uPVwicHJvdmlkZXItYWRkXCJdJywgJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuYWRkUHJvdmlkZXIoZXZlbnQuZGVsZWdhdGVUYXJnZXQuZGF0YXNldC5wcm92aWRlcik7XG4gIH0pO1xuXG4gIHRoaXMuZGVsZWdhdGUoJ1tkYXRhLWFjdGlvbj1cInByb3ZpZGVyLXJlbW92ZVwiXScsICdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnJlbW92ZVByb3ZpZGVyKGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmRhdGFzZXQucHJvdmlkZXIpO1xuICB9KTtcblxufVxuXG5cbkF1dGhQcm92aWRlcnNNYW5hZ2VyLnByb3RvdHlwZS5hZGRQcm92aWRlciA9IGZ1bmN0aW9uKHByb3ZpZGVyTmFtZSkge1xuICB0aGlzLm9wZW5BdXRoUG9wdXAoJy9hdXRoL2Nvbm5lY3QvJyArIHByb3ZpZGVyTmFtZSk7XG59O1xuXG5BdXRoUHJvdmlkZXJzTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlUHJvdmlkZXIgPSBmdW5jdGlvbihwcm92aWRlck5hbWUpIHtcbiAgdmFyIHJlcXVlc3QgPSB4aHIoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogJy9hdXRoL2Rpc2Nvbm5lY3QvJyArIHByb3ZpZGVyTmFtZVxuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gIH0pO1xuXG4gIHJlcXVlc3Quc2VuZCgpO1xuXG59O1xuXG5cblxuQXV0aFByb3ZpZGVyc01hbmFnZXIucHJvdG90eXBlLm9wZW5BdXRoUG9wdXAgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKHRoaXMuYXV0aFBvcHVwICYmICF0aGlzLmF1dGhQb3B1cC5jbG9zZWQpIHtcbiAgICB0aGlzLmF1dGhQb3B1cC5jbG9zZSgpOyAvLyBjbG9zZSBvbGQgcG9wdXAgaWYgYW55XG4gIH1cbiAgdmFyIHdpZHRoID0gODAwLCBoZWlnaHQgPSA2MDA7XG4gIHZhciB0b3AgPSAod2luZG93Lm91dGVySGVpZ2h0IC0gaGVpZ2h0KSAvIDI7XG4gIHZhciBsZWZ0ID0gKHdpbmRvdy5vdXRlcldpZHRoIC0gd2lkdGgpIC8gMjtcblxuICB3aW5kb3cuYXV0aFByb3ZpZGVyc01hbmFnZXIgPSB0aGlzO1xuICB0aGlzLmF1dGhQb3B1cCA9IHdpbmRvdy5vcGVuKHVybCwgJ2F1dGhQcm92aWRlcnNNYW5hZ2VyJywgJ3dpZHRoPScgKyB3aWR0aCArICcsaGVpZ2h0PScgKyBoZWlnaHQgKyAnLHNjcm9sbGJhcnM9MCx0b3A9JyArIHRvcCArICcsbGVmdD0nICsgbGVmdCk7XG59O1xuXG4vKlxuINCy0YHQtSDQvtCx0YDQsNCx0L7RgtGH0LjQutC4INCw0LLRgtC+0YDQuNC30LDRhtC40LggKNCy0LrQu9GO0YfQsNGPIEZhY2Vib29rINC40LcgcG9wdXAt0LAg0Lgg0LvQvtC60LDQu9GM0L3Ri9C5KVxuINCyINC40YLQvtCz0LUg0YLRgNC40LPQs9C10YDRj9GCINC+0LTQuNC9INC40Lcg0Y3RgtC40YUg0LrQsNC70LvQsdGN0LrQvtCyXG4gKi9cbkF1dGhQcm92aWRlcnNNYW5hZ2VyLnByb3RvdHlwZS5vbkF1dGhTdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbn07XG5cbkF1dGhQcm92aWRlcnNNYW5hZ2VyLnByb3RvdHlwZS5vbkF1dGhGYWlsdXJlID0gZnVuY3Rpb24oZXJyb3JNZXNzYWdlKSB7XG4gIG5vdGlmeS5lcnJvcihlcnJvck1lc3NhZ2UgfHwgXCLQntGC0LrQsNC3INCyINCw0LLRgtC+0YDQuNC30LDRhtC40LhcIiwgJ2Vycm9yJyk7XG59O1xuXG5cbmRlbGVnYXRlLmRlbGVnYXRlTWl4aW4oQXV0aFByb3ZpZGVyc01hbmFnZXIucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoUHJvdmlkZXJzTWFuYWdlcjtcbiIsInZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2NsaWVudC9kZWxlZ2F0ZScpO1xudmFyIHhociA9IHJlcXVpcmUoJ2NsaWVudC94aHInKTtcbnZhciBJbWFnZVVwbG9hZGVyID0gcmVxdWlyZSgnY2xpZW50L2ltYWdlVXBsb2FkZXInKTtcbnZhciBub3RpZnkgPSByZXF1aXJlKCdjbGllbnQvbm90aWZ5Jyk7XG5cbmZ1bmN0aW9uIFBob3RvQ2hhbmdlcigpIHtcbiAgdGhpcy5lbGVtID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJwaG90by1jaGFuZ2VcIl0nKTtcblxuICB0aGlzLmltZyA9IHRoaXMuZWxlbTtcbiAgdGhpcy5lbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuY2hhbmdlUGhvdG8oKTtcbiAgfS5iaW5kKHRoaXMpKTtcbn1cblxuUGhvdG9DaGFuZ2VyLnByb3RvdHlwZS5jaGFuZ2VQaG90byA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmlsZUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgZmlsZUlucHV0LnR5cGUgPSAnZmlsZSc7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBmaWxlSW5wdXQub25jaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBzZWxmLnVwbG9hZCh0aGlzLmZpbGVzWzBdKTtcbiAgfTtcbiAgZmlsZUlucHV0LmNsaWNrKCk7XG59O1xuXG5QaG90b0NoYW5nZXIucHJvdG90eXBlLnVwZGF0ZVVzZXJQaG90byA9IGZ1bmN0aW9uKGxpbmspIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIHJlcXVlc3QgPSB4aHIoe1xuICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICB1cmw6ICcvdXNlcnMvbWUnXG4gIH0pO1xuXG4gIHJlcXVlc3Quc2VuZCh7cGhvdG86IGxpbmt9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHNlbGYuaW1nLnNyYyA9IGV2ZW50LnJlc3VsdC5waG90by5yZXBsYWNlKC8oXFwuXFx3KykkLywgd2luZG93LmRldmljZVBpeGVsUmF0aW8gPiAxID8gJ20kMScgOiAndCQxJyk7XG4gIH0pO1xuXG59O1xuXG5cblBob3RvQ2hhbmdlci5wcm90b3R5cGUudXBsb2FkID0gZnVuY3Rpb24oZmlsZSkge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBJbWFnZVVwbG9hZGVyKGZpbGUpLnVwbG9hZCgpO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLnN0YXR1cyA9PSA0MDApIHtcbiAgICAgIG5vdGlmeS5lcnJvcihcItCd0LXQstC10YDQvdGL0Lkg0YLQuNC/INGE0LDQudC70LAg0LjQu9C4INC40LfQvtCx0YDQsNC20LXQvdC40LUg0L/QvtCy0YDQtdC20LTQtdC90L4uXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChlLnJlc3VsdC5kYXRhLndpZHRoIDwgMTYwIHx8IGUucmVzdWx0LmRhdGEuaGVpZ2h0IDwgMTYwKSB7XG4gICAgICBub3RpZnkuZXJyb3IoXCLQnNC40L3QuNC80LDQu9GM0L3QvtC1INGA0LDQt9GA0LXRiNC10L3QuNC1IDE2MHgxNjAsINC70YPRh9GI0LUgMzIwcHguXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYudXBkYXRlVXNlclBob3RvKGUucmVzdWx0LmRhdGEubGluayk7XG4gIH0pO1xuXG59O1xuXG5kZWxlZ2F0ZS5kZWxlZ2F0ZU1peGluKFBob3RvQ2hhbmdlci5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBob3RvQ2hhbmdlcjtcbiIsIlxuXG52YXIgQXV0aFByb3ZpZGVyc01hbmFnZXIgPSByZXF1aXJlKCcuL2F1dGhQcm92aWRlcnNNYW5hZ2VyJyk7XG52YXIgUGhvdG9DaGFuZ2VyID0gcmVxdWlyZSgnLi9waG90b0NoYW5nZXInKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIG5ldyBBdXRoUHJvdmlkZXJzTWFuYWdlcigpO1xuICBuZXcgUGhvdG9DaGFuZ2VyKCk7XG59O1xuIl19
