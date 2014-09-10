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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svcHJlbHVkZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9mb250VGVzdC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9pbml0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2luc2VydE5vbkJsb2NraW5nU2NyaXB0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2xvZ2luLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2xvZ291dC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9tb2RhbC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9zaXRldG9vbGJhci5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC91bnJlYWR5LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9zcGlubmVyLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBtb2R1bGVzIGFyZSBkZWZpbmVkIGFzIGFuIGFycmF5XG4vLyBbIG1vZHVsZSBmdW5jdGlvbiwgbWFwIG9mIHJlcXVpcmV1aXJlcyBdXG4vL1xuLy8gbWFwIG9mIHJlcXVpcmV1aXJlcyBpcyBzaG9ydCByZXF1aXJlIG5hbWUgLT4gbnVtZXJpYyByZXF1aXJlXG4vL1xuLy8gYW55dGhpbmcgZGVmaW5lZCBpbiBhIHByZXZpb3VzIGJ1bmRsZSBpcyBhY2Nlc3NlZCB2aWEgdGhlXG4vLyBvcmlnIG1ldGhvZCB3aGljaCBpcyB0aGUgcmVxdWlyZXVpcmUgZm9yIHByZXZpb3VzIGJ1bmRsZXNcblxuKGZ1bmN0aW9uIG91dGVyIChtb2R1bGVzLCBjYWNoZSwgZW50cnkpIHtcbiAgICAvLyBTYXZlIHRoZSByZXF1aXJlIGZyb20gcHJldmlvdXMgYnVuZGxlIHRvIHRoaXMgY2xvc3VyZSBpZiBhbnlcbiAgICB2YXIgcHJldmlvdXNSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG5cbiAgICBmdW5jdGlvbiBuZXdSZXF1aXJlKG5hbWUsIGp1bXBlZCl7XG4gICAgICAgIGlmKCFjYWNoZVtuYW1lXSkge1xuICAgICAgICAgICAgaWYoIW1vZHVsZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBjYW5ub3QgZmluZCB0aGUgdGhlIG1vZHVsZSB3aXRoaW4gb3VyIGludGVybmFsIG1hcCBvclxuICAgICAgICAgICAgICAgIC8vIGNhY2hlIGp1bXAgdG8gdGhlIGN1cnJlbnQgZ2xvYmFsIHJlcXVpcmUgaWUuIHRoZSBsYXN0IGJ1bmRsZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2FzIGFkZGVkIHRvIHRoZSBwYWdlLlxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuICAgICAgICAgICAgICAgIGlmICghanVtcGVkICYmIGN1cnJlbnRSZXF1aXJlKSByZXR1cm4gY3VycmVudFJlcXVpcmUobmFtZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgYnVuZGxlcyBvbiB0aGlzIHBhZ2UgdGhlIHJlcXVpcmUgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cyBvbmUgaXMgc2F2ZWQgdG8gJ3ByZXZpb3VzUmVxdWlyZScuIFJlcGVhdCB0aGlzIGFzXG4gICAgICAgICAgICAgICAgLy8gbWFueSB0aW1lcyBhcyB0aGVyZSBhcmUgYnVuZGxlcyB1bnRpbCB0aGUgbW9kdWxlIGlzIGZvdW5kIG9yXG4gICAgICAgICAgICAgICAgLy8gd2UgZXhoYXVzdCB0aGUgcmVxdWlyZSBjaGFpbi5cbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNSZXF1aXJlKSByZXR1cm4gcHJldmlvdXNSZXF1aXJlKG5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIG1vZHVsZSBcXCcnICsgbmFtZSArICdcXCcnKTtcbiAgICAgICAgICAgICAgICBlcnIuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbSA9IGNhY2hlW25hbWVdID0ge2V4cG9ydHM6e319O1xuICAgICAgICAgICAgbW9kdWxlc1tuYW1lXVswXS5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24oeCl7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gbW9kdWxlc1tuYW1lXVsxXVt4XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3UmVxdWlyZShpZCA/IGlkIDogeCk7XG4gICAgICAgICAgICB9LG0sbS5leHBvcnRzLG91dGVyLG1vZHVsZXMsY2FjaGUsZW50cnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIH1cbiAgICBmb3IodmFyIGk9MDtpPGVudHJ5Lmxlbmd0aDtpKyspIG5ld1JlcXVpcmUoZW50cnlbaV0pO1xuXG4gICAgLy8gT3ZlcnJpZGUgdGhlIGN1cnJlbnQgcmVxdWlyZSB3aXRoIHRoaXMgbmV3IG9uZVxuICAgIHJldHVybiBuZXdSZXF1aXJlO1xufSlcbiIsIi8qXG7QmNC30LHQtdCz0LDQtdC8IEZPVVQgLSDQv9GA0L7RgdGC0L7QuSDRgdC/0L7RgdC+0LEg0L/RgNC+0LLQtdGA0LrQuCDQt9Cw0LPRgNGD0LfQutC4INC40LrQvtC90LjQuiDRiNGA0LjRhNGC0LAuXG4gMSkg0JTQtdC70LDQtdC8INCyIGljb25pYyDRiNGA0LjRhNGC0LUg0L7QtNC40L0g0YHQuNC80LLQvtC7INGBINC60L7QtNC+0LwgMjEgKNCy0LzQtdGB0YLQviDCqyHCuylcbiDQkiBpY29ubW9vblxuIGh0dHA6Ly9pbHlha2FudG9yLnJ1L3NjcmVlbi8yMDE0LTA5LTA2XzAxNTIucG5nXG4gaHR0cDovL2lseWFrYW50b3IucnUvc2NyZWVuLzIwMTQtMDktMDZfMDE1My5wbmdcblxuINCt0YLQvtGCINGI0YDQuNGE0YIg0LIg0L7QsdGL0YfQvdC+0Lwg0YjRgNC40YTRgtC1IChzZXJpZikg0YPQt9C60LjQuSDQv9C+INGI0LjRgNC40L3QtSwg0LAg0LIgaWNvbmljIC0g0L3QvtGA0LzQsNC70YzQvdGL0LkuXG4gMikg0JTQsNC70LXQtSDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDRgdC+0LfQtNCw0ZHQvCA8c3Bhbj4hPC9zcGFuPiDQuCDQtNCw0ZHQvCDQtdC80YMgZm9udEZhbWlseSDRgdC90LDRh9Cw0LvQsCBzZXJpZiDQuCDQt9Cw0LzQtdGA0Y/QtdC8INGI0LjRgNC40L3Rgywg0LAg0L/QvtGC0L7QvCBGb250SWNvbnMsIHNlcmlmLlxuINCe0YLQu9Cw0LLQu9C40LLQsNC10Lwg0LzQvtC80LXQvdGCLCDQutC+0LPQtNCwINGI0LjRgNC40L3QsCDQuNC30LzQtdC90LjRgtGB0Y8uINCt0YLQviDQt9C90LDRh9C40YIg0YjRgNC40YTRgiDQt9Cw0LPRgNGD0LbQtdC9LlxuINCc0L7QttC90L4g0YPQsdGA0LDRgtGMINC60LvQsNGB0YEgLm5vLWljb25zINC4INC/0L7QutCw0LfQsNGC0Ywg0LjQutC+0L3QutC4LlxuICovXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gIGVsZW0uY2xhc3NOYW1lID0gJ2ZvbnQtdGVzdCc7XG4gIGVsZW0uc3R5bGUuZm9udEZhbWlseSA9ICdzZXJpZic7XG4gIHZhciBpbml0aWFsV2lkdGggPSBlbGVtLm9mZnNldFdpZHRoO1xuXG4gIGVsZW0uc3R5bGUuZm9udEZhbWlseSA9ICcnO1xuXG4gIGZ1bmN0aW9uIGNoZWNrRm9udExvYWRlZCgpIHtcbiAgICBpZiAoaW5pdGlhbFdpZHRoICE9IGVsZW0ub2Zmc2V0V2lkdGgpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taWNvbnMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGltZW91dChjaGVja0ZvbnRMb2FkZWQsIDEwMCk7XG4gICAgfVxuICB9XG5cbiAgY2hlY2tGb250TG9hZGVkKCk7XG5cbn07XG4iLCIvLyB1c2UgZ2xvYmFsIHZhcmlhYmxlcywgYmVjYXVzZSBoZWFkLmpzIGFuZCBtYWluLmpzIGluY2x1ZGUgZGlmZmVyZW50IG1vZHVsZXNcbnZhciBpbml0SGFuZGxlcnMgPSB7fTtcbnZhciBpbml0V2hlblJlYWR5Q2FsbGVkID0ge307XG5cbi8vIFVzYWdlOlxuLy8gIGluaXRXaGVuUmVhZHkoJ2xvZ2luJylcbi8vICAgIHdpbGwgdHJpZ2dlciBhZGRJbml0SGFuZGxlcignbG9naW4nKVxuLy8gICAgYW5kIHdhaXQgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcblxuLy8gaWYgaW5pdFdoZW5SZWFkeSBpcyBmaXJzdCAoZnJvbSBIVE1MKVxuLy8gIC0+IGluaXRXaGVuUmVhZHlDYWxsZWRbbmFtZV0gPSB0cnVlXG4vLyAgLT4gdGhlbiBhZGRJbml0SGFuZGxlciB1c2VzIGl0XG5cbi8vIGlmIGFkZEluaXRIYW5kbGVyIGlzIGZpcnN0IChmcm9tIFNDUklQVClcbi8vICAtPiBpbml0SGFuZGxlcnNbbmFtZV0gPSBoYW5kbGVyXG4vLyAgLT4gdGhlbiBpbml0V2hlblJlYWR5IHVzZXMgaXRcbmZ1bmN0aW9uIGluaXRXaGVuUmVhZHkobmFtZSkge1xuLy8gIGNvbnNvbGUubG9nKFwiaW5pdFdoZW5SZWFkeVwiLCBuYW1lKTtcbiAgaWYgKGluaXRIYW5kbGVyc1tuYW1lXSkge1xuICAgIGluaXRIYW5kbGVyc1tuYW1lXSgpO1xuICB9IGVsc2Uge1xuICAgIGluaXRXaGVuUmVhZHlDYWxsZWRbbmFtZV0gPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZEluaXRIYW5kbGVyKG5hbWUsIGhhbmRsZXIpIHtcbi8vICBjb25zb2xlLmxvZyhcImFkZEluaXRIYW5kbGVyXCIsIG5hbWUsIGhhbmRsZXIpO1xuICBpZiAoaW5pdFdoZW5SZWFkeUNhbGxlZFtuYW1lXSkge1xuICAgIGhhbmRsZXIoKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0SGFuZGxlcnNbbmFtZV0gPSBoYW5kbGVyO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB3aGVuUmVhZHk6IGluaXRXaGVuUmVhZHksXG4gIGFkZEhhbmRsZXI6IGFkZEluaXRIYW5kbGVyXG59O1xuIiwiXG4vLyBpbnNlcnQgPHNjcmlwdCBzcmM9XCIuLi5cIj4gaW50byBkb2N1bWVudFxuLy8gICAtLT4gZG9lcyBub3QgYmxvY2sgcmVuZGVyaW5nXG4vLyAgIC0tPiBrZWVwcyBleGVjdXRpb24gb3JkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3JjKSB7XG4gIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgc2NyaXB0LnNyYyA9IHNyYztcbiAgc2NyaXB0LmFzeW5jID0gZmFsc2U7IC8vIG1haW50YWluIHRoZSBleGVjdXRpb24gb3JkZXJcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICByZXR1cm4gc2NyaXB0OyAvLyBmb3Igb25sb2FkIGhhbmRsZXJzXG59O1xuXG4iLCJ2YXIgaW5pdCA9IHJlcXVpcmUoJy4vaW5pdCcpO1xudmFyIGluc2VydE5vbkJsb2NraW5nU2NyaXB0ID0gcmVxdWlyZSgnLi9pbnNlcnROb25CbG9ja2luZ1NjcmlwdCcpO1xudmFyIE1vZGFsID0gcmVxdWlyZSgnLi9tb2RhbCcpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKCdjbGllbnQvc3Bpbm5lcicpO1xuXG5pbml0LmFkZEhhbmRsZXIoXCJsb2dpblwiLCBmdW5jdGlvbigpIHtcblxuICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpdGV0b29sYmFyX19sb2dpbicpO1xuICBidXR0b24ub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgbG9naW4oKTtcbiAgfTtcblxufSk7XG5cbmZ1bmN0aW9uIGxvZ2luKCkge1xuICB2YXIgbW9kYWwgPSBuZXcgTW9kYWwoKTtcbiAgdmFyIHNwaW5uZXIgPSBuZXcgU3Bpbm5lcigpO1xuICBtb2RhbC5zZXRDb250ZW50KHNwaW5uZXIuZWxlbSk7XG4gIHNwaW5uZXIuc3RhcnQoKTtcbiAgdmFyIHNjcmlwdCA9IGluc2VydE5vbkJsb2NraW5nU2NyaXB0KCcvanMvYXV0aC5qcycpO1xuICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgbW9kYWwucmVtb3ZlKCk7XG4gICAgdmFyIEF1dGhNb2RhbCA9IHJlcXVpcmUoJ2F1dGgvY2xpZW50JykuQXV0aE1vZGFsO1xuICAgIG5ldyBBdXRoTW9kYWwoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpbjtcbiIsInZhciBpbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5cbmluaXQuYWRkSGFuZGxlcihcImxvZ291dFwiLCBmdW5jdGlvbigpIHtcblxuICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpdGV0b29sYmFyX19sb2dvdXQnKTtcbiAgYnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxvZ291dCgpO1xuICB9O1xuICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgndW5yZWFkeScpO1xufSk7XG5cblxuZnVuY3Rpb24gbG9nb3V0KCkge1xuICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgZm9ybS5pbm5lckhUTUwgPSAnPGlucHV0IG5hbWU9XCJfY3NyZlwiIHZhbHVlPVwiJyArIHdpbmRvdy5jc3JmICsgJ1wiPic7XG4gIGZvcm0ubWV0aG9kID0gJ1BPU1QnO1xuICBmb3JtLmFjdGlvbiA9ICcvYXV0aC9sb2dvdXQnO1xuICBmb3JtLnN1Ym1pdCgpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gbG9nb3V0O1xuIiwiZnVuY3Rpb24gTW9kYWwoKSB7XG4gIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVFbmQnLCAnPGRpdiBjbGFzcz1cIm1vZGFsXCI+PGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZ1wiPjwvZGl2PjwvZGl2PicpO1xuXG4gIHRoaXMuZWxlbSA9IGRvY3VtZW50LmJvZHkubGFzdENoaWxkO1xuICB0aGlzLmNvbnRlbnRFbGVtID0gdGhpcy5lbGVtLmxhc3RDaGlsZDtcblxuLy8gIHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKHRoaXMpO1xuICB0aGlzLm9uRG9jdW1lbnRLZXlEb3duID0gdGhpcy5vbkRvY3VtZW50S2V5RG93bi5iaW5kKHRoaXMpO1xuXG4vLyAgdGhpcy5lbGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm9uQ2xpY2spO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLm9uRG9jdW1lbnRLZXlEb3duKTtcbn1cblxuLypcbk1vZGFsLnByb3RvdHlwZS5vbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKGV2ZW50LnRhcmdldCA9PSB0aGlzLmVsZW0pIHsgLy8gY2xpY2sgb24gdGhlIG91dGVyIGVsZW1lbnQsIG91dHNpZGUgb2YgdGhlIHdpbmRvd1xuICAgIHRoaXMucmVtb3ZlKCk7XG4gIH1cbn07XG4qL1xuTW9kYWwucHJvdG90eXBlLm9uRG9jdW1lbnRLZXlEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmtleUNvZGUgPT0gMjcpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMucmVtb3ZlKCk7XG4gIH1cbn07XG5cbk1vZGFsLnByb3RvdHlwZS5zaG93T3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbnRlbnRFbGVtLmNsYXNzTGlzdC5hZGQoJ21vZGFsLW92ZXJsYXknKTtcbn07XG5cbk1vZGFsLnByb3RvdHlwZS5oaWRlT3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbnRlbnRFbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLW92ZXJsYXknKTtcbn07XG5cbk1vZGFsLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24oaHRtbE9yTm9kZSkge1xuICBpZiAodHlwZW9mIGh0bWxPck5vZGUgPT0gJ3N0cmluZycpIHtcbiAgICB0aGlzLmNvbnRlbnRFbGVtLmlubmVySFRNTCA9IGh0bWxPck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb250ZW50RWxlbS5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLmNvbnRlbnRFbGVtLmFwcGVuZENoaWxkKGh0bWxPck5vZGUpO1xuICB9XG4gIHZhciBhdXRvZm9jdXMgPSB0aGlzLmNvbnRlbnRFbGVtLnF1ZXJ5U2VsZWN0b3IoJ1thdXRvZm9jdXNdJyk7XG4gIGlmIChhdXRvZm9jdXMpIGF1dG9mb2N1cy5mb2N1cygpO1xufTtcblxuTW9kYWwucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuZWxlbSk7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMub25Eb2N1bWVudEtleURvd24pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbDtcbiIsInZhciBsYXN0UGFnZVlPZmZzZXQ7XG5cbnZhciBpZ25vcmVKdW1wID0gZmFsc2U7XG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQ7XG5cbi8vIHdoZW4gSSBzY3JvbGwgZG93biBvbiBNYWNPUywgQ2hyb21lIGRvZXMgdGhlIGJvdW5jZSB0cmlja1xuLy8gQXQgdGhlIHBhZ2UgYm90dG9tIGl0IGlzIHBvc3NpYmxlIHRvIHNjcm9sbCBiZWxvdyB0aGUgcGFnZSwgYW5kIHRoZW4gaXQgZ29lcyBiYWNrIChpbmVydGlhKVxuLy8gdGhlIHByb2JsZW0gaXMgdGhhdCB0aGUgYWN0dWFsIHNjcm9sbCBmb3IgbW91c2UgZG93biBnb2VzIGEgbGl0dGxlIGJpdCB1cFxudmFyIHRvbGVyYW5jZSA9IHtcbiAgdXA6ICAgMTAsIC8vIGJpZyBlbm91Z2ggdG8gaWdub3JlIGNocm9tZSBmYWxsYmFja1xuICB1cEF0Qm90dG9tOiA2MCxcbiAgZG93bjogMTBcbn07XG5cbi8vIGRlZmVyIGV2ZW50IHJlZ2lzdHJhdGlvbiB0byBoYW5kbGUgYnJvd3NlclxuLy8gcG90ZW50aWFsbHkgcmVzdG9yaW5nIHByZXZpb3VzIHNjcm9sbCBwb3NpdGlvblxuc2V0VGltZW91dChpbml0LCAyMDApO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICBsYXN0UGFnZVlPZmZzZXQgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uc2Nyb2xsKTtcbn1cblxuZnVuY3Rpb24gb25zY3JvbGwoKSB7XG4gIGlmIChyZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZCkgcmV0dXJuO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZUlkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICBzaG93SGlkZVNpdGVUb29sYmFyKCk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQgPSBudWxsO1xuICB9KTtcblxufVxuXG5mdW5jdGlvbiBzaG93SGlkZVNpdGVUb29sYmFyKCkge1xuICBpZiAoaXNTY3JvbGxPdXRPZkRvY3VtZW50KCkpIHsgLy8gSWdub3JlIGJvdW5jeSBzY3JvbGxpbmcgaW4gT1NYXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcblxuICB2YXIgc2Nyb2xsRGlyZWN0aW9uID0gc2Nyb2xsVG9wID4gbGFzdFBhZ2VZT2Zmc2V0ID8gJ2Rvd24nIDogJ3VwJztcbiAgdmFyIHNjcm9sbERpZmYgPSBNYXRoLmFicyhzY3JvbGxUb3AgLSBsYXN0UGFnZVlPZmZzZXQpO1xuXG4vLyAgY29uc29sZS5sb2coXCJzY3JvbGxEaWZmXCIsIHNjcm9sbERpZmYpO1xuXG4gIC8vINC10YHQu9C4INC/0YDQvtC60YDRg9GC0LjQu9C4INC80LDQu9C+IC0g0L3QuNGH0LXQs9C+INC90LUg0LTQtdC70LDQtdC8LCDQvdC+INC4INGC0L7Rh9C60YMg0L7RgtGB0YfRkdGC0LAg0L3QtSDQvNC10L3Rj9C10LxcbiAgaWYgKHRvbGVyYW5jZVtzY3JvbGxEaXJlY3Rpb25dID4gc2Nyb2xsRGlmZikgcmV0dXJuO1xuXG4gIC8vINCyIE1hY09zINC/0YDQuCDQv9GA0L7QutGA0YPRgtC60LUg0LLQvdC40Lcg0LLQvtC30LzQvtC20LXQvSDQuNC90LXRgNGG0LjQvtC90L3Ri9C5INC+0YLRgdC60L7QuiDQvdCw0LLQtdGA0YVcbiAgLy8g0LXRgdC70Lgg0LzRiyDQstC90LjQt9GDINGB0YLRgNCw0L3QuNGG0YssINGC0L4gdG9sZXJhbmNlINCy0YvRiNC1XG4gIHZhciBzY3JvbGxCb3R0b20gPSBnZXREb2N1bWVudEhlaWdodCgpIC0gc2Nyb2xsVG9wIC0gd2luZG93LmlubmVySGVpZ2h0O1xuICBpZiAoc2Nyb2xsRGlyZWN0aW9uID09ICd1cCcgJiYgc2Nyb2xsQm90dG9tIDwgdG9sZXJhbmNlLnVwQXRCb3R0b20gJiYgc2Nyb2xsVG9wID4gdG9sZXJhbmNlLnVwQXRCb3R0b20pIHJldHVybjtcblxuICBsYXN0UGFnZVlPZmZzZXQgPSBzY3JvbGxUb3A7XG5cbiAgaWYgKGlnbm9yZUp1bXApIHJldHVybjtcblxuLy8gIGNvbnNvbGUubG9nKHNjcm9sbERpcmVjdGlvbiwgc2Nyb2xsRGlmZiwgdG9sZXJhbmNlW3Njcm9sbERpcmVjdGlvbl0pO1xuXG5cbiAgaWYgKHNjcm9sbFRvcCA9PT0gMCB8fCBzY3JvbGxEaXJlY3Rpb24gPT0gJ3VwJykge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsZWQtb3V0Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHNjcm9sbERpcmVjdGlvbiA9PSAnZG93bicpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGVkLW91dCcpO1xuICB9XG5cbn1cblxuLyoqXG4gKiBkZXRlcm1pbmVzIGlmIHRoZSBzY3JvbGwgcG9zaXRpb24gaXMgb3V0c2lkZSBvZiBkb2N1bWVudCBib3VuZGFyaWVzXG4gKiBAcGFyYW0gIHtpbnR9ICBjdXJyZW50U2Nyb2xsWSB0aGUgY3VycmVudCB5IHNjcm9sbCBwb3NpdGlvblxuICogQHJldHVybiB7Ym9vbH0gdHJ1ZSBpZiBvdXQgb2YgYm91bmRzLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZnVuY3Rpb24gaXNTY3JvbGxPdXRPZkRvY3VtZW50KCkge1xuICB2YXIgcGFzdFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCA8IDAsXG4gICAgICBwYXN0Qm90dG9tID0gd2luZG93LnBhZ2VZT2Zmc2V0ICsgd2luZG93LmlubmVySGVpZ2h0ID4gZ2V0RG9jdW1lbnRIZWlnaHQoKTtcblxuICByZXR1cm4gcGFzdFRvcCB8fCBwYXN0Qm90dG9tO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGhlaWdodCBvZiB0aGUgZG9jdW1lbnRcbiAqIEBzZWUgaHR0cDovL2phbWVzLnBhZG9sc2V5LmNvbS9qYXZhc2NyaXB0L2dldC1kb2N1bWVudC1oZWlnaHQtY3Jvc3MtYnJvd3Nlci9cbiAqIEByZXR1cm4ge2ludH0gdGhlIGhlaWdodCBvZiB0aGUgZG9jdW1lbnQgaW4gcGl4ZWxzXG4gKi9cbmZ1bmN0aW9uIGdldERvY3VtZW50SGVpZ2h0KCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHksXG4gICAgICBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgcmV0dXJuIE1hdGgubWF4KFxuICAgIGJvZHkuc2Nyb2xsSGVpZ2h0LCBkb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0LFxuICAgIGJvZHkub2Zmc2V0SGVpZ2h0LCBkb2N1bWVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0LFxuICAgIGJvZHkuY2xpZW50SGVpZ2h0LCBkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICk7XG59XG5cbi8qXG4gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xuIGNvbnNvbGUubG9nKHdpbmRvdy5wYWdlWU9mZnNldCk7XG4gLy8gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiBpZiAod2luZG93LnBhZ2VZT2Zmc2V0IDwgbGFzdFBhZ2VZT2Zmc2V0IHx8IHdpbmRvdy5wYWdlWU9mZnNldCA8IDUpIHtcbiBjb25zb2xlLmxvZyhcIlVQXCIpO1xuIC8vIHNjcm9sbGVkIHVwXG4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGxlZC1vdXQnKTtcbiB9IGVsc2UgaWYgKHdpbmRvdy5wYWdlWU9mZnNldCA+IGxhc3RQYWdlWU9mZnNldCArIDMwKSB7XG4gY29uc29sZS5sb2coXCJET1dOXCIpO1xuIC8vIHNjcm9sbGVkIGRvd24sIGhpZGUgbmF2XG4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdzY3JvbGxlZC1vdXQnKTtcbiB9XG5cbiBsYXN0UGFnZVlPZmZzZXQgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gLy8gfSwgMTAwKTtcbiB9KTtcbiAqL1xuLy8gZG9uJ3QgYXV0b3Njcm9sbCBhZnRlciBhIGNsaWNrIG9uIGEgbmF2aWdhdGlvbiBoZWFkZXJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGlnbm9yZUp1bXAgPSB0cnVlO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIGlnbm9yZUp1bXAgPSBmYWxzZTtcbiAgfSwgMCk7XG59KTtcbiIsIi8vIGlmIGNsYXNzIGVuZHMgd2l0aCBfdW5yZWFkeSB0aGVuIHdlIGNvbnNpZGVyIGVsZW1lbnQgdW51c2FibGUgKHlldClcblxuXG4vLyBjYW5jZWwgY2xpY2tzIG9uIDxhIGNsYXNzPVwidW5yZWFkeVwiPiBhbmQgPGJ1dHRvbiBjbGFzcz1cInVucmVhZHlcIj5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICB3aGlsZSAodGFyZ2V0KSB7XG4gICAgaWYgKHRhcmdldC5jbGFzc05hbWUubWF0Y2goL191bnJlYWR5XFxiLykpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICB9XG59KTtcblxuLy8gY2FuY2VsIHN1Ym1pdHMgb2YgPGZvcm0gY2xhc3M9XCJ1bnJlYWR5XCI+XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgaWYgKGUudGFyZ2V0LmNsYXNzTmFtZS5tYXRjaCgvX3VucmVhZHlcXGIvKSkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn0pO1xuIiwiLy8gVXNhZ2U6XG4vLyAgMSkgbmV3IFNwaW5uZXIoeyBlbGVtOiBlbGVtfSkgLT4gc3RhcnQvc3RvcCgpXG4vLyAgMikgbmV3IFNwaW5uZXIoKSAtPiBzb21ld2hlcmUuYXBwZW5kKHNwaW5uZXIuZWxlbSkgLT4gc3RhcnQvc3RvcFxuZnVuY3Rpb24gU3Bpbm5lcihvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLmVsZW0gPSBvcHRpb25zLmVsZW07XG4gIHRoaXMuc2l6ZSA9IG9wdGlvbnMuc2l6ZSB8fCAnbWVkaXVtJztcbiAgLy8gYW55IGNsYXNzIHRvIGFkZCB0byBzcGlubmVyIChtYWtlIHNwaW5uZXIgc3BlY2lhbCBoZXJlKVxuICB0aGlzLmNsYXNzID0gb3B0aW9ucy5jbGFzcyA/ICgnICcgKyBvcHRpb25zLmNsYXNzKSA6ICcnO1xuXG4gIC8vIGFueSBjbGFzcyB0byBhZGQgdG8gZWxlbWVudCAodG8gaGlkZSBpdCdzIGNvbnRlbnQgZm9yIGluc3RhbmNlKVxuICB0aGlzLmVsZW1DbGFzcyA9IG9wdGlvbnMuZWxlbUNsYXNzO1xuXG4gIGlmICh0aGlzLnNpemUgIT0gJ21lZGl1bScgJiYgdGhpcy5zaXplICE9ICdzbWFsbCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBzaXplOiBcIiArIHRoaXMuc2l6ZSk7XG4gIH1cblxuICBpZiAoIXRoaXMuZWxlbSkge1xuICAgIHRoaXMuZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB9XG59XG5cblNwaW5uZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmVsZW1DbGFzcykge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuZWxlbUNsYXNzKTtcbiAgfVxuXG4gIHRoaXMuZWxlbS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsICc8c3BhbiBjbGFzcz1cInNwaW5uZXIgc3Bpbm5lcl9hY3RpdmUgc3Bpbm5lcl8nICsgdGhpcy5zaXplICsgdGhpcy5jbGFzcyArICdcIj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfMVwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfMlwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfM1wiPjwvc3Bhbj48L3NwYW4+Jyk7XG59O1xuXG5TcGlubmVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbS5yZW1vdmVDaGlsZCh0aGlzLmVsZW0ucXVlcnlTZWxlY3RvcignLnNwaW5uZXInKSk7XG5cbiAgaWYgKHRoaXMuZWxlbUNsYXNzKSB7XG4gICAgdGhpcy5lbGVtLmNsYXNzTGlzdC50b2dnbGUodGhpcy5lbGVtQ2xhc3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaW5uZXI7XG4iLCJcbmV4cG9ydHMuaW5zZXJ0Tm9uQmxvY2tpbmdTY3JpcHQgPSByZXF1aXJlKCcuL2luc2VydE5vbkJsb2NraW5nU2NyaXB0Jyk7XG5yZXF1aXJlKCcuL3VucmVhZHknKTtcbmV4cG9ydHMuaW5pdCA9IHJlcXVpcmUoJy4vaW5pdCcpO1xuZXhwb3J0cy5sb2dpbiA9IHJlcXVpcmUoJy4vbG9naW4nKTtcbmV4cG9ydHMubG9nb3V0ID0gcmVxdWlyZSgnLi9sb2dvdXQnKTtcbmV4cG9ydHMuTW9kYWwgPSByZXF1aXJlKCcuL21vZGFsJyk7XG5leHBvcnRzLmZvbnRUZXN0ID0gcmVxdWlyZSgnLi9mb250VGVzdCcpO1xucmVxdWlyZSgnLi9zaXRldG9vbGJhcicpO1xuXG4iXX0=
