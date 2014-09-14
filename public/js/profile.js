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


},{"./polyfill":"/root/javascript-nodejs/node_modules/client/polyfill/index.js"}],"/root/javascript-nodejs/node_modules/client/imageUploader.js":[function(require,module,exports){
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


},{}],"/root/javascript-nodejs/node_modules/client/polyfill/index.js":[function(require,module,exports){
require('./dom4');

},{"./dom4":"/root/javascript-nodejs/node_modules/client/polyfill/dom4.js"}],"/root/javascript-nodejs/node_modules/client/xhr-notify.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svcHJlbHVkZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvZGVsZWdhdGUuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L2ltYWdlVXBsb2FkZXIuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L25vdGlmeS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvcG9seWZpbGwvZG9tNC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvcG9seWZpbGwvaW5kZXguanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L3hoci1ub3RpZnkuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L3hoci5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9odW1hbmUtanMvaHVtYW5lLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3Byb2ZpbGUvY2xpZW50L2F1dGhQcm92aWRlcnNNYW5hZ2VyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3Byb2ZpbGUvY2xpZW50L3Bob3RvQ2hhbmdlci5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9wcm9maWxlL2NsaWVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIG1vZHVsZXMgYXJlIGRlZmluZWQgYXMgYW4gYXJyYXlcbi8vIFsgbW9kdWxlIGZ1bmN0aW9uLCBtYXAgb2YgcmVxdWlyZXVpcmVzIF1cbi8vXG4vLyBtYXAgb2YgcmVxdWlyZXVpcmVzIGlzIHNob3J0IHJlcXVpcmUgbmFtZSAtPiBudW1lcmljIHJlcXVpcmVcbi8vXG4vLyBhbnl0aGluZyBkZWZpbmVkIGluIGEgcHJldmlvdXMgYnVuZGxlIGlzIGFjY2Vzc2VkIHZpYSB0aGVcbi8vIG9yaWcgbWV0aG9kIHdoaWNoIGlzIHRoZSByZXF1aXJldWlyZSBmb3IgcHJldmlvdXMgYnVuZGxlc1xuXG4oZnVuY3Rpb24gb3V0ZXIgKG1vZHVsZXMsIGNhY2hlLCBlbnRyeSkge1xuICAgIC8vIFNhdmUgdGhlIHJlcXVpcmUgZnJvbSBwcmV2aW91cyBidW5kbGUgdG8gdGhpcyBjbG9zdXJlIGlmIGFueVxuICAgIHZhciBwcmV2aW91c1JlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcblxuICAgIGZ1bmN0aW9uIG5ld1JlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICAgICAgaWYoIWNhY2hlW25hbWVdKSB7XG4gICAgICAgICAgICBpZighbW9kdWxlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGNhbm5vdCBmaW5kIHRoZSB0aGUgbW9kdWxlIHdpdGhpbiBvdXIgaW50ZXJuYWwgbWFwIG9yXG4gICAgICAgICAgICAgICAgLy8gY2FjaGUganVtcCB0byB0aGUgY3VycmVudCBnbG9iYWwgcmVxdWlyZSBpZS4gdGhlIGxhc3QgYnVuZGxlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3YXMgYWRkZWQgdG8gdGhlIHBhZ2UuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG4gICAgICAgICAgICAgICAgaWYgKCFqdW1wZWQgJiYgY3VycmVudFJlcXVpcmUpIHJldHVybiBjdXJyZW50UmVxdWlyZShuYW1lLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciBidW5kbGVzIG9uIHRoaXMgcGFnZSB0aGUgcmVxdWlyZSBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzIG9uZSBpcyBzYXZlZCB0byAncHJldmlvdXNSZXF1aXJlJy4gUmVwZWF0IHRoaXMgYXNcbiAgICAgICAgICAgICAgICAvLyBtYW55IHRpbWVzIGFzIHRoZXJlIGFyZSBidW5kbGVzIHVudGlsIHRoZSBtb2R1bGUgaXMgZm91bmQgb3JcbiAgICAgICAgICAgICAgICAvLyB3ZSBleGhhdXN0IHRoZSByZXF1aXJlIGNoYWluLlxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c1JlcXVpcmUpIHJldHVybiBwcmV2aW91c1JlcXVpcmUobmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgbW9kdWxlIFxcJycgKyBuYW1lICsgJ1xcJycpO1xuICAgICAgICAgICAgICAgIGVyci5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtID0gY2FjaGVbbmFtZV0gPSB7ZXhwb3J0czp7fX07XG4gICAgICAgICAgICBtb2R1bGVzW25hbWVdWzBdLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbih4KXtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBtb2R1bGVzW25hbWVdWzFdW3hdO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdSZXF1aXJlKGlkID8gaWQgOiB4KTtcbiAgICAgICAgICAgIH0sbSxtLmV4cG9ydHMsb3V0ZXIsbW9kdWxlcyxjYWNoZSxlbnRyeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlW25hbWVdLmV4cG9ydHM7XG4gICAgfVxuICAgIGZvcih2YXIgaT0wO2k8ZW50cnkubGVuZ3RoO2krKykgbmV3UmVxdWlyZShlbnRyeVtpXSk7XG5cbiAgICAvLyBPdmVycmlkZSB0aGUgY3VycmVudCByZXF1aXJlIHdpdGggdGhpcyBuZXcgb25lXG4gICAgcmV0dXJuIG5ld1JlcXVpcmU7XG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5cbmZ1bmN0aW9uIGZpbmREZWxlZ2F0ZVRhcmdldChldmVudCwgc2VsZWN0b3IpIHtcbiAgdmFyIGN1cnJlbnROb2RlID0gZXZlbnQudGFyZ2V0O1xuICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICBpZiAoY3VycmVudE5vZGUubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiBjdXJyZW50Tm9kZTtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudE5vZGUgPT0gZXZlbnQuY3VycmVudFRhcmdldCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucGFyZW50RWxlbWVudDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gZGVsZWdhdGUodGFibGUsICd0aCcsIGNsaWNrLCBoYW5kbGVyKVxuLy8gdGFibGVcbi8vICAgdGhlYWRcbi8vICAgICB0aCAgICAgICAgIF4qXG4vLyAgICAgICBjb2RlICA8LS1cbmZ1bmN0aW9uIGRlbGVnYXRlKHRvcEVsZW1lbnQsIHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQpIHtcbiAgLyoganNoaW50IC1XMDQwICovXG4gIHRvcEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGZvdW5kID0gZmluZERlbGVnYXRlVGFyZ2V0KGV2ZW50LCBzZWxlY3Rvcik7XG5cbiAgICAvLyAuY3VycmVudFRhcmdldCBpcyByZWFkIG9ubHksIEkgY2FuIG5vdCBvdmVyd3JpdGUgaXQgdG8gdGhlIFwiZm91bmRcIiBlbGVtZW50XG4gICAgLy8gT2JqZWN0LmNyZWF0ZSB3cmFwcGVyIHdvdWxkIGJyZWFrIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAvLyBzbywga2VlcCBpbiBtaW5kOlxuICAgIC8vIC0tPiBldmVudC5jdXJyZW50VGFyZ2V0IGlzIGFsd2F5cyB0aGUgdG9wLWxldmVsIChkZWxlZ2F0aW5nKSBlbGVtZW50IVxuICAgIC8vIHVzZSBcInRoaXNcIiB0byBnZXQgdGhlIGZvdW5kIHRhcmdldFxuXG4gICAgZXZlbnQuZGVsZWdhdGVUYXJnZXQgPSBmb3VuZDsgLy8gdXNlIGluc3RlYWQgb2YgXCJ0aGlzXCIgaW4gb2JqZWN0IG1ldGhvZHNcblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgLy8gaWYgaW4gY29udGV4dCBvZiBvYmplY3QsIHVzZSBvYmplY3QgYXMgdGhpcyxcbiAgICAgIGhhbmRsZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIGV2ZW50KTtcbiAgICB9XG4gIH0pO1xufVxuXG5kZWxlZ2F0ZS5kZWxlZ2F0ZU1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gIG9iai5kZWxlZ2F0ZSA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICBkZWxlZ2F0ZSh0aGlzLmVsZW0sIHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIsIHRoaXMpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWxlZ2F0ZTtcblxuIiwidmFyIHhociA9IHJlcXVpcmUoJ2NsaWVudC94aHInKTtcblxuZnVuY3Rpb24gSW1hZ2VVcGxvYWRlcihmaWxlKSB7XG4gIHRoaXMuZmlsZSA9IGZpbGU7XG59XG5cbkltYWdlVXBsb2FkZXIucHJvdG90eXBlLnVwbG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuLy8gIGltZ3VyIHNob3VsZCBjaGVjayB0aGlzLCBubz9cbi8vICBpZiAoIWZpbGUudHlwZS5tYXRjaCgvaW1hZ2UuKi8pKSB7XG4vLyAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBmaWxlIHR5cGU6IFwiICsgZmlsZS50eXBlKTtcbi8vICB9XG5cbiAgZm9ybURhdGEuYXBwZW5kKFwiaW1hZ2VcIiwgdGhpcy5maWxlKTtcblxuICB2YXIgcmVxdWVzdCA9IHhocih7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLmltZ3VyLmNvbS8zL2ltYWdlLmpzb25cIixcbiAgICBqc29uOiB0cnVlXG4gIH0pO1xuXG4gIC8vIDQwMCB3aGVuIGNvcnJ1cHQgb3IgaW52YWxpZCBmaWxlXG4gIHJlcXVlc3Quc3VjY2Vzc1N0YXR1c2VzID0gWzIwMCwgNDAwXTtcblxuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCAnQ2xpZW50LUlEIDY3NWMyZDliMjEzZTU2YicpO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgcmVxdWVzdC5zZW5kKGZvcm1EYXRhKTtcbiAgfSwgMCk7XG5cbiAgcmV0dXJuIHJlcXVlc3Q7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VVcGxvYWRlcjtcbiIsInZhciBodW1hbmUgPSByZXF1aXJlKCdodW1hbmUtanMnKTtcblxuZXhwb3J0cy5pbmZvID0gaHVtYW5lLnNwYXduKHsgYWRkbkNsczogJ2h1bWFuZS1saWJub3RpZnktaW5mbycsIHRpbWVvdXQ6IDEwMDAgfSk7XG5leHBvcnRzLmVycm9yID0gaHVtYW5lLnNwYXduKHsgYWRkbkNsczogJ2h1bWFuZS1saWJub3RpZnktZXJyb3InLCB0aW1lb3V0OiAzMDAwIH0pO1xuIiwiZnVuY3Rpb24gdGV4dE5vZGVJZlN0cmluZyhub2RlKSB7XG4gIHJldHVybiB0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKSA6IG5vZGU7XG59XG5cbmZ1bmN0aW9uIG11dGF0aW9uTWFjcm8obm9kZXMpIHtcbiAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiB0ZXh0Tm9kZUlmU3RyaW5nKG5vZGVzWzBdKTtcbiAgfVxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciBsaXN0ID0gW10uc2xpY2UuY2FsbChub2Rlcyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQodGV4dE5vZGVJZlN0cmluZyhsaXN0W2ldKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuXG52YXIgbWV0aG9kcyA9IHtcbiAgbWF0Y2hlczogRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvcixcbiAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgcmV0dXJuIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfVxuICB9XG59O1xuXG5mb3IgKHZhciBtZXRob2ROYW1lIGluIG1ldGhvZHMpIHtcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZVttZXRob2ROYW1lXSkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdID0gbWV0aG9kc1ttZXRob2ROYW1lXTtcbiAgfVxufVxuXG50cnkge1xuICBuZXcgQ3VzdG9tRXZlbnQoXCJJRSBoYXMgQ3VzdG9tRXZlbnQsIGJ1dCBkb2Vzbid0IHN1cHBvcnQgY29uc3RydWN0b3JcIik7XG59IGNhdGNoIChlKSB7XG5cbiAgd2luZG93LkN1c3RvbUV2ZW50ID0gZnVuY3Rpb24oZXZlbnQsIHBhcmFtcykge1xuICAgIHZhciBldnQ7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHtcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICBkZXRhaWw6IHVuZGVmaW5lZFxuICAgIH07XG4gICAgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICAgIHJldHVybiBldnQ7XG4gIH07XG5cbiAgQ3VzdG9tRXZlbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSh3aW5kb3cuRXZlbnQucHJvdG90eXBlKTtcbn1cblxuIiwicmVxdWlyZSgnLi9kb200Jyk7XG4iLCJ2YXIgbm90aWZ5ID0gcmVxdWlyZSgnLi9ub3RpZnknKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigneGhyZmFpbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIG5vdGlmeS5lcnJvcihldmVudC5yZWFzb24pO1xufSk7XG4iLCJyZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5yZXF1aXJlKCcuL3hoci1ub3RpZnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSB4aHI7XG5cbi8vIFdyYXBwZXIgYWJvdXQgWEhSXG4vLyAjIEdsb2JhbCBFdmVudHNcbi8vIHRyaWdnZXJzIGRvY3VtZW50LmxvYWRzdGFydC9sb2FkZW5kIG9uIGNvbW11bmljYXRpb24gc3RhcnQvZW5kXG4vLyAgICAtLT4gdW5sZXNzIG9wdGlvbnMubm9HbG9iYWxFdmVudHMgaXMgc2V0XG4vL1xuLy8gIyBFdmVudHNcbi8vIHRyaWdnZXJzIGZhaWwvc3VjY2VzcyBvbiBsb2FkIGVuZDpcbi8vICAgIC0tPiBieSBkZWZhdWx0IHN0YXR1cz0yMDAgaXMgb2ssIHRoZSBvdGhlcnMgYXJlIGZhaWx1cmVzXG4vLyAgICAtLT4gb3B0aW9ucy5zdWNjZXNzU3RhdHVzZXMgPSBbMjAxLDQwOV0gYWxsb3cgZ2l2ZW4gc3RhdHVzZXNcbi8vICAgIC0tPiBmYWlsIGV2ZW50IGhhcyAucmVhc29uIGZpZWxkXG4vLyAgICAtLT4gc3VjY2VzcyBldmVudCBoYXMgLnJlc3VsdCBmaWVsZFxuLy9cbi8vICMgSlNPTlxuLy8gICAgLS0+IHNlbmQob2JqZWN0KSBjYWxscyBKU09OLnN0cmluZ2lmeVxuLy8gICAgLS0+IG9wdGlvbnMuanNvbiBhZGRzIEFjY2VwdDoganNvbiAod2Ugd2FudCBqc29uKVxuLy8gaWYgb3B0aW9ucy5qc29uIG9yIHNlcnZlciByZXR1cm5lZCBqc29uIGNvbnRlbnQgdHlwZVxuLy8gICAgLS0+IGF1dG9wYXJzZSBqc29uXG4vLyAgICAtLT4gZmFpbCBpZiBlcnJvclxuLy9cbi8vICMgQ1NSRlxuLy8gICAgLS0+IEdFVC9PUFRJT05TL0hFQUQgcmVxdWVzdHMgZ2V0IF9jc3JmIGZpZWxkIGZyb20gd2luZG93LmNzcmZcblxuZnVuY3Rpb24geGhyKG9wdGlvbnMpIHtcblxuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHZhciBtZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCAnR0VUJztcbiAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgb3B0aW9ucy51cmwsIG9wdGlvbnMuc3luYyA/IGZhbHNlIDogdHJ1ZSk7XG5cbiAgcmVxdWVzdC5tZXRob2QgPSBtZXRob2Q7XG5cbiAgaWYgKCFvcHRpb25zLm5vR2xvYmFsRXZlbnRzKSB7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RhcnQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocnN0YXJ0JywgZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlbmQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocmVuZCcsIGV2ZW50KTtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlID0gd3JhcEV2ZW50KCd4aHJzdWNjZXNzJywgZXZlbnQpO1xuICAgICAgZS5yZXN1bHQgPSBldmVudC5yZXN1bHQ7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZmFpbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyZmFpbCcsIGV2ZW50KTtcbiAgICAgIGUucmVhc29uID0gZXZlbnQucmVhc29uO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmpzb24pIHsgLy8gbWVhbnMgd2Ugd2FudCBqc29uXG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgfVxuXG4gIHZhciBzdWNjZXNzU3RhdHVzZXMgPSBvcHRpb25zLnN1Y2Nlc3NTdGF0dXNlcyB8fCBbMjAwXTtcblxuICBmdW5jdGlvbiB3cmFwRXZlbnQobmFtZSwgZSkge1xuICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChuYW1lKTtcbiAgICBldmVudC5vcmlnaW5hbEV2ZW50ID0gZTtcbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBmYWlsKHJlYXNvbiwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gd3JhcEV2ZW50KFwiZmFpbFwiLCBvcmlnaW5hbEV2ZW50KTtcbiAgICBlLnJlYXNvbiA9IHJlYXNvbjtcbiAgICByZXF1ZXN0LmRpc3BhdGNoRXZlbnQoZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdWNjZXNzKHJlc3VsdCwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gd3JhcEV2ZW50KFwic3VjY2Vzc1wiLCBvcmlnaW5hbEV2ZW50KTtcbiAgICBlLnJlc3VsdCA9IHJlc3VsdDtcbiAgICByZXF1ZXN0LmRpc3BhdGNoRXZlbnQoZSk7XG4gIH1cblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihlKSB7XG4gICAgZmFpbChcItCe0YjQuNCx0LrQsCDRgdCy0Y/Qt9C4INGBINGB0LXRgNCy0LXRgNC+0LwuXCIsIGUpO1xuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0aW1lb3V0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBmYWlsKFwi0J/RgNC10LLRi9GI0LXQvdC+INC80LDQutGB0LjQvNCw0LvRjNC90L4g0LTQvtC/0YPRgdGC0LjQvNC+0LUg0LLRgNC10LzRjyDQvtC20LjQtNCw0L3QuNGPINC+0YLQstC10YLQsCDQvtGCINGB0LXRgNCy0LXRgNCwLlwiLCBlKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgZnVuY3Rpb24oZSkge1xuICAgIGZhaWwoXCLQl9Cw0L/RgNC+0YEg0LHRi9C7INC/0YDQtdGA0LLQsNC9LlwiLCBlKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCF0aGlzLnN0YXR1cykgeyAvLyBkb2VzIHRoYXQgZXZlciBoYXBwZW4/XG4gICAgICBmYWlsKFwi0J3QtSDQv9C+0LvRg9GH0LXQvSDQvtGC0LLQtdGCINC+0YIg0YHQtdGA0LLQtdGA0LAuXCIsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzdWNjZXNzU3RhdHVzZXMuaW5kZXhPZih0aGlzLnN0YXR1cykgPT0gLTEpIHtcbiAgICAgIGZhaWwoXCLQntGI0LjQsdC60LAg0L3QsCDRgdGC0L7RgNC+0L3QtSDRgdC10YDQstC10YDQsCAo0LrQvtC0IFwiICsgdGhpcy5zdGF0dXMgKyBcIiksINC/0L7Qv9GL0YLQsNC50YLQtdGB0Ywg0L/QvtC30LTQvdC10LVcIiwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucmVzcG9uc2VUZXh0O1xuICAgIHZhciBjb250ZW50VHlwZSA9IHRoaXMuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIik7XG4gICAgaWYgKGNvbnRlbnRUeXBlLm1hdGNoKC9eYXBwbGljYXRpb25cXC9qc29uLykgfHwgb3B0aW9ucy5qc29uKSB7IC8vIGF1dG9wYXJzZSBqc29uIGlmIFdBTlQgb3IgUkVDRUlWRUQganNvblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmYWlsKFwi0J3QtdC60L7RgNGA0LXQutGC0L3Ri9C5INGE0L7RgNC80LDRgiDQvtGC0LLQtdGC0LAg0L7RgiDRgdC10YDQstC10YDQsFwiLCBlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN1Y2Nlc3MocmVzdWx0LCBlKTtcbiAgfSk7XG5cbiAgd3JhcENzcmZTZW5kKHJlcXVlc3QpO1xuICByZXR1cm4gcmVxdWVzdDtcbn1cblxuLy8gQWxsIG5vbi1HRVQgcmVxdWVzdCBnZXQgX2NzcmYgZnJvbSB3aW5kb3cuY3NyZiBhdXRvbWF0aWNhbGx5XG5mdW5jdGlvbiB3cmFwQ3NyZlNlbmQocmVxdWVzdCkge1xuXG4gIHZhciBzZW5kID0gcmVxdWVzdC5zZW5kO1xuICByZXF1ZXN0LnNlbmQgPSBmdW5jdGlvbihib2R5KSB7XG5cbiAgICBpZiAoIX5bJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnXS5pbmRleE9mKHRoaXMubWV0aG9kKSkge1xuICAgICAgaWYgKGJvZHkgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuICAgICAgICBib2R5LmFwcGVuZChcIl9jc3JmXCIsIHdpbmRvdy5jc3JmKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoYm9keSkgPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgYm9keS5fY3NyZiA9IHdpbmRvdy5jc3JmO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IHtfY3NyZjogd2luZG93LmNzcmZ9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGJvZHkpID09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICB0aGlzLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLThcIik7XG4gICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgfVxuXG4gICAgc2VuZC5jYWxsKHRoaXMsIGJvZHkpO1xuXG4gIH07XG5cbn1cbiIsIi8qKlxuICogaHVtYW5lLmpzXG4gKiBIdW1hbml6ZWQgTWVzc2FnZXMgZm9yIE5vdGlmaWNhdGlvbnNcbiAqIEBhdXRob3IgTWFyYyBIYXJ0ZXIgKEB3YXZkZWQpXG4gKiBAZXhhbXBsZVxuICogICBodW1hbmUubG9nKCdoZWxsbyB3b3JsZCcpO1xuICogU2VlIG1vcmUgdXNhZ2UgZXhhbXBsZXMgYXQ6IGh0dHA6Ly93YXZkZWQuZ2l0aHViLmNvbS9odW1hbmUtanMvXG4gKi9cblxuOyFmdW5jdGlvbiAobmFtZSwgY29udGV4dCwgZGVmaW5pdGlvbikge1xuICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24obmFtZSwgY29udGV4dClcbiAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgID09PSAnb2JqZWN0JykgZGVmaW5lKGRlZmluaXRpb24pXG4gICBlbHNlIGNvbnRleHRbbmFtZV0gPSBkZWZpbml0aW9uKG5hbWUsIGNvbnRleHQpXG59KCdodW1hbmUnLCB0aGlzLCBmdW5jdGlvbiAobmFtZSwgY29udGV4dCkge1xuICAgdmFyIHdpbiA9IHdpbmRvd1xuICAgdmFyIGRvYyA9IGRvY3VtZW50XG5cbiAgIHZhciBFTlYgPSB7XG4gICAgICBvbjogZnVuY3Rpb24gKGVsLCB0eXBlLCBjYikge1xuICAgICAgICAgJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbiA/IGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSxjYixmYWxzZSkgOiBlbC5hdHRhY2hFdmVudCgnb24nK3R5cGUsY2IpXG4gICAgICB9LFxuICAgICAgb2ZmOiBmdW5jdGlvbiAoZWwsIHR5cGUsIGNiKSB7XG4gICAgICAgICAncmVtb3ZlRXZlbnRMaXN0ZW5lcicgaW4gd2luID8gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLGNiLGZhbHNlKSA6IGVsLmRldGFjaEV2ZW50KCdvbicrdHlwZSxjYilcbiAgICAgIH0sXG4gICAgICBiaW5kOiBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkoY3R4LGFyZ3VtZW50cykgfVxuICAgICAgfSxcbiAgICAgIGlzQXJyYXk6IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XScgfSxcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHByZWZlcnJlZCwgZmFsbGJhY2spIHtcbiAgICAgICAgIHJldHVybiBwcmVmZXJyZWQgIT0gbnVsbCA/IHByZWZlcnJlZCA6IGZhbGxiYWNrXG4gICAgICB9LFxuICAgICAgdHJhbnNTdXBwb3J0OiBmYWxzZSxcbiAgICAgIHVzZUZpbHRlcjogL21zaWUgWzY3OF0vaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLCAvLyBzbmlmZiwgc25pZmZcbiAgICAgIF9jaGVja1RyYW5zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgdmFyIHZlbmRvcnMgPSB7IHdlYmtpdDogJ3dlYmtpdCcsIE1vejogJycsIE86ICdvJywgbXM6ICdNUycgfVxuXG4gICAgICAgICBmb3IgKHZhciB2ZW5kb3IgaW4gdmVuZG9ycylcbiAgICAgICAgICAgIGlmICh2ZW5kb3IgKyAnVHJhbnNpdGlvbicgaW4gZWwuc3R5bGUpIHtcbiAgICAgICAgICAgICAgIHRoaXMudmVuZG9yUHJlZml4ID0gdmVuZG9yc1t2ZW5kb3JdXG4gICAgICAgICAgICAgICB0aGlzLnRyYW5zU3VwcG9ydCA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgIH1cbiAgIH1cbiAgIEVOVi5fY2hlY2tUcmFuc2l0aW9uKClcblxuICAgdmFyIEh1bWFuZSA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICBvIHx8IChvID0ge30pXG4gICAgICB0aGlzLnF1ZXVlID0gW11cbiAgICAgIHRoaXMuYmFzZUNscyA9IG8uYmFzZUNscyB8fCAnaHVtYW5lJ1xuICAgICAgdGhpcy5hZGRuQ2xzID0gby5hZGRuQ2xzIHx8ICcnXG4gICAgICB0aGlzLnRpbWVvdXQgPSAndGltZW91dCcgaW4gbyA/IG8udGltZW91dCA6IDI1MDBcbiAgICAgIHRoaXMud2FpdEZvck1vdmUgPSBvLndhaXRGb3JNb3ZlIHx8IGZhbHNlXG4gICAgICB0aGlzLmNsaWNrVG9DbG9zZSA9IG8uY2xpY2tUb0Nsb3NlIHx8IGZhbHNlXG4gICAgICB0aGlzLnRpbWVvdXRBZnRlck1vdmUgPSBvLnRpbWVvdXRBZnRlck1vdmUgfHwgZmFsc2UgXG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG8uY29udGFpbmVyXG5cbiAgICAgIHRyeSB7IHRoaXMuX3NldHVwRWwoKSB9IC8vIGF0dGVtcHQgdG8gc2V0dXAgZWxlbWVudHNcbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIEVOVi5vbih3aW4sJ2xvYWQnLEVOVi5iaW5kKHRoaXMuX3NldHVwRWwsIHRoaXMpKSAvLyBkb20gd2Fzbid0IHJlYWR5LCB3YWl0IHRpbGwgcmVhZHlcbiAgICAgIH1cbiAgIH1cblxuICAgSHVtYW5lLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBIdW1hbmUsXG4gICAgICBfc2V0dXBFbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICBpZiAoIXRoaXMuY29udGFpbmVyKXtcbiAgICAgICAgICAgaWYoZG9jLmJvZHkpIHRoaXMuY29udGFpbmVyID0gZG9jLmJvZHk7XG4gICAgICAgICAgIGVsc2UgdGhyb3cgJ2RvY3VtZW50LmJvZHkgaXMgbnVsbCdcbiAgICAgICAgIH1cbiAgICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKVxuICAgICAgICAgdGhpcy5lbCA9IGVsXG4gICAgICAgICB0aGlzLnJlbW92ZUV2ZW50ID0gRU5WLmJpbmQoZnVuY3Rpb24oKXsgaWYgKCF0aGlzLnRpbWVvdXRBZnRlck1vdmUpe3RoaXMucmVtb3ZlKCl9IGVsc2Uge3NldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5yZW1vdmUsdGhpcyksdGhpcy50aW1lb3V0KTt9fSx0aGlzKVxuICAgICAgICAgdGhpcy50cmFuc0V2ZW50ID0gRU5WLmJpbmQodGhpcy5fYWZ0ZXJBbmltYXRpb24sdGhpcylcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICB9LFxuICAgICAgX2FmdGVyVGltZW91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgaWYgKCFFTlYuY29uZmlnKHRoaXMuY3VycmVudE1zZy53YWl0Rm9yTW92ZSx0aGlzLndhaXRGb3JNb3ZlKSkgdGhpcy5yZW1vdmUoKVxuXG4gICAgICAgICBlbHNlIGlmICghdGhpcy5yZW1vdmVFdmVudHNTZXQpIHtcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwnbW91c2Vtb3ZlJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwna2V5cHJlc3MnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICBFTlYub24oZG9jLmJvZHksJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50c1NldCA9IHRydWVcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfcnVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAodGhpcy5fYW5pbWF0aW5nIHx8ICF0aGlzLnF1ZXVlLmxlbmd0aCB8fCAhdGhpcy5lbCkgcmV0dXJuXG5cbiAgICAgICAgIHRoaXMuX2FuaW1hdGluZyA9IHRydWVcbiAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY3VycmVudFRpbWVyKVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZXIgPSBudWxsXG4gICAgICAgICB9XG5cbiAgICAgICAgIHZhciBtc2cgPSB0aGlzLnF1ZXVlLnNoaWZ0KClcbiAgICAgICAgIHZhciBjbGlja1RvQ2xvc2UgPSBFTlYuY29uZmlnKG1zZy5jbGlja1RvQ2xvc2UsdGhpcy5jbGlja1RvQ2xvc2UpXG5cbiAgICAgICAgIGlmIChjbGlja1RvQ2xvc2UpIHtcbiAgICAgICAgICAgIEVOVi5vbih0aGlzLmVsLCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbih0aGlzLmVsLCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgfVxuXG4gICAgICAgICB2YXIgdGltZW91dCA9IEVOVi5jb25maWcobXNnLnRpbWVvdXQsdGhpcy50aW1lb3V0KVxuXG4gICAgICAgICBpZiAodGltZW91dCA+IDApXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lciA9IHNldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5fYWZ0ZXJUaW1lb3V0LHRoaXMpLCB0aW1lb3V0KVxuXG4gICAgICAgICBpZiAoRU5WLmlzQXJyYXkobXNnLmh0bWwpKSBtc2cuaHRtbCA9ICc8dWw+PGxpPicrbXNnLmh0bWwuam9pbignPGxpPicpKyc8L3VsPidcblxuICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSBtc2cuaHRtbFxuICAgICAgICAgdGhpcy5jdXJyZW50TXNnID0gbXNnXG4gICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNsc1xuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICAgICAgICAgIHNldFRpbWVvdXQoRU5WLmJpbmQodGhpcy5fc2hvd01zZyx0aGlzKSw1MClcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TXNnKClcbiAgICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIF9zZXRPcGFjaXR5OiBmdW5jdGlvbiAob3BhY2l0eSkge1xuICAgICAgICAgaWYgKEVOVi51c2VGaWx0ZXIpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgdGhpcy5lbC5maWx0ZXJzLml0ZW0oJ0RYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkFscGhhJykuT3BhY2l0eSA9IG9wYWNpdHkqMTAwXG4gICAgICAgICAgICB9IGNhdGNoKGVycil7fVxuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUub3BhY2l0eSA9IFN0cmluZyhvcGFjaXR5KVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9zaG93TXNnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgYWRkbkNscyA9IEVOVi5jb25maWcodGhpcy5jdXJyZW50TXNnLmFkZG5DbHMsdGhpcy5hZGRuQ2xzKVxuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzKycgJyt0aGlzLmJhc2VDbHMrJy1hbmltYXRlJ1xuICAgICAgICAgfVxuICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3BhY2l0eSA9IDBcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzKycgJyt0aGlzLmJhc2VDbHMrJy1qcy1hbmltYXRlJ1xuICAgICAgICAgICAgdGhpcy5fc2V0T3BhY2l0eSgwKSAvLyByZXNldCB2YWx1ZSBzbyBob3ZlciBzdGF0ZXMgd29ya1xuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICBpZiAob3BhY2l0eSA8IDEpIHtcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gMC4xXG4gICAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSA+IDEpIG9wYWNpdHkgPSAxXG4gICAgICAgICAgICAgICAgICBzZWxmLl9zZXRPcGFjaXR5KG9wYWNpdHkpXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNlIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgICAgICB9LCAzMClcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfaGlkZU1zZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGFkZG5DbHMgPSBFTlYuY29uZmlnKHRoaXMuY3VycmVudE1zZy5hZGRuQ2xzLHRoaXMuYWRkbkNscylcbiAgICAgICAgIGlmIChFTlYudHJhbnNTdXBwb3J0KSB7XG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNscysnICcrYWRkbkNsc1xuICAgICAgICAgICAgRU5WLm9uKHRoaXMuZWwsRU5WLnZlbmRvclByZWZpeCA/IEVOVi52ZW5kb3JQcmVmaXgrJ1RyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnLHRoaXMudHJhbnNFdmVudClcbiAgICAgICAgIH1cbiAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAxXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICBpZihvcGFjaXR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgb3BhY2l0eSAtPSAwLjFcbiAgICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5IDwgMCkgb3BhY2l0eSA9IDBcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3NldE9wYWNpdHkob3BhY2l0eSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZWwuY2xhc3NOYW1lID0gc2VsZi5iYXNlQ2xzKycgJythZGRuQ2xzXG4gICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKVxuICAgICAgICAgICAgICAgICAgc2VsZi5fYWZ0ZXJBbmltYXRpb24oKVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzApXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX2FmdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkgRU5WLm9mZih0aGlzLmVsLEVOVi52ZW5kb3JQcmVmaXggPyBFTlYudmVuZG9yUHJlZml4KydUcmFuc2l0aW9uRW5kJyA6ICd0cmFuc2l0aW9uZW5kJyx0aGlzLnRyYW5zRXZlbnQpXG5cbiAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRNc2cuY2IpIHRoaXMuY3VycmVudE1zZy5jYigpXG4gICAgICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICAgICAgdGhpcy5fYW5pbWF0aW5nID0gZmFsc2VcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICB9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgdmFyIGNiID0gdHlwZW9mIGUgPT0gJ2Z1bmN0aW9uJyA/IGUgOiBudWxsXG5cbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ21vdXNlbW92ZScsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwna2V5cHJlc3MnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKGRvYy5ib2R5LCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZih0aGlzLmVsLCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYodGhpcy5lbCwndG91Y2hzdGFydCcsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRzU2V0ID0gZmFsc2VcblxuICAgICAgICAgaWYgKGNiICYmIHRoaXMuY3VycmVudE1zZykgdGhpcy5jdXJyZW50TXNnLmNiID0gY2JcbiAgICAgICAgIGlmICh0aGlzLl9hbmltYXRpbmcpIHRoaXMuX2hpZGVNc2coKVxuICAgICAgICAgZWxzZSBpZiAoY2IpIGNiKClcbiAgICAgIH0sXG4gICAgICBsb2c6IGZ1bmN0aW9uIChodG1sLCBvLCBjYiwgZGVmYXVsdHMpIHtcbiAgICAgICAgIHZhciBtc2cgPSB7fVxuICAgICAgICAgaWYgKGRlZmF1bHRzKVxuICAgICAgICAgICBmb3IgKHZhciBvcHQgaW4gZGVmYXVsdHMpXG4gICAgICAgICAgICAgICBtc2dbb3B0XSA9IGRlZmF1bHRzW29wdF1cblxuICAgICAgICAgaWYgKHR5cGVvZiBvID09ICdmdW5jdGlvbicpIGNiID0gb1xuICAgICAgICAgZWxzZSBpZiAobylcbiAgICAgICAgICAgIGZvciAodmFyIG9wdCBpbiBvKSBtc2dbb3B0XSA9IG9bb3B0XVxuXG4gICAgICAgICBtc2cuaHRtbCA9IGh0bWxcbiAgICAgICAgIGlmIChjYikgbXNnLmNiID0gY2JcbiAgICAgICAgIHRoaXMucXVldWUucHVzaChtc2cpXG4gICAgICAgICB0aGlzLl9ydW4oKVxuICAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIH0sXG4gICAgICBzcGF3bjogZnVuY3Rpb24gKGRlZmF1bHRzKSB7XG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoaHRtbCwgbywgY2IpIHtcbiAgICAgICAgICAgIHNlbGYubG9nLmNhbGwoc2VsZixodG1sLG8sY2IsZGVmYXVsdHMpXG4gICAgICAgICAgICByZXR1cm4gc2VsZlxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG5ldyBIdW1hbmUobykgfVxuICAgfVxuICAgcmV0dXJuIG5ldyBIdW1hbmUoKVxufSlcbiIsInZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2NsaWVudC9kZWxlZ2F0ZScpO1xudmFyIG5vdGlmeSA9IHJlcXVpcmUoJ2NsaWVudC9ub3RpZnknKTtcbnZhciB4aHIgPSByZXF1aXJlKCdjbGllbnQveGhyJyk7XG5cbmZ1bmN0aW9uIEF1dGhQcm92aWRlcnNNYW5hZ2VyKCkge1xuICB0aGlzLmVsZW0gPSBkb2N1bWVudC5ib2R5O1xuXG4gIHRoaXMuZGVsZWdhdGUoJ1tkYXRhLWFjdGlvbj1cInByb3ZpZGVyLWFkZFwiXScsICdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmFkZFByb3ZpZGVyKGV2ZW50LmRlbGVnYXRlVGFyZ2V0LmRhdGFzZXQucHJvdmlkZXIpO1xuICB9KTtcblxuICB0aGlzLmRlbGVnYXRlKCdbZGF0YS1hY3Rpb249XCJwcm92aWRlci1yZW1vdmVcIl0nLCAnY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5yZW1vdmVQcm92aWRlcihldmVudC5kZWxlZ2F0ZVRhcmdldC5kYXRhc2V0LnByb3ZpZGVyKTtcbiAgfSk7XG5cbn1cblxuXG5BdXRoUHJvdmlkZXJzTWFuYWdlci5wcm90b3R5cGUuYWRkUHJvdmlkZXIgPSBmdW5jdGlvbihwcm92aWRlck5hbWUpIHtcbiAgdGhpcy5vcGVuQXV0aFBvcHVwKCcvYXV0aC9jb25uZWN0LycgKyBwcm92aWRlck5hbWUpO1xufTtcblxuQXV0aFByb3ZpZGVyc01hbmFnZXIucHJvdG90eXBlLnJlbW92ZVByb3ZpZGVyID0gZnVuY3Rpb24ocHJvdmlkZXJOYW1lKSB7XG4gIHZhciByZXF1ZXN0ID0geGhyKHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6ICcvYXV0aC9kaXNjb25uZWN0LycgKyBwcm92aWRlck5hbWVcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICB9KTtcblxuICByZXF1ZXN0LnNlbmQoKTtcblxufTtcblxuXG5cbkF1dGhQcm92aWRlcnNNYW5hZ2VyLnByb3RvdHlwZS5vcGVuQXV0aFBvcHVwID0gZnVuY3Rpb24odXJsKSB7XG4gIGlmICh0aGlzLmF1dGhQb3B1cCAmJiAhdGhpcy5hdXRoUG9wdXAuY2xvc2VkKSB7XG4gICAgdGhpcy5hdXRoUG9wdXAuY2xvc2UoKTsgLy8gY2xvc2Ugb2xkIHBvcHVwIGlmIGFueVxuICB9XG4gIHZhciB3aWR0aCA9IDgwMCwgaGVpZ2h0ID0gNjAwO1xuICB2YXIgdG9wID0gKHdpbmRvdy5vdXRlckhlaWdodCAtIGhlaWdodCkgLyAyO1xuICB2YXIgbGVmdCA9ICh3aW5kb3cub3V0ZXJXaWR0aCAtIHdpZHRoKSAvIDI7XG5cbiAgd2luZG93LmF1dGhQcm92aWRlcnNNYW5hZ2VyID0gdGhpcztcbiAgdGhpcy5hdXRoUG9wdXAgPSB3aW5kb3cub3Blbih1cmwsICdhdXRoUHJvdmlkZXJzTWFuYWdlcicsICd3aWR0aD0nICsgd2lkdGggKyAnLGhlaWdodD0nICsgaGVpZ2h0ICsgJyxzY3JvbGxiYXJzPTAsdG9wPScgKyB0b3AgKyAnLGxlZnQ9JyArIGxlZnQpO1xufTtcblxuLypcbiDQstGB0LUg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDQsNCy0YLQvtGA0LjQt9Cw0YbQuNC4ICjQstC60LvRjtGH0LDRjyBGYWNlYm9vayDQuNC3IHBvcHVwLdCwINC4INC70L7QutCw0LvRjNC90YvQuSlcbiDQsiDQuNGC0L7Qs9C1INGC0YDQuNCz0LPQtdGA0Y/RgiDQvtC00LjQvSDQuNC3INGN0YLQuNGFINC60LDQu9C70LHRjdC60L7QslxuICovXG5BdXRoUHJvdmlkZXJzTWFuYWdlci5wcm90b3R5cGUub25BdXRoU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG59O1xuXG5BdXRoUHJvdmlkZXJzTWFuYWdlci5wcm90b3R5cGUub25BdXRoRmFpbHVyZSA9IGZ1bmN0aW9uKGVycm9yTWVzc2FnZSkge1xuICBub3RpZnkuZXJyb3IoZXJyb3JNZXNzYWdlIHx8IFwi0J7RgtC60LDQtyDQsiDQsNCy0YLQvtGA0LjQt9Cw0YbQuNC4XCIsICdlcnJvcicpO1xufTtcblxuXG5kZWxlZ2F0ZS5kZWxlZ2F0ZU1peGluKEF1dGhQcm92aWRlcnNNYW5hZ2VyLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aFByb3ZpZGVyc01hbmFnZXI7XG4iLCJ2YXIgZGVsZWdhdGUgPSByZXF1aXJlKCdjbGllbnQvZGVsZWdhdGUnKTtcbnZhciB4aHIgPSByZXF1aXJlKCdjbGllbnQveGhyJyk7XG52YXIgSW1hZ2VVcGxvYWRlciA9IHJlcXVpcmUoJ2NsaWVudC9pbWFnZVVwbG9hZGVyJyk7XG52YXIgbm90aWZ5ID0gcmVxdWlyZSgnY2xpZW50L25vdGlmeScpO1xuXG5mdW5jdGlvbiBQaG90b0NoYW5nZXIoKSB7XG4gIHRoaXMuZWxlbSA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwicGhvdG8tY2hhbmdlXCJdJyk7XG5cbiAgdGhpcy5pbWcgPSB0aGlzLmVsZW07XG4gIHRoaXMuZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmNoYW5nZVBob3RvKCk7XG4gIH0uYmluZCh0aGlzKSk7XG59XG5cblBob3RvQ2hhbmdlci5wcm90b3R5cGUuY2hhbmdlUGhvdG8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZpbGVJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIGZpbGVJbnB1dC50eXBlID0gJ2ZpbGUnO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgZmlsZUlucHV0Lm9uY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgc2VsZi51cGxvYWQodGhpcy5maWxlc1swXSk7XG4gIH07XG4gIGZpbGVJbnB1dC5jbGljaygpO1xufTtcblxuUGhvdG9DaGFuZ2VyLnByb3RvdHlwZS51cGRhdGVVc2VyUGhvdG8gPSBmdW5jdGlvbihsaW5rKSB7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciByZXF1ZXN0ID0geGhyKHtcbiAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgdXJsOiAnL3VzZXJzL21lJ1xuICB9KTtcblxuICByZXF1ZXN0LnNlbmQoe3Bob3RvOiBsaW5rfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzZWxmLmltZy5zcmMgPSBldmVudC5yZXN1bHQucGhvdG8ucmVwbGFjZSgvKFxcLlxcdyspJC8sIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID4gMSA/ICdtJDEnIDogJ3QkMScpO1xuICB9KTtcblxufTtcblxuXG5QaG90b0NoYW5nZXIucHJvdG90eXBlLnVwbG9hZCA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgdmFyIHJlcXVlc3QgPSBuZXcgSW1hZ2VVcGxvYWRlcihmaWxlKS51cGxvYWQoKTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gNDAwKSB7XG4gICAgICBub3RpZnkuZXJyb3IoXCLQndC10LLQtdGA0L3Ri9C5INGC0LjQvyDRhNCw0LnQu9CwINC40LvQuCDQuNC30L7QsdGA0LDQttC10L3QuNC1INC/0L7QstGA0LXQttC00LXQvdC+LlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZS5yZXN1bHQuZGF0YS53aWR0aCA8IDE2MCB8fCBlLnJlc3VsdC5kYXRhLmhlaWdodCA8IDE2MCkge1xuICAgICAgbm90aWZ5LmVycm9yKFwi0JzQuNC90LjQvNCw0LvRjNC90L7QtSDRgNCw0LfRgNC10YjQtdC90LjQtSAxNjB4MTYwLCDQu9GD0YfRiNC1IDMyMHB4LlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLnVwZGF0ZVVzZXJQaG90byhlLnJlc3VsdC5kYXRhLmxpbmspO1xuICB9KTtcblxufTtcblxuZGVsZWdhdGUuZGVsZWdhdGVNaXhpbihQaG90b0NoYW5nZXIucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaG90b0NoYW5nZXI7XG4iLCJcblxudmFyIEF1dGhQcm92aWRlcnNNYW5hZ2VyID0gcmVxdWlyZSgnLi9hdXRoUHJvdmlkZXJzTWFuYWdlcicpO1xudmFyIFBob3RvQ2hhbmdlciA9IHJlcXVpcmUoJy4vcGhvdG9DaGFuZ2VyJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBuZXcgQXV0aFByb3ZpZGVyc01hbmFnZXIoKTtcbiAgbmV3IFBob3RvQ2hhbmdlcigpO1xufTtcbiJdfQ==
