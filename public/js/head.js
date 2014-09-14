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
({"/root/javascript-nodejs/node_modules/client/head/fontTest.js":[function(require,module,exports){
/*
Избегаем FOUT - простой способ проверки загрузки иконик шрифта.
 1) Делаем в iconic шрифте один символ с кодом 21 (вместо «!»)
 В iconmoon
 http://ilyakantor.ru/screen/2014-09-06_0152.png
 http://ilyakantor.ru/screen/2014-09-06_0153.png

 Этот шрифт в обычном шрифте (serif) узкий по ширине, а в iconic - нормальный.
 2) Далее при загрузке создаём <span>!</span> и даём ему fontFamily сначала serif и замеряем ширину, а потом FontIcons, serif.
 Отлавливаем момент, когда ширина изменится. Это значит шрифт загружен.
 Можно убрать класс .no-icons и показать иконки.
 */


module.exports = function() {
  var elem = document.createElement('span');
  document.body.appendChild(elem);
  elem.className = 'font-test';
  elem.style.fontFamily = 'serif';
  var initialWidth = elem.offsetWidth;

  elem.style.fontFamily = '';

  function checkFontLoaded() {
    if (initialWidth != elem.offsetWidth) {
      document.body.classList.remove('no-icons');
    } else {
      setTimeout(checkFontLoaded, 100);
    }
  }

  checkFontLoaded();

};

},{}],"/root/javascript-nodejs/node_modules/client/head/init.js":[function(require,module,exports){
// use global variables, because head.js and main.js include different modules
var initHandlers = {};
var initWhenReadyCalled = {};

// Usage:
//  initWhenReady('login')
//    will trigger addInitHandler('login')
//    and wait if it doesn't exist yet

// if initWhenReady is first (from HTML)
//  -> initWhenReadyCalled[name] = true
//  -> then addInitHandler uses it

// if addInitHandler is first (from SCRIPT)
//  -> initHandlers[name] = handler
//  -> then initWhenReady uses it
function initWhenReady(name) {
//  console.log("initWhenReady", name);
  if (initHandlers[name]) {
    initHandlers[name]();
  } else {
    initWhenReadyCalled[name] = true;
  }
}

function addInitHandler(name, handler) {
//  console.log("addInitHandler", name, handler);
  if (initWhenReadyCalled[name]) {
    handler();
  } else {
    initHandlers[name] = handler;
  }
}

module.exports = {
  whenReady: initWhenReady,
  addHandler: addInitHandler
};

},{}],"/root/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js":[function(require,module,exports){
var versions = require('client/versions');

// insert <script src="..."> into document
//   --> does not block rendering
//   --> keeps execution order
module.exports = function(src, options) {
  var script = document.createElement('script');
  if (versions[src]) {
    src = src.replace('.js', '.v' + versions[src] + '.js');
  }
  script.src = src;
  script.async = options.async || false; // maintain the execution order if async is not set
  document.head.appendChild(script);
  return script; // for onload handlers
};


},{"client/versions":"/root/javascript-nodejs/node_modules/client/versions.json"}],"/root/javascript-nodejs/node_modules/client/head/login.js":[function(require,module,exports){
var init = require('./init');
var insertNonBlockingScript = require('./insertNonBlockingScript');
var Modal = require('./modal');
var Spinner = require('client/spinner');

init.addHandler("login", function() {

  var button = document.querySelector('.sitetoolbar__login');
  button.onclick = function(e) {
    e.preventDefault();
    login();
  };

});

function login() {
  var modal = new Modal();
  var spinner = new Spinner();
  modal.setContent(spinner.elem);
  spinner.start();
  var script = insertNonBlockingScript('/js/auth.js');
  script.onload = function() {
    modal.remove();
    var AuthModal = require('auth/client').AuthModal;
    new AuthModal();
  };
}

module.exports = login;

},{"./init":"/root/javascript-nodejs/node_modules/client/head/init.js","./insertNonBlockingScript":"/root/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js","./modal":"/root/javascript-nodejs/node_modules/client/head/modal.js","auth/client":"auth/client","client/spinner":"/root/javascript-nodejs/node_modules/client/spinner.js"}],"/root/javascript-nodejs/node_modules/client/head/logout.js":[function(require,module,exports){
var init = require('./init');

init.addHandler("logout", function() {

  var button = document.querySelector('.sitetoolbar__logout');
  button.onclick = function(e) {
    e.preventDefault();
    logout();
  };
  button.classList.remove('unready');
});


function logout() {
  var form = document.createElement('form');
  form.innerHTML = '<input name="_csrf" value="' + window.csrf + '">';
  form.method = 'POST';
  form.action = '/auth/logout';
  form.submit();
}


module.exports = logout;

},{"./init":"/root/javascript-nodejs/node_modules/client/head/init.js"}],"/root/javascript-nodejs/node_modules/client/head/modal.js":[function(require,module,exports){
function Modal() {
  document.body.insertAdjacentHTML('beforeEnd', '<div class="modal"><div class="modal-dialog"></div></div>');

  var self = this;
  this.elem = document.body.lastChild;
  this.contentElem = this.elem.lastChild;

  this.onClick = this.onClick.bind(this);
  this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

  this.elem.addEventListener('click', this.onClick);

  document.addEventListener("keydown", this.onDocumentKeyDown);
}


Modal.prototype.onClick = function(event) {
  if (event.target.classList.contains('close-button')) {
    this.remove();
  }
};


Modal.prototype.onDocumentKeyDown = function(event) {
  if (event.keyCode == 27) {
    event.preventDefault();
    this.remove();
  }
};

Modal.prototype.showOverlay = function() {
  this.contentElem.classList.add('modal-overlay');
};

Modal.prototype.hideOverlay = function() {
  this.contentElem.classList.remove('modal-overlay');
};

Modal.prototype.setContent = function(htmlOrNode) {
  if (typeof htmlOrNode == 'string') {
    this.contentElem.innerHTML = htmlOrNode;
  } else {
    this.contentElem.innerHTML = '';
    this.contentElem.appendChild(htmlOrNode);
  }
  var autofocus = this.contentElem.querySelector('[autofocus]');
  if (autofocus) autofocus.focus();
};

Modal.prototype.remove = function() {
  document.body.removeChild(this.elem);
  document.removeEventListener("keydown", this.onDocumentKeyDown);
};

module.exports = Modal;

},{}],"/root/javascript-nodejs/node_modules/client/head/sitetoolbar.js":[function(require,module,exports){
var lastPageYOffset;

var ignoreJump = false;
var requestAnimationFrameId;

// when I scroll down on MacOS, Chrome does the bounce trick
// At the page bottom it is possible to scroll below the page, and then it goes back (inertia)
// the problem is that the actual scroll for mouse down goes a little bit up
var tolerance = {
  up:   10, // big enough to ignore chrome fallback
  upAtBottom: 60,
  down: 10
};

// defer event registration to handle browser
// potentially restoring previous scroll position
setTimeout(init, 200);

function init() {
  lastPageYOffset = window.pageYOffset;

  window.addEventListener('scroll', onscroll);
}

function onscroll() {
  if (requestAnimationFrameId) return;

  requestAnimationFrameId = window.requestAnimationFrame(function() {
    showHideSiteToolbar();
    requestAnimationFrameId = null;
  });

}

function showHideSiteToolbar() {
  if (isScrollOutOfDocument()) { // Ignore bouncy scrolling in OSX
    return;
  }

  var scrollTop = window.pageYOffset;

  var scrollDirection = scrollTop > lastPageYOffset ? 'down' : 'up';
  var scrollDiff = Math.abs(scrollTop - lastPageYOffset);

//  console.log("scrollDiff", scrollDiff);

  // если прокрутили мало - ничего не делаем, но и точку отсчёта не меняем
  if (tolerance[scrollDirection] > scrollDiff) return;

  // в MacOs при прокрутке вниз возможен инерционный отскок наверх
  // если мы внизу страницы, то tolerance выше
  var scrollBottom = getDocumentHeight() - scrollTop - window.innerHeight;
  if (scrollDirection == 'up' && scrollBottom < tolerance.upAtBottom && scrollTop > tolerance.upAtBottom) return;

  lastPageYOffset = scrollTop;

  if (ignoreJump) return;

//  console.log(scrollDirection, scrollDiff, tolerance[scrollDirection]);


  if (scrollTop === 0 || scrollDirection == 'up') {
    document.body.classList.remove('scrolled-out');
    return;
  }

  if (scrollDirection == 'down') {
    document.body.classList.add('scrolled-out');
  }

}

/**
 * determines if the scroll position is outside of document boundaries
 * @param  {int}  currentScrollY the current y scroll position
 * @return {bool} true if out of bounds, false otherwise
 */
function isScrollOutOfDocument() {
  var pastTop = window.pageYOffset < 0,
      pastBottom = window.pageYOffset + window.innerHeight > getDocumentHeight();

  return pastTop || pastBottom;
}

/**
 * Gets the height of the document
 * @see http://james.padolsey.com/javascript/get-document-height-cross-browser/
 * @return {int} the height of the document in pixels
 */
function getDocumentHeight() {
  var body = document.body,
      documentElement = document.documentElement;

  return Math.max(
    body.scrollHeight, documentElement.scrollHeight,
    body.offsetHeight, documentElement.offsetHeight,
    body.clientHeight, documentElement.clientHeight
  );
}

/*
 window.addEventListener('scroll', function() {
 console.log(window.pageYOffset);
 // setTimeout(function() {
 if (window.pageYOffset < lastPageYOffset || window.pageYOffset < 5) {
 console.log("UP");
 // scrolled up
 document.body.classList.remove('scrolled-out');
 } else if (window.pageYOffset > lastPageYOffset + 30) {
 console.log("DOWN");
 // scrolled down, hide nav
 document.body.classList.add('scrolled-out');
 }

 lastPageYOffset = window.pageYOffset;
 // }, 100);
 });
 */
// don't autoscroll after a click on a navigation header
document.addEventListener('click', function() {
  ignoreJump = true;
  setTimeout(function() {
    ignoreJump = false;
  }, 0);
});

},{}],"/root/javascript-nodejs/node_modules/client/head/unready.js":[function(require,module,exports){
// if class ends with _unready then we consider element unusable (yet)


// cancel clicks on <a class="unready"> and <button class="unready">
document.addEventListener("click", function(event) {
  var target = event.target;
  while (target) {
    if (target.className.match(/_unready\b/)) {
      event.preventDefault();
      return;
    }
    target = target.parentElement;
  }
});

// cancel submits of <form class="unready">
document.addEventListener("submit", function(e) {
  if (e.target.className.match(/_unready\b/)) {
    event.preventDefault();
  }
});

},{}],"/root/javascript-nodejs/node_modules/client/spinner.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/client/versions.json":[function(require,module,exports){
module.exports={"/js/auth.js":"713073","/js/profile.js":"9f50ce","/js/tutorial.js":"711e87","/js/footer.js":"da8123"}
},{}],"client/head":[function(require,module,exports){

exports.insertNonBlockingScript = require('./insertNonBlockingScript');
require('./unready');
exports.init = require('./init');
exports.login = require('./login');
exports.logout = require('./logout');
exports.Modal = require('./modal');
exports.fontTest = require('./fontTest');

require('./sitetoolbar');

},{"./fontTest":"/root/javascript-nodejs/node_modules/client/head/fontTest.js","./init":"/root/javascript-nodejs/node_modules/client/head/init.js","./insertNonBlockingScript":"/root/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js","./login":"/root/javascript-nodejs/node_modules/client/head/login.js","./logout":"/root/javascript-nodejs/node_modules/client/head/logout.js","./modal":"/root/javascript-nodejs/node_modules/client/head/modal.js","./sitetoolbar":"/root/javascript-nodejs/node_modules/client/head/sitetoolbar.js","./unready":"/root/javascript-nodejs/node_modules/client/head/unready.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svcHJlbHVkZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9mb250VGVzdC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9pbml0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2luc2VydE5vbkJsb2NraW5nU2NyaXB0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2xvZ2luLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2xvZ291dC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9tb2RhbC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9zaXRldG9vbGJhci5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC91bnJlYWR5LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9zcGlubmVyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC92ZXJzaW9ucy5qc29uIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBtb2R1bGVzIGFyZSBkZWZpbmVkIGFzIGFuIGFycmF5XG4vLyBbIG1vZHVsZSBmdW5jdGlvbiwgbWFwIG9mIHJlcXVpcmV1aXJlcyBdXG4vL1xuLy8gbWFwIG9mIHJlcXVpcmV1aXJlcyBpcyBzaG9ydCByZXF1aXJlIG5hbWUgLT4gbnVtZXJpYyByZXF1aXJlXG4vL1xuLy8gYW55dGhpbmcgZGVmaW5lZCBpbiBhIHByZXZpb3VzIGJ1bmRsZSBpcyBhY2Nlc3NlZCB2aWEgdGhlXG4vLyBvcmlnIG1ldGhvZCB3aGljaCBpcyB0aGUgcmVxdWlyZXVpcmUgZm9yIHByZXZpb3VzIGJ1bmRsZXNcblxuKGZ1bmN0aW9uIG91dGVyIChtb2R1bGVzLCBjYWNoZSwgZW50cnkpIHtcbiAgICAvLyBTYXZlIHRoZSByZXF1aXJlIGZyb20gcHJldmlvdXMgYnVuZGxlIHRvIHRoaXMgY2xvc3VyZSBpZiBhbnlcbiAgICB2YXIgcHJldmlvdXNSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG5cbiAgICBmdW5jdGlvbiBuZXdSZXF1aXJlKG5hbWUsIGp1bXBlZCl7XG4gICAgICAgIGlmKCFjYWNoZVtuYW1lXSkge1xuICAgICAgICAgICAgaWYoIW1vZHVsZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBjYW5ub3QgZmluZCB0aGUgdGhlIG1vZHVsZSB3aXRoaW4gb3VyIGludGVybmFsIG1hcCBvclxuICAgICAgICAgICAgICAgIC8vIGNhY2hlIGp1bXAgdG8gdGhlIGN1cnJlbnQgZ2xvYmFsIHJlcXVpcmUgaWUuIHRoZSBsYXN0IGJ1bmRsZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2FzIGFkZGVkIHRvIHRoZSBwYWdlLlxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuICAgICAgICAgICAgICAgIGlmICghanVtcGVkICYmIGN1cnJlbnRSZXF1aXJlKSByZXR1cm4gY3VycmVudFJlcXVpcmUobmFtZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgYnVuZGxlcyBvbiB0aGlzIHBhZ2UgdGhlIHJlcXVpcmUgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cyBvbmUgaXMgc2F2ZWQgdG8gJ3ByZXZpb3VzUmVxdWlyZScuIFJlcGVhdCB0aGlzIGFzXG4gICAgICAgICAgICAgICAgLy8gbWFueSB0aW1lcyBhcyB0aGVyZSBhcmUgYnVuZGxlcyB1bnRpbCB0aGUgbW9kdWxlIGlzIGZvdW5kIG9yXG4gICAgICAgICAgICAgICAgLy8gd2UgZXhoYXVzdCB0aGUgcmVxdWlyZSBjaGFpbi5cbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNSZXF1aXJlKSByZXR1cm4gcHJldmlvdXNSZXF1aXJlKG5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIG1vZHVsZSBcXCcnICsgbmFtZSArICdcXCcnKTtcbiAgICAgICAgICAgICAgICBlcnIuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbSA9IGNhY2hlW25hbWVdID0ge2V4cG9ydHM6e319O1xuICAgICAgICAgICAgbW9kdWxlc1tuYW1lXVswXS5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24oeCl7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gbW9kdWxlc1tuYW1lXVsxXVt4XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3UmVxdWlyZShpZCA/IGlkIDogeCk7XG4gICAgICAgICAgICB9LG0sbS5leHBvcnRzLG91dGVyLG1vZHVsZXMsY2FjaGUsZW50cnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIH1cbiAgICBmb3IodmFyIGk9MDtpPGVudHJ5Lmxlbmd0aDtpKyspIG5ld1JlcXVpcmUoZW50cnlbaV0pO1xuXG4gICAgLy8gT3ZlcnJpZGUgdGhlIGN1cnJlbnQgcmVxdWlyZSB3aXRoIHRoaXMgbmV3IG9uZVxuICAgIHJldHVybiBuZXdSZXF1aXJlO1xufSlcbiIsIi8qXG7QmNC30LHQtdCz0LDQtdC8IEZPVVQgLSDQv9GA0L7RgdGC0L7QuSDRgdC/0L7RgdC+0LEg0L/RgNC+0LLQtdGA0LrQuCDQt9Cw0LPRgNGD0LfQutC4INC40LrQvtC90LjQuiDRiNGA0LjRhNGC0LAuXG4gMSkg0JTQtdC70LDQtdC8INCyIGljb25pYyDRiNGA0LjRhNGC0LUg0L7QtNC40L0g0YHQuNC80LLQvtC7INGBINC60L7QtNC+0LwgMjEgKNCy0LzQtdGB0YLQviDCqyHCuylcbiDQkiBpY29ubW9vblxuIGh0dHA6Ly9pbHlha2FudG9yLnJ1L3NjcmVlbi8yMDE0LTA5LTA2XzAxNTIucG5nXG4gaHR0cDovL2lseWFrYW50b3IucnUvc2NyZWVuLzIwMTQtMDktMDZfMDE1My5wbmdcblxuINCt0YLQvtGCINGI0YDQuNGE0YIg0LIg0L7QsdGL0YfQvdC+0Lwg0YjRgNC40YTRgtC1IChzZXJpZikg0YPQt9C60LjQuSDQv9C+INGI0LjRgNC40L3QtSwg0LAg0LIgaWNvbmljIC0g0L3QvtGA0LzQsNC70YzQvdGL0LkuXG4gMikg0JTQsNC70LXQtSDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRgdC+0LfQtNCw0ZHQvCA8c3Bhbj4hPC9zcGFuPiDQuCDQtNCw0ZHQvCDQtdC80YMgZm9udEZhbWlseSDRgdC90LDRh9Cw0LvQsCBzZXJpZiDQuCDQt9Cw0LzQtdGA0Y/QtdC8INGI0LjRgNC40L3Rgywg0LAg0L/QvtGC0L7QvCBGb250SWNvbnMsIHNlcmlmLlxuINCe0YLQu9Cw0LLQu9C40LLQsNC10Lwg0LzQvtC80LXQvdGCLCDQutC+0LPQtNCwINGI0LjRgNC40L3QsCDQuNC30LzQtdC90LjRgtGB0Y8uINCt0YLQviDQt9C90LDRh9C40YIg0YjRgNC40YTRgiDQt9Cw0LPRgNGD0LbQtdC9LlxuINCc0L7QttC90L4g0YPQsdGA0LDRgtGMINC60LvQsNGB0YEgLm5vLWljb25zINC4INC/0L7QutCw0LfQsNGC0Ywg0LjQutC+0L3QutC4LlxuICovXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gIGVsZW0uY2xhc3NOYW1lID0gJ2ZvbnQtdGVzdCc7XG4gIGVsZW0uc3R5bGUuZm9udEZhbWlseSA9ICdzZXJpZic7XG4gIHZhciBpbml0aWFsV2lkdGggPSBlbGVtLm9mZnNldFdpZHRoO1xuXG4gIGVsZW0uc3R5bGUuZm9udEZhbWlseSA9ICcnO1xuXG4gIGZ1bmN0aW9uIGNoZWNrRm9udExvYWRlZCgpIHtcbiAgICBpZiAoaW5pdGlhbFdpZHRoICE9IGVsZW0ub2Zmc2V0V2lkdGgpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taWNvbnMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGltZW91dChjaGVja0ZvbnRMb2FkZWQsIDEwMCk7XG4gICAgfVxuICB9XG5cbiAgY2hlY2tGb250TG9hZGVkKCk7XG5cbn07XG4iLCIvLyB1c2UgZ2xvYmFsIHZhcmlhYmxlcywgYmVjYXVzZSBoZWFkLmpzIGFuZCBtYWluLmpzIGluY2x1ZGUgZGlmZmVyZW50IG1vZHVsZXNcbnZhciBpbml0SGFuZGxlcnMgPSB7fTtcbnZhciBpbml0V2hlblJlYWR5Q2FsbGVkID0ge307XG5cbi8vIFVzYWdlOlxuLy8gIGluaXRXaGVuUmVhZHkoJ2xvZ2luJylcbi8vICAgIHdpbGwgdHJpZ2dlciBhZGRJbml0SGFuZGxlcignbG9naW4nKVxuLy8gICAgYW5kIHdhaXQgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcblxuLy8gaWYgaW5pdFdoZW5SZWFkeSBpcyBmaXJzdCAoZnJvbSBIVE1MKVxuLy8gIC0+IGluaXRXaGVuUmVhZHlDYWxsZWRbbmFtZV0gPSB0cnVlXG4vLyAgLT4gdGhlbiBhZGRJbml0SGFuZGxlciB1c2VzIGl0XG5cbi8vIGlmIGFkZEluaXRIYW5kbGVyIGlzIGZpcnN0IChmcm9tIFNDUklQVClcbi8vICAtPiBpbml0SGFuZGxlcnNbbmFtZV0gPSBoYW5kbGVyXG4vLyAgLT4gdGhlbiBpbml0V2hlblJlYWR5IHVzZXMgaXRcbmZ1bmN0aW9uIGluaXRXaGVuUmVhZHkobmFtZSkge1xuLy8gIGNvbnNvbGUubG9nKFwiaW5pdFdoZW5SZWFkeVwiLCBuYW1lKTtcbiAgaWYgKGluaXRIYW5kbGVyc1tuYW1lXSkge1xuICAgIGluaXRIYW5kbGVyc1tuYW1lXSgpO1xuICB9IGVsc2Uge1xuICAgIGluaXRXaGVuUmVhZHlDYWxsZWRbbmFtZV0gPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZEluaXRIYW5kbGVyKG5hbWUsIGhhbmRsZXIpIHtcbi8vICBjb25zb2xlLmxvZyhcImFkZEluaXRIYW5kbGVyXCIsIG5hbWUsIGhhbmRsZXIpO1xuICBpZiAoaW5pdFdoZW5SZWFkeUNhbGxlZFtuYW1lXSkge1xuICAgIGhhbmRsZXIoKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0SGFuZGxlcnNbbmFtZV0gPSBoYW5kbGVyO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB3aGVuUmVhZHk6IGluaXRXaGVuUmVhZHksXG4gIGFkZEhhbmRsZXI6IGFkZEluaXRIYW5kbGVyXG59O1xuIiwidmFyIHZlcnNpb25zID0gcmVxdWlyZSgnY2xpZW50L3ZlcnNpb25zJyk7XG5cbi8vIGluc2VydCA8c2NyaXB0IHNyYz1cIi4uLlwiPiBpbnRvIGRvY3VtZW50XG4vLyAgIC0tPiBkb2VzIG5vdCBibG9jayByZW5kZXJpbmdcbi8vICAgLS0+IGtlZXBzIGV4ZWN1dGlvbiBvcmRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMpIHtcbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBpZiAodmVyc2lvbnNbc3JjXSkge1xuICAgIHNyYyA9IHNyYy5yZXBsYWNlKCcuanMnLCAnLnYnICsgdmVyc2lvbnNbc3JjXSArICcuanMnKTtcbiAgfVxuICBzY3JpcHQuc3JjID0gc3JjO1xuICBzY3JpcHQuYXN5bmMgPSBvcHRpb25zLmFzeW5jIHx8IGZhbHNlOyAvLyBtYWludGFpbiB0aGUgZXhlY3V0aW9uIG9yZGVyIGlmIGFzeW5jIGlzIG5vdCBzZXRcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICByZXR1cm4gc2NyaXB0OyAvLyBmb3Igb25sb2FkIGhhbmRsZXJzXG59O1xuXG4iLCJ2YXIgaW5pdCA9IHJlcXVpcmUoJy4vaW5pdCcpO1xudmFyIGluc2VydE5vbkJsb2NraW5nU2NyaXB0ID0gcmVxdWlyZSgnLi9pbnNlcnROb25CbG9ja2luZ1NjcmlwdCcpO1xudmFyIE1vZGFsID0gcmVxdWlyZSgnLi9tb2RhbCcpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKCdjbGllbnQvc3Bpbm5lcicpO1xuXG5pbml0LmFkZEhhbmRsZXIoXCJsb2dpblwiLCBmdW5jdGlvbigpIHtcblxuICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpdGV0b29sYmFyX19sb2dpbicpO1xuICBidXR0b24ub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgbG9naW4oKTtcbiAgfTtcblxufSk7XG5cbmZ1bmN0aW9uIGxvZ2luKCkge1xuICB2YXIgbW9kYWwgPSBuZXcgTW9kYWwoKTtcbiAgdmFyIHNwaW5uZXIgPSBuZXcgU3Bpbm5lcigpO1xuICBtb2RhbC5zZXRDb250ZW50KHNwaW5uZXIuZWxlbSk7XG4gIHNwaW5uZXIuc3RhcnQoKTtcbiAgdmFyIHNjcmlwdCA9IGluc2VydE5vbkJsb2NraW5nU2NyaXB0KCcvanMvYXV0aC5qcycpO1xuICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgbW9kYWwucmVtb3ZlKCk7XG4gICAgdmFyIEF1dGhNb2RhbCA9IHJlcXVpcmUoJ2F1dGgvY2xpZW50JykuQXV0aE1vZGFsO1xuICAgIG5ldyBBdXRoTW9kYWwoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpbjtcbiIsInZhciBpbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5cbmluaXQuYWRkSGFuZGxlcihcImxvZ291dFwiLCBmdW5jdGlvbigpIHtcblxuICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpdGV0b29sYmFyX19sb2dvdXQnKTtcbiAgYnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxvZ291dCgpO1xuICB9O1xuICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgndW5yZWFkeScpO1xufSk7XG5cblxuZnVuY3Rpb24gbG9nb3V0KCkge1xuICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgZm9ybS5pbm5lckhUTUwgPSAnPGlucHV0IG5hbWU9XCJfY3NyZlwiIHZhbHVlPVwiJyArIHdpbmRvdy5jc3JmICsgJ1wiPic7XG4gIGZvcm0ubWV0aG9kID0gJ1BPU1QnO1xuICBmb3JtLmFjdGlvbiA9ICcvYXV0aC9sb2dvdXQnO1xuICBmb3JtLnN1Ym1pdCgpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gbG9nb3V0O1xuIiwiZnVuY3Rpb24gTW9kYWwoKSB7XG4gIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVFbmQnLCAnPGRpdiBjbGFzcz1cIm1vZGFsXCI+PGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZ1wiPjwvZGl2PjwvZGl2PicpO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5lbGVtID0gZG9jdW1lbnQuYm9keS5sYXN0Q2hpbGQ7XG4gIHRoaXMuY29udGVudEVsZW0gPSB0aGlzLmVsZW0ubGFzdENoaWxkO1xuXG4gIHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKHRoaXMpO1xuICB0aGlzLm9uRG9jdW1lbnRLZXlEb3duID0gdGhpcy5vbkRvY3VtZW50S2V5RG93bi5iaW5kKHRoaXMpO1xuXG4gIHRoaXMuZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGljayk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbkRvY3VtZW50S2V5RG93bik7XG59XG5cblxuTW9kYWwucHJvdG90eXBlLm9uQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnY2xvc2UtYnV0dG9uJykpIHtcbiAgICB0aGlzLnJlbW92ZSgpO1xuICB9XG59O1xuXG5cbk1vZGFsLnByb3RvdHlwZS5vbkRvY3VtZW50S2V5RG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmIChldmVudC5rZXlDb2RlID09IDI3KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnJlbW92ZSgpO1xuICB9XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUuc2hvd092ZXJsYXkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb250ZW50RWxlbS5jbGFzc0xpc3QuYWRkKCdtb2RhbC1vdmVybGF5Jyk7XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUuaGlkZU92ZXJsYXkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb250ZW50RWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1vdmVybGF5Jyk7XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uKGh0bWxPck5vZGUpIHtcbiAgaWYgKHR5cGVvZiBodG1sT3JOb2RlID09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5jb250ZW50RWxlbS5pbm5lckhUTUwgPSBodG1sT3JOb2RlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY29udGVudEVsZW0uaW5uZXJIVE1MID0gJyc7XG4gICAgdGhpcy5jb250ZW50RWxlbS5hcHBlbmRDaGlsZChodG1sT3JOb2RlKTtcbiAgfVxuICB2YXIgYXV0b2ZvY3VzID0gdGhpcy5jb250ZW50RWxlbS5xdWVyeVNlbGVjdG9yKCdbYXV0b2ZvY3VzXScpO1xuICBpZiAoYXV0b2ZvY3VzKSBhdXRvZm9jdXMuZm9jdXMoKTtcbn07XG5cbk1vZGFsLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmVsZW0pO1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLm9uRG9jdW1lbnRLZXlEb3duKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWw7XG4iLCJ2YXIgbGFzdFBhZ2VZT2Zmc2V0O1xuXG52YXIgaWdub3JlSnVtcCA9IGZhbHNlO1xudmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZUlkO1xuXG4vLyB3aGVuIEkgc2Nyb2xsIGRvd24gb24gTWFjT1MsIENocm9tZSBkb2VzIHRoZSBib3VuY2UgdHJpY2tcbi8vIEF0IHRoZSBwYWdlIGJvdHRvbSBpdCBpcyBwb3NzaWJsZSB0byBzY3JvbGwgYmVsb3cgdGhlIHBhZ2UsIGFuZCB0aGVuIGl0IGdvZXMgYmFjayAoaW5lcnRpYSlcbi8vIHRoZSBwcm9ibGVtIGlzIHRoYXQgdGhlIGFjdHVhbCBzY3JvbGwgZm9yIG1vdXNlIGRvd24gZ29lcyBhIGxpdHRsZSBiaXQgdXBcbnZhciB0b2xlcmFuY2UgPSB7XG4gIHVwOiAgIDEwLCAvLyBiaWcgZW5vdWdoIHRvIGlnbm9yZSBjaHJvbWUgZmFsbGJhY2tcbiAgdXBBdEJvdHRvbTogNjAsXG4gIGRvd246IDEwXG59O1xuXG4vLyBkZWZlciBldmVudCByZWdpc3RyYXRpb24gdG8gaGFuZGxlIGJyb3dzZXJcbi8vIHBvdGVudGlhbGx5IHJlc3RvcmluZyBwcmV2aW91cyBzY3JvbGwgcG9zaXRpb25cbnNldFRpbWVvdXQoaW5pdCwgMjAwKTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgbGFzdFBhZ2VZT2Zmc2V0ID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvbnNjcm9sbCk7XG59XG5cbmZ1bmN0aW9uIG9uc2Nyb2xsKCkge1xuICBpZiAocmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQpIHJldHVybjtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgc2hvd0hpZGVTaXRlVG9vbGJhcigpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZUlkID0gbnVsbDtcbiAgfSk7XG5cbn1cblxuZnVuY3Rpb24gc2hvd0hpZGVTaXRlVG9vbGJhcigpIHtcbiAgaWYgKGlzU2Nyb2xsT3V0T2ZEb2N1bWVudCgpKSB7IC8vIElnbm9yZSBib3VuY3kgc2Nyb2xsaW5nIGluIE9TWFxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzY3JvbGxUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cbiAgdmFyIHNjcm9sbERpcmVjdGlvbiA9IHNjcm9sbFRvcCA+IGxhc3RQYWdlWU9mZnNldCA/ICdkb3duJyA6ICd1cCc7XG4gIHZhciBzY3JvbGxEaWZmID0gTWF0aC5hYnMoc2Nyb2xsVG9wIC0gbGFzdFBhZ2VZT2Zmc2V0KTtcblxuLy8gIGNvbnNvbGUubG9nKFwic2Nyb2xsRGlmZlwiLCBzY3JvbGxEaWZmKTtcblxuICAvLyDQtdGB0LvQuCDQv9GA0L7QutGA0YPRgtC40LvQuCDQvNCw0LvQviAtINC90LjRh9C10LPQviDQvdC1INC00LXQu9Cw0LXQvCwg0L3QviDQuCDRgtC+0YfQutGDINC+0YLRgdGH0ZHRgtCwINC90LUg0LzQtdC90Y/QtdC8XG4gIGlmICh0b2xlcmFuY2Vbc2Nyb2xsRGlyZWN0aW9uXSA+IHNjcm9sbERpZmYpIHJldHVybjtcblxuICAvLyDQsiBNYWNPcyDQv9GA0Lgg0L/RgNC+0LrRgNGD0YLQutC1INCy0L3QuNC3INCy0L7Qt9C80L7QttC10L0g0LjQvdC10YDRhtC40L7QvdC90YvQuSDQvtGC0YHQutC+0Log0L3QsNCy0LXRgNGFXG4gIC8vINC10YHQu9C4INC80Ysg0LLQvdC40LfRgyDRgdGC0YDQsNC90LjRhtGLLCDRgtC+IHRvbGVyYW5jZSDQstGL0YjQtVxuICB2YXIgc2Nyb2xsQm90dG9tID0gZ2V0RG9jdW1lbnRIZWlnaHQoKSAtIHNjcm9sbFRvcCAtIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgaWYgKHNjcm9sbERpcmVjdGlvbiA9PSAndXAnICYmIHNjcm9sbEJvdHRvbSA8IHRvbGVyYW5jZS51cEF0Qm90dG9tICYmIHNjcm9sbFRvcCA+IHRvbGVyYW5jZS51cEF0Qm90dG9tKSByZXR1cm47XG5cbiAgbGFzdFBhZ2VZT2Zmc2V0ID0gc2Nyb2xsVG9wO1xuXG4gIGlmIChpZ25vcmVKdW1wKSByZXR1cm47XG5cbi8vICBjb25zb2xlLmxvZyhzY3JvbGxEaXJlY3Rpb24sIHNjcm9sbERpZmYsIHRvbGVyYW5jZVtzY3JvbGxEaXJlY3Rpb25dKTtcblxuXG4gIGlmIChzY3JvbGxUb3AgPT09IDAgfHwgc2Nyb2xsRGlyZWN0aW9uID09ICd1cCcpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbGVkLW91dCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzY3JvbGxEaXJlY3Rpb24gPT0gJ2Rvd24nKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdzY3JvbGxlZC1vdXQnKTtcbiAgfVxuXG59XG5cbi8qKlxuICogZGV0ZXJtaW5lcyBpZiB0aGUgc2Nyb2xsIHBvc2l0aW9uIGlzIG91dHNpZGUgb2YgZG9jdW1lbnQgYm91bmRhcmllc1xuICogQHBhcmFtICB7aW50fSAgY3VycmVudFNjcm9sbFkgdGhlIGN1cnJlbnQgeSBzY3JvbGwgcG9zaXRpb25cbiAqIEByZXR1cm4ge2Jvb2x9IHRydWUgaWYgb3V0IG9mIGJvdW5kcywgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmZ1bmN0aW9uIGlzU2Nyb2xsT3V0T2ZEb2N1bWVudCgpIHtcbiAgdmFyIHBhc3RUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgPCAwLFxuICAgICAgcGFzdEJvdHRvbSA9IHdpbmRvdy5wYWdlWU9mZnNldCArIHdpbmRvdy5pbm5lckhlaWdodCA+IGdldERvY3VtZW50SGVpZ2h0KCk7XG5cbiAgcmV0dXJuIHBhc3RUb3AgfHwgcGFzdEJvdHRvbTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBoZWlnaHQgb2YgdGhlIGRvY3VtZW50XG4gKiBAc2VlIGh0dHA6Ly9qYW1lcy5wYWRvbHNleS5jb20vamF2YXNjcmlwdC9nZXQtZG9jdW1lbnQtaGVpZ2h0LWNyb3NzLWJyb3dzZXIvXG4gKiBAcmV0dXJuIHtpbnR9IHRoZSBoZWlnaHQgb2YgdGhlIGRvY3VtZW50IGluIHBpeGVsc1xuICovXG5mdW5jdGlvbiBnZXREb2N1bWVudEhlaWdodCgpIHtcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5LFxuICAgICAgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gIHJldHVybiBNYXRoLm1heChcbiAgICBib2R5LnNjcm9sbEhlaWdodCwgZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCxcbiAgICBib2R5Lm9mZnNldEhlaWdodCwgZG9jdW1lbnRFbGVtZW50Lm9mZnNldEhlaWdodCxcbiAgICBib2R5LmNsaWVudEhlaWdodCwgZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICApO1xufVxuXG4vKlxuIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcbiBjb25zb2xlLmxvZyh3aW5kb3cucGFnZVlPZmZzZXQpO1xuIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gaWYgKHdpbmRvdy5wYWdlWU9mZnNldCA8IGxhc3RQYWdlWU9mZnNldCB8fCB3aW5kb3cucGFnZVlPZmZzZXQgPCA1KSB7XG4gY29uc29sZS5sb2coXCJVUFwiKTtcbiAvLyBzY3JvbGxlZCB1cFxuIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsZWQtb3V0Jyk7XG4gfSBlbHNlIGlmICh3aW5kb3cucGFnZVlPZmZzZXQgPiBsYXN0UGFnZVlPZmZzZXQgKyAzMCkge1xuIGNvbnNvbGUubG9nKFwiRE9XTlwiKTtcbiAvLyBzY3JvbGxlZCBkb3duLCBoaWRlIG5hdlxuIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnc2Nyb2xsZWQtb3V0Jyk7XG4gfVxuXG4gbGFzdFBhZ2VZT2Zmc2V0ID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuIC8vIH0sIDEwMCk7XG4gfSk7XG4gKi9cbi8vIGRvbid0IGF1dG9zY3JvbGwgYWZ0ZXIgYSBjbGljayBvbiBhIG5hdmlnYXRpb24gaGVhZGVyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICBpZ25vcmVKdW1wID0gdHJ1ZTtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBpZ25vcmVKdW1wID0gZmFsc2U7XG4gIH0sIDApO1xufSk7XG4iLCIvLyBpZiBjbGFzcyBlbmRzIHdpdGggX3VucmVhZHkgdGhlbiB3ZSBjb25zaWRlciBlbGVtZW50IHVudXNhYmxlICh5ZXQpXG5cblxuLy8gY2FuY2VsIGNsaWNrcyBvbiA8YSBjbGFzcz1cInVucmVhZHlcIj4gYW5kIDxidXR0b24gY2xhc3M9XCJ1bnJlYWR5XCI+XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgd2hpbGUgKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lLm1hdGNoKC9fdW5yZWFkeVxcYi8pKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgfVxufSk7XG5cbi8vIGNhbmNlbCBzdWJtaXRzIG9mIDxmb3JtIGNsYXNzPVwidW5yZWFkeVwiPlxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihlKSB7XG4gIGlmIChlLnRhcmdldC5jbGFzc05hbWUubWF0Y2goL191bnJlYWR5XFxiLykpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59KTtcbiIsIi8vIFVzYWdlOlxuLy8gIDEpIG5ldyBTcGlubmVyKHsgZWxlbTogZWxlbX0pIC0+IHN0YXJ0L3N0b3AoKVxuLy8gIDIpIG5ldyBTcGlubmVyKCkgLT4gc29tZXdoZXJlLmFwcGVuZChzcGlubmVyLmVsZW0pIC0+IHN0YXJ0L3N0b3BcbmZ1bmN0aW9uIFNwaW5uZXIob3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5lbGVtID0gb3B0aW9ucy5lbGVtO1xuICB0aGlzLnNpemUgPSBvcHRpb25zLnNpemUgfHwgJ21lZGl1bSc7XG4gIC8vIGFueSBjbGFzcyB0byBhZGQgdG8gc3Bpbm5lciAobWFrZSBzcGlubmVyIHNwZWNpYWwgaGVyZSlcbiAgdGhpcy5jbGFzcyA9IG9wdGlvbnMuY2xhc3MgPyAoJyAnICsgb3B0aW9ucy5jbGFzcykgOiAnJztcblxuICAvLyBhbnkgY2xhc3MgdG8gYWRkIHRvIGVsZW1lbnQgKHRvIGhpZGUgaXQncyBjb250ZW50IGZvciBpbnN0YW5jZSlcbiAgdGhpcy5lbGVtQ2xhc3MgPSBvcHRpb25zLmVsZW1DbGFzcztcblxuICBpZiAodGhpcy5zaXplICE9ICdtZWRpdW0nICYmIHRoaXMuc2l6ZSAhPSAnc21hbGwnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgc2l6ZTogXCIgKyB0aGlzLnNpemUpO1xuICB9XG5cbiAgaWYgKCF0aGlzLmVsZW0pIHtcbiAgICB0aGlzLmVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgfVxufVxuXG5TcGlubmVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5lbGVtQ2xhc3MpIHtcbiAgICB0aGlzLmVsZW0uY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmVsZW1DbGFzcyk7XG4gIH1cblxuICB0aGlzLmVsZW0uaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCAnPHNwYW4gY2xhc3M9XCJzcGlubmVyIHNwaW5uZXJfYWN0aXZlIHNwaW5uZXJfJyArIHRoaXMuc2l6ZSArIHRoaXMuY2xhc3MgKyAnXCI+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzFcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzJcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzNcIj48L3NwYW4+PC9zcGFuPicpO1xufTtcblxuU3Bpbm5lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW0ucmVtb3ZlQ2hpbGQodGhpcy5lbGVtLnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyJykpO1xuXG4gIGlmICh0aGlzLmVsZW1DbGFzcykge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuZWxlbUNsYXNzKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGlubmVyO1xuIiwibW9kdWxlLmV4cG9ydHM9e1wiL2pzL2F1dGguanNcIjpcIjcxMzA3M1wiLFwiL2pzL3Byb2ZpbGUuanNcIjpcIjlmNTBjZVwiLFwiL2pzL3R1dG9yaWFsLmpzXCI6XCI3MTFlODdcIixcIi9qcy9mb290ZXIuanNcIjpcImRhODEyM1wifSIsIlxuZXhwb3J0cy5pbnNlcnROb25CbG9ja2luZ1NjcmlwdCA9IHJlcXVpcmUoJy4vaW5zZXJ0Tm9uQmxvY2tpbmdTY3JpcHQnKTtcbnJlcXVpcmUoJy4vdW5yZWFkeScpO1xuZXhwb3J0cy5pbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5leHBvcnRzLmxvZ2luID0gcmVxdWlyZSgnLi9sb2dpbicpO1xuZXhwb3J0cy5sb2dvdXQgPSByZXF1aXJlKCcuL2xvZ291dCcpO1xuZXhwb3J0cy5Nb2RhbCA9IHJlcXVpcmUoJy4vbW9kYWwnKTtcbmV4cG9ydHMuZm9udFRlc3QgPSByZXF1aXJlKCcuL2ZvbnRUZXN0Jyk7XG5cbnJlcXVpcmUoJy4vc2l0ZXRvb2xiYXInKTtcbiJdfQ==
