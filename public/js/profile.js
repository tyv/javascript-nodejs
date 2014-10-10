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
({"/js/javascript-nodejs/node_modules/client/delegate.js":[function(require,module,exports){
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


},{"./polyfill":"/js/javascript-nodejs/node_modules/client/polyfill/index.js"}],"/js/javascript-nodejs/node_modules/client/imageUploader.js":[function(require,module,exports){
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

},{"client/xhr":"/js/javascript-nodejs/node_modules/client/xhr.js"}],"/js/javascript-nodejs/node_modules/client/notify.js":[function(require,module,exports){
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

},{"./dom4":"/js/javascript-nodejs/node_modules/client/polyfill/dom4.js"}],"/js/javascript-nodejs/node_modules/client/xhr-notify.js":[function(require,module,exports){
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

},{}],"/js/javascript-nodejs/node_modules/profile/client/authProvidersManager.js":[function(require,module,exports){
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

},{"client/delegate":"/js/javascript-nodejs/node_modules/client/delegate.js","client/notify":"/js/javascript-nodejs/node_modules/client/notify.js","client/xhr":"/js/javascript-nodejs/node_modules/client/xhr.js"}],"/js/javascript-nodejs/node_modules/profile/client/photoChanger.js":[function(require,module,exports){
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

},{"client/delegate":"/js/javascript-nodejs/node_modules/client/delegate.js","client/imageUploader":"/js/javascript-nodejs/node_modules/client/imageUploader.js","client/notify":"/js/javascript-nodejs/node_modules/client/notify.js","client/xhr":"/js/javascript-nodejs/node_modules/client/xhr.js"}],"profile/client":[function(require,module,exports){


var AuthProvidersManager = require('./authProvidersManager');
var PhotoChanger = require('./photoChanger');

exports.init = function() {
  new AuthProvidersManager();
  new PhotoChanger();
};

},{"./authProvidersManager":"/js/javascript-nodejs/node_modules/profile/client/authProvidersManager.js","./photoChanger":"/js/javascript-nodejs/node_modules/profile/client/photoChanger.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9qcy9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2RlbGVnYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9pbWFnZVVwbG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9ub3RpZnkuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L3BvbHlmaWxsL2RvbTQuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L3BvbHlmaWxsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC94aHItbm90aWZ5LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC94aHIuanMiLCJub2RlX21vZHVsZXMvaHVtYW5lLWpzL2h1bWFuZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9maWxlL2NsaWVudC9hdXRoUHJvdmlkZXJzTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9wcm9maWxlL2NsaWVudC9waG90b0NoYW5nZXIuanMiLCJub2RlX21vZHVsZXMvcHJvZmlsZS9jbGllbnQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gbW9kdWxlcyBhcmUgZGVmaW5lZCBhcyBhbiBhcnJheVxuLy8gWyBtb2R1bGUgZnVuY3Rpb24sIG1hcCBvZiByZXF1aXJldWlyZXMgXVxuLy9cbi8vIG1hcCBvZiByZXF1aXJldWlyZXMgaXMgc2hvcnQgcmVxdWlyZSBuYW1lIC0+IG51bWVyaWMgcmVxdWlyZVxuLy9cbi8vIGFueXRoaW5nIGRlZmluZWQgaW4gYSBwcmV2aW91cyBidW5kbGUgaXMgYWNjZXNzZWQgdmlhIHRoZVxuLy8gb3JpZyBtZXRob2Qgd2hpY2ggaXMgdGhlIHJlcXVpcmV1aXJlIGZvciBwcmV2aW91cyBidW5kbGVzXG5cbihmdW5jdGlvbiBvdXRlciAobW9kdWxlcywgY2FjaGUsIGVudHJ5KSB7XG4gICAgLy8gU2F2ZSB0aGUgcmVxdWlyZSBmcm9tIHByZXZpb3VzIGJ1bmRsZSB0byB0aGlzIGNsb3N1cmUgaWYgYW55XG4gICAgdmFyIHByZXZpb3VzUmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuXG4gICAgZnVuY3Rpb24gbmV3UmVxdWlyZShuYW1lLCBqdW1wZWQpe1xuICAgICAgICBpZighY2FjaGVbbmFtZV0pIHtcbiAgICAgICAgICAgIGlmKCFtb2R1bGVzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgY2Fubm90IGZpbmQgdGhlIHRoZSBtb2R1bGUgd2l0aGluIG91ciBpbnRlcm5hbCBtYXAgb3JcbiAgICAgICAgICAgICAgICAvLyBjYWNoZSBqdW1wIHRvIHRoZSBjdXJyZW50IGdsb2JhbCByZXF1aXJlIGllLiB0aGUgbGFzdCBidW5kbGVcbiAgICAgICAgICAgICAgICAvLyB0aGF0IHdhcyBhZGRlZCB0byB0aGUgcGFnZS5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFJlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcbiAgICAgICAgICAgICAgICBpZiAoIWp1bXBlZCAmJiBjdXJyZW50UmVxdWlyZSkgcmV0dXJuIGN1cnJlbnRSZXF1aXJlKG5hbWUsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIGJ1bmRsZXMgb24gdGhpcyBwYWdlIHRoZSByZXF1aXJlIGZyb20gdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMgb25lIGlzIHNhdmVkIHRvICdwcmV2aW91c1JlcXVpcmUnLiBSZXBlYXQgdGhpcyBhc1xuICAgICAgICAgICAgICAgIC8vIG1hbnkgdGltZXMgYXMgdGhlcmUgYXJlIGJ1bmRsZXMgdW50aWwgdGhlIG1vZHVsZSBpcyBmb3VuZCBvclxuICAgICAgICAgICAgICAgIC8vIHdlIGV4aGF1c3QgdGhlIHJlcXVpcmUgY2hhaW4uXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzUmVxdWlyZSkgcmV0dXJuIHByZXZpb3VzUmVxdWlyZShuYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdDYW5ub3QgZmluZCBtb2R1bGUgXFwnJyArIG5hbWUgKyAnXFwnJyk7XG4gICAgICAgICAgICAgICAgZXJyLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG0gPSBjYWNoZVtuYW1lXSA9IHtleHBvcnRzOnt9fTtcbiAgICAgICAgICAgIG1vZHVsZXNbbmFtZV1bMF0uY2FsbChtLmV4cG9ydHMsIGZ1bmN0aW9uKHgpe1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IG1vZHVsZXNbbmFtZV1bMV1beF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld1JlcXVpcmUoaWQgPyBpZCA6IHgpO1xuICAgICAgICAgICAgfSxtLG0uZXhwb3J0cyxvdXRlcixtb2R1bGVzLGNhY2hlLGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICB9XG4gICAgZm9yKHZhciBpPTA7aTxlbnRyeS5sZW5ndGg7aSsrKSBuZXdSZXF1aXJlKGVudHJ5W2ldKTtcblxuICAgIC8vIE92ZXJyaWRlIHRoZSBjdXJyZW50IHJlcXVpcmUgd2l0aCB0aGlzIG5ldyBvbmVcbiAgICByZXR1cm4gbmV3UmVxdWlyZTtcbn0pXG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vcG9seWZpbGwnKTtcblxuZnVuY3Rpb24gZmluZERlbGVnYXRlVGFyZ2V0KGV2ZW50LCBzZWxlY3Rvcikge1xuICB2YXIgY3VycmVudE5vZGUgPSBldmVudC50YXJnZXQ7XG4gIHdoaWxlIChjdXJyZW50Tm9kZSkge1xuICAgIGlmIChjdXJyZW50Tm9kZS5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnROb2RlO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Tm9kZSA9PSBldmVudC5jdXJyZW50VGFyZ2V0KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnRFbGVtZW50O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBkZWxlZ2F0ZSh0YWJsZSwgJ3RoJywgY2xpY2ssIGhhbmRsZXIpXG4vLyB0YWJsZVxuLy8gICB0aGVhZFxuLy8gICAgIHRoICAgICAgICAgXipcbi8vICAgICAgIGNvZGUgIDwtLVxuZnVuY3Rpb24gZGVsZWdhdGUodG9wRWxlbWVudCwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCkge1xuICAvKiBqc2hpbnQgLVcwNDAgKi9cbiAgdG9wRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZm91bmQgPSBmaW5kRGVsZWdhdGVUYXJnZXQoZXZlbnQsIHNlbGVjdG9yKTtcblxuICAgIC8vIC5jdXJyZW50VGFyZ2V0IGlzIHJlYWQgb25seSwgSSBjYW4gbm90IG92ZXJ3cml0ZSBpdCB0byB0aGUgXCJmb3VuZFwiIGVsZW1lbnRcbiAgICAvLyBPYmplY3QuY3JlYXRlIHdyYXBwZXIgd291bGQgYnJlYWsgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIC8vIHNvLCBrZWVwIGluIG1pbmQ6XG4gICAgLy8gLS0+IGV2ZW50LmN1cnJlbnRUYXJnZXQgaXMgYWx3YXlzIHRoZSB0b3AtbGV2ZWwgKGRlbGVnYXRpbmcpIGVsZW1lbnQhXG4gICAgLy8gdXNlIFwidGhpc1wiIHRvIGdldCB0aGUgZm91bmQgdGFyZ2V0XG5cbiAgICBldmVudC5kZWxlZ2F0ZVRhcmdldCA9IGZvdW5kOyAvLyB1c2UgaW5zdGVhZCBvZiBcInRoaXNcIiBpbiBvYmplY3QgbWV0aG9kc1xuXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICAvLyBpZiBpbiBjb250ZXh0IG9mIG9iamVjdCwgdXNlIG9iamVjdCBhcyB0aGlzLFxuICAgICAgaGFuZGxlci5jYWxsKGNvbnRleHQgfHwgdGhpcywgZXZlbnQpO1xuICAgIH1cbiAgfSk7XG59XG5cbmRlbGVnYXRlLmRlbGVnYXRlTWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgb2JqLmRlbGVnYXRlID0gZnVuY3Rpb24oc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIGRlbGVnYXRlKHRoaXMuZWxlbSwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgdGhpcyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlO1xuXG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnY2xpZW50L3hocicpO1xuXG5mdW5jdGlvbiBJbWFnZVVwbG9hZGVyKGZpbGUpIHtcbiAgdGhpcy5maWxlID0gZmlsZTtcbn1cblxuSW1hZ2VVcGxvYWRlci5wcm90b3R5cGUudXBsb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4vLyAgaW1ndXIgc2hvdWxkIGNoZWNrIHRoaXMsIG5vP1xuLy8gIGlmICghZmlsZS50eXBlLm1hdGNoKC9pbWFnZS4qLykpIHtcbi8vICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIGZpbGUgdHlwZTogXCIgKyBmaWxlLnR5cGUpO1xuLy8gIH1cblxuICBmb3JtRGF0YS5hcHBlbmQoXCJpbWFnZVwiLCB0aGlzLmZpbGUpO1xuXG4gIHZhciByZXF1ZXN0ID0geGhyKHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IFwiaHR0cHM6Ly9hcGkuaW1ndXIuY29tLzMvaW1hZ2UuanNvblwiLFxuICAgIGpzb246IHRydWVcbiAgfSk7XG5cbiAgLy8gNDAwIHdoZW4gY29ycnVwdCBvciBpbnZhbGlkIGZpbGVcbiAgcmVxdWVzdC5zdWNjZXNzU3RhdHVzZXMgPSBbMjAwLCA0MDBdO1xuXG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsICdDbGllbnQtSUQgNjc1YzJkOWIyMTNlNTZiJyk7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICByZXF1ZXN0LnNlbmQoZm9ybURhdGEpO1xuICB9LCAwKTtcblxuICByZXR1cm4gcmVxdWVzdDtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZVVwbG9hZGVyO1xuIiwidmFyIGh1bWFuZSA9IHJlcXVpcmUoJ2h1bWFuZS1qcycpO1xuXG5leHBvcnRzLmluZm8gPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWxpYm5vdGlmeS1pbmZvJywgdGltZW91dDogMTAwMCB9KTtcbmV4cG9ydHMuZXJyb3IgPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWxpYm5vdGlmeS1lcnJvcicsIHRpbWVvdXQ6IDMwMDAgfSk7XG4iLCJmdW5jdGlvbiB0ZXh0Tm9kZUlmU3RyaW5nKG5vZGUpIHtcbiAgcmV0dXJuIHR5cGVvZiBub2RlID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpIDogbm9kZTtcbn1cblxuZnVuY3Rpb24gbXV0YXRpb25NYWNybyhub2Rlcykge1xuICBpZiAobm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHRleHROb2RlSWZTdHJpbmcobm9kZXNbMF0pO1xuICB9XG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIGxpc3QgPSBbXS5zbGljZS5jYWxsKG5vZGVzKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0ZXh0Tm9kZUlmU3RyaW5nKGxpc3RbaV0pKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbnZhciBtZXRob2RzID0ge1xuICBtYXRjaGVzOiBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yLFxuICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnROb2RlID0gdGhpcy5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm4gcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gIH1cbn07XG5cbmZvciAodmFyIG1ldGhvZE5hbWUgaW4gbWV0aG9kcykge1xuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBtZXRob2RzW21ldGhvZE5hbWVdO1xuICB9XG59XG5cbnRyeSB7XG4gIG5ldyBDdXN0b21FdmVudChcIklFIGhhcyBDdXN0b21FdmVudCwgYnV0IGRvZXNuJ3Qgc3VwcG9ydCBjb25zdHJ1Y3RvclwiKTtcbn0gY2F0Y2ggKGUpIHtcblxuICB3aW5kb3cuQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbihldmVudCwgcGFyYW1zKSB7XG4gICAgdmFyIGV2dDtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgcmV0dXJuIGV2dDtcbiAgfTtcblxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHdpbmRvdy5FdmVudC5wcm90b3R5cGUpO1xufVxuXG4iLCJyZXF1aXJlKCcuL2RvbTQnKTtcbiIsInZhciBub3RpZnkgPSByZXF1aXJlKCcuL25vdGlmeScpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd4aHJmYWlsJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgbm90aWZ5LmVycm9yKGV2ZW50LnJlYXNvbik7XG59KTtcbiIsInJlcXVpcmUoJy4vcG9seWZpbGwnKTtcbnJlcXVpcmUoJy4veGhyLW5vdGlmeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHhocjtcblxuLy8gV3JhcHBlciBhYm91dCBYSFJcbi8vICMgR2xvYmFsIEV2ZW50c1xuLy8gdHJpZ2dlcnMgZG9jdW1lbnQubG9hZHN0YXJ0L2xvYWRlbmQgb24gY29tbXVuaWNhdGlvbiBzdGFydC9lbmRcbi8vICAgIC0tPiB1bmxlc3Mgb3B0aW9ucy5ub0dsb2JhbEV2ZW50cyBpcyBzZXRcbi8vXG4vLyAjIEV2ZW50c1xuLy8gdHJpZ2dlcnMgZmFpbC9zdWNjZXNzIG9uIGxvYWQgZW5kOlxuLy8gICAgLS0+IGJ5IGRlZmF1bHQgc3RhdHVzPTIwMCBpcyBvaywgdGhlIG90aGVycyBhcmUgZmFpbHVyZXNcbi8vICAgIC0tPiBvcHRpb25zLnN1Y2Nlc3NTdGF0dXNlcyA9IFsyMDEsNDA5XSBhbGxvdyBnaXZlbiBzdGF0dXNlc1xuLy8gICAgLS0+IGZhaWwgZXZlbnQgaGFzIC5yZWFzb24gZmllbGRcbi8vICAgIC0tPiBzdWNjZXNzIGV2ZW50IGhhcyAucmVzdWx0IGZpZWxkXG4vL1xuLy8gIyBKU09OXG4vLyAgICAtLT4gc2VuZChvYmplY3QpIGNhbGxzIEpTT04uc3RyaW5naWZ5XG4vLyAgICAtLT4gb3B0aW9ucy5qc29uIGFkZHMgQWNjZXB0OiBqc29uICh3ZSB3YW50IGpzb24pXG4vLyBpZiBvcHRpb25zLmpzb24gb3Igc2VydmVyIHJldHVybmVkIGpzb24gY29udGVudCB0eXBlXG4vLyAgICAtLT4gYXV0b3BhcnNlIGpzb25cbi8vICAgIC0tPiBmYWlsIGlmIGVycm9yXG4vL1xuLy8gIyBDU1JGXG4vLyAgICAtLT4gR0VUL09QVElPTlMvSEVBRCByZXF1ZXN0cyBnZXQgX2NzcmYgZmllbGQgZnJvbSB3aW5kb3cuY3NyZlxuXG5mdW5jdGlvbiB4aHIob3B0aW9ucykge1xuXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgdmFyIG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnO1xuICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBvcHRpb25zLnVybCwgb3B0aW9ucy5zeW5jID8gZmFsc2UgOiB0cnVlKTtcblxuICByZXF1ZXN0Lm1ldGhvZCA9IG1ldGhvZDtcblxuICBpZiAoIW9wdGlvbnMubm9HbG9iYWxFdmVudHMpIHtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyc3RhcnQnLCBldmVudCk7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyZW5kJywgZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocnN1Y2Nlc3MnLCBldmVudCk7XG4gICAgICBlLnJlc3VsdCA9IGV2ZW50LnJlc3VsdDtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdmYWlsJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlID0gd3JhcEV2ZW50KCd4aHJmYWlsJywgZXZlbnQpO1xuICAgICAgZS5yZWFzb24gPSBldmVudC5yZWFzb247XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuanNvbikgeyAvLyBtZWFucyB3ZSB3YW50IGpzb25cbiAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoXCJBY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICB9XG5cbiAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdYLVJlcXVlc3RlZC1XaXRoJywgXCJYTUxIdHRwUmVxdWVzdFwiKTtcblxuICB2YXIgc3VjY2Vzc1N0YXR1c2VzID0gb3B0aW9ucy5zdWNjZXNzU3RhdHVzZXMgfHwgWzIwMF07XG5cbiAgZnVuY3Rpb24gd3JhcEV2ZW50KG5hbWUsIGUpIHtcbiAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQobmFtZSk7XG4gICAgZXZlbnQub3JpZ2luYWxFdmVudCA9IGU7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG5cbiAgZnVuY3Rpb24gZmFpbChyZWFzb24sIG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgZSA9IHdyYXBFdmVudChcImZhaWxcIiwgb3JpZ2luYWxFdmVudCk7XG4gICAgZS5yZWFzb24gPSByZWFzb247XG4gICAgcmVxdWVzdC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3VjY2VzcyhyZXN1bHQsIG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgZSA9IHdyYXBFdmVudChcInN1Y2Nlc3NcIiwgb3JpZ2luYWxFdmVudCk7XG4gICAgZS5yZXN1bHQgPSByZXN1bHQ7XG4gICAgcmVxdWVzdC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oZSkge1xuICAgIGZhaWwoXCLQntGI0LjQsdC60LAg0YHQstGP0LfQuCDRgSDRgdC10YDQstC10YDQvtC8LlwiLCBlKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwidGltZW91dFwiLCBmdW5jdGlvbihlKSB7XG4gICAgZmFpbChcItCf0YDQtdCy0YvRiNC10L3QviDQvNCw0LrRgdC40LzQsNC70YzQvdC+INC00L7Qv9GD0YHRgtC40LzQvtC1INCy0YDQtdC80Y8g0L7QttC40LTQsNC90LjRjyDQvtGC0LLQtdGC0LAg0L7RgiDRgdC10YDQstC10YDQsC5cIiwgZSk7XG4gIH0pO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBmYWlsKFwi0JfQsNC/0YDQvtGBINCx0YvQuyDQv9GA0LXRgNCy0LDQvS5cIiwgZSk7XG4gIH0pO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oZSkge1xuICAgIGlmICghdGhpcy5zdGF0dXMpIHsgLy8gZG9lcyB0aGF0IGV2ZXIgaGFwcGVuP1xuICAgICAgZmFpbChcItCd0LUg0L/QvtC70YPRh9C10L0g0L7RgtCy0LXRgiDQvtGCINGB0LXRgNCy0LXRgNCwLlwiLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3VjY2Vzc1N0YXR1c2VzLmluZGV4T2YodGhpcy5zdGF0dXMpID09IC0xKSB7XG4gICAgICBmYWlsKFwi0J7RiNC40LHQutCwINC90LAg0YHRgtC+0YDQvtC90LUg0YHQtdGA0LLQtdGA0LAgKNC60L7QtCBcIiArIHRoaXMuc3RhdHVzICsgXCIpLCDQv9C+0L/Ri9GC0LDQudGC0LXRgdGMINC/0L7Qt9C00L3QtdC1XCIsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSB0aGlzLnJlc3BvbnNlVGV4dDtcbiAgICB2YXIgY29udGVudFR5cGUgPSB0aGlzLmdldFJlc3BvbnNlSGVhZGVyKFwiQ29udGVudC1UeXBlXCIpO1xuICAgIGlmIChjb250ZW50VHlwZS5tYXRjaCgvXmFwcGxpY2F0aW9uXFwvanNvbi8pIHx8IG9wdGlvbnMuanNvbikgeyAvLyBhdXRvcGFyc2UganNvbiBpZiBXQU5UIG9yIFJFQ0VJVkVEIGpzb25cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IEpTT04ucGFyc2UocmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZmFpbChcItCd0LXQutC+0YDRgNC10LrRgtC90YvQuSDRhNC+0YDQvNCw0YIg0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LBcIiwgZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdWNjZXNzKHJlc3VsdCwgZSk7XG4gIH0pO1xuXG4gIHdyYXBDc3JmU2VuZChyZXF1ZXN0KTtcbiAgcmV0dXJuIHJlcXVlc3Q7XG59XG5cbi8vIEFsbCBub24tR0VUIHJlcXVlc3QgZ2V0IF9jc3JmIGZyb20gd2luZG93LmNzcmYgYXV0b21hdGljYWxseVxuZnVuY3Rpb24gd3JhcENzcmZTZW5kKHJlcXVlc3QpIHtcblxuICB2YXIgc2VuZCA9IHJlcXVlc3Quc2VuZDtcbiAgcmVxdWVzdC5zZW5kID0gZnVuY3Rpb24oYm9keSkge1xuXG4gICAgaWYgKCF+WydHRVQnLCAnSEVBRCcsICdPUFRJT05TJ10uaW5kZXhPZih0aGlzLm1ldGhvZCkpIHtcbiAgICAgIGlmIChib2R5IGluc3RhbmNlb2YgRm9ybURhdGEpIHtcbiAgICAgICAgYm9keS5hcHBlbmQoXCJfY3NyZlwiLCB3aW5kb3cuY3NyZik7XG4gICAgICB9XG5cbiAgICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGJvZHkpID09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgIGJvZHkuX2NzcmYgPSB3aW5kb3cuY3NyZjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSB7X2NzcmY6IHdpbmRvdy5jc3JmfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoe30udG9TdHJpbmcuY2FsbChib2R5KSA9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgdGhpcy5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PVVURi04XCIpO1xuICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xuICAgIH1cblxuICAgIHNlbmQuY2FsbCh0aGlzLCBib2R5KTtcblxuICB9O1xuXG59XG4iLCIvKipcbiAqIGh1bWFuZS5qc1xuICogSHVtYW5pemVkIE1lc3NhZ2VzIGZvciBOb3RpZmljYXRpb25zXG4gKiBAYXV0aG9yIE1hcmMgSGFydGVyIChAd2F2ZGVkKVxuICogQGV4YW1wbGVcbiAqICAgaHVtYW5lLmxvZygnaGVsbG8gd29ybGQnKTtcbiAqIFNlZSBtb3JlIHVzYWdlIGV4YW1wbGVzIGF0OiBodHRwOi8vd2F2ZGVkLmdpdGh1Yi5jb20vaHVtYW5lLWpzL1xuICovXG5cbjshZnVuY3Rpb24gKG5hbWUsIGNvbnRleHQsIGRlZmluaXRpb24pIHtcbiAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKG5hbWUsIGNvbnRleHQpXG4gICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kICA9PT0gJ29iamVjdCcpIGRlZmluZShkZWZpbml0aW9uKVxuICAgZWxzZSBjb250ZXh0W25hbWVdID0gZGVmaW5pdGlvbihuYW1lLCBjb250ZXh0KVxufSgnaHVtYW5lJywgdGhpcywgZnVuY3Rpb24gKG5hbWUsIGNvbnRleHQpIHtcbiAgIHZhciB3aW4gPSB3aW5kb3dcbiAgIHZhciBkb2MgPSBkb2N1bWVudFxuXG4gICB2YXIgRU5WID0ge1xuICAgICAgb246IGZ1bmN0aW9uIChlbCwgdHlwZSwgY2IpIHtcbiAgICAgICAgICdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW4gPyBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsY2IsZmFsc2UpIDogZWwuYXR0YWNoRXZlbnQoJ29uJyt0eXBlLGNiKVxuICAgICAgfSxcbiAgICAgIG9mZjogZnVuY3Rpb24gKGVsLCB0eXBlLCBjYikge1xuICAgICAgICAgJ3JlbW92ZUV2ZW50TGlzdGVuZXInIGluIHdpbiA/IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSxjYixmYWxzZSkgOiBlbC5kZXRhY2hFdmVudCgnb24nK3R5cGUsY2IpXG4gICAgICB9LFxuICAgICAgYmluZDogZnVuY3Rpb24gKGZuLCBjdHgpIHtcbiAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KGN0eCxhcmd1bWVudHMpIH1cbiAgICAgIH0sXG4gICAgICBpc0FycmF5OiBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nIH0sXG4gICAgICBjb25maWc6IGZ1bmN0aW9uIChwcmVmZXJyZWQsIGZhbGxiYWNrKSB7XG4gICAgICAgICByZXR1cm4gcHJlZmVycmVkICE9IG51bGwgPyBwcmVmZXJyZWQgOiBmYWxsYmFja1xuICAgICAgfSxcbiAgICAgIHRyYW5zU3VwcG9ydDogZmFsc2UsXG4gICAgICB1c2VGaWx0ZXI6IC9tc2llIFs2NzhdL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSwgLy8gc25pZmYsIHNuaWZmXG4gICAgICBfY2hlY2tUcmFuc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgIHZhciB2ZW5kb3JzID0geyB3ZWJraXQ6ICd3ZWJraXQnLCBNb3o6ICcnLCBPOiAnbycsIG1zOiAnTVMnIH1cblxuICAgICAgICAgZm9yICh2YXIgdmVuZG9yIGluIHZlbmRvcnMpXG4gICAgICAgICAgICBpZiAodmVuZG9yICsgJ1RyYW5zaXRpb24nIGluIGVsLnN0eWxlKSB7XG4gICAgICAgICAgICAgICB0aGlzLnZlbmRvclByZWZpeCA9IHZlbmRvcnNbdmVuZG9yXVxuICAgICAgICAgICAgICAgdGhpcy50cmFuc1N1cHBvcnQgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICB9XG4gICB9XG4gICBFTlYuX2NoZWNrVHJhbnNpdGlvbigpXG5cbiAgIHZhciBIdW1hbmUgPSBmdW5jdGlvbiAobykge1xuICAgICAgbyB8fCAobyA9IHt9KVxuICAgICAgdGhpcy5xdWV1ZSA9IFtdXG4gICAgICB0aGlzLmJhc2VDbHMgPSBvLmJhc2VDbHMgfHwgJ2h1bWFuZSdcbiAgICAgIHRoaXMuYWRkbkNscyA9IG8uYWRkbkNscyB8fCAnJ1xuICAgICAgdGhpcy50aW1lb3V0ID0gJ3RpbWVvdXQnIGluIG8gPyBvLnRpbWVvdXQgOiAyNTAwXG4gICAgICB0aGlzLndhaXRGb3JNb3ZlID0gby53YWl0Rm9yTW92ZSB8fCBmYWxzZVxuICAgICAgdGhpcy5jbGlja1RvQ2xvc2UgPSBvLmNsaWNrVG9DbG9zZSB8fCBmYWxzZVxuICAgICAgdGhpcy50aW1lb3V0QWZ0ZXJNb3ZlID0gby50aW1lb3V0QWZ0ZXJNb3ZlIHx8IGZhbHNlIFxuICAgICAgdGhpcy5jb250YWluZXIgPSBvLmNvbnRhaW5lclxuXG4gICAgICB0cnkgeyB0aGlzLl9zZXR1cEVsKCkgfSAvLyBhdHRlbXB0IHRvIHNldHVwIGVsZW1lbnRzXG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBFTlYub24od2luLCdsb2FkJyxFTlYuYmluZCh0aGlzLl9zZXR1cEVsLCB0aGlzKSkgLy8gZG9tIHdhc24ndCByZWFkeSwgd2FpdCB0aWxsIHJlYWR5XG4gICAgICB9XG4gICB9XG5cbiAgIEh1bWFuZS5wcm90b3R5cGUgPSB7XG4gICAgICBjb25zdHJ1Y3RvcjogSHVtYW5lLFxuICAgICAgX3NldHVwRWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5lcil7XG4gICAgICAgICAgIGlmKGRvYy5ib2R5KSB0aGlzLmNvbnRhaW5lciA9IGRvYy5ib2R5O1xuICAgICAgICAgICBlbHNlIHRocm93ICdkb2N1bWVudC5ib2R5IGlzIG51bGwnXG4gICAgICAgICB9XG4gICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgIHRoaXMuZWwgPSBlbFxuICAgICAgICAgdGhpcy5yZW1vdmVFdmVudCA9IEVOVi5iaW5kKGZ1bmN0aW9uKCl7IGlmICghdGhpcy50aW1lb3V0QWZ0ZXJNb3ZlKXt0aGlzLnJlbW92ZSgpfSBlbHNlIHtzZXRUaW1lb3V0KEVOVi5iaW5kKHRoaXMucmVtb3ZlLHRoaXMpLHRoaXMudGltZW91dCk7fX0sdGhpcylcbiAgICAgICAgIHRoaXMudHJhbnNFdmVudCA9IEVOVi5iaW5kKHRoaXMuX2FmdGVyQW5pbWF0aW9uLHRoaXMpXG4gICAgICAgICB0aGlzLl9ydW4oKVxuICAgICAgfSxcbiAgICAgIF9hZnRlclRpbWVvdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIGlmICghRU5WLmNvbmZpZyh0aGlzLmN1cnJlbnRNc2cud2FpdEZvck1vdmUsdGhpcy53YWl0Rm9yTW92ZSkpIHRoaXMucmVtb3ZlKClcblxuICAgICAgICAgZWxzZSBpZiAoIXRoaXMucmVtb3ZlRXZlbnRzU2V0KSB7XG4gICAgICAgICAgICBFTlYub24oZG9jLmJvZHksJ21vdXNlbW92ZScsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwnY2xpY2snLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICBFTlYub24oZG9jLmJvZHksJ2tleXByZXNzJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudHNTZXQgPSB0cnVlXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX3J1bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgaWYgKHRoaXMuX2FuaW1hdGluZyB8fCAhdGhpcy5xdWV1ZS5sZW5ndGggfHwgIXRoaXMuZWwpIHJldHVyblxuXG4gICAgICAgICB0aGlzLl9hbmltYXRpbmcgPSB0cnVlXG4gICAgICAgICBpZiAodGhpcy5jdXJyZW50VGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmN1cnJlbnRUaW1lcilcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWVyID0gbnVsbFxuICAgICAgICAgfVxuXG4gICAgICAgICB2YXIgbXNnID0gdGhpcy5xdWV1ZS5zaGlmdCgpXG4gICAgICAgICB2YXIgY2xpY2tUb0Nsb3NlID0gRU5WLmNvbmZpZyhtc2cuY2xpY2tUb0Nsb3NlLHRoaXMuY2xpY2tUb0Nsb3NlKVxuXG4gICAgICAgICBpZiAoY2xpY2tUb0Nsb3NlKSB7XG4gICAgICAgICAgICBFTlYub24odGhpcy5lbCwnY2xpY2snLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICBFTlYub24odGhpcy5lbCwndG91Y2hzdGFydCcsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIH1cblxuICAgICAgICAgdmFyIHRpbWVvdXQgPSBFTlYuY29uZmlnKG1zZy50aW1lb3V0LHRoaXMudGltZW91dClcblxuICAgICAgICAgaWYgKHRpbWVvdXQgPiAwKVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZXIgPSBzZXRUaW1lb3V0KEVOVi5iaW5kKHRoaXMuX2FmdGVyVGltZW91dCx0aGlzKSwgdGltZW91dClcblxuICAgICAgICAgaWYgKEVOVi5pc0FycmF5KG1zZy5odG1sKSkgbXNnLmh0bWwgPSAnPHVsPjxsaT4nK21zZy5odG1sLmpvaW4oJzxsaT4nKSsnPC91bD4nXG5cbiAgICAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gbXNnLmh0bWxcbiAgICAgICAgIHRoaXMuY3VycmVudE1zZyA9IG1zZ1xuICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSB0aGlzLmJhc2VDbHNcbiAgICAgICAgIGlmIChFTlYudHJhbnNTdXBwb3J0KSB7XG4gICAgICAgICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgICAgICAgICBzZXRUaW1lb3V0KEVOVi5iaW5kKHRoaXMuX3Nob3dNc2csdGhpcyksNTApXG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2hvd01zZygpXG4gICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBfc2V0T3BhY2l0eTogZnVuY3Rpb24gKG9wYWNpdHkpIHtcbiAgICAgICAgIGlmIChFTlYudXNlRmlsdGVyKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgIHRoaXMuZWwuZmlsdGVycy5pdGVtKCdEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5BbHBoYScpLk9wYWNpdHkgPSBvcGFjaXR5KjEwMFxuICAgICAgICAgICAgfSBjYXRjaChlcnIpe31cbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsLnN0eWxlLm9wYWNpdHkgPSBTdHJpbmcob3BhY2l0eSlcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfc2hvd01zZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGFkZG5DbHMgPSBFTlYuY29uZmlnKHRoaXMuY3VycmVudE1zZy5hZGRuQ2xzLHRoaXMuYWRkbkNscylcbiAgICAgICAgIGlmIChFTlYudHJhbnNTdXBwb3J0KSB7XG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNscysnICcrYWRkbkNscysnICcrdGhpcy5iYXNlQ2xzKyctYW5pbWF0ZSdcbiAgICAgICAgIH1cbiAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAwXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IHRoaXMuYmFzZUNscysnICcrYWRkbkNscysnICcrdGhpcy5iYXNlQ2xzKyctanMtYW5pbWF0ZSdcbiAgICAgICAgICAgIHRoaXMuX3NldE9wYWNpdHkoMCkgLy8gcmVzZXQgdmFsdWUgc28gaG92ZXIgc3RhdGVzIHdvcmtcbiAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkgPCAxKSB7XG4gICAgICAgICAgICAgICAgICBvcGFjaXR5ICs9IDAuMVxuICAgICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkgPiAxKSBvcGFjaXR5ID0gMVxuICAgICAgICAgICAgICAgICAgc2VsZi5fc2V0T3BhY2l0eShvcGFjaXR5KVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgZWxzZSBjbGVhckludGVydmFsKGludGVydmFsKVxuICAgICAgICAgICAgfSwgMzApXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX2hpZGVNc2c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHZhciBhZGRuQ2xzID0gRU5WLmNvbmZpZyh0aGlzLmN1cnJlbnRNc2cuYWRkbkNscyx0aGlzLmFkZG5DbHMpXG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkge1xuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSB0aGlzLmJhc2VDbHMrJyAnK2FkZG5DbHNcbiAgICAgICAgICAgIEVOVi5vbih0aGlzLmVsLEVOVi52ZW5kb3JQcmVmaXggPyBFTlYudmVuZG9yUHJlZml4KydUcmFuc2l0aW9uRW5kJyA6ICd0cmFuc2l0aW9uZW5kJyx0aGlzLnRyYW5zRXZlbnQpXG4gICAgICAgICB9XG4gICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gMVxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgaWYob3BhY2l0eSA+IDApIHtcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHkgLT0gMC4xXG4gICAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSA8IDApIG9wYWNpdHkgPSAwXG4gICAgICAgICAgICAgICAgICBzZWxmLl9zZXRPcGFjaXR5KG9wYWNpdHkpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLmVsLmNsYXNzTmFtZSA9IHNlbGYuYmFzZUNscysnICcrYWRkbkNsc1xuICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcbiAgICAgICAgICAgICAgICAgIHNlbGYuX2FmdGVyQW5pbWF0aW9uKClcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDMwKVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9hZnRlckFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIEVOVi5vZmYodGhpcy5lbCxFTlYudmVuZG9yUHJlZml4ID8gRU5WLnZlbmRvclByZWZpeCsnVHJhbnNpdGlvbkVuZCcgOiAndHJhbnNpdGlvbmVuZCcsdGhpcy50cmFuc0V2ZW50KVxuXG4gICAgICAgICBpZiAodGhpcy5jdXJyZW50TXNnLmNiKSB0aGlzLmN1cnJlbnRNc2cuY2IoKVxuICAgICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbiAgICAgICAgIHRoaXMuX2FuaW1hdGluZyA9IGZhbHNlXG4gICAgICAgICB0aGlzLl9ydW4oKVxuICAgICAgfSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgIHZhciBjYiA9IHR5cGVvZiBlID09ICdmdW5jdGlvbicgPyBlIDogbnVsbFxuXG4gICAgICAgICBFTlYub2ZmKGRvYy5ib2R5LCdtb3VzZW1vdmUnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKGRvYy5ib2R5LCdjbGljaycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ2tleXByZXNzJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwndG91Y2hzdGFydCcsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYodGhpcy5lbCwnY2xpY2snLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKHRoaXMuZWwsJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICB0aGlzLnJlbW92ZUV2ZW50c1NldCA9IGZhbHNlXG5cbiAgICAgICAgIGlmIChjYiAmJiB0aGlzLmN1cnJlbnRNc2cpIHRoaXMuY3VycmVudE1zZy5jYiA9IGNiXG4gICAgICAgICBpZiAodGhpcy5fYW5pbWF0aW5nKSB0aGlzLl9oaWRlTXNnKClcbiAgICAgICAgIGVsc2UgaWYgKGNiKSBjYigpXG4gICAgICB9LFxuICAgICAgbG9nOiBmdW5jdGlvbiAoaHRtbCwgbywgY2IsIGRlZmF1bHRzKSB7XG4gICAgICAgICB2YXIgbXNnID0ge31cbiAgICAgICAgIGlmIChkZWZhdWx0cylcbiAgICAgICAgICAgZm9yICh2YXIgb3B0IGluIGRlZmF1bHRzKVxuICAgICAgICAgICAgICAgbXNnW29wdF0gPSBkZWZhdWx0c1tvcHRdXG5cbiAgICAgICAgIGlmICh0eXBlb2YgbyA9PSAnZnVuY3Rpb24nKSBjYiA9IG9cbiAgICAgICAgIGVsc2UgaWYgKG8pXG4gICAgICAgICAgICBmb3IgKHZhciBvcHQgaW4gbykgbXNnW29wdF0gPSBvW29wdF1cblxuICAgICAgICAgbXNnLmh0bWwgPSBodG1sXG4gICAgICAgICBpZiAoY2IpIG1zZy5jYiA9IGNiXG4gICAgICAgICB0aGlzLnF1ZXVlLnB1c2gobXNnKVxuICAgICAgICAgdGhpcy5fcnVuKClcbiAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9LFxuICAgICAgc3Bhd246IGZ1bmN0aW9uIChkZWZhdWx0cykge1xuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGh0bWwsIG8sIGNiKSB7XG4gICAgICAgICAgICBzZWxmLmxvZy5jYWxsKHNlbGYsaHRtbCxvLGNiLGRlZmF1bHRzKVxuICAgICAgICAgICAgcmV0dXJuIHNlbGZcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjcmVhdGU6IGZ1bmN0aW9uIChvKSB7IHJldHVybiBuZXcgSHVtYW5lKG8pIH1cbiAgIH1cbiAgIHJldHVybiBuZXcgSHVtYW5lKClcbn0pXG4iLCJ2YXIgZGVsZWdhdGUgPSByZXF1aXJlKCdjbGllbnQvZGVsZWdhdGUnKTtcbnZhciBub3RpZnkgPSByZXF1aXJlKCdjbGllbnQvbm90aWZ5Jyk7XG52YXIgeGhyID0gcmVxdWlyZSgnY2xpZW50L3hocicpO1xuXG5mdW5jdGlvbiBBdXRoUHJvdmlkZXJzTWFuYWdlcigpIHtcbiAgdGhpcy5lbGVtID0gZG9jdW1lbnQuYm9keTtcblxuICB0aGlzLmRlbGVnYXRlKCdbZGF0YS1hY3Rpb249XCJwcm92aWRlci1hZGRcIl0nLCAnY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5hZGRQcm92aWRlcihldmVudC5kZWxlZ2F0ZVRhcmdldC5kYXRhc2V0LnByb3ZpZGVyKTtcbiAgfSk7XG5cbiAgdGhpcy5kZWxlZ2F0ZSgnW2RhdGEtYWN0aW9uPVwicHJvdmlkZXItcmVtb3ZlXCJdJywgJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMucmVtb3ZlUHJvdmlkZXIoZXZlbnQuZGVsZWdhdGVUYXJnZXQuZGF0YXNldC5wcm92aWRlcik7XG4gIH0pO1xuXG59XG5cblxuQXV0aFByb3ZpZGVyc01hbmFnZXIucHJvdG90eXBlLmFkZFByb3ZpZGVyID0gZnVuY3Rpb24ocHJvdmlkZXJOYW1lKSB7XG4gIHRoaXMub3BlbkF1dGhQb3B1cCgnL2F1dGgvY29ubmVjdC8nICsgcHJvdmlkZXJOYW1lKTtcbn07XG5cbkF1dGhQcm92aWRlcnNNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVQcm92aWRlciA9IGZ1bmN0aW9uKHByb3ZpZGVyTmFtZSkge1xuICB2YXIgcmVxdWVzdCA9IHhocih7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiAnL2F1dGgvZGlzY29ubmVjdC8nICsgcHJvdmlkZXJOYW1lXG4gIH0pO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5zZW5kKCk7XG5cbn07XG5cblxuXG5BdXRoUHJvdmlkZXJzTWFuYWdlci5wcm90b3R5cGUub3BlbkF1dGhQb3B1cCA9IGZ1bmN0aW9uKHVybCkge1xuICBpZiAodGhpcy5hdXRoUG9wdXAgJiYgIXRoaXMuYXV0aFBvcHVwLmNsb3NlZCkge1xuICAgIHRoaXMuYXV0aFBvcHVwLmNsb3NlKCk7IC8vIGNsb3NlIG9sZCBwb3B1cCBpZiBhbnlcbiAgfVxuICB2YXIgd2lkdGggPSA4MDAsIGhlaWdodCA9IDYwMDtcbiAgdmFyIHRvcCA9ICh3aW5kb3cub3V0ZXJIZWlnaHQgLSBoZWlnaHQpIC8gMjtcbiAgdmFyIGxlZnQgPSAod2luZG93Lm91dGVyV2lkdGggLSB3aWR0aCkgLyAyO1xuXG4gIHdpbmRvdy5hdXRoUHJvdmlkZXJzTWFuYWdlciA9IHRoaXM7XG4gIHRoaXMuYXV0aFBvcHVwID0gd2luZG93Lm9wZW4odXJsLCAnYXV0aFByb3ZpZGVyc01hbmFnZXInLCAnd2lkdGg9JyArIHdpZHRoICsgJyxoZWlnaHQ9JyArIGhlaWdodCArICcsc2Nyb2xsYmFycz0wLHRvcD0nICsgdG9wICsgJyxsZWZ0PScgKyBsZWZ0KTtcbn07XG5cbi8qXG4g0LLRgdC1INC+0LHRgNCw0LHQvtGC0YfQuNC60Lgg0LDQstGC0L7RgNC40LfQsNGG0LjQuCAo0LLQutC70Y7Rh9Cw0Y8gRmFjZWJvb2sg0LjQtyBwb3B1cC3QsCDQuCDQu9C+0LrQsNC70YzQvdGL0LkpXG4g0LIg0LjRgtC+0LPQtSDRgtGA0LjQs9Cz0LXRgNGP0YIg0L7QtNC40L0g0LjQtyDRjdGC0LjRhSDQutCw0LvQu9Cx0Y3QutC+0LJcbiAqL1xuQXV0aFByb3ZpZGVyc01hbmFnZXIucHJvdG90eXBlLm9uQXV0aFN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xufTtcblxuQXV0aFByb3ZpZGVyc01hbmFnZXIucHJvdG90eXBlLm9uQXV0aEZhaWx1cmUgPSBmdW5jdGlvbihlcnJvck1lc3NhZ2UpIHtcbiAgbm90aWZ5LmVycm9yKGVycm9yTWVzc2FnZSB8fCBcItCe0YLQutCw0Lcg0LIg0LDQstGC0L7RgNC40LfQsNGG0LjQuFwiLCAnZXJyb3InKTtcbn07XG5cblxuZGVsZWdhdGUuZGVsZWdhdGVNaXhpbihBdXRoUHJvdmlkZXJzTWFuYWdlci5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGhQcm92aWRlcnNNYW5hZ2VyO1xuIiwidmFyIGRlbGVnYXRlID0gcmVxdWlyZSgnY2xpZW50L2RlbGVnYXRlJyk7XG52YXIgeGhyID0gcmVxdWlyZSgnY2xpZW50L3hocicpO1xudmFyIEltYWdlVXBsb2FkZXIgPSByZXF1aXJlKCdjbGllbnQvaW1hZ2VVcGxvYWRlcicpO1xudmFyIG5vdGlmeSA9IHJlcXVpcmUoJ2NsaWVudC9ub3RpZnknKTtcblxuZnVuY3Rpb24gUGhvdG9DaGFuZ2VyKCkge1xuICB0aGlzLmVsZW0gPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cInBob3RvLWNoYW5nZVwiXScpO1xuXG4gIHRoaXMuaW1nID0gdGhpcy5lbGVtO1xuICB0aGlzLmVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5jaGFuZ2VQaG90bygpO1xuICB9LmJpbmQodGhpcykpO1xufVxuXG5QaG90b0NoYW5nZXIucHJvdG90eXBlLmNoYW5nZVBob3RvID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmaWxlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICBmaWxlSW5wdXQudHlwZSA9ICdmaWxlJztcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGZpbGVJbnB1dC5vbmNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYudXBsb2FkKHRoaXMuZmlsZXNbMF0pO1xuICB9O1xuICBmaWxlSW5wdXQuY2xpY2soKTtcbn07XG5cblBob3RvQ2hhbmdlci5wcm90b3R5cGUudXBkYXRlVXNlclBob3RvID0gZnVuY3Rpb24obGluaykge1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB2YXIgcmVxdWVzdCA9IHhocih7XG4gICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgIHVybDogJy91c2Vycy9tZSdcbiAgfSk7XG5cbiAgcmVxdWVzdC5zZW5kKHtwaG90bzogbGlua30pO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc2VsZi5pbWcuc3JjID0gZXZlbnQucmVzdWx0LnBob3RvLnJlcGxhY2UoLyhcXC5cXHcrKSQvLCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+IDEgPyAnbSQxJyA6ICd0JDEnKTtcbiAgfSk7XG5cbn07XG5cblxuUGhvdG9DaGFuZ2VyLnByb3RvdHlwZS51cGxvYWQgPSBmdW5jdGlvbihmaWxlKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IEltYWdlVXBsb2FkZXIoZmlsZSkudXBsb2FkKCk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKHRoaXMuc3RhdHVzID09IDQwMCkge1xuICAgICAgbm90aWZ5LmVycm9yKFwi0J3QtdCy0LXRgNC90YvQuSDRgtC40L8g0YTQsNC50LvQsCDQuNC70Lgg0LjQt9C+0LHRgNCw0LbQtdC90LjQtSDQv9C+0LLRgNC10LbQtNC10L3Qvi5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGUucmVzdWx0LmRhdGEud2lkdGggPCAxNjAgfHwgZS5yZXN1bHQuZGF0YS5oZWlnaHQgPCAxNjApIHtcbiAgICAgIG5vdGlmeS5lcnJvcihcItCc0LjQvdC40LzQsNC70YzQvdC+0LUg0YDQsNC30YDQtdGI0LXQvdC40LUgMTYweDE2MCwg0LvRg9GH0YjQtSAzMjBweC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZi51cGRhdGVVc2VyUGhvdG8oZS5yZXN1bHQuZGF0YS5saW5rKTtcbiAgfSk7XG5cbn07XG5cbmRlbGVnYXRlLmRlbGVnYXRlTWl4aW4oUGhvdG9DaGFuZ2VyLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGhvdG9DaGFuZ2VyO1xuIiwiXG5cbnZhciBBdXRoUHJvdmlkZXJzTWFuYWdlciA9IHJlcXVpcmUoJy4vYXV0aFByb3ZpZGVyc01hbmFnZXInKTtcbnZhciBQaG90b0NoYW5nZXIgPSByZXF1aXJlKCcuL3Bob3RvQ2hhbmdlcicpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgbmV3IEF1dGhQcm92aWRlcnNNYW5hZ2VyKCk7XG4gIG5ldyBQaG90b0NoYW5nZXIoKTtcbn07XG4iXX0=
