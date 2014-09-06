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

// insert <script src="..."> into document
//   --> does not block rendering
//   --> keeps execution order
module.exports = function(src) {
  var script = document.createElement('script');
  script.src = src;
  script.async = false; // maintain the execution order
  document.head.appendChild(script);
  return script; // for onload handlers
};


},{}],"/root/javascript-nodejs/node_modules/client/head/login.js":[function(require,module,exports){
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

  this.elem = document.body.lastChild;
  this.contentElem = this.elem.lastChild;

//  this.onClick = this.onClick.bind(this);
  this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

//  this.elem.addEventListener("click", this.onClick);
  document.addEventListener("keydown", this.onDocumentKeyDown);
}

/*
Modal.prototype.onClick = function(event) {
  if (event.target == this.elem) { // click on the outer element, outside of the window
    this.remove();
  }
};
*/
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svcHJlbHVkZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9mb250VGVzdC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9pbml0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2luc2VydE5vbkJsb2NraW5nU2NyaXB0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2xvZ2luLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2xvZ291dC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9tb2RhbC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9zaXRldG9vbGJhci5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC91bnJlYWR5LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9zcGlubmVyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gbW9kdWxlcyBhcmUgZGVmaW5lZCBhcyBhbiBhcnJheVxuLy8gWyBtb2R1bGUgZnVuY3Rpb24sIG1hcCBvZiByZXF1aXJldWlyZXMgXVxuLy9cbi8vIG1hcCBvZiByZXF1aXJldWlyZXMgaXMgc2hvcnQgcmVxdWlyZSBuYW1lIC0+IG51bWVyaWMgcmVxdWlyZVxuLy9cbi8vIGFueXRoaW5nIGRlZmluZWQgaW4gYSBwcmV2aW91cyBidW5kbGUgaXMgYWNjZXNzZWQgdmlhIHRoZVxuLy8gb3JpZyBtZXRob2Qgd2hpY2ggaXMgdGhlIHJlcXVpcmV1aXJlIGZvciBwcmV2aW91cyBidW5kbGVzXG5cbihmdW5jdGlvbiBvdXRlciAobW9kdWxlcywgY2FjaGUsIGVudHJ5KSB7XG4gICAgLy8gU2F2ZSB0aGUgcmVxdWlyZSBmcm9tIHByZXZpb3VzIGJ1bmRsZSB0byB0aGlzIGNsb3N1cmUgaWYgYW55XG4gICAgdmFyIHByZXZpb3VzUmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuXG4gICAgZnVuY3Rpb24gbmV3UmVxdWlyZShuYW1lLCBqdW1wZWQpe1xuICAgICAgICBpZighY2FjaGVbbmFtZV0pIHtcbiAgICAgICAgICAgIGlmKCFtb2R1bGVzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgY2Fubm90IGZpbmQgdGhlIHRoZSBtb2R1bGUgd2l0aGluIG91ciBpbnRlcm5hbCBtYXAgb3JcbiAgICAgICAgICAgICAgICAvLyBjYWNoZSBqdW1wIHRvIHRoZSBjdXJyZW50IGdsb2JhbCByZXF1aXJlIGllLiB0aGUgbGFzdCBidW5kbGVcbiAgICAgICAgICAgICAgICAvLyB0aGF0IHdhcyBhZGRlZCB0byB0aGUgcGFnZS5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFJlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcbiAgICAgICAgICAgICAgICBpZiAoIWp1bXBlZCAmJiBjdXJyZW50UmVxdWlyZSkgcmV0dXJuIGN1cnJlbnRSZXF1aXJlKG5hbWUsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIGJ1bmRsZXMgb24gdGhpcyBwYWdlIHRoZSByZXF1aXJlIGZyb20gdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMgb25lIGlzIHNhdmVkIHRvICdwcmV2aW91c1JlcXVpcmUnLiBSZXBlYXQgdGhpcyBhc1xuICAgICAgICAgICAgICAgIC8vIG1hbnkgdGltZXMgYXMgdGhlcmUgYXJlIGJ1bmRsZXMgdW50aWwgdGhlIG1vZHVsZSBpcyBmb3VuZCBvclxuICAgICAgICAgICAgICAgIC8vIHdlIGV4aGF1c3QgdGhlIHJlcXVpcmUgY2hhaW4uXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzUmVxdWlyZSkgcmV0dXJuIHByZXZpb3VzUmVxdWlyZShuYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdDYW5ub3QgZmluZCBtb2R1bGUgXFwnJyArIG5hbWUgKyAnXFwnJyk7XG4gICAgICAgICAgICAgICAgZXJyLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG0gPSBjYWNoZVtuYW1lXSA9IHtleHBvcnRzOnt9fTtcbiAgICAgICAgICAgIG1vZHVsZXNbbmFtZV1bMF0uY2FsbChtLmV4cG9ydHMsIGZ1bmN0aW9uKHgpe1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IG1vZHVsZXNbbmFtZV1bMV1beF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld1JlcXVpcmUoaWQgPyBpZCA6IHgpO1xuICAgICAgICAgICAgfSxtLG0uZXhwb3J0cyxvdXRlcixtb2R1bGVzLGNhY2hlLGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICB9XG4gICAgZm9yKHZhciBpPTA7aTxlbnRyeS5sZW5ndGg7aSsrKSBuZXdSZXF1aXJlKGVudHJ5W2ldKTtcblxuICAgIC8vIE92ZXJyaWRlIHRoZSBjdXJyZW50IHJlcXVpcmUgd2l0aCB0aGlzIG5ldyBvbmVcbiAgICByZXR1cm4gbmV3UmVxdWlyZTtcbn0pXG4iLCIvKlxu0JjQt9Cx0LXQs9Cw0LXQvCBGT1VUIC0g0L/RgNC+0YHRgtC+0Lkg0YHQv9C+0YHQvtCxINC/0YDQvtCy0LXRgNC60Lgg0LfQsNCz0YDRg9C30LrQuCDQuNC60L7QvdC40Log0YjRgNC40YTRgtCwLlxuIDEpINCU0LXQu9Cw0LXQvCDQsiBpY29uaWMg0YjRgNC40YTRgtC1INC+0LTQuNC9INGB0LjQvNCy0L7QuyDRgSDQutC+0LTQvtC8IDIxICjQstC80LXRgdGC0L4gwqshwrspXG4g0JIgaWNvbm1vb25cbiBodHRwOi8vaWx5YWthbnRvci5ydS9zY3JlZW4vMjAxNC0wOS0wNl8wMTUyLnBuZ1xuIGh0dHA6Ly9pbHlha2FudG9yLnJ1L3NjcmVlbi8yMDE0LTA5LTA2XzAxNTMucG5nXG5cbiDQrdGC0L7RgiDRiNGA0LjRhNGCINCyINC+0LHRi9GH0L3QvtC8INGI0YDQuNGE0YLQtSAoc2VyaWYpINGD0LfQutC40Lkg0L/QviDRiNC40YDQuNC90LUsINCwINCyIGljb25pYyAtINC90L7RgNC80LDQu9GM0L3Ri9C5LlxuIDIpINCU0LDQu9C10LUg0L/RgNC4INC30LDQs9GA0YPQt9C60LUg0YHQvtC30LTQsNGR0LwgPHNwYW4+ITwvc3Bhbj4g0Lgg0LTQsNGR0Lwg0LXQvNGDIGZvbnRGYW1pbHkg0YHQvdCw0YfQsNC70LAgc2VyaWYg0Lgg0LfQsNC80LXRgNGP0LXQvCDRiNC40YDQuNC90YMsINCwINC/0L7RgtC+0LwgRm9udEljb25zLCBzZXJpZi5cbiDQntGC0LvQsNCy0LvQuNCy0LDQtdC8INC80L7QvNC10L3Rgiwg0LrQvtCz0LTQsCDRiNC40YDQuNC90LAg0LjQt9C80LXQvdC40YLRgdGPLiDQrdGC0L4g0LfQvdCw0YfQuNGCINGI0YDQuNGE0YIg0LfQsNCz0YDRg9C20LXQvS5cbiDQnNC+0LbQvdC+INGD0LHRgNCw0YLRjCDQutC70LDRgdGBIC5uby1pY29ucyDQuCDQv9C+0LrQsNC30LDRgtGMINC40LrQvtC90LrQuC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgZWxlbS5jbGFzc05hbWUgPSAnZm9udC10ZXN0JztcbiAgZWxlbS5zdHlsZS5mb250RmFtaWx5ID0gJ3NlcmlmJztcbiAgdmFyIGluaXRpYWxXaWR0aCA9IGVsZW0ub2Zmc2V0V2lkdGg7XG5cbiAgZWxlbS5zdHlsZS5mb250RmFtaWx5ID0gJyc7XG5cbiAgZnVuY3Rpb24gY2hlY2tGb250TG9hZGVkKCkge1xuICAgIGlmIChpbml0aWFsV2lkdGggIT0gZWxlbS5vZmZzZXRXaWR0aCkge1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1pY29ucycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KGNoZWNrRm9udExvYWRlZCwgMTAwKTtcbiAgICB9XG4gIH1cblxuICBjaGVja0ZvbnRMb2FkZWQoKTtcblxufTtcbiIsIi8vIHVzZSBnbG9iYWwgdmFyaWFibGVzLCBiZWNhdXNlIGhlYWQuanMgYW5kIG1haW4uanMgaW5jbHVkZSBkaWZmZXJlbnQgbW9kdWxlc1xudmFyIGluaXRIYW5kbGVycyA9IHt9O1xudmFyIGluaXRXaGVuUmVhZHlDYWxsZWQgPSB7fTtcblxuLy8gVXNhZ2U6XG4vLyAgaW5pdFdoZW5SZWFkeSgnbG9naW4nKVxuLy8gICAgd2lsbCB0cmlnZ2VyIGFkZEluaXRIYW5kbGVyKCdsb2dpbicpXG4vLyAgICBhbmQgd2FpdCBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldFxuXG4vLyBpZiBpbml0V2hlblJlYWR5IGlzIGZpcnN0IChmcm9tIEhUTUwpXG4vLyAgLT4gaW5pdFdoZW5SZWFkeUNhbGxlZFtuYW1lXSA9IHRydWVcbi8vICAtPiB0aGVuIGFkZEluaXRIYW5kbGVyIHVzZXMgaXRcblxuLy8gaWYgYWRkSW5pdEhhbmRsZXIgaXMgZmlyc3QgKGZyb20gU0NSSVBUKVxuLy8gIC0+IGluaXRIYW5kbGVyc1tuYW1lXSA9IGhhbmRsZXJcbi8vICAtPiB0aGVuIGluaXRXaGVuUmVhZHkgdXNlcyBpdFxuZnVuY3Rpb24gaW5pdFdoZW5SZWFkeShuYW1lKSB7XG4vLyAgY29uc29sZS5sb2coXCJpbml0V2hlblJlYWR5XCIsIG5hbWUpO1xuICBpZiAoaW5pdEhhbmRsZXJzW25hbWVdKSB7XG4gICAgaW5pdEhhbmRsZXJzW25hbWVdKCk7XG4gIH0gZWxzZSB7XG4gICAgaW5pdFdoZW5SZWFkeUNhbGxlZFtuYW1lXSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkSW5pdEhhbmRsZXIobmFtZSwgaGFuZGxlcikge1xuLy8gIGNvbnNvbGUubG9nKFwiYWRkSW5pdEhhbmRsZXJcIiwgbmFtZSwgaGFuZGxlcik7XG4gIGlmIChpbml0V2hlblJlYWR5Q2FsbGVkW25hbWVdKSB7XG4gICAgaGFuZGxlcigpO1xuICB9IGVsc2Uge1xuICAgIGluaXRIYW5kbGVyc1tuYW1lXSA9IGhhbmRsZXI7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHdoZW5SZWFkeTogaW5pdFdoZW5SZWFkeSxcbiAgYWRkSGFuZGxlcjogYWRkSW5pdEhhbmRsZXJcbn07XG4iLCJcbi8vIGluc2VydCA8c2NyaXB0IHNyYz1cIi4uLlwiPiBpbnRvIGRvY3VtZW50XG4vLyAgIC0tPiBkb2VzIG5vdCBibG9jayByZW5kZXJpbmdcbi8vICAgLS0+IGtlZXBzIGV4ZWN1dGlvbiBvcmRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzcmMpIHtcbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzY3JpcHQuc3JjID0gc3JjO1xuICBzY3JpcHQuYXN5bmMgPSBmYWxzZTsgLy8gbWFpbnRhaW4gdGhlIGV4ZWN1dGlvbiBvcmRlclxuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIHJldHVybiBzY3JpcHQ7IC8vIGZvciBvbmxvYWQgaGFuZGxlcnNcbn07XG5cbiIsInZhciBpbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG52YXIgaW5zZXJ0Tm9uQmxvY2tpbmdTY3JpcHQgPSByZXF1aXJlKCcuL2luc2VydE5vbkJsb2NraW5nU2NyaXB0Jyk7XG52YXIgTW9kYWwgPSByZXF1aXJlKCcuL21vZGFsJyk7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoJ2NsaWVudC9zcGlubmVyJyk7XG5cbmluaXQuYWRkSGFuZGxlcihcImxvZ2luXCIsIGZ1bmN0aW9uKCkge1xuXG4gIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZXRvb2xiYXJfX2xvZ2luJyk7XG4gIGJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBsb2dpbigpO1xuICB9O1xuXG59KTtcblxuZnVuY3Rpb24gbG9naW4oKSB7XG4gIHZhciBtb2RhbCA9IG5ldyBNb2RhbCgpO1xuICB2YXIgc3Bpbm5lciA9IG5ldyBTcGlubmVyKCk7XG4gIG1vZGFsLnNldENvbnRlbnQoc3Bpbm5lci5lbGVtKTtcbiAgc3Bpbm5lci5zdGFydCgpO1xuICB2YXIgc2NyaXB0ID0gaW5zZXJ0Tm9uQmxvY2tpbmdTY3JpcHQoJy9qcy9hdXRoLmpzJyk7XG4gIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBtb2RhbC5yZW1vdmUoKTtcbiAgICB2YXIgQXV0aE1vZGFsID0gcmVxdWlyZSgnYXV0aC9jbGllbnQnKS5BdXRoTW9kYWw7XG4gICAgbmV3IEF1dGhNb2RhbCgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luO1xuIiwidmFyIGluaXQgPSByZXF1aXJlKCcuL2luaXQnKTtcblxuaW5pdC5hZGRIYW5kbGVyKFwibG9nb3V0XCIsIGZ1bmN0aW9uKCkge1xuXG4gIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZXRvb2xiYXJfX2xvZ291dCcpO1xuICBidXR0b24ub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgbG9nb3V0KCk7XG4gIH07XG4gIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCd1bnJlYWR5Jyk7XG59KTtcblxuXG5mdW5jdGlvbiBsb2dvdXQoKSB7XG4gIHZhciBmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICBmb3JtLmlubmVySFRNTCA9ICc8aW5wdXQgbmFtZT1cIl9jc3JmXCIgdmFsdWU9XCInICsgd2luZG93LmNzcmYgKyAnXCI+JztcbiAgZm9ybS5tZXRob2QgPSAnUE9TVCc7XG4gIGZvcm0uYWN0aW9uID0gJy9hdXRoL2xvZ291dCc7XG4gIGZvcm0uc3VibWl0KCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBsb2dvdXQ7XG4iLCJmdW5jdGlvbiBNb2RhbCgpIHtcbiAgZG9jdW1lbnQuYm9keS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZUVuZCcsICc8ZGl2IGNsYXNzPVwibW9kYWxcIj48ZGl2IGNsYXNzPVwibW9kYWwtZGlhbG9nXCI+PC9kaXY+PC9kaXY+Jyk7XG5cbiAgdGhpcy5lbGVtID0gZG9jdW1lbnQuYm9keS5sYXN0Q2hpbGQ7XG4gIHRoaXMuY29udGVudEVsZW0gPSB0aGlzLmVsZW0ubGFzdENoaWxkO1xuXG4vLyAgdGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQodGhpcyk7XG4gIHRoaXMub25Eb2N1bWVudEtleURvd24gPSB0aGlzLm9uRG9jdW1lbnRLZXlEb3duLmJpbmQodGhpcyk7XG5cbi8vICB0aGlzLmVsZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMub25DbGljayk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMub25Eb2N1bWVudEtleURvd24pO1xufVxuXG4vKlxuTW9kYWwucHJvdG90eXBlLm9uQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuZWxlbSkgeyAvLyBjbGljayBvbiB0aGUgb3V0ZXIgZWxlbWVudCwgb3V0c2lkZSBvZiB0aGUgd2luZG93XG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfVxufTtcbiovXG5Nb2RhbC5wcm90b3R5cGUub25Eb2N1bWVudEtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoZXZlbnQua2V5Q29kZSA9PSAyNykge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfVxufTtcblxuTW9kYWwucHJvdG90eXBlLnNob3dPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29udGVudEVsZW0uY2xhc3NMaXN0LmFkZCgnbW9kYWwtb3ZlcmxheScpO1xufTtcblxuTW9kYWwucHJvdG90eXBlLmhpZGVPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29udGVudEVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtb3ZlcmxheScpO1xufTtcblxuTW9kYWwucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbihodG1sT3JOb2RlKSB7XG4gIGlmICh0eXBlb2YgaHRtbE9yTm9kZSA9PSAnc3RyaW5nJykge1xuICAgIHRoaXMuY29udGVudEVsZW0uaW5uZXJIVE1MID0gaHRtbE9yTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvbnRlbnRFbGVtLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuY29udGVudEVsZW0uYXBwZW5kQ2hpbGQoaHRtbE9yTm9kZSk7XG4gIH1cbiAgdmFyIGF1dG9mb2N1cyA9IHRoaXMuY29udGVudEVsZW0ucXVlcnlTZWxlY3RvcignW2F1dG9mb2N1c10nKTtcbiAgaWYgKGF1dG9mb2N1cykgYXV0b2ZvY3VzLmZvY3VzKCk7XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5lbGVtKTtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbkRvY3VtZW50S2V5RG93bik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsO1xuIiwidmFyIGxhc3RQYWdlWU9mZnNldDtcblxudmFyIGlnbm9yZUp1bXAgPSBmYWxzZTtcbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZDtcblxuLy8gd2hlbiBJIHNjcm9sbCBkb3duIG9uIE1hY09TLCBDaHJvbWUgZG9lcyB0aGUgYm91bmNlIHRyaWNrXG4vLyBBdCB0aGUgcGFnZSBib3R0b20gaXQgaXMgcG9zc2libGUgdG8gc2Nyb2xsIGJlbG93IHRoZSBwYWdlLCBhbmQgdGhlbiBpdCBnb2VzIGJhY2sgKGluZXJ0aWEpXG4vLyB0aGUgcHJvYmxlbSBpcyB0aGF0IHRoZSBhY3R1YWwgc2Nyb2xsIGZvciBtb3VzZSBkb3duIGdvZXMgYSBsaXR0bGUgYml0IHVwXG52YXIgdG9sZXJhbmNlID0ge1xuICB1cDogICAxMCwgLy8gYmlnIGVub3VnaCB0byBpZ25vcmUgY2hyb21lIGZhbGxiYWNrXG4gIHVwQXRCb3R0b206IDYwLFxuICBkb3duOiAxMFxufTtcblxuLy8gZGVmZXIgZXZlbnQgcmVnaXN0cmF0aW9uIHRvIGhhbmRsZSBicm93c2VyXG4vLyBwb3RlbnRpYWxseSByZXN0b3JpbmcgcHJldmlvdXMgc2Nyb2xsIHBvc2l0aW9uXG5zZXRUaW1lb3V0KGluaXQsIDIwMCk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGxhc3RQYWdlWU9mZnNldCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25zY3JvbGwpO1xufVxuXG5mdW5jdGlvbiBvbnNjcm9sbCgpIHtcbiAgaWYgKHJlcXVlc3RBbmltYXRpb25GcmFtZUlkKSByZXR1cm47XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgIHNob3dIaWRlU2l0ZVRvb2xiYXIoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZCA9IG51bGw7XG4gIH0pO1xuXG59XG5cbmZ1bmN0aW9uIHNob3dIaWRlU2l0ZVRvb2xiYXIoKSB7XG4gIGlmIChpc1Njcm9sbE91dE9mRG9jdW1lbnQoKSkgeyAvLyBJZ25vcmUgYm91bmN5IHNjcm9sbGluZyBpbiBPU1hcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuXG4gIHZhciBzY3JvbGxEaXJlY3Rpb24gPSBzY3JvbGxUb3AgPiBsYXN0UGFnZVlPZmZzZXQgPyAnZG93bicgOiAndXAnO1xuICB2YXIgc2Nyb2xsRGlmZiA9IE1hdGguYWJzKHNjcm9sbFRvcCAtIGxhc3RQYWdlWU9mZnNldCk7XG5cbi8vICBjb25zb2xlLmxvZyhcInNjcm9sbERpZmZcIiwgc2Nyb2xsRGlmZik7XG5cbiAgLy8g0LXRgdC70Lgg0L/RgNC+0LrRgNGD0YLQuNC70Lgg0LzQsNC70L4gLSDQvdC40YfQtdCz0L4g0L3QtSDQtNC10LvQsNC10LwsINC90L4g0Lgg0YLQvtGH0LrRgyDQvtGC0YHRh9GR0YLQsCDQvdC1INC80LXQvdGP0LXQvFxuICBpZiAodG9sZXJhbmNlW3Njcm9sbERpcmVjdGlvbl0gPiBzY3JvbGxEaWZmKSByZXR1cm47XG5cbiAgLy8g0LIgTWFjT3Mg0L/RgNC4INC/0YDQvtC60YDRg9GC0LrQtSDQstC90LjQtyDQstC+0LfQvNC+0LbQtdC9INC40L3QtdGA0YbQuNC+0L3QvdGL0Lkg0L7RgtGB0LrQvtC6INC90LDQstC10YDRhVxuICAvLyDQtdGB0LvQuCDQvNGLINCy0L3QuNC30YMg0YHRgtGA0LDQvdC40YbRiywg0YLQviB0b2xlcmFuY2Ug0LLRi9GI0LVcbiAgdmFyIHNjcm9sbEJvdHRvbSA9IGdldERvY3VtZW50SGVpZ2h0KCkgLSBzY3JvbGxUb3AgLSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIGlmIChzY3JvbGxEaXJlY3Rpb24gPT0gJ3VwJyAmJiBzY3JvbGxCb3R0b20gPCB0b2xlcmFuY2UudXBBdEJvdHRvbSAmJiBzY3JvbGxUb3AgPiB0b2xlcmFuY2UudXBBdEJvdHRvbSkgcmV0dXJuO1xuXG4gIGxhc3RQYWdlWU9mZnNldCA9IHNjcm9sbFRvcDtcblxuICBpZiAoaWdub3JlSnVtcCkgcmV0dXJuO1xuXG4vLyAgY29uc29sZS5sb2coc2Nyb2xsRGlyZWN0aW9uLCBzY3JvbGxEaWZmLCB0b2xlcmFuY2Vbc2Nyb2xsRGlyZWN0aW9uXSk7XG5cblxuICBpZiAoc2Nyb2xsVG9wID09PSAwIHx8IHNjcm9sbERpcmVjdGlvbiA9PSAndXAnKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGxlZC1vdXQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc2Nyb2xsRGlyZWN0aW9uID09ICdkb3duJykge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnc2Nyb2xsZWQtb3V0Jyk7XG4gIH1cblxufVxuXG4vKipcbiAqIGRldGVybWluZXMgaWYgdGhlIHNjcm9sbCBwb3NpdGlvbiBpcyBvdXRzaWRlIG9mIGRvY3VtZW50IGJvdW5kYXJpZXNcbiAqIEBwYXJhbSAge2ludH0gIGN1cnJlbnRTY3JvbGxZIHRoZSBjdXJyZW50IHkgc2Nyb2xsIHBvc2l0aW9uXG4gKiBAcmV0dXJuIHtib29sfSB0cnVlIGlmIG91dCBvZiBib3VuZHMsIGZhbHNlIG90aGVyd2lzZVxuICovXG5mdW5jdGlvbiBpc1Njcm9sbE91dE9mRG9jdW1lbnQoKSB7XG4gIHZhciBwYXN0VG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IDwgMCxcbiAgICAgIHBhc3RCb3R0b20gPSB3aW5kb3cucGFnZVlPZmZzZXQgKyB3aW5kb3cuaW5uZXJIZWlnaHQgPiBnZXREb2N1bWVudEhlaWdodCgpO1xuXG4gIHJldHVybiBwYXN0VG9wIHx8IHBhc3RCb3R0b207XG59XG5cbi8qKlxuICogR2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSBkb2N1bWVudFxuICogQHNlZSBodHRwOi8vamFtZXMucGFkb2xzZXkuY29tL2phdmFzY3JpcHQvZ2V0LWRvY3VtZW50LWhlaWdodC1jcm9zcy1icm93c2VyL1xuICogQHJldHVybiB7aW50fSB0aGUgaGVpZ2h0IG9mIHRoZSBkb2N1bWVudCBpbiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gZ2V0RG9jdW1lbnRIZWlnaHQoKSB7XG4gIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keSxcbiAgICAgIGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuICByZXR1cm4gTWF0aC5tYXgoXG4gICAgYm9keS5zY3JvbGxIZWlnaHQsIGRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQsXG4gICAgYm9keS5vZmZzZXRIZWlnaHQsIGRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHQsXG4gICAgYm9keS5jbGllbnRIZWlnaHQsIGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgKTtcbn1cblxuLypcbiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gY29uc29sZS5sb2cod2luZG93LnBhZ2VZT2Zmc2V0KTtcbiAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuIGlmICh3aW5kb3cucGFnZVlPZmZzZXQgPCBsYXN0UGFnZVlPZmZzZXQgfHwgd2luZG93LnBhZ2VZT2Zmc2V0IDwgNSkge1xuIGNvbnNvbGUubG9nKFwiVVBcIik7XG4gLy8gc2Nyb2xsZWQgdXBcbiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbGVkLW91dCcpO1xuIH0gZWxzZSBpZiAod2luZG93LnBhZ2VZT2Zmc2V0ID4gbGFzdFBhZ2VZT2Zmc2V0ICsgMzApIHtcbiBjb25zb2xlLmxvZyhcIkRPV05cIik7XG4gLy8gc2Nyb2xsZWQgZG93biwgaGlkZSBuYXZcbiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGVkLW91dCcpO1xuIH1cblxuIGxhc3RQYWdlWU9mZnNldCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAvLyB9LCAxMDApO1xuIH0pO1xuICovXG4vLyBkb24ndCBhdXRvc2Nyb2xsIGFmdGVyIGEgY2xpY2sgb24gYSBuYXZpZ2F0aW9uIGhlYWRlclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgaWdub3JlSnVtcCA9IHRydWU7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgaWdub3JlSnVtcCA9IGZhbHNlO1xuICB9LCAwKTtcbn0pO1xuIiwiLy8gaWYgY2xhc3MgZW5kcyB3aXRoIF91bnJlYWR5IHRoZW4gd2UgY29uc2lkZXIgZWxlbWVudCB1bnVzYWJsZSAoeWV0KVxuXG5cbi8vIGNhbmNlbCBjbGlja3Mgb24gPGEgY2xhc3M9XCJ1bnJlYWR5XCI+IGFuZCA8YnV0dG9uIGNsYXNzPVwidW5yZWFkeVwiPlxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gIHdoaWxlICh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZS5tYXRjaCgvX3VucmVhZHlcXGIvKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gIH1cbn0pO1xuXG4vLyBjYW5jZWwgc3VibWl0cyBvZiA8Zm9ybSBjbGFzcz1cInVucmVhZHlcIj5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZSkge1xuICBpZiAoZS50YXJnZXQuY2xhc3NOYW1lLm1hdGNoKC9fdW5yZWFkeVxcYi8pKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxufSk7XG4iLCIvLyBVc2FnZTpcbi8vICAxKSBuZXcgU3Bpbm5lcih7IGVsZW06IGVsZW19KSAtPiBzdGFydC9zdG9wKClcbi8vICAyKSBuZXcgU3Bpbm5lcigpIC0+IHNvbWV3aGVyZS5hcHBlbmQoc3Bpbm5lci5lbGVtKSAtPiBzdGFydC9zdG9wXG5mdW5jdGlvbiBTcGlubmVyKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMuZWxlbSA9IG9wdGlvbnMuZWxlbTtcbiAgdGhpcy5zaXplID0gb3B0aW9ucy5zaXplIHx8ICdtZWRpdW0nO1xuICAvLyBhbnkgY2xhc3MgdG8gYWRkIHRvIHNwaW5uZXIgKG1ha2Ugc3Bpbm5lciBzcGVjaWFsIGhlcmUpXG4gIHRoaXMuY2xhc3MgPSBvcHRpb25zLmNsYXNzID8gKCcgJyArIG9wdGlvbnMuY2xhc3MpIDogJyc7XG5cbiAgLy8gYW55IGNsYXNzIHRvIGFkZCB0byBlbGVtZW50ICh0byBoaWRlIGl0J3MgY29udGVudCBmb3IgaW5zdGFuY2UpXG4gIHRoaXMuZWxlbUNsYXNzID0gb3B0aW9ucy5lbGVtQ2xhc3M7XG5cbiAgaWYgKHRoaXMuc2l6ZSAhPSAnbWVkaXVtJyAmJiB0aGlzLnNpemUgIT0gJ3NtYWxsJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIHNpemU6IFwiICsgdGhpcy5zaXplKTtcbiAgfVxuXG4gIGlmICghdGhpcy5lbGVtKSB7XG4gICAgdGhpcy5lbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIH1cbn1cblxuU3Bpbm5lci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuZWxlbUNsYXNzKSB7XG4gICAgdGhpcy5lbGVtLmNsYXNzTGlzdC50b2dnbGUodGhpcy5lbGVtQ2xhc3MpO1xuICB9XG5cbiAgdGhpcy5lbGVtLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgJzxzcGFuIGNsYXNzPVwic3Bpbm5lciBzcGlubmVyX2FjdGl2ZSBzcGlubmVyXycgKyB0aGlzLnNpemUgKyB0aGlzLmNsYXNzICsgJ1wiPjxzcGFuIGNsYXNzPVwic3Bpbm5lcl9fZG90IHNwaW5uZXJfX2RvdF8xXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Bpbm5lcl9fZG90IHNwaW5uZXJfX2RvdF8yXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Bpbm5lcl9fZG90IHNwaW5uZXJfX2RvdF8zXCI+PC9zcGFuPjwvc3Bhbj4nKTtcbn07XG5cblNwaW5uZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtLnJlbW92ZUNoaWxkKHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yKCcuc3Bpbm5lcicpKTtcblxuICBpZiAodGhpcy5lbGVtQ2xhc3MpIHtcbiAgICB0aGlzLmVsZW0uY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmVsZW1DbGFzcyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3Bpbm5lcjtcbiIsIlxuZXhwb3J0cy5pbnNlcnROb25CbG9ja2luZ1NjcmlwdCA9IHJlcXVpcmUoJy4vaW5zZXJ0Tm9uQmxvY2tpbmdTY3JpcHQnKTtcbnJlcXVpcmUoJy4vdW5yZWFkeScpO1xuZXhwb3J0cy5pbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5leHBvcnRzLmxvZ2luID0gcmVxdWlyZSgnLi9sb2dpbicpO1xuZXhwb3J0cy5sb2dvdXQgPSByZXF1aXJlKCcuL2xvZ291dCcpO1xuZXhwb3J0cy5Nb2RhbCA9IHJlcXVpcmUoJy4vbW9kYWwnKTtcbmV4cG9ydHMuZm9udFRlc3QgPSByZXF1aXJlKCcuL2ZvbnRUZXN0Jyk7XG5yZXF1aXJlKCcuL3NpdGV0b29sYmFyJyk7XG5cbiJdfQ==
