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
({"/js/javascript-nodejs/node_modules/client/dom/findClosest.js":[function(require,module,exports){
// find the nearest ancestor matching selector
module.exports = function(elem, selector) {

  while (elem) {
    if (elem.matches(selector)) {
      return elem;
    } else {
      elem = elem.parentElement;
    }
  }
  return null;

};

},{}],"/js/javascript-nodejs/node_modules/client/dom/getBrowserScrollCause.js":[function(require,module,exports){
/**
 * Get the cause of the browser-initiated scroll (for onscroll event handler)
 * initial | onload | click | null
 * @type {boolean}
 */


// Chrome
// at page load browser autoscrolls the page to #hash
var isInitialScroll = true;
// then at onload autoscrolls to last remembered position
var isOnloadScroll = false;

// scroll as a result of clicking (probably, navigation)
var isClickScroll = false;

document.addEventListener('DOMContentLoaded', function() {
//  console.log("DOMContentLoaded");
  setTimeout(function() {
    // after 200 ms we consider all scrolls user-requested, not browser autoscroll
    isInitialScroll = false;
//    console.log("clean isInitialScroll");
  }, 2000);
});


document.addEventListener('click', function() {
  isClickScroll = true;
  setTimeout(function() {
    isClickScroll = false;
  }, 50); // firefox needs more than 0ms to scroll
});


window.onload = function() {
//  console.log("onload");
  isOnloadScroll = true;
  setTimeout(function() {
    // let browser scroll to the last remembered position
//    console.log("clean onload");
    isOnloadScroll = false;
  }, 200);
};


function getBrowserScrollCause() {

  return isInitialScroll ? 'initial' :
    isOnloadScroll ? 'onload' :
      isClickScroll ? 'click' : null;

}

module.exports = getBrowserScrollCause;

},{}],"/js/javascript-nodejs/node_modules/client/dom/getDocumentHeight.js":[function(require,module,exports){
var scrollbarHeight = require('./getScrollbarHeight');

function getDocumentHeight(doc) {
  doc = doc || document;

  var height = Math.max(
    doc.body.scrollHeight, doc.documentElement.scrollHeight,
    doc.body.offsetHeight, doc.documentElement.offsetHeight,
    doc.body.clientHeight, doc.documentElement.clientHeight
  );

  if (doc.documentElement.scrollWidth > doc.documentElement.clientWidth) {
    // got a horiz scroll, let's add it
    height += scrollbarHeight;
  }

  return height;
};

module.exports = getDocumentHeight;

/**  TODO: is Math.max below still needed anywhere?
 * Gets the height of the document
 * @see http://james.padolsey.com/javascript/get-document-height-cross-browser/
 * @return {int} the height of the document in pixels

function getDocumentHeight() {
  var body = document.body,
      documentElement = document.documentElement;

  return Math.max(
    body.scrollHeight, documentElement.scrollHeight,
    body.offsetHeight, documentElement.offsetHeight,
    body.clientHeight, documentElement.clientHeight
  );
}
*/



},{"./getScrollbarHeight":"/js/javascript-nodejs/node_modules/client/dom/getScrollbarHeight.js"}],"/js/javascript-nodejs/node_modules/client/dom/getScrollbarHeight.js":[function(require,module,exports){
function getScrollbarHeight() {
  var outer = document.createElement("div");
  outer.style.cssText = "visibility:hidden;height:100px";
  if (!document.body) {
    throw new Error("getScrollbarHeight called to early: no document.body");
  }
  document.body.appendChild(outer);

  var widthNoScroll = outer.offsetWidth;
  // force scrollbars
  outer.style.overflow = "scroll";

  // add innerdiv
  var inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);

  var widthWithScroll = inner.offsetWidth;

  // remove divs
  outer.parentNode.removeChild(outer);

  return widthNoScroll - widthWithScroll;
}

module.exports = getScrollbarHeight();

},{}],"/js/javascript-nodejs/node_modules/client/head/fontTest.js":[function(require,module,exports){
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

},{}],"/js/javascript-nodejs/node_modules/client/head/init.js":[function(require,module,exports){
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

},{}],"/js/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js":[function(require,module,exports){
var versions = require('client/versions');

// insert <script src="..."> into document
//   --> does not block rendering
//   --> keeps execution order
module.exports = function(src, options) {
  options = options || {};
  var script = document.createElement('script');
  if (versions[src]) {
    src = src.replace('.js', '.v' + versions[src] + '.js');
  }
  script.src = src;
  script.async = options.async || false; // maintain the execution order if async is not set
  document.head.appendChild(script);
  return script; // for onload handlers
};


},{"client/versions":"/js/javascript-nodejs/node_modules/client/versions.json"}],"/js/javascript-nodejs/node_modules/client/head/login.js":[function(require,module,exports){
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

},{"./init":"/js/javascript-nodejs/node_modules/client/head/init.js","./insertNonBlockingScript":"/js/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js","./modal":"/js/javascript-nodejs/node_modules/client/head/modal.js","auth/client":"auth/client","client/spinner":"/js/javascript-nodejs/node_modules/client/spinner.js"}],"/js/javascript-nodejs/node_modules/client/head/logout.js":[function(require,module,exports){
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

},{"./init":"/js/javascript-nodejs/node_modules/client/head/init.js"}],"/js/javascript-nodejs/node_modules/client/head/modal.js":[function(require,module,exports){
function Modal() {
  var self = this;

  this.render();

  this.onClick = this.onClick.bind(this);
  this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

  this.elem.addEventListener('click', this.onClick);

  document.addEventListener("keydown", this.onDocumentKeyDown);
}

Modal.prototype.render = function() {
  document.body.insertAdjacentHTML('beforeEnd', '<div class="modal"><div class="modal-dialog"></div></div>');
  this.elem = document.body.lastChild;
  this.contentElem = this.elem.lastChild;
};

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

},{}],"/js/javascript-nodejs/node_modules/client/head/navigation.js":[function(require,module,exports){
// navigation starts to work right now
document.addEventListener('keydown', navigate);

var ctrlOrAlt = ~navigator.userAgent.toLowerCase().indexOf("mac os x") ? 'ctrl' : 'alt';

function navigate(event) {
  // don't react on Ctrl-> <- if in text
  if (~['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName)) return;

  if (!event[ctrlOrAlt + 'Key']) return;

  var rel = null;
  switch (event.keyCode) {
  case 0x25:
    rel = 'prev';
    break;
  case 0x27:
    rel = 'next';
    break;
  default:
    return;
  }

  var link = document.querySelector('link[rel="' + rel + '"]');
  if (!link) return;

  document.location = link.href;
  event.preventDefault();

}


document.addEventListener('DOMContentLoaded', function() {
  var keyDesc = ctrlOrAlt[0].toUpperCase() + ctrlOrAlt.slice(1);

  var shortcut;

  var next = document.querySelector('link[rel="next"]');
  if (next) {
    shortcut = document.querySelector('a[href="' + next.getAttribute('href') + '"] .page__nav-text-shortcut');
    shortcut.innerHTML = keyDesc + ' + <span class="page__nav-text-arr">→</span>';
  }

  var prev = document.querySelector('link[rel="prev"]');
  if (prev) {
    shortcut = document.querySelector('a[href="' + prev.getAttribute('href') + '"] .page__nav-text-shortcut');
    shortcut.innerHTML = keyDesc + ' + <span class="page__nav-text-arr">←</span>';
  }

});

},{}],"/js/javascript-nodejs/node_modules/client/head/resizeOnload/iframeResize.js":[function(require,module,exports){
var getDocumentHeight = require('client/dom/getDocumentHeight');

function iframeResize(ifrElem, callback) {

  var timeoutTimer = setTimeout(function() {
    // default height
    callback(new Error("timeout"));
  }, 500);

  function done(err, height) {
    clearTimeout(timeoutTimer);

    callback(err, height);
  }

  // throw right now if cross-domain
  try {
    /* jshint -W030 */
    (ifrElem.contentDocument || ifrElem.contentWindow.document).body;
  } catch (e) {
    iframeResizeCrossDomain(ifrElem, done);
  }


  // HINT: I shoulnd't move iframe in DOM, because it will reload it's contents when appended/inserted anywhere!
  // so I create a clone and work on it
  if (!ifrElem.offsetWidth) {
    // clone iframe at another place to see the size
    var cloneIframe = ifrElem.cloneNode(true);
    cloneIframe.name = "";

    cloneIframe.style.height = '50px';
    cloneIframe.style.position = 'absolute';
    cloneIframe.style.display = 'block';
    cloneIframe.style.top = '10000px';

    cloneIframe.onload = function() {
      var height = getDocumentHeight(this.contentDocument);
      ifrElem.style.display = 'block';
      cloneIframe.remove();
      done(null, height);
    };

    document.body.appendChild(cloneIframe);
    return;
  }

  ifrElem.style.display = 'block';
  ifrElem.style.height = '1px';

  var height = getDocumentHeight(ifrElem.contentDocument);

  ifrElem.style.height = '';
  done(null, height);
}

iframeResize.async = function iframeResizeAsync(iframe, callback) {
  // delay to let the code inside the iframe finish
  setTimeout(function() {
    iframeResize(iframe, callback);
  }, 0);
};


function iframeResizeCrossDomain(ifrElem, callback) {
  throw new Error("Not implemented yet");
}

module.exports = iframeResize;


/*
 window.onmessage = function(e) {
 if (e.origin != "http://ru.lookatcode.com") return;
 var data = JSON.parse(e.data);
 if (!data || data.cmd != "resize-iframe") return;
 var elem = document.getElementsByName(data.name)[0];

 elem.style.height = +data.height + 10 + "px";
 var deferred = iframeResizeCrossDomain.deferreds[data.id];
 deferred.resolve();
 };

 function iframeResizeCrossDomain(ifrElem, callback) {

 setTimeout(function() {
 callback(new Error("timeout"));
 }, 500);

 try {
 // try to see if resizer can work on this iframe
 ifrElem.contentWindow.postMessage("test", "http://ru.lookatcode.com");
 } catch(e) {
 // iframe from another domain, sorry
 callback(new Error("the resizer must be from ru.lookatcode.com"));
 return;
 }

 if (!ifrElem.offsetWidth) {
 // move iframe to another place to resize there
 var placeholder = document.createElement('span');
 ifrElem.parentNode.insertBefore(placeholder, ifrElem);
 document.body.appendChild(ifrElem);
 }

 ifrElem.style.display = 'none';

 var id = "" + Math.random();
 var message = { cmd: 'resize-iframe', name: ifrElem[0].name, id: id };
 // TODO
 iframeResizeCrossDomain.deferreds[id] = deferred;
 deferred.always(function() {
 delete iframeResizeCrossDomain.deferreds[id];
 });

 var frame = iframeResizeCrossDomain.iframe;
 if (frame.loaded) {
 frame.contentWindow.postMessage(JSON.stringify(message), "http://ru.lookatcode.com");
 } else {
 frame.on('load', function() {
 frame.contentWindow.postMessage(JSON.stringify(message), "http://ru.lookatcode.com");
 });
 }

 if (placeholder) {
 setTimeout(function() {
 placeholder.replaceWith(ifrElem);
 }, 20);
 }

 return deferred;
 }

 iframeResizeCrossDomain.deferreds = {};
 iframeResizeCrossDomain.iframe = $('<iframe src="http://ru.lookatcode.com/files/iframe-resize.html" style="display:none"></iframe>').prependTo('body');
 iframeResizeCrossDomain.iframe.on('load', function() {
 this.loaded = true;
 });
 */

},{"client/dom/getDocumentHeight":"/js/javascript-nodejs/node_modules/client/dom/getDocumentHeight.js"}],"/js/javascript-nodejs/node_modules/client/head/resizeOnload/index.js":[function(require,module,exports){
var iframeResize = require('./iframeResize');
var findClosest = require('client/dom/findClosest');
var throttle = require('lib/throttle');
// track resized iframes in window.onresize

var onResizeQueue = [];

exports.iframe = function(iframe) {

  function resize() {
    iframeResize.async(iframe, function(err, height) {
      if (err) console.error(err);
      if (height) iframe.style.height = height + 'px';
    });
  }

  resize();
};

exports.codeTabs = function(iframe) {
  function hideShowArrows() {

    // add arrows if needed
    var elem = findClosest(iframe, '.code-tabs');
    var contentElem = findClosest(iframe, '[data-code-tabs-content]');
    var switchesElem = elem.querySelector('[data-code-tabs-switches]');
    var switchesElemItems = switchesElem.firstElementChild;

    if (switchesElemItems.offsetWidth > switchesElem.offsetWidth) {
      elem.classList.add('code-tabs_scroll');
    } else {
      elem.classList.remove('code-tabs_scroll');
    }

  }

  hideShowArrows();
  onResizeQueue.push(hideShowArrows);
};



window.addEventListener('resize', throttle(function() {
  onResizeQueue.forEach(function(onResize) {
    onResize();
  });
}, 200));

},{"./iframeResize":"/js/javascript-nodejs/node_modules/client/head/resizeOnload/iframeResize.js","client/dom/findClosest":"/js/javascript-nodejs/node_modules/client/dom/findClosest.js","lib/throttle":"/js/javascript-nodejs/node_modules/lib/throttle.js"}],"/js/javascript-nodejs/node_modules/client/head/sitetoolbar.js":[function(require,module,exports){
var getBrowserScrollCause = require('client/dom/getBrowserScrollCause');
var getDocumentHeight = require('client/dom/getDocumentHeight');

var lastPageYOffset = 0;

var requestAnimationFrameId;

var lastState = '';

var DEBUG = false;
function log() {
  if (DEBUG) {
    console.log.apply(console, arguments);
  }
}

// adds [data-scroll-prev] && [data-scroll] attributes
// both the previous and the next state => for CSS animation to draw the transition
function setState(newState) {
  log("setState", newState);
  document.body.setAttribute('data-scroll-prev', document.body.getAttribute('data-scroll') || '');

  if (!newState) {
    document.body.removeAttribute('data-scroll');
  } else {
    document.body.setAttribute('data-scroll', newState);
  }
  lastState = newState;
}


// when I scroll down on MacOS, Chrome does the bounce trick
// At the page bottom it is possible to scroll below the page, and then it goes back (inertia)
// the problem is that the actual scroll for mouse down goes a little bit up
var tolerance = {
  up:         10, // big enough to ignore chrome fallback
  upAtBottom: 60,
  down:       10
};

// don't handle onscroll more often than animation
function onWindowScrollAndResize() {
  log("onWindowScrollAndResize", requestAnimationFrameId);
  if (requestAnimationFrameId) return;

  requestAnimationFrameId = window.requestAnimationFrame(function() {
    onscroll();
    requestAnimationFrameId = null;
  });

}

window.addEventListener('scroll', onWindowScrollAndResize);
window.addEventListener('resize', onWindowScrollAndResize);


function onscroll() {
  log("onscroll");
  if (isScrollOutOfDocument()) { // Ignore bouncy scrolling in OSX
    log("isScrollOutOfDocument");
    return;
  }

  var sitetoolbar = document.querySelector('.sitetoolbar');
  if (!sitetoolbar) {
    log("no siteoolbar");
    return; // page in a no-top-nav layout
  }


  var sitetoolbarHeight = sitetoolbar.offsetHeight;

  // should content become scrollable? (fixed)
  function contentIsScrollable() {
    log(document.querySelector('.page').clientHeight, document.documentElement.clientHeight + sitetoolbarHeight);
    return document.querySelector('.page').clientHeight > document.documentElement.clientHeight + sitetoolbarHeight;
  }

  log("contentIsScrollable", contentIsScrollable());

  // если содержимое меньше по высоте, чем окно, а сайдбар - больше,
  // то после скролла будет переход в fixed-состояние
  // так как содержимое меньше окна, то получим pageYOffset==0,
  // как следствие, прокрутить вверх будет нельзя,
  // т.е. фиксированное состояние будет снять нельзя, обратно увидеть sitetoolbar нельзя
  // чтобы такого не случилось
  //   => запрещаем переход в fixed-состояние с небольшим содержимым (оно всё равно не нужно)
  //     -> если содержимое чуть больше, чем окно, то при прокрутки были неожиданные появления sitetoolbar
  //     -> поэтому добавляем высоту sitetoolbar к сравнению
  // это важнейшая проверка на уместность fixed-состояния, поэтому идёт до всего
  if (!contentIsScrollable()) {
    setState('');
    return;
  }

  var browserScrollCause = getBrowserScrollCause();
  log("scrollCause", browserScrollCause);


  if (browserScrollCause !== null) {
    log("browser scroll");
    // browser-initiated scroll: never show navigation (except on top), try to hide it
    // if page top - user will see the nav and the header
    // if not page top - user will see the header when opening a link with #hash
    //   (without a sitetoolbar which would overlay it)
    lastPageYOffset = window.pageYOffset;

    if (window.pageYOffset > sitetoolbarHeight) {
      setState('out');
    } else {
      setState('');
    }
    return;
  }

  if (lastState == 'in' && window.pageYOffset < 3) {
    console.log("close to top");
    // if close to page top, no scrolled state apply
    lastPageYOffset = window.pageYOffset;
    setState('');
    return;
  }


  if (lastState === '' && window.pageYOffset < sitetoolbarHeight) {
    log("close to top");
    // if close to page top, no scrolled state apply
    lastPageYOffset = window.pageYOffset;
    return;
  }


  // now we are in the middle of the page or at the end
  // let's see if the user scrolls up or down

  var scrollDirection = window.pageYOffset > lastPageYOffset ? 'down' : 'up';
  var scrollDiff = Math.abs(window.pageYOffset - lastPageYOffset);

  log("scrollDiff", scrollDiff);

  // если прокрутили мало - ничего не делаем, но и точку отсчёта не меняем
  if (tolerance[scrollDirection] > scrollDiff) return;

  lastPageYOffset = window.pageYOffset;

  // в MacOs при прокрутке вниз возможен инерционный отскок наверх
  // если мы внизу страницы, то tolerance выше
  var scrollBottom = getDocumentHeight() - window.pageYOffset - window.innerHeight;
  if (scrollDirection == 'up' && scrollBottom < tolerance.upAtBottom && window.pageYOffset > tolerance.upAtBottom) return;

  log(scrollDirection, scrollDiff, tolerance[scrollDirection]);

  if (scrollDirection == 'up') {
    log("scroll up");
    setState('in');
    return;
  }

  if (scrollDirection == 'down') {
    log("scroll down");
    setState('out');
    return;
  }

}

/**
 * determines if the scroll position is outside of document boundaries
 * @return {bool} true if out of bounds, false otherwise
 */
function isScrollOutOfDocument() {
  // no document yet
  if (document.readyState != 'complete') return false;

  var pastTop = window.pageYOffset < 0;
  var pastBottom = window.pageYOffset + document.documentElement.clientHeight > getDocumentHeight();

  log("pastTop", pastTop, "pastBottom", pastBottom);

  return pastTop || pastBottom;
}

},{"client/dom/getBrowserScrollCause":"/js/javascript-nodejs/node_modules/client/dom/getBrowserScrollCause.js","client/dom/getDocumentHeight":"/js/javascript-nodejs/node_modules/client/dom/getDocumentHeight.js"}],"/js/javascript-nodejs/node_modules/client/head/unready.js":[function(require,module,exports){
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

},{}],"/js/javascript-nodejs/node_modules/client/spinner.js":[function(require,module,exports){
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

},{}],"/js/javascript-nodejs/node_modules/client/versions.json":[function(require,module,exports){
module.exports={"/js/auth.js":"09a4c8","/js/profile.js":"048cd4","/js/tutorial.js":"5a0bfe","/js/head.js":"912be3","/js/footer.js":"eaf544"}
},{}],"/js/javascript-nodejs/node_modules/lib/throttle.js":[function(require,module,exports){

function throttle(func, ms) {

  var isThrottled = false,
      savedArgs,
      savedThis;

  function wrapper() {

    if (isThrottled) {
      savedArgs = arguments;
      savedThis = this;
      return;
    }

    func.apply(this, arguments);

    isThrottled = true;

    setTimeout(function() {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}

module.exports = throttle;

},{}],"client/head":[function(require,module,exports){

exports.insertNonBlockingScript = require('./insertNonBlockingScript');
require('./unready');
exports.init = require('./init');
exports.login = require('./login');
exports.logout = require('./logout');
exports.Modal = require('./modal');
exports.fontTest = require('./fontTest');
exports.resizeOnload = require('./resizeOnload');
require('./sitetoolbar');
require('./navigation');

},{"./fontTest":"/js/javascript-nodejs/node_modules/client/head/fontTest.js","./init":"/js/javascript-nodejs/node_modules/client/head/init.js","./insertNonBlockingScript":"/js/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js","./login":"/js/javascript-nodejs/node_modules/client/head/login.js","./logout":"/js/javascript-nodejs/node_modules/client/head/logout.js","./modal":"/js/javascript-nodejs/node_modules/client/head/modal.js","./navigation":"/js/javascript-nodejs/node_modules/client/head/navigation.js","./resizeOnload":"/js/javascript-nodejs/node_modules/client/head/resizeOnload/index.js","./sitetoolbar":"/js/javascript-nodejs/node_modules/client/head/sitetoolbar.js","./unready":"/js/javascript-nodejs/node_modules/client/head/unready.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9qcy9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2RvbS9maW5kQ2xvc2VzdC5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvZG9tL2dldEJyb3dzZXJTY3JvbGxDYXVzZS5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvZG9tL2dldERvY3VtZW50SGVpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9kb20vZ2V0U2Nyb2xsYmFySGVpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2ZvbnRUZXN0LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL2luaXQuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2hlYWQvaW5zZXJ0Tm9uQmxvY2tpbmdTY3JpcHQuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2hlYWQvbG9naW4uanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2hlYWQvbG9nb3V0LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL21vZGFsLmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9oZWFkL25hdmlnYXRpb24uanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2hlYWQvcmVzaXplT25sb2FkL2lmcmFtZVJlc2l6ZS5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvaGVhZC9yZXNpemVPbmxvYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2hlYWQvc2l0ZXRvb2xiYXIuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2hlYWQvdW5yZWFkeS5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvc3Bpbm5lci5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvdmVyc2lvbnMuanNvbiIsIm5vZGVfbW9kdWxlcy9saWIvdGhyb3R0bGUuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2hlYWQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gbW9kdWxlcyBhcmUgZGVmaW5lZCBhcyBhbiBhcnJheVxuLy8gWyBtb2R1bGUgZnVuY3Rpb24sIG1hcCBvZiByZXF1aXJldWlyZXMgXVxuLy9cbi8vIG1hcCBvZiByZXF1aXJldWlyZXMgaXMgc2hvcnQgcmVxdWlyZSBuYW1lIC0+IG51bWVyaWMgcmVxdWlyZVxuLy9cbi8vIGFueXRoaW5nIGRlZmluZWQgaW4gYSBwcmV2aW91cyBidW5kbGUgaXMgYWNjZXNzZWQgdmlhIHRoZVxuLy8gb3JpZyBtZXRob2Qgd2hpY2ggaXMgdGhlIHJlcXVpcmV1aXJlIGZvciBwcmV2aW91cyBidW5kbGVzXG5cbihmdW5jdGlvbiBvdXRlciAobW9kdWxlcywgY2FjaGUsIGVudHJ5KSB7XG4gICAgLy8gU2F2ZSB0aGUgcmVxdWlyZSBmcm9tIHByZXZpb3VzIGJ1bmRsZSB0byB0aGlzIGNsb3N1cmUgaWYgYW55XG4gICAgdmFyIHByZXZpb3VzUmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuXG4gICAgZnVuY3Rpb24gbmV3UmVxdWlyZShuYW1lLCBqdW1wZWQpe1xuICAgICAgICBpZighY2FjaGVbbmFtZV0pIHtcbiAgICAgICAgICAgIGlmKCFtb2R1bGVzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgY2Fubm90IGZpbmQgdGhlIHRoZSBtb2R1bGUgd2l0aGluIG91ciBpbnRlcm5hbCBtYXAgb3JcbiAgICAgICAgICAgICAgICAvLyBjYWNoZSBqdW1wIHRvIHRoZSBjdXJyZW50IGdsb2JhbCByZXF1aXJlIGllLiB0aGUgbGFzdCBidW5kbGVcbiAgICAgICAgICAgICAgICAvLyB0aGF0IHdhcyBhZGRlZCB0byB0aGUgcGFnZS5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFJlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcbiAgICAgICAgICAgICAgICBpZiAoIWp1bXBlZCAmJiBjdXJyZW50UmVxdWlyZSkgcmV0dXJuIGN1cnJlbnRSZXF1aXJlKG5hbWUsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIGJ1bmRsZXMgb24gdGhpcyBwYWdlIHRoZSByZXF1aXJlIGZyb20gdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMgb25lIGlzIHNhdmVkIHRvICdwcmV2aW91c1JlcXVpcmUnLiBSZXBlYXQgdGhpcyBhc1xuICAgICAgICAgICAgICAgIC8vIG1hbnkgdGltZXMgYXMgdGhlcmUgYXJlIGJ1bmRsZXMgdW50aWwgdGhlIG1vZHVsZSBpcyBmb3VuZCBvclxuICAgICAgICAgICAgICAgIC8vIHdlIGV4aGF1c3QgdGhlIHJlcXVpcmUgY2hhaW4uXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzUmVxdWlyZSkgcmV0dXJuIHByZXZpb3VzUmVxdWlyZShuYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdDYW5ub3QgZmluZCBtb2R1bGUgXFwnJyArIG5hbWUgKyAnXFwnJyk7XG4gICAgICAgICAgICAgICAgZXJyLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG0gPSBjYWNoZVtuYW1lXSA9IHtleHBvcnRzOnt9fTtcbiAgICAgICAgICAgIG1vZHVsZXNbbmFtZV1bMF0uY2FsbChtLmV4cG9ydHMsIGZ1bmN0aW9uKHgpe1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IG1vZHVsZXNbbmFtZV1bMV1beF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld1JlcXVpcmUoaWQgPyBpZCA6IHgpO1xuICAgICAgICAgICAgfSxtLG0uZXhwb3J0cyxvdXRlcixtb2R1bGVzLGNhY2hlLGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICB9XG4gICAgZm9yKHZhciBpPTA7aTxlbnRyeS5sZW5ndGg7aSsrKSBuZXdSZXF1aXJlKGVudHJ5W2ldKTtcblxuICAgIC8vIE92ZXJyaWRlIHRoZSBjdXJyZW50IHJlcXVpcmUgd2l0aCB0aGlzIG5ldyBvbmVcbiAgICByZXR1cm4gbmV3UmVxdWlyZTtcbn0pXG4iLCIvLyBmaW5kIHRoZSBuZWFyZXN0IGFuY2VzdG9yIG1hdGNoaW5nIHNlbGVjdG9yXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW0sIHNlbGVjdG9yKSB7XG5cbiAgd2hpbGUgKGVsZW0pIHtcbiAgICBpZiAoZWxlbS5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW0gPSBlbGVtLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xuXG59O1xuIiwiLyoqXG4gKiBHZXQgdGhlIGNhdXNlIG9mIHRoZSBicm93c2VyLWluaXRpYXRlZCBzY3JvbGwgKGZvciBvbnNjcm9sbCBldmVudCBoYW5kbGVyKVxuICogaW5pdGlhbCB8IG9ubG9hZCB8IGNsaWNrIHwgbnVsbFxuICogQHR5cGUge2Jvb2xlYW59XG4gKi9cblxuXG4vLyBDaHJvbWVcbi8vIGF0IHBhZ2UgbG9hZCBicm93c2VyIGF1dG9zY3JvbGxzIHRoZSBwYWdlIHRvICNoYXNoXG52YXIgaXNJbml0aWFsU2Nyb2xsID0gdHJ1ZTtcbi8vIHRoZW4gYXQgb25sb2FkIGF1dG9zY3JvbGxzIHRvIGxhc3QgcmVtZW1iZXJlZCBwb3NpdGlvblxudmFyIGlzT25sb2FkU2Nyb2xsID0gZmFsc2U7XG5cbi8vIHNjcm9sbCBhcyBhIHJlc3VsdCBvZiBjbGlja2luZyAocHJvYmFibHksIG5hdmlnYXRpb24pXG52YXIgaXNDbGlja1Njcm9sbCA9IGZhbHNlO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4vLyAgY29uc29sZS5sb2coXCJET01Db250ZW50TG9hZGVkXCIpO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vIGFmdGVyIDIwMCBtcyB3ZSBjb25zaWRlciBhbGwgc2Nyb2xscyB1c2VyLXJlcXVlc3RlZCwgbm90IGJyb3dzZXIgYXV0b3Njcm9sbFxuICAgIGlzSW5pdGlhbFNjcm9sbCA9IGZhbHNlO1xuLy8gICAgY29uc29sZS5sb2coXCJjbGVhbiBpc0luaXRpYWxTY3JvbGxcIik7XG4gIH0sIDIwMDApO1xufSk7XG5cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgaXNDbGlja1Njcm9sbCA9IHRydWU7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgaXNDbGlja1Njcm9sbCA9IGZhbHNlO1xuICB9LCA1MCk7IC8vIGZpcmVmb3ggbmVlZHMgbW9yZSB0aGFuIDBtcyB0byBzY3JvbGxcbn0pO1xuXG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbi8vICBjb25zb2xlLmxvZyhcIm9ubG9hZFwiKTtcbiAgaXNPbmxvYWRTY3JvbGwgPSB0cnVlO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vIGxldCBicm93c2VyIHNjcm9sbCB0byB0aGUgbGFzdCByZW1lbWJlcmVkIHBvc2l0aW9uXG4vLyAgICBjb25zb2xlLmxvZyhcImNsZWFuIG9ubG9hZFwiKTtcbiAgICBpc09ubG9hZFNjcm9sbCA9IGZhbHNlO1xuICB9LCAyMDApO1xufTtcblxuXG5mdW5jdGlvbiBnZXRCcm93c2VyU2Nyb2xsQ2F1c2UoKSB7XG5cbiAgcmV0dXJuIGlzSW5pdGlhbFNjcm9sbCA/ICdpbml0aWFsJyA6XG4gICAgaXNPbmxvYWRTY3JvbGwgPyAnb25sb2FkJyA6XG4gICAgICBpc0NsaWNrU2Nyb2xsID8gJ2NsaWNrJyA6IG51bGw7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRCcm93c2VyU2Nyb2xsQ2F1c2U7XG4iLCJ2YXIgc2Nyb2xsYmFySGVpZ2h0ID0gcmVxdWlyZSgnLi9nZXRTY3JvbGxiYXJIZWlnaHQnKTtcblxuZnVuY3Rpb24gZ2V0RG9jdW1lbnRIZWlnaHQoZG9jKSB7XG4gIGRvYyA9IGRvYyB8fCBkb2N1bWVudDtcblxuICB2YXIgaGVpZ2h0ID0gTWF0aC5tYXgoXG4gICAgZG9jLmJvZHkuc2Nyb2xsSGVpZ2h0LCBkb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCxcbiAgICBkb2MuYm9keS5vZmZzZXRIZWlnaHQsIGRvYy5kb2N1bWVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0LFxuICAgIGRvYy5ib2R5LmNsaWVudEhlaWdodCwgZG9jLmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgKTtcblxuICBpZiAoZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA+IGRvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpIHtcbiAgICAvLyBnb3QgYSBob3JpeiBzY3JvbGwsIGxldCdzIGFkZCBpdFxuICAgIGhlaWdodCArPSBzY3JvbGxiYXJIZWlnaHQ7XG4gIH1cblxuICByZXR1cm4gaGVpZ2h0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXREb2N1bWVudEhlaWdodDtcblxuLyoqICBUT0RPOiBpcyBNYXRoLm1heCBiZWxvdyBzdGlsbCBuZWVkZWQgYW55d2hlcmU/XG4gKiBHZXRzIHRoZSBoZWlnaHQgb2YgdGhlIGRvY3VtZW50XG4gKiBAc2VlIGh0dHA6Ly9qYW1lcy5wYWRvbHNleS5jb20vamF2YXNjcmlwdC9nZXQtZG9jdW1lbnQtaGVpZ2h0LWNyb3NzLWJyb3dzZXIvXG4gKiBAcmV0dXJuIHtpbnR9IHRoZSBoZWlnaHQgb2YgdGhlIGRvY3VtZW50IGluIHBpeGVsc1xuXG5mdW5jdGlvbiBnZXREb2N1bWVudEhlaWdodCgpIHtcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5LFxuICAgICAgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gIHJldHVybiBNYXRoLm1heChcbiAgICBib2R5LnNjcm9sbEhlaWdodCwgZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCxcbiAgICBib2R5Lm9mZnNldEhlaWdodCwgZG9jdW1lbnRFbGVtZW50Lm9mZnNldEhlaWdodCxcbiAgICBib2R5LmNsaWVudEhlaWdodCwgZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICApO1xufVxuKi9cblxuXG4iLCJmdW5jdGlvbiBnZXRTY3JvbGxiYXJIZWlnaHQoKSB7XG4gIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG91dGVyLnN0eWxlLmNzc1RleHQgPSBcInZpc2liaWxpdHk6aGlkZGVuO2hlaWdodDoxMDBweFwiO1xuICBpZiAoIWRvY3VtZW50LmJvZHkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZXRTY3JvbGxiYXJIZWlnaHQgY2FsbGVkIHRvIGVhcmx5OiBubyBkb2N1bWVudC5ib2R5XCIpO1xuICB9XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xuXG4gIHZhciB3aWR0aE5vU2Nyb2xsID0gb3V0ZXIub2Zmc2V0V2lkdGg7XG4gIC8vIGZvcmNlIHNjcm9sbGJhcnNcbiAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSBcInNjcm9sbFwiO1xuXG4gIC8vIGFkZCBpbm5lcmRpdlxuICB2YXIgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBpbm5lci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xuICBvdXRlci5hcHBlbmRDaGlsZChpbm5lcik7XG5cbiAgdmFyIHdpZHRoV2l0aFNjcm9sbCA9IGlubmVyLm9mZnNldFdpZHRoO1xuXG4gIC8vIHJlbW92ZSBkaXZzXG4gIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xuXG4gIHJldHVybiB3aWR0aE5vU2Nyb2xsIC0gd2lkdGhXaXRoU2Nyb2xsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFNjcm9sbGJhckhlaWdodCgpO1xuIiwiLypcbtCY0LfQsdC10LPQsNC10LwgRk9VVCAtINC/0YDQvtGB0YLQvtC5INGB0L/QvtGB0L7QsSDQv9GA0L7QstC10YDQutC4INC30LDQs9GA0YPQt9C60Lgg0LjQutC+0L3QuNC6INGI0YDQuNGE0YLQsC5cbiAxKSDQlNC10LvQsNC10Lwg0LIgaWNvbmljINGI0YDQuNGE0YLQtSDQvtC00LjQvSDRgdC40LzQstC+0Lsg0YEg0LrQvtC00L7QvCAyMSAo0LLQvNC10YHRgtC+IMKrIcK7KVxuINCSIGljb25tb29uXG4gaHR0cDovL2lseWFrYW50b3IucnUvc2NyZWVuLzIwMTQtMDktMDZfMDE1Mi5wbmdcbiBodHRwOi8vaWx5YWthbnRvci5ydS9zY3JlZW4vMjAxNC0wOS0wNl8wMTUzLnBuZ1xuXG4g0K3RgtC+0YIg0YjRgNC40YTRgiDQsiDQvtCx0YvRh9C90L7QvCDRiNGA0LjRhNGC0LUgKHNlcmlmKSDRg9C30LrQuNC5INC/0L4g0YjQuNGA0LjQvdC1LCDQsCDQsiBpY29uaWMgLSDQvdC+0YDQvNCw0LvRjNC90YvQuS5cbiAyKSDQlNCw0LvQtdC1INC/0YDQuCDQt9Cw0LPRgNGD0LfQutC1INGB0L7Qt9C00LDRkdC8IDxzcGFuPiE8L3NwYW4+INC4INC00LDRkdC8INC10LzRgyBmb250RmFtaWx5INGB0L3QsNGH0LDQu9CwIHNlcmlmINC4INC30LDQvNC10YDRj9C10Lwg0YjQuNGA0LjQvdGDLCDQsCDQv9C+0YLQvtC8IEZvbnRJY29ucywgc2VyaWYuXG4g0J7RgtC70LDQstC70LjQstCw0LXQvCDQvNC+0LzQtdC90YIsINC60L7Qs9C00LAg0YjQuNGA0LjQvdCwINC40LfQvNC10L3QuNGC0YHRjy4g0K3RgtC+INC30L3QsNGH0LjRgiDRiNGA0LjRhNGCINC30LDQs9GA0YPQttC10L0uXG4g0JzQvtC20L3QviDRg9Cx0YDQsNGC0Ywg0LrQu9Cw0YHRgSAubm8taWNvbnMg0Lgg0L/QvtC60LDQt9Cw0YLRjCDQuNC60L7QvdC60LguXG4gKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgZWxlbS5jbGFzc05hbWUgPSAnZm9udC10ZXN0JztcbiAgZWxlbS5zdHlsZS5mb250RmFtaWx5ID0gJ3NlcmlmJztcbiAgdmFyIGluaXRpYWxXaWR0aCA9IGVsZW0ub2Zmc2V0V2lkdGg7XG5cbiAgZWxlbS5zdHlsZS5mb250RmFtaWx5ID0gJyc7XG5cbiAgZnVuY3Rpb24gY2hlY2tGb250TG9hZGVkKCkge1xuICAgIGlmIChpbml0aWFsV2lkdGggIT0gZWxlbS5vZmZzZXRXaWR0aCkge1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1pY29ucycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KGNoZWNrRm9udExvYWRlZCwgMTAwKTtcbiAgICB9XG4gIH1cblxuICBjaGVja0ZvbnRMb2FkZWQoKTtcblxufTtcbiIsIi8vIHVzZSBnbG9iYWwgdmFyaWFibGVzLCBiZWNhdXNlIGhlYWQuanMgYW5kIG1haW4uanMgaW5jbHVkZSBkaWZmZXJlbnQgbW9kdWxlc1xudmFyIGluaXRIYW5kbGVycyA9IHt9O1xudmFyIGluaXRXaGVuUmVhZHlDYWxsZWQgPSB7fTtcblxuLy8gVXNhZ2U6XG4vLyAgaW5pdFdoZW5SZWFkeSgnbG9naW4nKVxuLy8gICAgd2lsbCB0cmlnZ2VyIGFkZEluaXRIYW5kbGVyKCdsb2dpbicpXG4vLyAgICBhbmQgd2FpdCBpZiBpdCBkb2Vzbid0IGV4aXN0IHlldFxuXG4vLyBpZiBpbml0V2hlblJlYWR5IGlzIGZpcnN0IChmcm9tIEhUTUwpXG4vLyAgLT4gaW5pdFdoZW5SZWFkeUNhbGxlZFtuYW1lXSA9IHRydWVcbi8vICAtPiB0aGVuIGFkZEluaXRIYW5kbGVyIHVzZXMgaXRcblxuLy8gaWYgYWRkSW5pdEhhbmRsZXIgaXMgZmlyc3QgKGZyb20gU0NSSVBUKVxuLy8gIC0+IGluaXRIYW5kbGVyc1tuYW1lXSA9IGhhbmRsZXJcbi8vICAtPiB0aGVuIGluaXRXaGVuUmVhZHkgdXNlcyBpdFxuZnVuY3Rpb24gaW5pdFdoZW5SZWFkeShuYW1lKSB7XG4vLyAgY29uc29sZS5sb2coXCJpbml0V2hlblJlYWR5XCIsIG5hbWUpO1xuICBpZiAoaW5pdEhhbmRsZXJzW25hbWVdKSB7XG4gICAgaW5pdEhhbmRsZXJzW25hbWVdKCk7XG4gIH0gZWxzZSB7XG4gICAgaW5pdFdoZW5SZWFkeUNhbGxlZFtuYW1lXSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkSW5pdEhhbmRsZXIobmFtZSwgaGFuZGxlcikge1xuLy8gIGNvbnNvbGUubG9nKFwiYWRkSW5pdEhhbmRsZXJcIiwgbmFtZSwgaGFuZGxlcik7XG4gIGlmIChpbml0V2hlblJlYWR5Q2FsbGVkW25hbWVdKSB7XG4gICAgaGFuZGxlcigpO1xuICB9IGVsc2Uge1xuICAgIGluaXRIYW5kbGVyc1tuYW1lXSA9IGhhbmRsZXI7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHdoZW5SZWFkeTogaW5pdFdoZW5SZWFkeSxcbiAgYWRkSGFuZGxlcjogYWRkSW5pdEhhbmRsZXJcbn07XG4iLCJ2YXIgdmVyc2lvbnMgPSByZXF1aXJlKCdjbGllbnQvdmVyc2lvbnMnKTtcblxuLy8gaW5zZXJ0IDxzY3JpcHQgc3JjPVwiLi4uXCI+IGludG8gZG9jdW1lbnRcbi8vICAgLS0+IGRvZXMgbm90IGJsb2NrIHJlbmRlcmluZ1xuLy8gICAtLT4ga2VlcHMgZXhlY3V0aW9uIG9yZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBpZiAodmVyc2lvbnNbc3JjXSkge1xuICAgIHNyYyA9IHNyYy5yZXBsYWNlKCcuanMnLCAnLnYnICsgdmVyc2lvbnNbc3JjXSArICcuanMnKTtcbiAgfVxuICBzY3JpcHQuc3JjID0gc3JjO1xuICBzY3JpcHQuYXN5bmMgPSBvcHRpb25zLmFzeW5jIHx8IGZhbHNlOyAvLyBtYWludGFpbiB0aGUgZXhlY3V0aW9uIG9yZGVyIGlmIGFzeW5jIGlzIG5vdCBzZXRcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICByZXR1cm4gc2NyaXB0OyAvLyBmb3Igb25sb2FkIGhhbmRsZXJzXG59O1xuXG4iLCJ2YXIgaW5pdCA9IHJlcXVpcmUoJy4vaW5pdCcpO1xudmFyIGluc2VydE5vbkJsb2NraW5nU2NyaXB0ID0gcmVxdWlyZSgnLi9pbnNlcnROb25CbG9ja2luZ1NjcmlwdCcpO1xudmFyIE1vZGFsID0gcmVxdWlyZSgnLi9tb2RhbCcpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKCdjbGllbnQvc3Bpbm5lcicpO1xuXG5pbml0LmFkZEhhbmRsZXIoXCJsb2dpblwiLCBmdW5jdGlvbigpIHtcblxuICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpdGV0b29sYmFyX19sb2dpbicpO1xuICBidXR0b24ub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgbG9naW4oKTtcbiAgfTtcblxufSk7XG5cbmZ1bmN0aW9uIGxvZ2luKCkge1xuICB2YXIgbW9kYWwgPSBuZXcgTW9kYWwoKTtcbiAgdmFyIHNwaW5uZXIgPSBuZXcgU3Bpbm5lcigpO1xuICBtb2RhbC5zZXRDb250ZW50KHNwaW5uZXIuZWxlbSk7XG4gIHNwaW5uZXIuc3RhcnQoKTtcbiAgdmFyIHNjcmlwdCA9IGluc2VydE5vbkJsb2NraW5nU2NyaXB0KCcvanMvYXV0aC5qcycpO1xuICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgbW9kYWwucmVtb3ZlKCk7XG4gICAgdmFyIEF1dGhNb2RhbCA9IHJlcXVpcmUoJ2F1dGgvY2xpZW50JykuQXV0aE1vZGFsO1xuICAgIG5ldyBBdXRoTW9kYWwoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpbjtcbiIsInZhciBpbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5cbmluaXQuYWRkSGFuZGxlcihcImxvZ291dFwiLCBmdW5jdGlvbigpIHtcblxuICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpdGV0b29sYmFyX19sb2dvdXQnKTtcbiAgYnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxvZ291dCgpO1xuICB9O1xuICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgndW5yZWFkeScpO1xufSk7XG5cblxuZnVuY3Rpb24gbG9nb3V0KCkge1xuICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgZm9ybS5pbm5lckhUTUwgPSAnPGlucHV0IG5hbWU9XCJfY3NyZlwiIHZhbHVlPVwiJyArIHdpbmRvdy5jc3JmICsgJ1wiPic7XG4gIGZvcm0ubWV0aG9kID0gJ1BPU1QnO1xuICBmb3JtLmFjdGlvbiA9ICcvYXV0aC9sb2dvdXQnO1xuICBmb3JtLnN1Ym1pdCgpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gbG9nb3V0O1xuIiwiZnVuY3Rpb24gTW9kYWwoKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLnJlbmRlcigpO1xuXG4gIHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKHRoaXMpO1xuICB0aGlzLm9uRG9jdW1lbnRLZXlEb3duID0gdGhpcy5vbkRvY3VtZW50S2V5RG93bi5iaW5kKHRoaXMpO1xuXG4gIHRoaXMuZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGljayk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbkRvY3VtZW50S2V5RG93bik7XG59XG5cbk1vZGFsLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgZG9jdW1lbnQuYm9keS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZUVuZCcsICc8ZGl2IGNsYXNzPVwibW9kYWxcIj48ZGl2IGNsYXNzPVwibW9kYWwtZGlhbG9nXCI+PC9kaXY+PC9kaXY+Jyk7XG4gIHRoaXMuZWxlbSA9IGRvY3VtZW50LmJvZHkubGFzdENoaWxkO1xuICB0aGlzLmNvbnRlbnRFbGVtID0gdGhpcy5lbGVtLmxhc3RDaGlsZDtcbn07XG5cbk1vZGFsLnByb3RvdHlwZS5vbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2Nsb3NlLWJ1dHRvbicpKSB7XG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfVxufTtcblxuXG5Nb2RhbC5wcm90b3R5cGUub25Eb2N1bWVudEtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoZXZlbnQua2V5Q29kZSA9PSAyNykge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfVxufTtcblxuTW9kYWwucHJvdG90eXBlLnNob3dPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29udGVudEVsZW0uY2xhc3NMaXN0LmFkZCgnbW9kYWwtb3ZlcmxheScpO1xufTtcblxuTW9kYWwucHJvdG90eXBlLmhpZGVPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29udGVudEVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtb3ZlcmxheScpO1xufTtcblxuTW9kYWwucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbihodG1sT3JOb2RlKSB7XG4gIGlmICh0eXBlb2YgaHRtbE9yTm9kZSA9PSAnc3RyaW5nJykge1xuICAgIHRoaXMuY29udGVudEVsZW0uaW5uZXJIVE1MID0gaHRtbE9yTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvbnRlbnRFbGVtLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuY29udGVudEVsZW0uYXBwZW5kQ2hpbGQoaHRtbE9yTm9kZSk7XG4gIH1cbiAgdmFyIGF1dG9mb2N1cyA9IHRoaXMuY29udGVudEVsZW0ucXVlcnlTZWxlY3RvcignW2F1dG9mb2N1c10nKTtcbiAgaWYgKGF1dG9mb2N1cykgYXV0b2ZvY3VzLmZvY3VzKCk7XG59O1xuXG5Nb2RhbC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5lbGVtKTtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbkRvY3VtZW50S2V5RG93bik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsO1xuIiwiLy8gbmF2aWdhdGlvbiBzdGFydHMgdG8gd29yayByaWdodCBub3dcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZSk7XG5cbnZhciBjdHJsT3JBbHQgPSB+bmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJtYWMgb3MgeFwiKSA/ICdjdHJsJyA6ICdhbHQnO1xuXG5mdW5jdGlvbiBuYXZpZ2F0ZShldmVudCkge1xuICAvLyBkb24ndCByZWFjdCBvbiBDdHJsLT4gPC0gaWYgaW4gdGV4dFxuICBpZiAoflsnSU5QVVQnLCAnVEVYVEFSRUEnLCAnU0VMRUNUJ10uaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUpKSByZXR1cm47XG5cbiAgaWYgKCFldmVudFtjdHJsT3JBbHQgKyAnS2V5J10pIHJldHVybjtcblxuICB2YXIgcmVsID0gbnVsbDtcbiAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gIGNhc2UgMHgyNTpcbiAgICByZWwgPSAncHJldic7XG4gICAgYnJlYWs7XG4gIGNhc2UgMHgyNzpcbiAgICByZWwgPSAnbmV4dCc7XG4gICAgYnJlYWs7XG4gIGRlZmF1bHQ6XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW3JlbD1cIicgKyByZWwgKyAnXCJdJyk7XG4gIGlmICghbGluaykgcmV0dXJuO1xuXG4gIGRvY3VtZW50LmxvY2F0aW9uID0gbGluay5ocmVmO1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG59XG5cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICB2YXIga2V5RGVzYyA9IGN0cmxPckFsdFswXS50b1VwcGVyQ2FzZSgpICsgY3RybE9yQWx0LnNsaWNlKDEpO1xuXG4gIHZhciBzaG9ydGN1dDtcblxuICB2YXIgbmV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbcmVsPVwibmV4dFwiXScpO1xuICBpZiAobmV4dCkge1xuICAgIHNob3J0Y3V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYVtocmVmPVwiJyArIG5leHQuZ2V0QXR0cmlidXRlKCdocmVmJykgKyAnXCJdIC5wYWdlX19uYXYtdGV4dC1zaG9ydGN1dCcpO1xuICAgIHNob3J0Y3V0LmlubmVySFRNTCA9IGtleURlc2MgKyAnICsgPHNwYW4gY2xhc3M9XCJwYWdlX19uYXYtdGV4dC1hcnJcIj7ihpI8L3NwYW4+JztcbiAgfVxuXG4gIHZhciBwcmV2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tyZWw9XCJwcmV2XCJdJyk7XG4gIGlmIChwcmV2KSB7XG4gICAgc2hvcnRjdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhW2hyZWY9XCInICsgcHJldi5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSArICdcIl0gLnBhZ2VfX25hdi10ZXh0LXNob3J0Y3V0Jyk7XG4gICAgc2hvcnRjdXQuaW5uZXJIVE1MID0ga2V5RGVzYyArICcgKyA8c3BhbiBjbGFzcz1cInBhZ2VfX25hdi10ZXh0LWFyclwiPuKGkDwvc3Bhbj4nO1xuICB9XG5cbn0pO1xuIiwidmFyIGdldERvY3VtZW50SGVpZ2h0ID0gcmVxdWlyZSgnY2xpZW50L2RvbS9nZXREb2N1bWVudEhlaWdodCcpO1xuXG5mdW5jdGlvbiBpZnJhbWVSZXNpemUoaWZyRWxlbSwgY2FsbGJhY2spIHtcblxuICB2YXIgdGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAvLyBkZWZhdWx0IGhlaWdodFxuICAgIGNhbGxiYWNrKG5ldyBFcnJvcihcInRpbWVvdXRcIikpO1xuICB9LCA1MDApO1xuXG4gIGZ1bmN0aW9uIGRvbmUoZXJyLCBoZWlnaHQpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dFRpbWVyKTtcblxuICAgIGNhbGxiYWNrKGVyciwgaGVpZ2h0KTtcbiAgfVxuXG4gIC8vIHRocm93IHJpZ2h0IG5vdyBpZiBjcm9zcy1kb21haW5cbiAgdHJ5IHtcbiAgICAvKiBqc2hpbnQgLVcwMzAgKi9cbiAgICAoaWZyRWxlbS5jb250ZW50RG9jdW1lbnQgfHwgaWZyRWxlbS5jb250ZW50V2luZG93LmRvY3VtZW50KS5ib2R5O1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWZyYW1lUmVzaXplQ3Jvc3NEb21haW4oaWZyRWxlbSwgZG9uZSk7XG4gIH1cblxuXG4gIC8vIEhJTlQ6IEkgc2hvdWxuZCd0IG1vdmUgaWZyYW1lIGluIERPTSwgYmVjYXVzZSBpdCB3aWxsIHJlbG9hZCBpdCdzIGNvbnRlbnRzIHdoZW4gYXBwZW5kZWQvaW5zZXJ0ZWQgYW55d2hlcmUhXG4gIC8vIHNvIEkgY3JlYXRlIGEgY2xvbmUgYW5kIHdvcmsgb24gaXRcbiAgaWYgKCFpZnJFbGVtLm9mZnNldFdpZHRoKSB7XG4gICAgLy8gY2xvbmUgaWZyYW1lIGF0IGFub3RoZXIgcGxhY2UgdG8gc2VlIHRoZSBzaXplXG4gICAgdmFyIGNsb25lSWZyYW1lID0gaWZyRWxlbS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgY2xvbmVJZnJhbWUubmFtZSA9IFwiXCI7XG5cbiAgICBjbG9uZUlmcmFtZS5zdHlsZS5oZWlnaHQgPSAnNTBweCc7XG4gICAgY2xvbmVJZnJhbWUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGNsb25lSWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGNsb25lSWZyYW1lLnN0eWxlLnRvcCA9ICcxMDAwMHB4JztcblxuICAgIGNsb25lSWZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhlaWdodCA9IGdldERvY3VtZW50SGVpZ2h0KHRoaXMuY29udGVudERvY3VtZW50KTtcbiAgICAgIGlmckVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICBjbG9uZUlmcmFtZS5yZW1vdmUoKTtcbiAgICAgIGRvbmUobnVsbCwgaGVpZ2h0KTtcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjbG9uZUlmcmFtZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWZyRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgaWZyRWxlbS5zdHlsZS5oZWlnaHQgPSAnMXB4JztcblxuICB2YXIgaGVpZ2h0ID0gZ2V0RG9jdW1lbnRIZWlnaHQoaWZyRWxlbS5jb250ZW50RG9jdW1lbnQpO1xuXG4gIGlmckVsZW0uc3R5bGUuaGVpZ2h0ID0gJyc7XG4gIGRvbmUobnVsbCwgaGVpZ2h0KTtcbn1cblxuaWZyYW1lUmVzaXplLmFzeW5jID0gZnVuY3Rpb24gaWZyYW1lUmVzaXplQXN5bmMoaWZyYW1lLCBjYWxsYmFjaykge1xuICAvLyBkZWxheSB0byBsZXQgdGhlIGNvZGUgaW5zaWRlIHRoZSBpZnJhbWUgZmluaXNoXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgaWZyYW1lUmVzaXplKGlmcmFtZSwgY2FsbGJhY2spO1xuICB9LCAwKTtcbn07XG5cblxuZnVuY3Rpb24gaWZyYW1lUmVzaXplQ3Jvc3NEb21haW4oaWZyRWxlbSwgY2FsbGJhY2spIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkIHlldFwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZnJhbWVSZXNpemU7XG5cblxuLypcbiB3aW5kb3cub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuIGlmIChlLm9yaWdpbiAhPSBcImh0dHA6Ly9ydS5sb29rYXRjb2RlLmNvbVwiKSByZXR1cm47XG4gdmFyIGRhdGEgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gaWYgKCFkYXRhIHx8IGRhdGEuY21kICE9IFwicmVzaXplLWlmcmFtZVwiKSByZXR1cm47XG4gdmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShkYXRhLm5hbWUpWzBdO1xuXG4gZWxlbS5zdHlsZS5oZWlnaHQgPSArZGF0YS5oZWlnaHQgKyAxMCArIFwicHhcIjtcbiB2YXIgZGVmZXJyZWQgPSBpZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5kZWZlcnJlZHNbZGF0YS5pZF07XG4gZGVmZXJyZWQucmVzb2x2ZSgpO1xuIH07XG5cbiBmdW5jdGlvbiBpZnJhbWVSZXNpemVDcm9zc0RvbWFpbihpZnJFbGVtLCBjYWxsYmFjaykge1xuXG4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiBjYWxsYmFjayhuZXcgRXJyb3IoXCJ0aW1lb3V0XCIpKTtcbiB9LCA1MDApO1xuXG4gdHJ5IHtcbiAvLyB0cnkgdG8gc2VlIGlmIHJlc2l6ZXIgY2FuIHdvcmsgb24gdGhpcyBpZnJhbWVcbiBpZnJFbGVtLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXCJ0ZXN0XCIsIFwiaHR0cDovL3J1Lmxvb2thdGNvZGUuY29tXCIpO1xuIH0gY2F0Y2goZSkge1xuIC8vIGlmcmFtZSBmcm9tIGFub3RoZXIgZG9tYWluLCBzb3JyeVxuIGNhbGxiYWNrKG5ldyBFcnJvcihcInRoZSByZXNpemVyIG11c3QgYmUgZnJvbSBydS5sb29rYXRjb2RlLmNvbVwiKSk7XG4gcmV0dXJuO1xuIH1cblxuIGlmICghaWZyRWxlbS5vZmZzZXRXaWR0aCkge1xuIC8vIG1vdmUgaWZyYW1lIHRvIGFub3RoZXIgcGxhY2UgdG8gcmVzaXplIHRoZXJlXG4gdmFyIHBsYWNlaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuIGlmckVsZW0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIGlmckVsZW0pO1xuIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyRWxlbSk7XG4gfVxuXG4gaWZyRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gdmFyIGlkID0gXCJcIiArIE1hdGgucmFuZG9tKCk7XG4gdmFyIG1lc3NhZ2UgPSB7IGNtZDogJ3Jlc2l6ZS1pZnJhbWUnLCBuYW1lOiBpZnJFbGVtWzBdLm5hbWUsIGlkOiBpZCB9O1xuIC8vIFRPRE9cbiBpZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5kZWZlcnJlZHNbaWRdID0gZGVmZXJyZWQ7XG4gZGVmZXJyZWQuYWx3YXlzKGZ1bmN0aW9uKCkge1xuIGRlbGV0ZSBpZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5kZWZlcnJlZHNbaWRdO1xuIH0pO1xuXG4gdmFyIGZyYW1lID0gaWZyYW1lUmVzaXplQ3Jvc3NEb21haW4uaWZyYW1lO1xuIGlmIChmcmFtZS5sb2FkZWQpIHtcbiBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpLCBcImh0dHA6Ly9ydS5sb29rYXRjb2RlLmNvbVwiKTtcbiB9IGVsc2Uge1xuIGZyYW1lLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShtZXNzYWdlKSwgXCJodHRwOi8vcnUubG9va2F0Y29kZS5jb21cIik7XG4gfSk7XG4gfVxuXG4gaWYgKHBsYWNlaG9sZGVyKSB7XG4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiBwbGFjZWhvbGRlci5yZXBsYWNlV2l0aChpZnJFbGVtKTtcbiB9LCAyMCk7XG4gfVxuXG4gcmV0dXJuIGRlZmVycmVkO1xuIH1cblxuIGlmcmFtZVJlc2l6ZUNyb3NzRG9tYWluLmRlZmVycmVkcyA9IHt9O1xuIGlmcmFtZVJlc2l6ZUNyb3NzRG9tYWluLmlmcmFtZSA9ICQoJzxpZnJhbWUgc3JjPVwiaHR0cDovL3J1Lmxvb2thdGNvZGUuY29tL2ZpbGVzL2lmcmFtZS1yZXNpemUuaHRtbFwiIHN0eWxlPVwiZGlzcGxheTpub25lXCI+PC9pZnJhbWU+JykucHJlcGVuZFRvKCdib2R5Jyk7XG4gaWZyYW1lUmVzaXplQ3Jvc3NEb21haW4uaWZyYW1lLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gdGhpcy5sb2FkZWQgPSB0cnVlO1xuIH0pO1xuICovXG4iLCJ2YXIgaWZyYW1lUmVzaXplID0gcmVxdWlyZSgnLi9pZnJhbWVSZXNpemUnKTtcbnZhciBmaW5kQ2xvc2VzdCA9IHJlcXVpcmUoJ2NsaWVudC9kb20vZmluZENsb3Nlc3QnKTtcbnZhciB0aHJvdHRsZSA9IHJlcXVpcmUoJ2xpYi90aHJvdHRsZScpO1xuLy8gdHJhY2sgcmVzaXplZCBpZnJhbWVzIGluIHdpbmRvdy5vbnJlc2l6ZVxuXG52YXIgb25SZXNpemVRdWV1ZSA9IFtdO1xuXG5leHBvcnRzLmlmcmFtZSA9IGZ1bmN0aW9uKGlmcmFtZSkge1xuXG4gIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICBpZnJhbWVSZXNpemUuYXN5bmMoaWZyYW1lLCBmdW5jdGlvbihlcnIsIGhlaWdodCkge1xuICAgICAgaWYgKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgaWYgKGhlaWdodCkgaWZyYW1lLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgfSk7XG4gIH1cblxuICByZXNpemUoKTtcbn07XG5cbmV4cG9ydHMuY29kZVRhYnMgPSBmdW5jdGlvbihpZnJhbWUpIHtcbiAgZnVuY3Rpb24gaGlkZVNob3dBcnJvd3MoKSB7XG5cbiAgICAvLyBhZGQgYXJyb3dzIGlmIG5lZWRlZFxuICAgIHZhciBlbGVtID0gZmluZENsb3Nlc3QoaWZyYW1lLCAnLmNvZGUtdGFicycpO1xuICAgIHZhciBjb250ZW50RWxlbSA9IGZpbmRDbG9zZXN0KGlmcmFtZSwgJ1tkYXRhLWNvZGUtdGFicy1jb250ZW50XScpO1xuICAgIHZhciBzd2l0Y2hlc0VsZW0gPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvZGUtdGFicy1zd2l0Y2hlc10nKTtcbiAgICB2YXIgc3dpdGNoZXNFbGVtSXRlbXMgPSBzd2l0Y2hlc0VsZW0uZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICBpZiAoc3dpdGNoZXNFbGVtSXRlbXMub2Zmc2V0V2lkdGggPiBzd2l0Y2hlc0VsZW0ub2Zmc2V0V2lkdGgpIHtcbiAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZCgnY29kZS10YWJzX3Njcm9sbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2NvZGUtdGFic19zY3JvbGwnKTtcbiAgICB9XG5cbiAgfVxuXG4gIGhpZGVTaG93QXJyb3dzKCk7XG4gIG9uUmVzaXplUXVldWUucHVzaChoaWRlU2hvd0Fycm93cyk7XG59O1xuXG5cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRocm90dGxlKGZ1bmN0aW9uKCkge1xuICBvblJlc2l6ZVF1ZXVlLmZvckVhY2goZnVuY3Rpb24ob25SZXNpemUpIHtcbiAgICBvblJlc2l6ZSgpO1xuICB9KTtcbn0sIDIwMCkpO1xuIiwidmFyIGdldEJyb3dzZXJTY3JvbGxDYXVzZSA9IHJlcXVpcmUoJ2NsaWVudC9kb20vZ2V0QnJvd3NlclNjcm9sbENhdXNlJyk7XG52YXIgZ2V0RG9jdW1lbnRIZWlnaHQgPSByZXF1aXJlKCdjbGllbnQvZG9tL2dldERvY3VtZW50SGVpZ2h0Jyk7XG5cbnZhciBsYXN0UGFnZVlPZmZzZXQgPSAwO1xuXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQ7XG5cbnZhciBsYXN0U3RhdGUgPSAnJztcblxudmFyIERFQlVHID0gZmFsc2U7XG5mdW5jdGlvbiBsb2coKSB7XG4gIGlmIChERUJVRykge1xuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuLy8gYWRkcyBbZGF0YS1zY3JvbGwtcHJldl0gJiYgW2RhdGEtc2Nyb2xsXSBhdHRyaWJ1dGVzXG4vLyBib3RoIHRoZSBwcmV2aW91cyBhbmQgdGhlIG5leHQgc3RhdGUgPT4gZm9yIENTUyBhbmltYXRpb24gdG8gZHJhdyB0aGUgdHJhbnNpdGlvblxuZnVuY3Rpb24gc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgbG9nKFwic2V0U3RhdGVcIiwgbmV3U3RhdGUpO1xuICBkb2N1bWVudC5ib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGwtcHJldicsIGRvY3VtZW50LmJvZHkuZ2V0QXR0cmlidXRlKCdkYXRhLXNjcm9sbCcpIHx8ICcnKTtcblxuICBpZiAoIW5ld1N0YXRlKSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc2Nyb2xsJyk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2Nyb2xsJywgbmV3U3RhdGUpO1xuICB9XG4gIGxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xufVxuXG5cbi8vIHdoZW4gSSBzY3JvbGwgZG93biBvbiBNYWNPUywgQ2hyb21lIGRvZXMgdGhlIGJvdW5jZSB0cmlja1xuLy8gQXQgdGhlIHBhZ2UgYm90dG9tIGl0IGlzIHBvc3NpYmxlIHRvIHNjcm9sbCBiZWxvdyB0aGUgcGFnZSwgYW5kIHRoZW4gaXQgZ29lcyBiYWNrIChpbmVydGlhKVxuLy8gdGhlIHByb2JsZW0gaXMgdGhhdCB0aGUgYWN0dWFsIHNjcm9sbCBmb3IgbW91c2UgZG93biBnb2VzIGEgbGl0dGxlIGJpdCB1cFxudmFyIHRvbGVyYW5jZSA9IHtcbiAgdXA6ICAgICAgICAgMTAsIC8vIGJpZyBlbm91Z2ggdG8gaWdub3JlIGNocm9tZSBmYWxsYmFja1xuICB1cEF0Qm90dG9tOiA2MCxcbiAgZG93bjogICAgICAgMTBcbn07XG5cbi8vIGRvbid0IGhhbmRsZSBvbnNjcm9sbCBtb3JlIG9mdGVuIHRoYW4gYW5pbWF0aW9uXG5mdW5jdGlvbiBvbldpbmRvd1Njcm9sbEFuZFJlc2l6ZSgpIHtcbiAgbG9nKFwib25XaW5kb3dTY3JvbGxBbmRSZXNpemVcIiwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQpO1xuICBpZiAocmVxdWVzdEFuaW1hdGlvbkZyYW1lSWQpIHJldHVybjtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgb25zY3JvbGwoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVJZCA9IG51bGw7XG4gIH0pO1xuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvbldpbmRvd1Njcm9sbEFuZFJlc2l6ZSk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25XaW5kb3dTY3JvbGxBbmRSZXNpemUpO1xuXG5cbmZ1bmN0aW9uIG9uc2Nyb2xsKCkge1xuICBsb2coXCJvbnNjcm9sbFwiKTtcbiAgaWYgKGlzU2Nyb2xsT3V0T2ZEb2N1bWVudCgpKSB7IC8vIElnbm9yZSBib3VuY3kgc2Nyb2xsaW5nIGluIE9TWFxuICAgIGxvZyhcImlzU2Nyb2xsT3V0T2ZEb2N1bWVudFwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc2l0ZXRvb2xiYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZXRvb2xiYXInKTtcbiAgaWYgKCFzaXRldG9vbGJhcikge1xuICAgIGxvZyhcIm5vIHNpdGVvb2xiYXJcIik7XG4gICAgcmV0dXJuOyAvLyBwYWdlIGluIGEgbm8tdG9wLW5hdiBsYXlvdXRcbiAgfVxuXG5cbiAgdmFyIHNpdGV0b29sYmFySGVpZ2h0ID0gc2l0ZXRvb2xiYXIub2Zmc2V0SGVpZ2h0O1xuXG4gIC8vIHNob3VsZCBjb250ZW50IGJlY29tZSBzY3JvbGxhYmxlPyAoZml4ZWQpXG4gIGZ1bmN0aW9uIGNvbnRlbnRJc1Njcm9sbGFibGUoKSB7XG4gICAgbG9nKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYWdlJykuY2xpZW50SGVpZ2h0LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0ICsgc2l0ZXRvb2xiYXJIZWlnaHQpO1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFnZScpLmNsaWVudEhlaWdodCA+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgKyBzaXRldG9vbGJhckhlaWdodDtcbiAgfVxuXG4gIGxvZyhcImNvbnRlbnRJc1Njcm9sbGFibGVcIiwgY29udGVudElzU2Nyb2xsYWJsZSgpKTtcblxuICAvLyDQtdGB0LvQuCDRgdC+0LTQtdGA0LbQuNC80L7QtSDQvNC10L3RjNGI0LUg0L/QviDQstGL0YHQvtGC0LUsINGH0LXQvCDQvtC60L3Qviwg0LAg0YHQsNC50LTQsdCw0YAgLSDQsdC+0LvRjNGI0LUsXG4gIC8vINGC0L4g0L/QvtGB0LvQtSDRgdC60YDQvtC70LvQsCDQsdGD0LTQtdGCINC/0LXRgNC10YXQvtC0INCyIGZpeGVkLdGB0L7RgdGC0L7Rj9C90LjQtVxuICAvLyDRgtCw0Log0LrQsNC6INGB0L7QtNC10YDQttC40LzQvtC1INC80LXQvdGM0YjQtSDQvtC60L3QsCwg0YLQviDQv9C+0LvRg9GH0LjQvCBwYWdlWU9mZnNldD09MCxcbiAgLy8g0LrQsNC6INGB0LvQtdC00YHRgtCy0LjQtSwg0L/RgNC+0LrRgNGD0YLQuNGC0Ywg0LLQstC10YDRhSDQsdGD0LTQtdGCINC90LXQu9GM0LfRjyxcbiAgLy8g0YIu0LUuINGE0LjQutGB0LjRgNC+0LLQsNC90L3QvtC1INGB0L7RgdGC0L7Rj9C90LjQtSDQsdGD0LTQtdGCINGB0L3Rj9GC0Ywg0L3QtdC70YzQt9GPLCDQvtCx0YDQsNGC0L3QviDRg9Cy0LjQtNC10YLRjCBzaXRldG9vbGJhciDQvdC10LvRjNC30Y9cbiAgLy8g0YfRgtC+0LHRiyDRgtCw0LrQvtCz0L4g0L3QtSDRgdC70YPRh9C40LvQvtGB0YxcbiAgLy8gICA9PiDQt9Cw0L/RgNC10YnQsNC10Lwg0L/QtdGA0LXRhdC+0LQg0LIgZml4ZWQt0YHQvtGB0YLQvtGP0L3QuNC1INGBINC90LXQsdC+0LvRjNGI0LjQvCDRgdC+0LTQtdGA0LbQuNC80YvQvCAo0L7QvdC+INCy0YHRkSDRgNCw0LLQvdC+INC90LUg0L3Rg9C20L3QvilcbiAgLy8gICAgIC0+INC10YHQu9C4INGB0L7QtNC10YDQttC40LzQvtC1INGH0YPRgtGMINCx0L7Qu9GM0YjQtSwg0YfQtdC8INC+0LrQvdC+LCDRgtC+INC/0YDQuCDQv9GA0L7QutGA0YPRgtC60Lgg0LHRi9C70Lgg0L3QtdC+0LbQuNC00LDQvdC90YvQtSDQv9C+0Y/QstC70LXQvdC40Y8gc2l0ZXRvb2xiYXJcbiAgLy8gICAgIC0+INC/0L7RjdGC0L7QvNGDINC00L7QsdCw0LLQu9GP0LXQvCDQstGL0YHQvtGC0YMgc2l0ZXRvb2xiYXIg0Log0YHRgNCw0LLQvdC10L3QuNGOXG4gIC8vINGN0YLQviDQstCw0LbQvdC10LnRiNCw0Y8g0L/RgNC+0LLQtdGA0LrQsCDQvdCwINGD0LzQtdGB0YLQvdC+0YHRgtGMIGZpeGVkLdGB0L7RgdGC0L7Rj9C90LjRjywg0L/QvtGN0YLQvtC80YMg0LjQtNGR0YIg0LTQviDQstGB0LXQs9C+XG4gIGlmICghY29udGVudElzU2Nyb2xsYWJsZSgpKSB7XG4gICAgc2V0U3RhdGUoJycpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBicm93c2VyU2Nyb2xsQ2F1c2UgPSBnZXRCcm93c2VyU2Nyb2xsQ2F1c2UoKTtcbiAgbG9nKFwic2Nyb2xsQ2F1c2VcIiwgYnJvd3NlclNjcm9sbENhdXNlKTtcblxuXG4gIGlmIChicm93c2VyU2Nyb2xsQ2F1c2UgIT09IG51bGwpIHtcbiAgICBsb2coXCJicm93c2VyIHNjcm9sbFwiKTtcbiAgICAvLyBicm93c2VyLWluaXRpYXRlZCBzY3JvbGw6IG5ldmVyIHNob3cgbmF2aWdhdGlvbiAoZXhjZXB0IG9uIHRvcCksIHRyeSB0byBoaWRlIGl0XG4gICAgLy8gaWYgcGFnZSB0b3AgLSB1c2VyIHdpbGwgc2VlIHRoZSBuYXYgYW5kIHRoZSBoZWFkZXJcbiAgICAvLyBpZiBub3QgcGFnZSB0b3AgLSB1c2VyIHdpbGwgc2VlIHRoZSBoZWFkZXIgd2hlbiBvcGVuaW5nIGEgbGluayB3aXRoICNoYXNoXG4gICAgLy8gICAod2l0aG91dCBhIHNpdGV0b29sYmFyIHdoaWNoIHdvdWxkIG92ZXJsYXkgaXQpXG4gICAgbGFzdFBhZ2VZT2Zmc2V0ID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuXG4gICAgaWYgKHdpbmRvdy5wYWdlWU9mZnNldCA+IHNpdGV0b29sYmFySGVpZ2h0KSB7XG4gICAgICBzZXRTdGF0ZSgnb3V0Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0YXRlKCcnKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGxhc3RTdGF0ZSA9PSAnaW4nICYmIHdpbmRvdy5wYWdlWU9mZnNldCA8IDMpIHtcbiAgICBjb25zb2xlLmxvZyhcImNsb3NlIHRvIHRvcFwiKTtcbiAgICAvLyBpZiBjbG9zZSB0byBwYWdlIHRvcCwgbm8gc2Nyb2xsZWQgc3RhdGUgYXBwbHlcbiAgICBsYXN0UGFnZVlPZmZzZXQgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgc2V0U3RhdGUoJycpO1xuICAgIHJldHVybjtcbiAgfVxuXG5cbiAgaWYgKGxhc3RTdGF0ZSA9PT0gJycgJiYgd2luZG93LnBhZ2VZT2Zmc2V0IDwgc2l0ZXRvb2xiYXJIZWlnaHQpIHtcbiAgICBsb2coXCJjbG9zZSB0byB0b3BcIik7XG4gICAgLy8gaWYgY2xvc2UgdG8gcGFnZSB0b3AsIG5vIHNjcm9sbGVkIHN0YXRlIGFwcGx5XG4gICAgbGFzdFBhZ2VZT2Zmc2V0ID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIHJldHVybjtcbiAgfVxuXG5cbiAgLy8gbm93IHdlIGFyZSBpbiB0aGUgbWlkZGxlIG9mIHRoZSBwYWdlIG9yIGF0IHRoZSBlbmRcbiAgLy8gbGV0J3Mgc2VlIGlmIHRoZSB1c2VyIHNjcm9sbHMgdXAgb3IgZG93blxuXG4gIHZhciBzY3JvbGxEaXJlY3Rpb24gPSB3aW5kb3cucGFnZVlPZmZzZXQgPiBsYXN0UGFnZVlPZmZzZXQgPyAnZG93bicgOiAndXAnO1xuICB2YXIgc2Nyb2xsRGlmZiA9IE1hdGguYWJzKHdpbmRvdy5wYWdlWU9mZnNldCAtIGxhc3RQYWdlWU9mZnNldCk7XG5cbiAgbG9nKFwic2Nyb2xsRGlmZlwiLCBzY3JvbGxEaWZmKTtcblxuICAvLyDQtdGB0LvQuCDQv9GA0L7QutGA0YPRgtC40LvQuCDQvNCw0LvQviAtINC90LjRh9C10LPQviDQvdC1INC00LXQu9Cw0LXQvCwg0L3QviDQuCDRgtC+0YfQutGDINC+0YLRgdGH0ZHRgtCwINC90LUg0LzQtdC90Y/QtdC8XG4gIGlmICh0b2xlcmFuY2Vbc2Nyb2xsRGlyZWN0aW9uXSA+IHNjcm9sbERpZmYpIHJldHVybjtcblxuICBsYXN0UGFnZVlPZmZzZXQgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cbiAgLy8g0LIgTWFjT3Mg0L/RgNC4INC/0YDQvtC60YDRg9GC0LrQtSDQstC90LjQtyDQstC+0LfQvNC+0LbQtdC9INC40L3QtdGA0YbQuNC+0L3QvdGL0Lkg0L7RgtGB0LrQvtC6INC90LDQstC10YDRhVxuICAvLyDQtdGB0LvQuCDQvNGLINCy0L3QuNC30YMg0YHRgtGA0LDQvdC40YbRiywg0YLQviB0b2xlcmFuY2Ug0LLRi9GI0LVcbiAgdmFyIHNjcm9sbEJvdHRvbSA9IGdldERvY3VtZW50SGVpZ2h0KCkgLSB3aW5kb3cucGFnZVlPZmZzZXQgLSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIGlmIChzY3JvbGxEaXJlY3Rpb24gPT0gJ3VwJyAmJiBzY3JvbGxCb3R0b20gPCB0b2xlcmFuY2UudXBBdEJvdHRvbSAmJiB3aW5kb3cucGFnZVlPZmZzZXQgPiB0b2xlcmFuY2UudXBBdEJvdHRvbSkgcmV0dXJuO1xuXG4gIGxvZyhzY3JvbGxEaXJlY3Rpb24sIHNjcm9sbERpZmYsIHRvbGVyYW5jZVtzY3JvbGxEaXJlY3Rpb25dKTtcblxuICBpZiAoc2Nyb2xsRGlyZWN0aW9uID09ICd1cCcpIHtcbiAgICBsb2coXCJzY3JvbGwgdXBcIik7XG4gICAgc2V0U3RhdGUoJ2luJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHNjcm9sbERpcmVjdGlvbiA9PSAnZG93bicpIHtcbiAgICBsb2coXCJzY3JvbGwgZG93blwiKTtcbiAgICBzZXRTdGF0ZSgnb3V0Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbn1cblxuLyoqXG4gKiBkZXRlcm1pbmVzIGlmIHRoZSBzY3JvbGwgcG9zaXRpb24gaXMgb3V0c2lkZSBvZiBkb2N1bWVudCBib3VuZGFyaWVzXG4gKiBAcmV0dXJuIHtib29sfSB0cnVlIGlmIG91dCBvZiBib3VuZHMsIGZhbHNlIG90aGVyd2lzZVxuICovXG5mdW5jdGlvbiBpc1Njcm9sbE91dE9mRG9jdW1lbnQoKSB7XG4gIC8vIG5vIGRvY3VtZW50IHlldFxuICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPSAnY29tcGxldGUnKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIHBhc3RUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgPCAwO1xuICB2YXIgcGFzdEJvdHRvbSA9IHdpbmRvdy5wYWdlWU9mZnNldCArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgPiBnZXREb2N1bWVudEhlaWdodCgpO1xuXG4gIGxvZyhcInBhc3RUb3BcIiwgcGFzdFRvcCwgXCJwYXN0Qm90dG9tXCIsIHBhc3RCb3R0b20pO1xuXG4gIHJldHVybiBwYXN0VG9wIHx8IHBhc3RCb3R0b207XG59XG4iLCIvLyBpZiBjbGFzcyBlbmRzIHdpdGggX3VucmVhZHkgdGhlbiB3ZSBjb25zaWRlciBlbGVtZW50IHVudXNhYmxlICh5ZXQpXG5cblxuLy8gY2FuY2VsIGNsaWNrcyBvbiA8YSBjbGFzcz1cInVucmVhZHlcIj4gYW5kIDxidXR0b24gY2xhc3M9XCJ1bnJlYWR5XCI+XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgd2hpbGUgKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lLm1hdGNoKC9fdW5yZWFkeVxcYi8pKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgfVxufSk7XG5cbi8vIGNhbmNlbCBzdWJtaXRzIG9mIDxmb3JtIGNsYXNzPVwidW5yZWFkeVwiPlxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihlKSB7XG4gIGlmIChlLnRhcmdldC5jbGFzc05hbWUubWF0Y2goL191bnJlYWR5XFxiLykpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59KTtcbiIsIi8vIFVzYWdlOlxuLy8gIDEpIG5ldyBTcGlubmVyKHsgZWxlbTogZWxlbX0pIC0+IHN0YXJ0L3N0b3AoKVxuLy8gIDIpIG5ldyBTcGlubmVyKCkgLT4gc29tZXdoZXJlLmFwcGVuZChzcGlubmVyLmVsZW0pIC0+IHN0YXJ0L3N0b3BcbmZ1bmN0aW9uIFNwaW5uZXIob3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5lbGVtID0gb3B0aW9ucy5lbGVtO1xuICB0aGlzLnNpemUgPSBvcHRpb25zLnNpemUgfHwgJ21lZGl1bSc7XG4gIC8vIGFueSBjbGFzcyB0byBhZGQgdG8gc3Bpbm5lciAobWFrZSBzcGlubmVyIHNwZWNpYWwgaGVyZSlcbiAgdGhpcy5jbGFzcyA9IG9wdGlvbnMuY2xhc3MgPyAoJyAnICsgb3B0aW9ucy5jbGFzcykgOiAnJztcblxuICAvLyBhbnkgY2xhc3MgdG8gYWRkIHRvIGVsZW1lbnQgKHRvIGhpZGUgaXQncyBjb250ZW50IGZvciBpbnN0YW5jZSlcbiAgdGhpcy5lbGVtQ2xhc3MgPSBvcHRpb25zLmVsZW1DbGFzcztcblxuICBpZiAodGhpcy5zaXplICE9ICdtZWRpdW0nICYmIHRoaXMuc2l6ZSAhPSAnc21hbGwnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgc2l6ZTogXCIgKyB0aGlzLnNpemUpO1xuICB9XG5cbiAgaWYgKCF0aGlzLmVsZW0pIHtcbiAgICB0aGlzLmVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgfVxufVxuXG5TcGlubmVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5lbGVtQ2xhc3MpIHtcbiAgICB0aGlzLmVsZW0uY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmVsZW1DbGFzcyk7XG4gIH1cblxuICB0aGlzLmVsZW0uaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCAnPHNwYW4gY2xhc3M9XCJzcGlubmVyIHNwaW5uZXJfYWN0aXZlIHNwaW5uZXJfJyArIHRoaXMuc2l6ZSArIHRoaXMuY2xhc3MgKyAnXCI+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzFcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzJcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzcGlubmVyX19kb3Qgc3Bpbm5lcl9fZG90XzNcIj48L3NwYW4+PC9zcGFuPicpO1xufTtcblxuU3Bpbm5lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW0ucmVtb3ZlQ2hpbGQodGhpcy5lbGVtLnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyJykpO1xuXG4gIGlmICh0aGlzLmVsZW1DbGFzcykge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuZWxlbUNsYXNzKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGlubmVyO1xuIiwibW9kdWxlLmV4cG9ydHM9e1wiL2pzL2F1dGguanNcIjpcIjA5YTRjOFwiLFwiL2pzL3Byb2ZpbGUuanNcIjpcIjA0OGNkNFwiLFwiL2pzL3R1dG9yaWFsLmpzXCI6XCI1YTBiZmVcIixcIi9qcy9oZWFkLmpzXCI6XCI5MTJiZTNcIixcIi9qcy9mb290ZXIuanNcIjpcImVhZjU0NFwifSIsIlxuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgbXMpIHtcblxuICB2YXIgaXNUaHJvdHRsZWQgPSBmYWxzZSxcbiAgICAgIHNhdmVkQXJncyxcbiAgICAgIHNhdmVkVGhpcztcblxuICBmdW5jdGlvbiB3cmFwcGVyKCkge1xuXG4gICAgaWYgKGlzVGhyb3R0bGVkKSB7XG4gICAgICBzYXZlZEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBzYXZlZFRoaXMgPSB0aGlzO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlzVGhyb3R0bGVkID0gdHJ1ZTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpc1Rocm90dGxlZCA9IGZhbHNlO1xuICAgICAgaWYgKHNhdmVkQXJncykge1xuICAgICAgICB3cmFwcGVyLmFwcGx5KHNhdmVkVGhpcywgc2F2ZWRBcmdzKTtcbiAgICAgICAgc2F2ZWRBcmdzID0gc2F2ZWRUaGlzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LCBtcyk7XG4gIH1cblxuICByZXR1cm4gd3JhcHBlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiIsIlxuZXhwb3J0cy5pbnNlcnROb25CbG9ja2luZ1NjcmlwdCA9IHJlcXVpcmUoJy4vaW5zZXJ0Tm9uQmxvY2tpbmdTY3JpcHQnKTtcbnJlcXVpcmUoJy4vdW5yZWFkeScpO1xuZXhwb3J0cy5pbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5leHBvcnRzLmxvZ2luID0gcmVxdWlyZSgnLi9sb2dpbicpO1xuZXhwb3J0cy5sb2dvdXQgPSByZXF1aXJlKCcuL2xvZ291dCcpO1xuZXhwb3J0cy5Nb2RhbCA9IHJlcXVpcmUoJy4vbW9kYWwnKTtcbmV4cG9ydHMuZm9udFRlc3QgPSByZXF1aXJlKCcuL2ZvbnRUZXN0Jyk7XG5leHBvcnRzLnJlc2l6ZU9ubG9hZCA9IHJlcXVpcmUoJy4vcmVzaXplT25sb2FkJyk7XG5yZXF1aXJlKCcuL3NpdGV0b29sYmFyJyk7XG5yZXF1aXJlKCcuL25hdmlnYXRpb24nKTtcbiJdfQ==
