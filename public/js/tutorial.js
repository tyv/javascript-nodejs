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


},{"./polyfill":"/js/javascript-nodejs/node_modules/client/polyfill/index.js"}],"/js/javascript-nodejs/node_modules/client/dom/findClosest.js":[function(require,module,exports){
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

},{}],"/js/javascript-nodejs/node_modules/client/isScrolledIntoView.js":[function(require,module,exports){

function isScrolledIntoView(elem) {
  var coords = elem.getBoundingClientRect();

  var visibleHeight = 0;

  if (coords.top < 0) {
    visibleHeight = coords.bottom;
  } else if (coords.bottom > window.innerHeight) {
    visibleHeight = window.innerHeight - top;
  } else {
    return true;
  }

  return visibleHeight > 10;
}

module.exports = isScrolledIntoView;

},{}],"/js/javascript-nodejs/node_modules/client/notify.js":[function(require,module,exports){
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

},{"./dom4":"/js/javascript-nodejs/node_modules/client/polyfill/dom4.js"}],"/js/javascript-nodejs/node_modules/client/prism/addLineNumbers.js":[function(require,module,exports){

function addLineNumbers(pre) {

  var linesNum = (1 + pre.innerHTML.split('\n').length);
  var lineNumbersWrapper;

  var lines = new Array(linesNum);
  lines = lines.join('<span></span>');

  lineNumbersWrapper = document.createElement('span');
  lineNumbersWrapper.className = 'line-numbers-rows';
  lineNumbersWrapper.innerHTML = lines;

  if (pre.hasAttribute('data-start')) {
    pre.style.counterReset = 'linenumber ' + Number(pre.dataset.start) - 1;
  }

  pre.appendChild(lineNumbersWrapper);
}


module.exports = addLineNumbers;

},{}],"/js/javascript-nodejs/node_modules/client/prism/codeBox.js":[function(require,module,exports){
var resizeOnload = require('client/head').resizeOnload;
var isScrolledIntoView = require('client/isScrolledIntoView');
var addLineNumbers = require('./addLineNumbers');

function CodeBox(elem) {

  var preElem = elem.querySelector('pre');
  var codeElem = preElem.querySelector('code');
  var code = codeElem.textContent;

  Prism.highlightElement(codeElem);
  addLineNumbers(preElem);

  addBlockHighlight(preElem, elem.dataset.highlightBlock);
  addInlineHighlight(preElem, elem.dataset.highlightInline);

  var isJS = preElem.classList.contains('language-javascript');
  var isHTML = preElem.classList.contains('language-markup');
  var isTrusted = elem.dataset.trusted;
  var jsFrame;
  var htmlResult;
  var isFirstRun = true;

  if (!isJS && !isHTML) return;

  var runElem = elem.querySelector('[data-action="run"]');
  if (runElem) {
    runElem.onclick = function() {
      this.blur();
      run();
      return false;
    };
  }

  var editElem = elem.querySelector('[data-action="edit"]');
  if (editElem) {
    editElem.onclick = function() {
      this.blur();
      edit();
      return false;
    };
  }

  if (elem.dataset.autorun) {
    setTimeout(run, 10);
  }

  function postJSFrame() {
    var win = jsFrame[0].contentWindow;
    if (typeof win.postMessage != 'function') {
      alert("Извините, запуск кода требует более современный браузер");
      return;
    }
    win.postMessage(code, 'http://ru.lookatcode.com/showjs');
  }

  function runHTML() {

    var hasHeight = false;
    var frame;

    if (htmlResult && elem.dataset.refresh) {
      htmlResult.remove();
      htmlResult = null;
    }

    if (!htmlResult) {
      htmlResult = document.createElement('div');
      htmlResult.className = "code-result code-example__result";

      frame = document.createElement('iframe');
      frame.name = 'frame-' + Math.random();
      frame.className = 'code-result__iframe';

      if (elem.dataset.demoHeight === "0") {// does that ever happen or dead code?
        frame.style.display = 'none';
        hasHeight = true;
      } else if (elem.dataset.demoHeight) {
        var height = +elem.dataset.demoHeight;
        frame.style.height = height + 'px';
        hasHeight = true;
      }
      htmlResult.appendChild(frame);

      elem.appendChild(htmlResult);
    } else {
      frame = htmlResult.querySelector('iframe');
    }

    if (isTrusted) {
      var doc = frame.contentDocument || frame.contentWindow.document;

      doc.open();
      doc.write(normalizeHtml(code));
      doc.close();

      if (!hasHeight) {
        resizeOnload.iframe(frame);
      }

      if (!(isFirstRun && elem.dataset.autorun)) {
        if (!isScrolledIntoView(htmlResult)) {
          htmlResult.scrollIntoView(false);
        }
      }

    } else {
      var form = document.createElement('form');
      form.style.display = 'none';
      form.method = 'POST';
      form.enctype = "application/x-www-form-urlencoded";
      form.action = "http://ru.lookatcode.com/showhtml";
      form.target = frame.name;

      var textarea = document.createElement('textarea');
      textarea.name = 'code';
      textarea.value = normalizeHtml(code);
      form.appendChild(textarea);

      frame.parentNode.insertBefore(form, frame.nextSibling);
      form.submit();
      form.remove();

      if (!(isFirstRun && elem.dataset.autorun)) {
        frame.onload = function() {

          if (!hasHeight) {
            resizeOnload.iframe(frame);
          }

          if (!isScrolledIntoView(htmlResult)) {
            htmlResult.scrollIntoView(false);
          }
        };
      }
    }

  }

  function runJS() {

    if (isTrusted) {

      try {
        /* jshint -W061 */
        window["eval"].call(window, code);
      } catch (e) {
        console.error(e);
        alert("Ошибка: " + e.message);
      }

    } else {

      if (elem.dataset.refresh && jsFrame) {
        jsFrame.remove();
        jsFrame = null;
      }

      if (!jsFrame) {
        // create iframe for js
        jsFrame = document.createElement('iframe');
        jsFrame.className = 'js-frame';
        jsFrame.src = 'http://ru.lookatcode.com/showjs';
        jsFrame.style.width = 0;
        jsFrame.style.height = 0;
        jsFrame.style.border = 'none';
        jsFrame.onload = function() {
          postJSFrame();
        };
        document.body.appendChild(jsFrame);
      } else {
        postJSFrame();
      }

    }
  }

  function edit() {

    var html;
    if (isHTML) {
      html = normalizeHtml(code);
    } else {
      var codeIndented = code.replace(/^/gim, '    ');
      html = '<!DOCTYPE html>\n<html>\n\n<body>\n  <script>\n' + codeIndented + '\n  </script>\n</body>\n\n</html>';
    }

    var form = document.createElement('form');
    form.action = "http://plnkr.co/edit/?p=preview";
    form.method = "POST";
    form.target = "_blank";

    document.body.appendChild(form);

    var textarea = document.createElement('textarea');
    textarea.name = "files[index.html]";
    textarea.value = html;
    form.appendChild(textarea);

    var input = document.createElement('input');
    input.name = "description";
    input.value = "Fork from " + window.location;
    form.appendChild(input);

    form.submit();
    form.remove();
  }


  function normalizeHtml() {
    var codeLc = code.toLowerCase();
    var hasBodyStart = codeLc.match('<body>');
    var hasBodyEnd = codeLc.match('</body>');
    var hasHtmlStart = codeLc.match('<html>');
    var hasHtmlEnd = codeLc.match('</html>');

    var hasDocType = codeLc.match(/^\s*<!doctype/);

    if (hasDocType) {
      return code;
    }

    var result = code;

    if (!hasHtmlStart) {
      result = '<html>\n' + result;
    }

    if (!hasHtmlEnd) {
      result = result + '\n</html>';
    }

    if (!hasBodyStart) {
      result = result.replace('<html>', '<html>\n<head>\n  <meta charset="utf-8">\n</head><body>\n');
    }

    if (!hasBodyEnd) {
      result = result.replace('</html>', '\n</body>\n</html>');
    }

    result = '<!DOCTYPE HTML>\n' + result;

    return result;
  }


  function run() {
    if (isJS) {
      runJS();
    } else {
      runHTML();
    }
    isFirstRun = false;
  }


}


function addBlockHighlight(pre, lines) {

  if (!lines) {
    return;
  }

  var ranges = lines.replace(/\s+/g, '').split(',');

  /*jshint -W084 */
  for (var i = 0, range; range = ranges[i++];) {
    range = range.split('-');

    var start = +range[0],
        end = +range[1] || start;


    var mask = '<div class="block-highlight" data-start="' + start + '" data-end="' + end + '">' +
      new Array(start + 1).join('\n') +
      '<div class="mask">' + new Array(end - start + 2).join('\n') + '</div></div>';

    pre.insertAdjacentHTML("afterBegin", mask);
  }

}


function addInlineHighlight(pre, ranges) {

  var codeElem = pre.querySelector('code');

  ranges = ranges ? ranges.split(",") : [];

  for (var i = 0; i < ranges.length; i++) {
    var piece = ranges[i].split(':');
    var lineNum = +piece[0], strRange = piece[1].split('-');
    var start = +strRange[0], end = +strRange[1];
    var mask = '<div class="inline-highlight">' +
      new Array(lineNum + 1).join('\n') +
      new Array(start + 1).join(' ') +
      '<span class="mask">' + new Array(end - start + 1).join(' ') + '</span></div>';

    codeElem.insertAdjacentHTML("afterBegin", mask);
  }
}


module.exports = CodeBox;

},{"./addLineNumbers":"/js/javascript-nodejs/node_modules/client/prism/addLineNumbers.js","client/head":"client/head","client/isScrolledIntoView":"/js/javascript-nodejs/node_modules/client/isScrolledIntoView.js"}],"/js/javascript-nodejs/node_modules/client/prism/codeTabsBox.js":[function(require,module,exports){
var delegate = require('client/delegate');
var addLineNumbers = require('./addLineNumbers');

function CodeTabsBox(elem) {

  this.elem = elem;
  this.translateX = 0;

  this.switchesElem = elem.querySelector('[data-code-tabs-switches]');
  this.switchesElemItems = this.switchesElem.firstElementChild;
  this.arrowLeft = elem.querySelector('[data-code-tabs-left]');
  this.arrowRight = elem.querySelector('[data-code-tabs-right]');


  this.arrowLeft.onclick = function(e) {
    e.preventDefault();

    this.translateX = Math.max(0, this.translateX - this.switchesElem.offsetWidth);
    this.renderTranslate();
  }.bind(this);


  this.arrowRight.onclick = function(e) {
    e.preventDefault();

    this.translateX = Math.min(this.translateX +this.switchesElem.offsetWidth, this.switchesElemItems.offsetWidth - this.switchesElem.offsetWidth);
    this.renderTranslate();
  }.bind(this);

  this.delegate('.code-tabs__switch', 'click', this.onSwitchClick);
}

CodeTabsBox.prototype.onSwitchClick = function(e) {
  e.preventDefault();

  var siblings = e.delegateTarget.parentNode.children;
  var tabs = this.elem.querySelector('[data-code-tabs-content]').children;


  var selectedIndex;
  for(var i=0; i<siblings.length; i++) {
    var switchElem = siblings[i];
    var tabElem = tabs[i];
    if (switchElem == e.delegateTarget) {
      selectedIndex = i;
      tabElem.classList.add('code-tabs__section_current');
      switchElem.classList.add('code-tabs__switch_current');
    } else {
      tabElem.classList.remove('code-tabs__section_current');
      switchElem.classList.remove('code-tabs__switch_current');
    }
  }

  if (selectedIndex === 0) {
    this.elem.classList.add('code-tabs_result_on');
  } else {
    this.elem.classList.remove('code-tabs_result_on');

    this.highlightTab(tabs[selectedIndex]);
  }

};


CodeTabsBox.prototype.highlightTab = function(tab) {
  if (tab.highlighted) return;
  var preElem = tab.querySelector('pre');
  var codeElem = preElem.querySelector('code');
  Prism.highlightElement(codeElem);
  addLineNumbers(preElem);
  tab.highlighted = true;
};

CodeTabsBox.prototype.renderTranslate = function() {
  console.log(this.translateX);
  this.switchesElemItems.style.transform = 'translateX(-' + this.translateX + 'px)';
  if (this.translateX === 0) {
    this.arrowLeft.setAttribute('disabled', '');
  } else {
    this.arrowLeft.removeAttribute('disabled');
  }

  if (this.translateX === this.switchesElemItems.offsetWidth - this.switchesElem.offsetWidth) {
    this.arrowRight.setAttribute('disabled', '');
  } else {
    this.arrowRight.removeAttribute('disabled');
  }

};


delegate.delegateMixin(CodeTabsBox.prototype);


module.exports = CodeTabsBox;

},{"./addLineNumbers":"/js/javascript-nodejs/node_modules/client/prism/addLineNumbers.js","client/delegate":"/js/javascript-nodejs/node_modules/client/delegate.js"}],"/js/javascript-nodejs/node_modules/client/prism/index.js":[function(require,module,exports){
require('prismjs/components/prism-core.js');
require('prismjs/components/prism-markup.js');
require('prismjs/components/prism-css.js');
require('prismjs/components/prism-css-extras.js');
require('prismjs/components/prism-clike.js');
require('prismjs/components/prism-javascript.js');
require('prismjs/components/prism-coffeescript.js');
require('prismjs/components/prism-http.js');
require('prismjs/components/prism-scss.js');
require('prismjs/components/prism-sql.js');
require('prismjs/components/prism-php.js');
require('prismjs/components/prism-php-extras.js');
require('prismjs/components/prism-python.js');
require('prismjs/components/prism-ruby.js');
require('prismjs/components/prism-java.js');

var CodeBox = require('./codeBox');
var CodeTabsBox = require('./codeTabsBox');

function initCodeBoxes() {

  // highlight inline
  var codeExampleElems = document.getElementsByClassName('code-example');

  for (var i = 0; i < codeExampleElems.length; i++) {
    var codeExampleElem = codeExampleElems[i];
    new CodeBox(codeExampleElem);
  }

}


function initCodeTabsBox() {

  var elems = document.querySelectorAll('div.code-tabs');

  for (var i = 0; i < elems.length; i++) {
    new CodeTabsBox(elems[i]);
  }

}

module.exports = function () {
  document.removeEventListener('DOMContentLoaded', Prism.highlightAll);

  document.addEventListener('DOMContentLoaded', function() {
    initCodeBoxes();
    initCodeTabsBox();
  });

};


},{"./codeBox":"/js/javascript-nodejs/node_modules/client/prism/codeBox.js","./codeTabsBox":"/js/javascript-nodejs/node_modules/client/prism/codeTabsBox.js","prismjs/components/prism-clike.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-clike.js","prismjs/components/prism-coffeescript.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-coffeescript.js","prismjs/components/prism-core.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-core.js","prismjs/components/prism-css-extras.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-css-extras.js","prismjs/components/prism-css.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-css.js","prismjs/components/prism-http.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-http.js","prismjs/components/prism-java.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-java.js","prismjs/components/prism-javascript.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-javascript.js","prismjs/components/prism-markup.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-markup.js","prismjs/components/prism-php-extras.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-php-extras.js","prismjs/components/prism-php.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-php.js","prismjs/components/prism-python.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-python.js","prismjs/components/prism-ruby.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-ruby.js","prismjs/components/prism-scss.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-scss.js","prismjs/components/prism-sql.js":"/js/javascript-nodejs/node_modules/prismjs/components/prism-sql.js"}],"/js/javascript-nodejs/node_modules/client/spinner.js":[function(require,module,exports){
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

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-clike.js":[function(require,module,exports){
Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//g,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*?(\r?\n|$)/g,
			lookbehind: true
		}
	],
	'string': /("|')(\\?.)*?\1/g,
	'class-name': {
		pattern: /((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,
	'boolean': /\b(true|false)\b/g,
	'function': {
		pattern: /[a-z0-9_]+\(/ig,
		inside: {
			punctuation: /\(/
		}
	},
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
	'operator': /[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
	'ignore': /&(lt|gt|amp);/gi,
	'punctuation': /[{}[\];(),.:]/g
};

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-coffeescript.js":[function(require,module,exports){
Prism.languages.coffeescript = Prism.languages.extend('javascript', {
	'comment': [
		/([#]{3}\s*\r?\n(.*\s*\r*\n*)\s*?\r?\n[#]{3})/g,
		/(\s|^)([#]{1}[^#^\r^\n]{2,}?(\r?\n|$))/g
	],
	'keyword': /\b(this|window|delete|class|extends|namespace|extend|ar|let|if|else|while|do|for|each|of|return|in|instanceof|new|with|typeof|try|catch|finally|null|undefined|break|continue)\b/g
});

Prism.languages.insertBefore('coffeescript', 'keyword', {
	'function': {
		pattern: /[a-z|A-z]+\s*[:|=]\s*(\([.|a-z\s|,|:|{|}|\"|\'|=]*\))?\s*-&gt;/gi,
		inside: {
			'function-name': /[_?a-z-|A-Z-]+(\s*[:|=])| @[_?$?a-z-|A-Z-]+(\s*)| /g,
			'operator': /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g
		}
	},
	'attr-name': /[_?a-z-|A-Z-]+(\s*:)| @[_?$?a-z-|A-Z-]+(\s*)| /g
});

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-core.js":[function(require,module,exports){
self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

var _ = self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					return o.slice();
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		// Insert a token before another token in a language literal
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];
			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type) {
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object') {
						_.languages.DFS(o[i], callback);
					} else if (_.util.type(o[i]) === 'Array') {
						_.languages.DFS(o[i], callback, i);
					}
				}
			}
		}
	},

	highlightAll: function(async, callback) {
		var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1];
			grammar = _.languages[language];
		}

		if (!grammar) {
			return;
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		if(!code) {
			return;
		}

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-highlight', env);

		if (async && self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = Token.stringify(JSON.parse(evt.data), language);

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language)

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					lookbehindLength = 0,
					alias = pattern.alias;

				pattern = pattern.pattern || pattern;

				for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str);

					if (match) {
						if(lookbehind) {
							lookbehindLength = match[1].length;
						}

						var from = match.index - 1 + lookbehindLength,
							match = match[0].slice(lookbehindLength),
							len = match.length,
							to = from + len,
							before = str.slice(0, from + 1),
							after = str.slice(to + 1);

						var args = [i, 1];

						if (before) {
							args.push(before);
						}

						var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias);

						args.push(wrapped);

						if (after) {
							args.push(after);
						}

						Array.prototype.splice.apply(strarr, args);
					}
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias) {
	this.type = type;
	this.content = content;
	this.alias = alias;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (Object.prototype.toString.call(o) == '[object Array]') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = '';

	for (var name in env.attributes) {
		attributes += name + '="' + (env.attributes[name] || '') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';

};

if (!self.document) {
	if (!self.addEventListener) {
		// in Node.js
		return self.Prism;
	}
 	// In worker
	self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code;

		self.postMessage(JSON.stringify(_.util.encode(_.tokenize(code, _.languages[lang]))));
		self.close();
	}, false);

	return self.Prism;
}

// Get current script and highlight
var script = document.getElementsByTagName('script');

script = script[script.length - 1];

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		document.addEventListener('DOMContentLoaded', _.highlightAll);
	}
}

return self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-css-extras.js":[function(require,module,exports){
Prism.languages.css.selector = {
	pattern: /[^\{\}\s][^\{\}]*(?=\s*\{)/g,
	inside: {
		'pseudo-element': /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/g,
		'pseudo-class': /:[-\w]+(?:\(.*\))?/g,
		'class': /\.[-:\.\w]+/g,
		'id': /#[-:\.\w]+/g
	}
};

Prism.languages.insertBefore('css', 'ignore', {
	'hexcode': /#[\da-f]{3,6}/gi,
	'entity': /\\[\da-f]{1,8}/gi,
	'number': /[\d%\.]+/g
});
},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-css.js":[function(require,module,exports){
Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//g,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*{))/gi,
		inside: {
			'punctuation': /[;:]/g
		}
	},
	'url': /url\((["']?).*?\1\)/gi,
	'selector': /[^\{\}\s][^\{\};]*(?=\s*\{)/g,
	'property': /(\b|\B)[\w-]+(?=\s*:)/ig,
	'string': /("|')(\\?.)*?\1/g,
	'important': /\B!important\b/gi,
	'punctuation': /[\{\};:]/g,
	'function': /[-a-z0-9]+(?=\()/ig
};

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /<style[\w\W]*?>[\w\W]*?<\/style>/ig,
			inside: {
				'tag': {
					pattern: /<style[\w\W]*?>|<\/style>/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.css
			}
		}
	});
}
},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-http.js":[function(require,module,exports){
Prism.languages.http = {
    'request-line': {
        pattern: /^(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b\shttps?:\/\/\S+\sHTTP\/[0-9.]+/g,
        inside: {
            // HTTP Verb
            property: /^\b(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b/g,
            // Path or query argument
            'attr-name': /:\w+/g
        }
    },
    'response-status': {
        pattern: /^HTTP\/1.[01] [0-9]+.*/g,
        inside: {
            // Status, e.g. 200 OK
            property: /[0-9]+[A-Z\s-]+$/g
        }
    },
    // HTTP header name
    keyword: /^[\w-]+:(?=.+)/gm
};

// Create a mapping of Content-Type headers to language definitions
var httpLanguages = {
    'application/json': Prism.languages.javascript,
    'application/xml': Prism.languages.markup,
    'text/xml': Prism.languages.markup,
    'text/html': Prism.languages.markup
};

// Insert each content type parser that has its associated language
// currently loaded.
for (var contentType in httpLanguages) {
    if (httpLanguages[contentType]) {
        var options = {};
        options[contentType] = {
            pattern: new RegExp('(content-type:\\s*' + contentType + '[\\w\\W]*?)\\n\\n[\\w\\W]*', 'gi'),
            lookbehind: true,
            inside: {
                rest: httpLanguages[contentType]
            }
        };
        Prism.languages.insertBefore('http', 'keyword', options);
    }
}

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-java.js":[function(require,module,exports){
Prism.languages.java = Prism.languages.extend('clike', {
	'keyword': /\b(abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/g,
	'number': /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+[e]?[\d]*[df]\b|\W\d*\.?\d+\b/gi,
	'operator': {
		pattern: /(^|[^\.])(?:\+=|\+\+?|-=|--?|!=?|<{1,2}=?|>{1,3}=?|==?|&=|&&?|\|=|\|\|?|\?|\*=?|\/=?|%=?|\^=?|:|~)/gm,
		lookbehind: true
	}
});
},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-javascript.js":[function(require,module,exports){
Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
		lookbehind: true
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /<script[\w\W]*?>[\w\W]*?<\/script>/ig,
			inside: {
				'tag': {
					pattern: /<script[\w\W]*?>|<\/script>/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.javascript
			}
		}
	});
}

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-markup.js":[function(require,module,exports){
Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/g,
	'prolog': /<\?.+?\?>/,
	'doctype': /<!DOCTYPE.+?>/,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
		inside: {
			'tag': {
				pattern: /^<\/?[\w:-]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[\w-]+?:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
				inside: {
					'punctuation': /=|>|"/g
				}
			},
			'punctuation': /\/?>/g,
			'attr-name': {
				pattern: /[\w:-]+/g,
				inside: {
					'namespace': /^[\w-]+?:/
				}
			}

		}
	},
	'entity': /\&#?[\da-z]{1,8};/gi
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-php-extras.js":[function(require,module,exports){
Prism.languages.insertBefore('php', 'variable', {
	'this': /\$this/g,
	'global': /\$_?(GLOBALS|SERVER|GET|POST|FILES|REQUEST|SESSION|ENV|COOKIE|HTTP_RAW_POST_DATA|argc|argv|php_errormsg|http_response_header)/g,
	'scope': {
		pattern: /\b[\w\\]+::/g,
		inside: {
			keyword: /(static|self|parent)/,
			punctuation: /(::|\\)/
		}
	}
});
},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-php.js":[function(require,module,exports){
/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */

Prism.languages.php = Prism.languages.extend('clike', {
	'keyword': /\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/ig,
	'constant': /\b[A-Z0-9_]{2,}\b/g,
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])(\/\/|#).*?(\r?\n|$))/g,
		lookbehind: true
	}
});

Prism.languages.insertBefore('php', 'keyword', {
	'delimiter': /(\?>|<\?php|<\?)/ig,
	'variable': /(\$\w+)\b/ig,
	'package': {
		pattern: /(\\|namespace\s+|use\s+)[\w\\]+/g,
		lookbehind: true,
		inside: {
			punctuation: /\\/
		}
	}
});

// Must be defined after the function pattern
Prism.languages.insertBefore('php', 'operator', {
	'property': {
		pattern: /(->)[\w]+/g,
		lookbehind: true
	}
});

// Add HTML support of the markup language exists
if (Prism.languages.markup) {

	// Tokenize all inline PHP blocks that are wrapped in <?php ?>
	// This allows for easy PHP + markup highlighting
	Prism.hooks.add('before-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		env.tokenStack = [];

		env.backupCode = env.code;
		env.code = env.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/ig, function(match) {
			env.tokenStack.push(match);

			return '{{{PHP' + env.tokenStack.length + '}}}';
		});
	});

	// Restore env.code for other plugins (e.g. line-numbers)
	Prism.hooks.add('before-insert', function(env) {
		if (env.language === 'php') {
			env.code = env.backupCode;
			delete env.backupCode;
		}
	});

	// Re-insert the tokens after highlighting
	Prism.hooks.add('after-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		for (var i = 0, t; t = env.tokenStack[i]; i++) {
			env.highlightedCode = env.highlightedCode.replace('{{{PHP' + (i + 1) + '}}}', Prism.highlight(t, env.grammar, 'php'));
		}

		env.element.innerHTML = env.highlightedCode;
	});

	// Wrap tokens in classes that are missing them
	Prism.hooks.add('wrap', function(env) {
		if (env.language === 'php' && env.type === 'markup') {
			env.content = env.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g, "<span class=\"token php\">$1</span>");
		}
	});

	// Add the rules before all others
	Prism.languages.insertBefore('php', 'comment', {
		'markup': {
			pattern: /<[^?]\/?(.*?)>/g,
			inside: Prism.languages.markup
		},
		'php': /\{\{\{PHP[0-9]+\}\}\}/g
	});
}

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-python.js":[function(require,module,exports){
Prism.languages.python= { 
	'comment': {
		pattern: /(^|[^\\])#.*?(\r?\n|$)/g,
		lookbehind: true
	},
	'string': /"""[\s\S]+?"""|("|')(\\?.)*?\1/g,
	'keyword' : /\b(as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/g,
	'boolean' : /\b(True|False)\b/g,
	'number' : /\b-?(0x)?\d*\.?[\da-f]+\b/g,
	'operator' : /[-+]{1,2}|=?&lt;|=?&gt;|!|={1,2}|(&){1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|~|\^|%|\b(or|and|not)\b/g,
	'ignore' : /&(lt|gt|amp);/gi,
	'punctuation' : /[{}[\];(),.:]/g
};


},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-ruby.js":[function(require,module,exports){
/**
 * Original by Samuel Flores
 *
 * Adds the following new token classes:
 * 		constant, builtin, variable, symbol, regex
 */
Prism.languages.ruby = Prism.languages.extend('clike', {
	'comment': /#[^\r\n]*(\r?\n|$)/g,
	'keyword': /\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/g,
	'builtin': /\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,
	'constant': /\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g
});

Prism.languages.insertBefore('ruby', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
		lookbehind: true
	},
	'variable': /[@$]+\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
	'symbol': /:\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g
});

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-scss.js":[function(require,module,exports){
Prism.languages.scss = Prism.languages.extend('css', {
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
		lookbehind: true
	},
	// aturle is just the @***, not the entire rule (to highlight var & stuffs)
	// + add ability to highlight number & unit for media queries
	'atrule': /@[\w-]+(?=\s+(\(|\{|;))/gi,
	// url, compassified
	'url': /([-a-z]+-)*url(?=\()/gi,
	// CSS selector regex is not appropriate for Sass
	// since there can be lot more things (var, @ directive, nesting..)
	// a selector must start at the end of a property or after a brace (end of other rules or nesting)
	// it can contain some caracters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
	// the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
	// can "pass" as a selector- e.g: proper#{$erty})
	// this one was ard to do, so please be careful if you edit this one :)
	'selector': /([^@;\{\}\(\)]?([^@;\{\}\(\)]|&|\#\{\$[-_\w]+\})+)(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/gm
});

Prism.languages.insertBefore('scss', 'atrule', {
	'keyword': /@(if|else if|else|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)|(?=@for\s+\$[-_\w]+\s)+from/i
});

Prism.languages.insertBefore('scss', 'property', {
	// var and interpolated vars
	'variable': /((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i
});

Prism.languages.insertBefore('scss', 'ignore', {
	'placeholder': /%[-_\w]+/i,
	'statement': /\B!(default|optional)\b/gi,
	'boolean': /\b(true|false)\b/g,
	'null': /\b(null)\b/g,
	'operator': /\s+([-+]{1,2}|={1,2}|!=|\|?\||\?|\*|\/|\%)\s+/g
});

},{}],"/js/javascript-nodejs/node_modules/prismjs/components/prism-sql.js":[function(require,module,exports){
Prism.languages.sql= { 
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|((--)|(\/\/)|#).*?(\r?\n|$))/g,
		lookbehind: true
	},
	'string' : {
		pattern: /(^|[^@])("|')(\\?[\s\S])*?\2/g,
		lookbehind: true
	},
	'variable': /@[\w.$]+|@("|'|`)(\\?[\s\S])+?\1/g,
	'function': /\b(?:COUNT|SUM|AVG|MIN|MAX|FIRST|LAST|UCASE|LCASE|MID|LEN|ROUND|NOW|FORMAT)(?=\s*\()/ig, // Should we highlight user defined functions too?
	'keyword': /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALTER|ANALYZE|APPLY|AS|ASC|AUTHORIZATION|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADE|CASCADED|CASE|CHAIN|CHAR VARYING|CHARACTER VARYING|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|CURRENT_USER|CURSOR|DATA|DATABASE|DATABASES|DATETIME|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DOUBLE PRECISION|DROP|DUMMY|DUMP|DUMPFILE|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE|ESCAPED BY|EXCEPT|EXEC|EXECUTE|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR|FOR EACH ROW|FORCE|FOREIGN|FREETEXT|FREETEXTTABLE|FROM|FULL|FUNCTION|GEOMETRY|GEOMETRYCOLLECTION|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY|IDENTITY_INSERT|IDENTITYCOL|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEY|KEYS|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONGBLOB|LONGTEXT|MATCH|MATCHED|MEDIUMBLOB|MEDIUMINT|MEDIUMTEXT|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTILINESTRING|MULTIPOINT|MULTIPOLYGON|NATIONAL|NATIONAL CHAR VARYING|NATIONAL CHARACTER|NATIONAL CHARACTER VARYING|NATIONAL VARCHAR|NATURAL|NCHAR|NCHAR VARCHAR|NEXT|NO|NO SQL|NOCHECK|NOCYCLE|NONCLUSTERED|NULLIF|NUMERIC|OF|OFF|OFFSETS|ON|OPEN|OPENDATASOURCE|OPENQUERY|OPENROWSET|OPTIMIZE|OPTION|OPTIONALLY|ORDER|OUT|OUTER|OUTFILE|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC|PROCEDURE|PUBLIC|PURGE|QUICK|RAISERROR|READ|READS SQL DATA|READTEXT|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURN|RETURNS|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROWCOUNT|ROWGUIDCOL|ROWS?|RTREE|RULE|SAVE|SAVEPOINT|SCHEMA|SELECT|SERIAL|SERIALIZABLE|SESSION|SESSION_USER|SET|SETUSER|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START|STARTING BY|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLE|TABLES|TABLESPACE|TEMP(?:ORARY)?|TEMPTABLE|TERMINATED BY|TEXT|TEXTSIZE|THEN|TIMESTAMP|TINYBLOB|TINYINT|TINYTEXT|TO|TOP|TRAN|TRANSACTION|TRANSACTIONS|TRIGGER|TRUNCATE|TSEQUAL|TYPE|TYPES|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNPIVOT|UPDATE|UPDATETEXT|USAGE|USE|USER|USING|VALUE|VALUES|VARBINARY|VARCHAR|VARCHARACTER|VARYING|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH|WITH ROLLUP|WITHIN|WORK|WRITE|WRITETEXT)\b/gi,
	'boolean': /\b(?:TRUE|FALSE|NULL)\b/gi,
	'number': /\b-?(0x)?\d*\.?[\da-f]+\b/g,
	'operator': /\b(?:ALL|AND|ANY|BETWEEN|EXISTS|IN|LIKE|NOT|OR|IS|UNIQUE|CHARACTER SET|COLLATE|DIV|OFFSET|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b|[-+]{1}|!|[=<>]{1,2}|(&){1,2}|\|?\||\?|\*|\//gi,
	'punctuation': /[;[\]()`,.]/g
};
},{}],"/js/javascript-nodejs/node_modules/tutorial/client/tutorialMap.js":[function(require,module,exports){
var throttle = require('lib/throttle');

function TutorialMap(elem) {
  this.elem = elem;

  this.showTasksCheckbox = elem.querySelector('[data-tutorial-map-show-tasks]');
  this.showTasksCheckbox.checked = +localStorage.showTasksCheckbox;
  this.updateShowTasks();

  this.showTasksCheckbox.onchange = this.updateShowTasks.bind(this);

  this.filterInput = this.elem.querySelector('[data-tutorial-map-filter]');

  this.filterInput.oninput = this.onFilterInput.bind(this);
}

TutorialMap.prototype.updateShowTasks = function() {
  if (this.showTasksCheckbox.checked) {
    this.elem.classList.add('tutorial-map_show-tasks');
  } else {
    this.elem.classList.remove('tutorial-map_show-tasks');
  }

  localStorage.showTasksCheckbox = this.showTasksCheckbox.checked ? "1" : "0";
};

TutorialMap.prototype.onFilterInput = function(event) {
  this.throttleFilter(event.target.value);
};

TutorialMap.prototype.focus = function() {
  this.filterInput.focus();
};

TutorialMap.prototype.filter = function(value) {
  value = value.toLowerCase();
  var showingTasks = this.showTasksCheckbox.checked;

  var links = this.elem.querySelectorAll('.tutorial-map-link');

  var topItems = this.elem.querySelectorAll('.tutorial-map__item');

  function checkLiMatch(li) {
    return isSubSequence(li.querySelector('a').innerHTML.toLowerCase(), value.replace(/\s/g, ''));
  }

  // an item is shown if any of its children is shown OR it's link matches the filter
  for (var i = 0; i < topItems.length; i++) {
    var li = topItems[i];
    var subItems = li.querySelectorAll('.tutorial-map__sub-item');

    var childMatch = Array.prototype.reduce.call(subItems, function(prevValue, subItem) {

      var childMatch = false;

      if (showingTasks) {
        var subItems = subItem.querySelectorAll('.tutorial-map__sub-sub-item');
        childMatch = Array.prototype.reduce.call(subItems, function(prevValue, subItem) {
          var match = checkLiMatch(subItem);
          subItem.hidden = !match;
          return prevValue || match;
        }, false);
      }

      var match = childMatch || checkLiMatch(subItem);
      //console.log(subItem, match);
      subItem.hidden = !match;

      return prevValue || match;
    }, false);

    li.hidden = !(childMatch || checkLiMatch(li));

  }

};

TutorialMap.prototype.throttleFilter = throttle(TutorialMap.prototype.filter, 200);


function isSubSequence(str1, str2) {
  var i = 0;
  var j = 0;
  while (i < str1.length && j < str2.length) {
    if (str1[i] == str2[j]) {
      i++;
      j++;
    } else {
      i++;
    }
  }
  return j == str2.length;
}

module.exports = TutorialMap;

},{"lib/throttle":"/js/javascript-nodejs/node_modules/lib/throttle.js"}],"/js/javascript-nodejs/node_modules/tutorial/client/tutorialMapModal.js":[function(require,module,exports){
var xhr = require('client/xhr');

var delegate = require('client/delegate');
var Modal = require('client/head').Modal;
var Spinner = require('client/spinner');

/**
 * Options:
 *   - callback: function to be called after successful login (by default - go to successRedirect)
 *   - message: form message to be shown when the login form appears ("Log in to leave the comment")
 *   - successRedirect: the page to redirect (current page by default)
 *       - after immediate login
 *       - after registration for "confirm email" link
 */
function TutorialMapModal() {
  Modal.apply(this, arguments);

  var spinner = new Spinner();
  this.setContent(spinner.elem);
  spinner.start();

  var request = this.request({
    url: '/tutorial/map'
  });

  var self = this;
  request.addEventListener('success', function(event) {
    var wrapper = document.createElement('div');
    wrapper.className = 'tutorial-map-overlay';
    wrapper.innerHTML = event.result + '<button class="close-button tutorial-map-overlay__close"></button>';
    self.setContent(wrapper);
  });

  request.addEventListener('fail', function() {
    self.remove();
  });

  request.send();
}

TutorialMapModal.prototype = Object.create(Modal.prototype);

delegate.delegateMixin(TutorialMapModal.prototype);

TutorialMapModal.prototype.request = function(options) {
  var request = xhr(options);

  request.addEventListener('loadstart', function() {
    var onEnd = this.startRequestIndication();
    request.addEventListener('loadend', onEnd);
  }.bind(this));

  return request;
};

TutorialMapModal.prototype.startRequestIndication = function() {
  this.showOverlay();
  var self = this;

  return function onEnd() {
    self.hideOverlay();
  };
};


module.exports = TutorialMapModal;

},{"client/delegate":"/js/javascript-nodejs/node_modules/client/delegate.js","client/head":"client/head","client/spinner":"/js/javascript-nodejs/node_modules/client/spinner.js","client/xhr":"/js/javascript-nodejs/node_modules/client/xhr.js"}],"tutorial/client":[function(require,module,exports){
require('client/polyfill');
var delegate = require('client/delegate');
var prism = require('client/prism');
var findClosest = require('client/dom/findClosest');
var xhr = require('client/xhr');
var TutorialMapModal = require('./tutorialMapModal');

exports.init = function() {

  initTaskButtons();

  delegate(document, '[data-action="tutorial-map"]', 'click', function(event) {
    new TutorialMapModal();
    event.preventDefault();
  });

  prism();
};

exports.TutorialMap = require('./tutorialMap');

function initTaskButtons() {
  // solution button
  delegate(document, '.task__solution', 'click', function(event) {
    findClosest(event.target, '.task').classList.toggle('task__answer_open');
  });

  // close solution button
  delegate(document, '.task__answer-close', 'click', function(event) {
    findClosest(event.target, '.task').classList.toggle('task__answer_open');
  });

  // every step button (if any steps)
  delegate(document, '.task__step-show', 'click', function(event) {
    findClosest(event.target, '.task__step').classList.toggle('task__step_open');
  });
}

},{"./tutorialMap":"/js/javascript-nodejs/node_modules/tutorial/client/tutorialMap.js","./tutorialMapModal":"/js/javascript-nodejs/node_modules/tutorial/client/tutorialMapModal.js","client/delegate":"/js/javascript-nodejs/node_modules/client/delegate.js","client/dom/findClosest":"/js/javascript-nodejs/node_modules/client/dom/findClosest.js","client/polyfill":"/js/javascript-nodejs/node_modules/client/polyfill/index.js","client/prism":"/js/javascript-nodejs/node_modules/client/prism/index.js","client/xhr":"/js/javascript-nodejs/node_modules/client/xhr.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9qcy9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2RlbGVnYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9kb20vZmluZENsb3Nlc3QuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2lzU2Nyb2xsZWRJbnRvVmlldy5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvbm90aWZ5LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9wb2x5ZmlsbC9kb200LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9wb2x5ZmlsbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvcHJpc20vYWRkTGluZU51bWJlcnMuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L3ByaXNtL2NvZGVCb3guanMiLCJub2RlX21vZHVsZXMvY2xpZW50L3ByaXNtL2NvZGVUYWJzQm94LmpzIiwibm9kZV9tb2R1bGVzL2NsaWVudC9wcmlzbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvc3Bpbm5lci5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQveGhyLW5vdGlmeS5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQveGhyLmpzIiwibm9kZV9tb2R1bGVzL2h1bWFuZS1qcy9odW1hbmUuanMiLCJub2RlX21vZHVsZXMvbGliL3Rocm90dGxlLmpzIiwibm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jbGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY29mZmVlc2NyaXB0LmpzIiwibm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jb3JlLmpzIiwibm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jc3MtZXh0cmFzLmpzIiwibm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jc3MuanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWh0dHAuanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWphdmEuanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWphdmFzY3JpcHQuanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLW1hcmt1cC5qcyIsIm5vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tcGhwLWV4dHJhcy5qcyIsIm5vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tcGhwLmpzIiwibm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1weXRob24uanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLXJ1YnkuanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLXNjc3MuanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLXNxbC5qcyIsIm5vZGVfbW9kdWxlcy90dXRvcmlhbC9jbGllbnQvdHV0b3JpYWxNYXAuanMiLCJub2RlX21vZHVsZXMvdHV0b3JpYWwvY2xpZW50L3R1dG9yaWFsTWFwTW9kYWwuanMiLCJub2RlX21vZHVsZXMvdHV0b3JpYWwvY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gbW9kdWxlcyBhcmUgZGVmaW5lZCBhcyBhbiBhcnJheVxuLy8gWyBtb2R1bGUgZnVuY3Rpb24sIG1hcCBvZiByZXF1aXJldWlyZXMgXVxuLy9cbi8vIG1hcCBvZiByZXF1aXJldWlyZXMgaXMgc2hvcnQgcmVxdWlyZSBuYW1lIC0+IG51bWVyaWMgcmVxdWlyZVxuLy9cbi8vIGFueXRoaW5nIGRlZmluZWQgaW4gYSBwcmV2aW91cyBidW5kbGUgaXMgYWNjZXNzZWQgdmlhIHRoZVxuLy8gb3JpZyBtZXRob2Qgd2hpY2ggaXMgdGhlIHJlcXVpcmV1aXJlIGZvciBwcmV2aW91cyBidW5kbGVzXG5cbihmdW5jdGlvbiBvdXRlciAobW9kdWxlcywgY2FjaGUsIGVudHJ5KSB7XG4gICAgLy8gU2F2ZSB0aGUgcmVxdWlyZSBmcm9tIHByZXZpb3VzIGJ1bmRsZSB0byB0aGlzIGNsb3N1cmUgaWYgYW55XG4gICAgdmFyIHByZXZpb3VzUmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuXG4gICAgZnVuY3Rpb24gbmV3UmVxdWlyZShuYW1lLCBqdW1wZWQpe1xuICAgICAgICBpZighY2FjaGVbbmFtZV0pIHtcbiAgICAgICAgICAgIGlmKCFtb2R1bGVzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgY2Fubm90IGZpbmQgdGhlIHRoZSBtb2R1bGUgd2l0aGluIG91ciBpbnRlcm5hbCBtYXAgb3JcbiAgICAgICAgICAgICAgICAvLyBjYWNoZSBqdW1wIHRvIHRoZSBjdXJyZW50IGdsb2JhbCByZXF1aXJlIGllLiB0aGUgbGFzdCBidW5kbGVcbiAgICAgICAgICAgICAgICAvLyB0aGF0IHdhcyBhZGRlZCB0byB0aGUgcGFnZS5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFJlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcbiAgICAgICAgICAgICAgICBpZiAoIWp1bXBlZCAmJiBjdXJyZW50UmVxdWlyZSkgcmV0dXJuIGN1cnJlbnRSZXF1aXJlKG5hbWUsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIGJ1bmRsZXMgb24gdGhpcyBwYWdlIHRoZSByZXF1aXJlIGZyb20gdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMgb25lIGlzIHNhdmVkIHRvICdwcmV2aW91c1JlcXVpcmUnLiBSZXBlYXQgdGhpcyBhc1xuICAgICAgICAgICAgICAgIC8vIG1hbnkgdGltZXMgYXMgdGhlcmUgYXJlIGJ1bmRsZXMgdW50aWwgdGhlIG1vZHVsZSBpcyBmb3VuZCBvclxuICAgICAgICAgICAgICAgIC8vIHdlIGV4aGF1c3QgdGhlIHJlcXVpcmUgY2hhaW4uXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzUmVxdWlyZSkgcmV0dXJuIHByZXZpb3VzUmVxdWlyZShuYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdDYW5ub3QgZmluZCBtb2R1bGUgXFwnJyArIG5hbWUgKyAnXFwnJyk7XG4gICAgICAgICAgICAgICAgZXJyLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG0gPSBjYWNoZVtuYW1lXSA9IHtleHBvcnRzOnt9fTtcbiAgICAgICAgICAgIG1vZHVsZXNbbmFtZV1bMF0uY2FsbChtLmV4cG9ydHMsIGZ1bmN0aW9uKHgpe1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IG1vZHVsZXNbbmFtZV1bMV1beF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld1JlcXVpcmUoaWQgPyBpZCA6IHgpO1xuICAgICAgICAgICAgfSxtLG0uZXhwb3J0cyxvdXRlcixtb2R1bGVzLGNhY2hlLGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICB9XG4gICAgZm9yKHZhciBpPTA7aTxlbnRyeS5sZW5ndGg7aSsrKSBuZXdSZXF1aXJlKGVudHJ5W2ldKTtcblxuICAgIC8vIE92ZXJyaWRlIHRoZSBjdXJyZW50IHJlcXVpcmUgd2l0aCB0aGlzIG5ldyBvbmVcbiAgICByZXR1cm4gbmV3UmVxdWlyZTtcbn0pXG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vcG9seWZpbGwnKTtcblxuZnVuY3Rpb24gZmluZERlbGVnYXRlVGFyZ2V0KGV2ZW50LCBzZWxlY3Rvcikge1xuICB2YXIgY3VycmVudE5vZGUgPSBldmVudC50YXJnZXQ7XG4gIHdoaWxlIChjdXJyZW50Tm9kZSkge1xuICAgIGlmIChjdXJyZW50Tm9kZS5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnROb2RlO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Tm9kZSA9PSBldmVudC5jdXJyZW50VGFyZ2V0KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnRFbGVtZW50O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBkZWxlZ2F0ZSh0YWJsZSwgJ3RoJywgY2xpY2ssIGhhbmRsZXIpXG4vLyB0YWJsZVxuLy8gICB0aGVhZFxuLy8gICAgIHRoICAgICAgICAgXipcbi8vICAgICAgIGNvZGUgIDwtLVxuZnVuY3Rpb24gZGVsZWdhdGUodG9wRWxlbWVudCwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCkge1xuICAvKiBqc2hpbnQgLVcwNDAgKi9cbiAgdG9wRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZm91bmQgPSBmaW5kRGVsZWdhdGVUYXJnZXQoZXZlbnQsIHNlbGVjdG9yKTtcblxuICAgIC8vIC5jdXJyZW50VGFyZ2V0IGlzIHJlYWQgb25seSwgSSBjYW4gbm90IG92ZXJ3cml0ZSBpdCB0byB0aGUgXCJmb3VuZFwiIGVsZW1lbnRcbiAgICAvLyBPYmplY3QuY3JlYXRlIHdyYXBwZXIgd291bGQgYnJlYWsgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIC8vIHNvLCBrZWVwIGluIG1pbmQ6XG4gICAgLy8gLS0+IGV2ZW50LmN1cnJlbnRUYXJnZXQgaXMgYWx3YXlzIHRoZSB0b3AtbGV2ZWwgKGRlbGVnYXRpbmcpIGVsZW1lbnQhXG4gICAgLy8gdXNlIFwidGhpc1wiIHRvIGdldCB0aGUgZm91bmQgdGFyZ2V0XG5cbiAgICBldmVudC5kZWxlZ2F0ZVRhcmdldCA9IGZvdW5kOyAvLyB1c2UgaW5zdGVhZCBvZiBcInRoaXNcIiBpbiBvYmplY3QgbWV0aG9kc1xuXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICAvLyBpZiBpbiBjb250ZXh0IG9mIG9iamVjdCwgdXNlIG9iamVjdCBhcyB0aGlzLFxuICAgICAgaGFuZGxlci5jYWxsKGNvbnRleHQgfHwgdGhpcywgZXZlbnQpO1xuICAgIH1cbiAgfSk7XG59XG5cbmRlbGVnYXRlLmRlbGVnYXRlTWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgb2JqLmRlbGVnYXRlID0gZnVuY3Rpb24oc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIGRlbGVnYXRlKHRoaXMuZWxlbSwgc2VsZWN0b3IsIGV2ZW50TmFtZSwgaGFuZGxlciwgdGhpcyk7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlO1xuXG4iLCIvLyBmaW5kIHRoZSBuZWFyZXN0IGFuY2VzdG9yIG1hdGNoaW5nIHNlbGVjdG9yXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW0sIHNlbGVjdG9yKSB7XG5cbiAgd2hpbGUgKGVsZW0pIHtcbiAgICBpZiAoZWxlbS5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW0gPSBlbGVtLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xuXG59O1xuIiwiXG5mdW5jdGlvbiBpc1Njcm9sbGVkSW50b1ZpZXcoZWxlbSkge1xuICB2YXIgY29vcmRzID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICB2YXIgdmlzaWJsZUhlaWdodCA9IDA7XG5cbiAgaWYgKGNvb3Jkcy50b3AgPCAwKSB7XG4gICAgdmlzaWJsZUhlaWdodCA9IGNvb3Jkcy5ib3R0b207XG4gIH0gZWxzZSBpZiAoY29vcmRzLmJvdHRvbSA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgIHZpc2libGVIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSB0b3A7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gdmlzaWJsZUhlaWdodCA+IDEwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU2Nyb2xsZWRJbnRvVmlldztcbiIsInZhciBodW1hbmUgPSByZXF1aXJlKCdodW1hbmUtanMnKTtcblxuZXhwb3J0cy5pbmZvID0gaHVtYW5lLnNwYXduKHsgYWRkbkNsczogJ2h1bWFuZS1saWJub3RpZnktaW5mbycsIHRpbWVvdXQ6IDEwMDAgfSk7XG5leHBvcnRzLmVycm9yID0gaHVtYW5lLnNwYXduKHsgYWRkbkNsczogJ2h1bWFuZS1saWJub3RpZnktZXJyb3InLCB0aW1lb3V0OiAzMDAwIH0pO1xuIiwiZnVuY3Rpb24gdGV4dE5vZGVJZlN0cmluZyhub2RlKSB7XG4gIHJldHVybiB0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKSA6IG5vZGU7XG59XG5cbmZ1bmN0aW9uIG11dGF0aW9uTWFjcm8obm9kZXMpIHtcbiAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiB0ZXh0Tm9kZUlmU3RyaW5nKG5vZGVzWzBdKTtcbiAgfVxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciBsaXN0ID0gW10uc2xpY2UuY2FsbChub2Rlcyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQodGV4dE5vZGVJZlN0cmluZyhsaXN0W2ldKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuXG52YXIgbWV0aG9kcyA9IHtcbiAgbWF0Y2hlczogRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvcixcbiAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgcmV0dXJuIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfVxuICB9XG59O1xuXG5mb3IgKHZhciBtZXRob2ROYW1lIGluIG1ldGhvZHMpIHtcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZVttZXRob2ROYW1lXSkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdID0gbWV0aG9kc1ttZXRob2ROYW1lXTtcbiAgfVxufVxuXG50cnkge1xuICBuZXcgQ3VzdG9tRXZlbnQoXCJJRSBoYXMgQ3VzdG9tRXZlbnQsIGJ1dCBkb2Vzbid0IHN1cHBvcnQgY29uc3RydWN0b3JcIik7XG59IGNhdGNoIChlKSB7XG5cbiAgd2luZG93LkN1c3RvbUV2ZW50ID0gZnVuY3Rpb24oZXZlbnQsIHBhcmFtcykge1xuICAgIHZhciBldnQ7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHtcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICBkZXRhaWw6IHVuZGVmaW5lZFxuICAgIH07XG4gICAgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICAgIHJldHVybiBldnQ7XG4gIH07XG5cbiAgQ3VzdG9tRXZlbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSh3aW5kb3cuRXZlbnQucHJvdG90eXBlKTtcbn1cblxuIiwicmVxdWlyZSgnLi9kb200Jyk7XG4iLCJcbmZ1bmN0aW9uIGFkZExpbmVOdW1iZXJzKHByZSkge1xuXG4gIHZhciBsaW5lc051bSA9ICgxICsgcHJlLmlubmVySFRNTC5zcGxpdCgnXFxuJykubGVuZ3RoKTtcbiAgdmFyIGxpbmVOdW1iZXJzV3JhcHBlcjtcblxuICB2YXIgbGluZXMgPSBuZXcgQXJyYXkobGluZXNOdW0pO1xuICBsaW5lcyA9IGxpbmVzLmpvaW4oJzxzcGFuPjwvc3Bhbj4nKTtcblxuICBsaW5lTnVtYmVyc1dyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGxpbmVOdW1iZXJzV3JhcHBlci5jbGFzc05hbWUgPSAnbGluZS1udW1iZXJzLXJvd3MnO1xuICBsaW5lTnVtYmVyc1dyYXBwZXIuaW5uZXJIVE1MID0gbGluZXM7XG5cbiAgaWYgKHByZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKSkge1xuICAgIHByZS5zdHlsZS5jb3VudGVyUmVzZXQgPSAnbGluZW51bWJlciAnICsgTnVtYmVyKHByZS5kYXRhc2V0LnN0YXJ0KSAtIDE7XG4gIH1cblxuICBwcmUuYXBwZW5kQ2hpbGQobGluZU51bWJlcnNXcmFwcGVyKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZExpbmVOdW1iZXJzO1xuIiwidmFyIHJlc2l6ZU9ubG9hZCA9IHJlcXVpcmUoJ2NsaWVudC9oZWFkJykucmVzaXplT25sb2FkO1xudmFyIGlzU2Nyb2xsZWRJbnRvVmlldyA9IHJlcXVpcmUoJ2NsaWVudC9pc1Njcm9sbGVkSW50b1ZpZXcnKTtcbnZhciBhZGRMaW5lTnVtYmVycyA9IHJlcXVpcmUoJy4vYWRkTGluZU51bWJlcnMnKTtcblxuZnVuY3Rpb24gQ29kZUJveChlbGVtKSB7XG5cbiAgdmFyIHByZUVsZW0gPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJ3ByZScpO1xuICB2YXIgY29kZUVsZW0gPSBwcmVFbGVtLnF1ZXJ5U2VsZWN0b3IoJ2NvZGUnKTtcbiAgdmFyIGNvZGUgPSBjb2RlRWxlbS50ZXh0Q29udGVudDtcblxuICBQcmlzbS5oaWdobGlnaHRFbGVtZW50KGNvZGVFbGVtKTtcbiAgYWRkTGluZU51bWJlcnMocHJlRWxlbSk7XG5cbiAgYWRkQmxvY2tIaWdobGlnaHQocHJlRWxlbSwgZWxlbS5kYXRhc2V0LmhpZ2hsaWdodEJsb2NrKTtcbiAgYWRkSW5saW5lSGlnaGxpZ2h0KHByZUVsZW0sIGVsZW0uZGF0YXNldC5oaWdobGlnaHRJbmxpbmUpO1xuXG4gIHZhciBpc0pTID0gcHJlRWxlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKTtcbiAgdmFyIGlzSFRNTCA9IHByZUVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdsYW5ndWFnZS1tYXJrdXAnKTtcbiAgdmFyIGlzVHJ1c3RlZCA9IGVsZW0uZGF0YXNldC50cnVzdGVkO1xuICB2YXIganNGcmFtZTtcbiAgdmFyIGh0bWxSZXN1bHQ7XG4gIHZhciBpc0ZpcnN0UnVuID0gdHJ1ZTtcblxuICBpZiAoIWlzSlMgJiYgIWlzSFRNTCkgcmV0dXJuO1xuXG4gIHZhciBydW5FbGVtID0gZWxlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJydW5cIl0nKTtcbiAgaWYgKHJ1bkVsZW0pIHtcbiAgICBydW5FbGVtLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgcnVuKCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIHZhciBlZGl0RWxlbSA9IGVsZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwiZWRpdFwiXScpO1xuICBpZiAoZWRpdEVsZW0pIHtcbiAgICBlZGl0RWxlbS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmJsdXIoKTtcbiAgICAgIGVkaXQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKGVsZW0uZGF0YXNldC5hdXRvcnVuKSB7XG4gICAgc2V0VGltZW91dChydW4sIDEwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvc3RKU0ZyYW1lKCkge1xuICAgIHZhciB3aW4gPSBqc0ZyYW1lWzBdLmNvbnRlbnRXaW5kb3c7XG4gICAgaWYgKHR5cGVvZiB3aW4ucG9zdE1lc3NhZ2UgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWxlcnQoXCLQmNC30LLQuNC90LjRgtC1LCDQt9Cw0L/Rg9GB0Log0LrQvtC00LAg0YLRgNC10LHRg9C10YIg0LHQvtC70LXQtSDRgdC+0LLRgNC10LzQtdC90L3Ri9C5INCx0YDQsNGD0LfQtdGAXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3aW4ucG9zdE1lc3NhZ2UoY29kZSwgJ2h0dHA6Ly9ydS5sb29rYXRjb2RlLmNvbS9zaG93anMnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bkhUTUwoKSB7XG5cbiAgICB2YXIgaGFzSGVpZ2h0ID0gZmFsc2U7XG4gICAgdmFyIGZyYW1lO1xuXG4gICAgaWYgKGh0bWxSZXN1bHQgJiYgZWxlbS5kYXRhc2V0LnJlZnJlc2gpIHtcbiAgICAgIGh0bWxSZXN1bHQucmVtb3ZlKCk7XG4gICAgICBodG1sUmVzdWx0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIWh0bWxSZXN1bHQpIHtcbiAgICAgIGh0bWxSZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGh0bWxSZXN1bHQuY2xhc3NOYW1lID0gXCJjb2RlLXJlc3VsdCBjb2RlLWV4YW1wbGVfX3Jlc3VsdFwiO1xuXG4gICAgICBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgZnJhbWUubmFtZSA9ICdmcmFtZS0nICsgTWF0aC5yYW5kb20oKTtcbiAgICAgIGZyYW1lLmNsYXNzTmFtZSA9ICdjb2RlLXJlc3VsdF9faWZyYW1lJztcblxuICAgICAgaWYgKGVsZW0uZGF0YXNldC5kZW1vSGVpZ2h0ID09PSBcIjBcIikgey8vIGRvZXMgdGhhdCBldmVyIGhhcHBlbiBvciBkZWFkIGNvZGU/XG4gICAgICAgIGZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGhhc0hlaWdodCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGVsZW0uZGF0YXNldC5kZW1vSGVpZ2h0KSB7XG4gICAgICAgIHZhciBoZWlnaHQgPSArZWxlbS5kYXRhc2V0LmRlbW9IZWlnaHQ7XG4gICAgICAgIGZyYW1lLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgICAgIGhhc0hlaWdodCA9IHRydWU7XG4gICAgICB9XG4gICAgICBodG1sUmVzdWx0LmFwcGVuZENoaWxkKGZyYW1lKTtcblxuICAgICAgZWxlbS5hcHBlbmRDaGlsZChodG1sUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnJhbWUgPSBodG1sUmVzdWx0LnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpO1xuICAgIH1cblxuICAgIGlmIChpc1RydXN0ZWQpIHtcbiAgICAgIHZhciBkb2MgPSBmcmFtZS5jb250ZW50RG9jdW1lbnQgfHwgZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcblxuICAgICAgZG9jLm9wZW4oKTtcbiAgICAgIGRvYy53cml0ZShub3JtYWxpemVIdG1sKGNvZGUpKTtcbiAgICAgIGRvYy5jbG9zZSgpO1xuXG4gICAgICBpZiAoIWhhc0hlaWdodCkge1xuICAgICAgICByZXNpemVPbmxvYWQuaWZyYW1lKGZyYW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEoaXNGaXJzdFJ1biAmJiBlbGVtLmRhdGFzZXQuYXV0b3J1bikpIHtcbiAgICAgICAgaWYgKCFpc1Njcm9sbGVkSW50b1ZpZXcoaHRtbFJlc3VsdCkpIHtcbiAgICAgICAgICBodG1sUmVzdWx0LnNjcm9sbEludG9WaWV3KGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgZm9ybS5tZXRob2QgPSAnUE9TVCc7XG4gICAgICBmb3JtLmVuY3R5cGUgPSBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiO1xuICAgICAgZm9ybS5hY3Rpb24gPSBcImh0dHA6Ly9ydS5sb29rYXRjb2RlLmNvbS9zaG93aHRtbFwiO1xuICAgICAgZm9ybS50YXJnZXQgPSBmcmFtZS5uYW1lO1xuXG4gICAgICB2YXIgdGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgdGV4dGFyZWEubmFtZSA9ICdjb2RlJztcbiAgICAgIHRleHRhcmVhLnZhbHVlID0gbm9ybWFsaXplSHRtbChjb2RlKTtcbiAgICAgIGZvcm0uYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuXG4gICAgICBmcmFtZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShmb3JtLCBmcmFtZS5uZXh0U2libGluZyk7XG4gICAgICBmb3JtLnN1Ym1pdCgpO1xuICAgICAgZm9ybS5yZW1vdmUoKTtcblxuICAgICAgaWYgKCEoaXNGaXJzdFJ1biAmJiBlbGVtLmRhdGFzZXQuYXV0b3J1bikpIHtcbiAgICAgICAgZnJhbWUub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICBpZiAoIWhhc0hlaWdodCkge1xuICAgICAgICAgICAgcmVzaXplT25sb2FkLmlmcmFtZShmcmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFpc1Njcm9sbGVkSW50b1ZpZXcoaHRtbFJlc3VsdCkpIHtcbiAgICAgICAgICAgIGh0bWxSZXN1bHQuc2Nyb2xsSW50b1ZpZXcoZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bkpTKCkge1xuXG4gICAgaWYgKGlzVHJ1c3RlZCkge1xuXG4gICAgICB0cnkge1xuICAgICAgICAvKiBqc2hpbnQgLVcwNjEgKi9cbiAgICAgICAgd2luZG93W1wiZXZhbFwiXS5jYWxsKHdpbmRvdywgY29kZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIGFsZXJ0KFwi0J7RiNC40LHQutCwOiBcIiArIGUubWVzc2FnZSk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICBpZiAoZWxlbS5kYXRhc2V0LnJlZnJlc2ggJiYganNGcmFtZSkge1xuICAgICAgICBqc0ZyYW1lLnJlbW92ZSgpO1xuICAgICAgICBqc0ZyYW1lID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFqc0ZyYW1lKSB7XG4gICAgICAgIC8vIGNyZWF0ZSBpZnJhbWUgZm9yIGpzXG4gICAgICAgIGpzRnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAganNGcmFtZS5jbGFzc05hbWUgPSAnanMtZnJhbWUnO1xuICAgICAgICBqc0ZyYW1lLnNyYyA9ICdodHRwOi8vcnUubG9va2F0Y29kZS5jb20vc2hvd2pzJztcbiAgICAgICAganNGcmFtZS5zdHlsZS53aWR0aCA9IDA7XG4gICAgICAgIGpzRnJhbWUuc3R5bGUuaGVpZ2h0ID0gMDtcbiAgICAgICAganNGcmFtZS5zdHlsZS5ib3JkZXIgPSAnbm9uZSc7XG4gICAgICAgIGpzRnJhbWUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcG9zdEpTRnJhbWUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChqc0ZyYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvc3RKU0ZyYW1lKCk7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlZGl0KCkge1xuXG4gICAgdmFyIGh0bWw7XG4gICAgaWYgKGlzSFRNTCkge1xuICAgICAgaHRtbCA9IG5vcm1hbGl6ZUh0bWwoY29kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjb2RlSW5kZW50ZWQgPSBjb2RlLnJlcGxhY2UoL14vZ2ltLCAnICAgICcpO1xuICAgICAgaHRtbCA9ICc8IURPQ1RZUEUgaHRtbD5cXG48aHRtbD5cXG5cXG48Ym9keT5cXG4gIDxzY3JpcHQ+XFxuJyArIGNvZGVJbmRlbnRlZCArICdcXG4gIDwvc2NyaXB0PlxcbjwvYm9keT5cXG5cXG48L2h0bWw+JztcbiAgICB9XG5cbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgICBmb3JtLmFjdGlvbiA9IFwiaHR0cDovL3BsbmtyLmNvL2VkaXQvP3A9cHJldmlld1wiO1xuICAgIGZvcm0ubWV0aG9kID0gXCJQT1NUXCI7XG4gICAgZm9ybS50YXJnZXQgPSBcIl9ibGFua1wiO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgIHZhciB0ZXh0YXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgdGV4dGFyZWEubmFtZSA9IFwiZmlsZXNbaW5kZXguaHRtbF1cIjtcbiAgICB0ZXh0YXJlYS52YWx1ZSA9IGh0bWw7XG4gICAgZm9ybS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cbiAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGlucHV0Lm5hbWUgPSBcImRlc2NyaXB0aW9uXCI7XG4gICAgaW5wdXQudmFsdWUgPSBcIkZvcmsgZnJvbSBcIiArIHdpbmRvdy5sb2NhdGlvbjtcbiAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcblxuICAgIGZvcm0uc3VibWl0KCk7XG4gICAgZm9ybS5yZW1vdmUoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplSHRtbCgpIHtcbiAgICB2YXIgY29kZUxjID0gY29kZS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBoYXNCb2R5U3RhcnQgPSBjb2RlTGMubWF0Y2goJzxib2R5PicpO1xuICAgIHZhciBoYXNCb2R5RW5kID0gY29kZUxjLm1hdGNoKCc8L2JvZHk+Jyk7XG4gICAgdmFyIGhhc0h0bWxTdGFydCA9IGNvZGVMYy5tYXRjaCgnPGh0bWw+Jyk7XG4gICAgdmFyIGhhc0h0bWxFbmQgPSBjb2RlTGMubWF0Y2goJzwvaHRtbD4nKTtcblxuICAgIHZhciBoYXNEb2NUeXBlID0gY29kZUxjLm1hdGNoKC9eXFxzKjwhZG9jdHlwZS8pO1xuXG4gICAgaWYgKGhhc0RvY1R5cGUpIHtcbiAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSBjb2RlO1xuXG4gICAgaWYgKCFoYXNIdG1sU3RhcnQpIHtcbiAgICAgIHJlc3VsdCA9ICc8aHRtbD5cXG4nICsgcmVzdWx0O1xuICAgIH1cblxuICAgIGlmICghaGFzSHRtbEVuZCkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0ICsgJ1xcbjwvaHRtbD4nO1xuICAgIH1cblxuICAgIGlmICghaGFzQm9keVN0YXJ0KSB7XG4gICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgnPGh0bWw+JywgJzxodG1sPlxcbjxoZWFkPlxcbiAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XFxuPC9oZWFkPjxib2R5PlxcbicpO1xuICAgIH1cblxuICAgIGlmICghaGFzQm9keUVuZCkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoJzwvaHRtbD4nLCAnXFxuPC9ib2R5PlxcbjwvaHRtbD4nKTtcbiAgICB9XG5cbiAgICByZXN1bHQgPSAnPCFET0NUWVBFIEhUTUw+XFxuJyArIHJlc3VsdDtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHJ1bigpIHtcbiAgICBpZiAoaXNKUykge1xuICAgICAgcnVuSlMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcnVuSFRNTCgpO1xuICAgIH1cbiAgICBpc0ZpcnN0UnVuID0gZmFsc2U7XG4gIH1cblxuXG59XG5cblxuZnVuY3Rpb24gYWRkQmxvY2tIaWdobGlnaHQocHJlLCBsaW5lcykge1xuXG4gIGlmICghbGluZXMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcmFuZ2VzID0gbGluZXMucmVwbGFjZSgvXFxzKy9nLCAnJykuc3BsaXQoJywnKTtcblxuICAvKmpzaGludCAtVzA4NCAqL1xuICBmb3IgKHZhciBpID0gMCwgcmFuZ2U7IHJhbmdlID0gcmFuZ2VzW2krK107KSB7XG4gICAgcmFuZ2UgPSByYW5nZS5zcGxpdCgnLScpO1xuXG4gICAgdmFyIHN0YXJ0ID0gK3JhbmdlWzBdLFxuICAgICAgICBlbmQgPSArcmFuZ2VbMV0gfHwgc3RhcnQ7XG5cblxuICAgIHZhciBtYXNrID0gJzxkaXYgY2xhc3M9XCJibG9jay1oaWdobGlnaHRcIiBkYXRhLXN0YXJ0PVwiJyArIHN0YXJ0ICsgJ1wiIGRhdGEtZW5kPVwiJyArIGVuZCArICdcIj4nICtcbiAgICAgIG5ldyBBcnJheShzdGFydCArIDEpLmpvaW4oJ1xcbicpICtcbiAgICAgICc8ZGl2IGNsYXNzPVwibWFza1wiPicgKyBuZXcgQXJyYXkoZW5kIC0gc3RhcnQgKyAyKS5qb2luKCdcXG4nKSArICc8L2Rpdj48L2Rpdj4nO1xuXG4gICAgcHJlLmluc2VydEFkamFjZW50SFRNTChcImFmdGVyQmVnaW5cIiwgbWFzayk7XG4gIH1cblxufVxuXG5cbmZ1bmN0aW9uIGFkZElubGluZUhpZ2hsaWdodChwcmUsIHJhbmdlcykge1xuXG4gIHZhciBjb2RlRWxlbSA9IHByZS5xdWVyeVNlbGVjdG9yKCdjb2RlJyk7XG5cbiAgcmFuZ2VzID0gcmFuZ2VzID8gcmFuZ2VzLnNwbGl0KFwiLFwiKSA6IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBpZWNlID0gcmFuZ2VzW2ldLnNwbGl0KCc6Jyk7XG4gICAgdmFyIGxpbmVOdW0gPSArcGllY2VbMF0sIHN0clJhbmdlID0gcGllY2VbMV0uc3BsaXQoJy0nKTtcbiAgICB2YXIgc3RhcnQgPSArc3RyUmFuZ2VbMF0sIGVuZCA9ICtzdHJSYW5nZVsxXTtcbiAgICB2YXIgbWFzayA9ICc8ZGl2IGNsYXNzPVwiaW5saW5lLWhpZ2hsaWdodFwiPicgK1xuICAgICAgbmV3IEFycmF5KGxpbmVOdW0gKyAxKS5qb2luKCdcXG4nKSArXG4gICAgICBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJykgK1xuICAgICAgJzxzcGFuIGNsYXNzPVwibWFza1wiPicgKyBuZXcgQXJyYXkoZW5kIC0gc3RhcnQgKyAxKS5qb2luKCcgJykgKyAnPC9zcGFuPjwvZGl2Pic7XG5cbiAgICBjb2RlRWxlbS5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlckJlZ2luXCIsIG1hc2spO1xuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb2RlQm94O1xuIiwidmFyIGRlbGVnYXRlID0gcmVxdWlyZSgnY2xpZW50L2RlbGVnYXRlJyk7XG52YXIgYWRkTGluZU51bWJlcnMgPSByZXF1aXJlKCcuL2FkZExpbmVOdW1iZXJzJyk7XG5cbmZ1bmN0aW9uIENvZGVUYWJzQm94KGVsZW0pIHtcblxuICB0aGlzLmVsZW0gPSBlbGVtO1xuICB0aGlzLnRyYW5zbGF0ZVggPSAwO1xuXG4gIHRoaXMuc3dpdGNoZXNFbGVtID0gZWxlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jb2RlLXRhYnMtc3dpdGNoZXNdJyk7XG4gIHRoaXMuc3dpdGNoZXNFbGVtSXRlbXMgPSB0aGlzLnN3aXRjaGVzRWxlbS5maXJzdEVsZW1lbnRDaGlsZDtcbiAgdGhpcy5hcnJvd0xlZnQgPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvZGUtdGFicy1sZWZ0XScpO1xuICB0aGlzLmFycm93UmlnaHQgPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvZGUtdGFicy1yaWdodF0nKTtcblxuXG4gIHRoaXMuYXJyb3dMZWZ0Lm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGhpcy50cmFuc2xhdGVYID0gTWF0aC5tYXgoMCwgdGhpcy50cmFuc2xhdGVYIC0gdGhpcy5zd2l0Y2hlc0VsZW0ub2Zmc2V0V2lkdGgpO1xuICAgIHRoaXMucmVuZGVyVHJhbnNsYXRlKCk7XG4gIH0uYmluZCh0aGlzKTtcblxuXG4gIHRoaXMuYXJyb3dSaWdodC5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRoaXMudHJhbnNsYXRlWCA9IE1hdGgubWluKHRoaXMudHJhbnNsYXRlWCArdGhpcy5zd2l0Y2hlc0VsZW0ub2Zmc2V0V2lkdGgsIHRoaXMuc3dpdGNoZXNFbGVtSXRlbXMub2Zmc2V0V2lkdGggLSB0aGlzLnN3aXRjaGVzRWxlbS5vZmZzZXRXaWR0aCk7XG4gICAgdGhpcy5yZW5kZXJUcmFuc2xhdGUoKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHRoaXMuZGVsZWdhdGUoJy5jb2RlLXRhYnNfX3N3aXRjaCcsICdjbGljaycsIHRoaXMub25Td2l0Y2hDbGljayk7XG59XG5cbkNvZGVUYWJzQm94LnByb3RvdHlwZS5vblN3aXRjaENsaWNrID0gZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgdmFyIHNpYmxpbmdzID0gZS5kZWxlZ2F0ZVRhcmdldC5wYXJlbnROb2RlLmNoaWxkcmVuO1xuICB2YXIgdGFicyA9IHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jb2RlLXRhYnMtY29udGVudF0nKS5jaGlsZHJlbjtcblxuXG4gIHZhciBzZWxlY3RlZEluZGV4O1xuICBmb3IodmFyIGk9MDsgaTxzaWJsaW5ncy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzd2l0Y2hFbGVtID0gc2libGluZ3NbaV07XG4gICAgdmFyIHRhYkVsZW0gPSB0YWJzW2ldO1xuICAgIGlmIChzd2l0Y2hFbGVtID09IGUuZGVsZWdhdGVUYXJnZXQpIHtcbiAgICAgIHNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgdGFiRWxlbS5jbGFzc0xpc3QuYWRkKCdjb2RlLXRhYnNfX3NlY3Rpb25fY3VycmVudCcpO1xuICAgICAgc3dpdGNoRWxlbS5jbGFzc0xpc3QuYWRkKCdjb2RlLXRhYnNfX3N3aXRjaF9jdXJyZW50Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhYkVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnY29kZS10YWJzX19zZWN0aW9uX2N1cnJlbnQnKTtcbiAgICAgIHN3aXRjaEVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnY29kZS10YWJzX19zd2l0Y2hfY3VycmVudCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzZWxlY3RlZEluZGV4ID09PSAwKSB7XG4gICAgdGhpcy5lbGVtLmNsYXNzTGlzdC5hZGQoJ2NvZGUtdGFic19yZXN1bHRfb24nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnY29kZS10YWJzX3Jlc3VsdF9vbicpO1xuXG4gICAgdGhpcy5oaWdobGlnaHRUYWIodGFic1tzZWxlY3RlZEluZGV4XSk7XG4gIH1cblxufTtcblxuXG5Db2RlVGFic0JveC5wcm90b3R5cGUuaGlnaGxpZ2h0VGFiID0gZnVuY3Rpb24odGFiKSB7XG4gIGlmICh0YWIuaGlnaGxpZ2h0ZWQpIHJldHVybjtcbiAgdmFyIHByZUVsZW0gPSB0YWIucXVlcnlTZWxlY3RvcigncHJlJyk7XG4gIHZhciBjb2RlRWxlbSA9IHByZUVsZW0ucXVlcnlTZWxlY3RvcignY29kZScpO1xuICBQcmlzbS5oaWdobGlnaHRFbGVtZW50KGNvZGVFbGVtKTtcbiAgYWRkTGluZU51bWJlcnMocHJlRWxlbSk7XG4gIHRhYi5oaWdobGlnaHRlZCA9IHRydWU7XG59O1xuXG5Db2RlVGFic0JveC5wcm90b3R5cGUucmVuZGVyVHJhbnNsYXRlID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKHRoaXMudHJhbnNsYXRlWCk7XG4gIHRoaXMuc3dpdGNoZXNFbGVtSXRlbXMuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLScgKyB0aGlzLnRyYW5zbGF0ZVggKyAncHgpJztcbiAgaWYgKHRoaXMudHJhbnNsYXRlWCA9PT0gMCkge1xuICAgIHRoaXMuYXJyb3dMZWZ0LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5hcnJvd0xlZnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICB9XG5cbiAgaWYgKHRoaXMudHJhbnNsYXRlWCA9PT0gdGhpcy5zd2l0Y2hlc0VsZW1JdGVtcy5vZmZzZXRXaWR0aCAtIHRoaXMuc3dpdGNoZXNFbGVtLm9mZnNldFdpZHRoKSB7XG4gICAgdGhpcy5hcnJvd1JpZ2h0LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5hcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgfVxuXG59O1xuXG5cbmRlbGVnYXRlLmRlbGVnYXRlTWl4aW4oQ29kZVRhYnNCb3gucHJvdG90eXBlKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvZGVUYWJzQm94O1xuIiwicmVxdWlyZSgncHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWNvcmUuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1tYXJrdXAuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jc3MuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jc3MtZXh0cmFzLmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY2xpa2UuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1qYXZhc2NyaXB0LmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY29mZmVlc2NyaXB0LmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20taHR0cC5qcycpO1xucmVxdWlyZSgncHJpc21qcy9jb21wb25lbnRzL3ByaXNtLXNjc3MuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1zcWwuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1waHAuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1waHAtZXh0cmFzLmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tcHl0aG9uLmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tcnVieS5qcycpO1xucmVxdWlyZSgncHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWphdmEuanMnKTtcblxudmFyIENvZGVCb3ggPSByZXF1aXJlKCcuL2NvZGVCb3gnKTtcbnZhciBDb2RlVGFic0JveCA9IHJlcXVpcmUoJy4vY29kZVRhYnNCb3gnKTtcblxuZnVuY3Rpb24gaW5pdENvZGVCb3hlcygpIHtcblxuICAvLyBoaWdobGlnaHQgaW5saW5lXG4gIHZhciBjb2RlRXhhbXBsZUVsZW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29kZS1leGFtcGxlJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2RlRXhhbXBsZUVsZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNvZGVFeGFtcGxlRWxlbSA9IGNvZGVFeGFtcGxlRWxlbXNbaV07XG4gICAgbmV3IENvZGVCb3goY29kZUV4YW1wbGVFbGVtKTtcbiAgfVxuXG59XG5cblxuZnVuY3Rpb24gaW5pdENvZGVUYWJzQm94KCkge1xuXG4gIHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi5jb2RlLXRhYnMnKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgbmV3IENvZGVUYWJzQm94KGVsZW1zW2ldKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgUHJpc20uaGlnaGxpZ2h0QWxsKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgaW5pdENvZGVCb3hlcygpO1xuICAgIGluaXRDb2RlVGFic0JveCgpO1xuICB9KTtcblxufTtcblxuIiwiLy8gVXNhZ2U6XG4vLyAgMSkgbmV3IFNwaW5uZXIoeyBlbGVtOiBlbGVtfSkgLT4gc3RhcnQvc3RvcCgpXG4vLyAgMikgbmV3IFNwaW5uZXIoKSAtPiBzb21ld2hlcmUuYXBwZW5kKHNwaW5uZXIuZWxlbSkgLT4gc3RhcnQvc3RvcFxuZnVuY3Rpb24gU3Bpbm5lcihvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLmVsZW0gPSBvcHRpb25zLmVsZW07XG4gIHRoaXMuc2l6ZSA9IG9wdGlvbnMuc2l6ZSB8fCAnbWVkaXVtJztcbiAgLy8gYW55IGNsYXNzIHRvIGFkZCB0byBzcGlubmVyIChtYWtlIHNwaW5uZXIgc3BlY2lhbCBoZXJlKVxuICB0aGlzLmNsYXNzID0gb3B0aW9ucy5jbGFzcyA/ICgnICcgKyBvcHRpb25zLmNsYXNzKSA6ICcnO1xuXG4gIC8vIGFueSBjbGFzcyB0byBhZGQgdG8gZWxlbWVudCAodG8gaGlkZSBpdCdzIGNvbnRlbnQgZm9yIGluc3RhbmNlKVxuICB0aGlzLmVsZW1DbGFzcyA9IG9wdGlvbnMuZWxlbUNsYXNzO1xuXG4gIGlmICh0aGlzLnNpemUgIT0gJ21lZGl1bScgJiYgdGhpcy5zaXplICE9ICdzbWFsbCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBzaXplOiBcIiArIHRoaXMuc2l6ZSk7XG4gIH1cblxuICBpZiAoIXRoaXMuZWxlbSkge1xuICAgIHRoaXMuZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB9XG59XG5cblNwaW5uZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmVsZW1DbGFzcykge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuZWxlbUNsYXNzKTtcbiAgfVxuXG4gIHRoaXMuZWxlbS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsICc8c3BhbiBjbGFzcz1cInNwaW5uZXIgc3Bpbm5lcl9hY3RpdmUgc3Bpbm5lcl8nICsgdGhpcy5zaXplICsgdGhpcy5jbGFzcyArICdcIj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfMVwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfMlwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNwaW5uZXJfX2RvdCBzcGlubmVyX19kb3RfM1wiPjwvc3Bhbj48L3NwYW4+Jyk7XG59O1xuXG5TcGlubmVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbS5yZW1vdmVDaGlsZCh0aGlzLmVsZW0ucXVlcnlTZWxlY3RvcignLnNwaW5uZXInKSk7XG5cbiAgaWYgKHRoaXMuZWxlbUNsYXNzKSB7XG4gICAgdGhpcy5lbGVtLmNsYXNzTGlzdC50b2dnbGUodGhpcy5lbGVtQ2xhc3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaW5uZXI7XG4iLCJ2YXIgbm90aWZ5ID0gcmVxdWlyZSgnLi9ub3RpZnknKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigneGhyZmFpbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIG5vdGlmeS5lcnJvcihldmVudC5yZWFzb24pO1xufSk7XG4iLCJyZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5yZXF1aXJlKCcuL3hoci1ub3RpZnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSB4aHI7XG5cbi8vIFdyYXBwZXIgYWJvdXQgWEhSXG4vLyAjIEdsb2JhbCBFdmVudHNcbi8vIHRyaWdnZXJzIGRvY3VtZW50LmxvYWRzdGFydC9sb2FkZW5kIG9uIGNvbW11bmljYXRpb24gc3RhcnQvZW5kXG4vLyAgICAtLT4gdW5sZXNzIG9wdGlvbnMubm9HbG9iYWxFdmVudHMgaXMgc2V0XG4vL1xuLy8gIyBFdmVudHNcbi8vIHRyaWdnZXJzIGZhaWwvc3VjY2VzcyBvbiBsb2FkIGVuZDpcbi8vICAgIC0tPiBieSBkZWZhdWx0IHN0YXR1cz0yMDAgaXMgb2ssIHRoZSBvdGhlcnMgYXJlIGZhaWx1cmVzXG4vLyAgICAtLT4gb3B0aW9ucy5zdWNjZXNzU3RhdHVzZXMgPSBbMjAxLDQwOV0gYWxsb3cgZ2l2ZW4gc3RhdHVzZXNcbi8vICAgIC0tPiBmYWlsIGV2ZW50IGhhcyAucmVhc29uIGZpZWxkXG4vLyAgICAtLT4gc3VjY2VzcyBldmVudCBoYXMgLnJlc3VsdCBmaWVsZFxuLy9cbi8vICMgSlNPTlxuLy8gICAgLS0+IHNlbmQob2JqZWN0KSBjYWxscyBKU09OLnN0cmluZ2lmeVxuLy8gICAgLS0+IG9wdGlvbnMuanNvbiBhZGRzIEFjY2VwdDoganNvbiAod2Ugd2FudCBqc29uKVxuLy8gaWYgb3B0aW9ucy5qc29uIG9yIHNlcnZlciByZXR1cm5lZCBqc29uIGNvbnRlbnQgdHlwZVxuLy8gICAgLS0+IGF1dG9wYXJzZSBqc29uXG4vLyAgICAtLT4gZmFpbCBpZiBlcnJvclxuLy9cbi8vICMgQ1NSRlxuLy8gICAgLS0+IEdFVC9PUFRJT05TL0hFQUQgcmVxdWVzdHMgZ2V0IF9jc3JmIGZpZWxkIGZyb20gd2luZG93LmNzcmZcblxuZnVuY3Rpb24geGhyKG9wdGlvbnMpIHtcblxuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHZhciBtZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCAnR0VUJztcbiAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgb3B0aW9ucy51cmwsIG9wdGlvbnMuc3luYyA/IGZhbHNlIDogdHJ1ZSk7XG5cbiAgcmVxdWVzdC5tZXRob2QgPSBtZXRob2Q7XG5cbiAgaWYgKCFvcHRpb25zLm5vR2xvYmFsRXZlbnRzKSB7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RhcnQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocnN0YXJ0JywgZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlbmQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUgPSB3cmFwRXZlbnQoJ3hocmVuZCcsIGV2ZW50KTtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlID0gd3JhcEV2ZW50KCd4aHJzdWNjZXNzJywgZXZlbnQpO1xuICAgICAgZS5yZXN1bHQgPSBldmVudC5yZXN1bHQ7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0pO1xuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZmFpbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHdyYXBFdmVudCgneGhyZmFpbCcsIGV2ZW50KTtcbiAgICAgIGUucmVhc29uID0gZXZlbnQucmVhc29uO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmpzb24pIHsgLy8gbWVhbnMgd2Ugd2FudCBqc29uXG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgfVxuXG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignWC1SZXF1ZXN0ZWQtV2l0aCcsIFwiWE1MSHR0cFJlcXVlc3RcIik7XG5cbiAgdmFyIHN1Y2Nlc3NTdGF0dXNlcyA9IG9wdGlvbnMuc3VjY2Vzc1N0YXR1c2VzIHx8IFsyMDBdO1xuXG4gIGZ1bmN0aW9uIHdyYXBFdmVudChuYW1lLCBlKSB7XG4gICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KG5hbWUpO1xuICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSBlO1xuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZhaWwocmVhc29uLCBvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIGUgPSB3cmFwRXZlbnQoXCJmYWlsXCIsIG9yaWdpbmFsRXZlbnQpO1xuICAgIGUucmVhc29uID0gcmVhc29uO1xuICAgIHJlcXVlc3QuZGlzcGF0Y2hFdmVudChlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Y2Nlc3MocmVzdWx0LCBvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIGUgPSB3cmFwRXZlbnQoXCJzdWNjZXNzXCIsIG9yaWdpbmFsRXZlbnQpO1xuICAgIGUucmVzdWx0ID0gcmVzdWx0O1xuICAgIHJlcXVlc3QuZGlzcGF0Y2hFdmVudChlKTtcbiAgfVxuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBmYWlsKFwi0J7RiNC40LHQutCwINGB0LLRj9C30Lgg0YEg0YHQtdGA0LLQtdGA0L7QvC5cIiwgZSk7XG4gIH0pO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcihcInRpbWVvdXRcIiwgZnVuY3Rpb24oZSkge1xuICAgIGZhaWwoXCLQn9GA0LXQstGL0YjQtdC90L4g0LzQsNC60YHQuNC80LDQu9GM0L3QviDQtNC+0L/Rg9GB0YLQuNC80L7QtSDQstGA0LXQvNGPINC+0LbQuNC00LDQvdC40Y8g0L7RgtCy0LXRgtCwINC+0YIg0YHQtdGA0LLQtdGA0LAuXCIsIGUpO1xuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBmdW5jdGlvbihlKSB7XG4gICAgZmFpbChcItCX0LDQv9GA0L7RgSDQsdGL0Lsg0L/RgNC10YDQstCw0L0uXCIsIGUpO1xuICB9KTtcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoIXRoaXMuc3RhdHVzKSB7IC8vIGRvZXMgdGhhdCBldmVyIGhhcHBlbj9cbiAgICAgIGZhaWwoXCLQndC1INC/0L7Qu9GD0YfQtdC9INC+0YLQstC10YIg0L7RgiDRgdC10YDQstC10YDQsC5cIiwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHN1Y2Nlc3NTdGF0dXNlcy5pbmRleE9mKHRoaXMuc3RhdHVzKSA9PSAtMSkge1xuICAgICAgZmFpbChcItCe0YjQuNCx0LrQsCDQvdCwINGB0YLQvtGA0L7QvdC1INGB0LXRgNCy0LXRgNCwICjQutC+0LQgXCIgKyB0aGlzLnN0YXR1cyArIFwiKSwg0L/QvtC/0YvRgtCw0LnRgtC10YHRjCDQv9C+0LfQtNC90LXQtVwiLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5yZXNwb25zZVRleHQ7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdGhpcy5nZXRSZXNwb25zZUhlYWRlcihcIkNvbnRlbnQtVHlwZVwiKTtcbiAgICBpZiAoY29udGVudFR5cGUubWF0Y2goL15hcHBsaWNhdGlvblxcL2pzb24vKSB8fCBvcHRpb25zLmpzb24pIHsgLy8gYXV0b3BhcnNlIGpzb24gaWYgV0FOVCBvciBSRUNFSVZFRCBqc29uXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZhaWwoXCLQndC10LrQvtGA0YDQtdC60YLQvdGL0Lkg0YTQvtGA0LzQsNGCINC+0YLQstC10YLQsCDQvtGCINGB0LXRgNCy0LXRgNCwXCIsIGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3VjY2VzcyhyZXN1bHQsIGUpO1xuICB9KTtcblxuICB3cmFwQ3NyZlNlbmQocmVxdWVzdCk7XG4gIHJldHVybiByZXF1ZXN0O1xufVxuXG4vLyBBbGwgbm9uLUdFVCByZXF1ZXN0IGdldCBfY3NyZiBmcm9tIHdpbmRvdy5jc3JmIGF1dG9tYXRpY2FsbHlcbmZ1bmN0aW9uIHdyYXBDc3JmU2VuZChyZXF1ZXN0KSB7XG5cbiAgdmFyIHNlbmQgPSByZXF1ZXN0LnNlbmQ7XG4gIHJlcXVlc3Quc2VuZCA9IGZ1bmN0aW9uKGJvZHkpIHtcblxuICAgIGlmICghflsnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUyddLmluZGV4T2YodGhpcy5tZXRob2QpKSB7XG4gICAgICBpZiAoYm9keSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICAgIGJvZHkuYXBwZW5kKFwiX2NzcmZcIiwgd2luZG93LmNzcmYpO1xuICAgICAgfVxuXG4gICAgICBpZiAoe30udG9TdHJpbmcuY2FsbChib2R5KSA9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICBib2R5Ll9jc3JmID0gd2luZG93LmNzcmY7XG4gICAgICB9XG5cbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICBib2R5ID0ge19jc3JmOiB3aW5kb3cuY3NyZn07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoYm9keSkgPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgIHRoaXMuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD1VVEYtOFwiKTtcbiAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcbiAgICB9XG5cbiAgICBzZW5kLmNhbGwodGhpcywgYm9keSk7XG5cbiAgfTtcblxufVxuIiwiLyoqXG4gKiBodW1hbmUuanNcbiAqIEh1bWFuaXplZCBNZXNzYWdlcyBmb3IgTm90aWZpY2F0aW9uc1xuICogQGF1dGhvciBNYXJjIEhhcnRlciAoQHdhdmRlZClcbiAqIEBleGFtcGxlXG4gKiAgIGh1bWFuZS5sb2coJ2hlbGxvIHdvcmxkJyk7XG4gKiBTZWUgbW9yZSB1c2FnZSBleGFtcGxlcyBhdDogaHR0cDovL3dhdmRlZC5naXRodWIuY29tL2h1bWFuZS1qcy9cbiAqL1xuXG47IWZ1bmN0aW9uIChuYW1lLCBjb250ZXh0LCBkZWZpbml0aW9uKSB7XG4gICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbihuYW1lLCBjb250ZXh0KVxuICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCAgPT09ICdvYmplY3QnKSBkZWZpbmUoZGVmaW5pdGlvbilcbiAgIGVsc2UgY29udGV4dFtuYW1lXSA9IGRlZmluaXRpb24obmFtZSwgY29udGV4dClcbn0oJ2h1bWFuZScsIHRoaXMsIGZ1bmN0aW9uIChuYW1lLCBjb250ZXh0KSB7XG4gICB2YXIgd2luID0gd2luZG93XG4gICB2YXIgZG9jID0gZG9jdW1lbnRcblxuICAgdmFyIEVOViA9IHtcbiAgICAgIG9uOiBmdW5jdGlvbiAoZWwsIHR5cGUsIGNiKSB7XG4gICAgICAgICAnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luID8gZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLGNiLGZhbHNlKSA6IGVsLmF0dGFjaEV2ZW50KCdvbicrdHlwZSxjYilcbiAgICAgIH0sXG4gICAgICBvZmY6IGZ1bmN0aW9uIChlbCwgdHlwZSwgY2IpIHtcbiAgICAgICAgICdyZW1vdmVFdmVudExpc3RlbmVyJyBpbiB3aW4gPyBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsY2IsZmFsc2UpIDogZWwuZGV0YWNoRXZlbnQoJ29uJyt0eXBlLGNiKVxuICAgICAgfSxcbiAgICAgIGJpbmQ6IGZ1bmN0aW9uIChmbiwgY3R4KSB7XG4gICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyBmbi5hcHBseShjdHgsYXJndW1lbnRzKSB9XG4gICAgICB9LFxuICAgICAgaXNBcnJheTogQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJyB9LFxuICAgICAgY29uZmlnOiBmdW5jdGlvbiAocHJlZmVycmVkLCBmYWxsYmFjaykge1xuICAgICAgICAgcmV0dXJuIHByZWZlcnJlZCAhPSBudWxsID8gcHJlZmVycmVkIDogZmFsbGJhY2tcbiAgICAgIH0sXG4gICAgICB0cmFuc1N1cHBvcnQ6IGZhbHNlLFxuICAgICAgdXNlRmlsdGVyOiAvbXNpZSBbNjc4XS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksIC8vIHNuaWZmLCBzbmlmZlxuICAgICAgX2NoZWNrVHJhbnNpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgdmFyIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICB2YXIgdmVuZG9ycyA9IHsgd2Via2l0OiAnd2Via2l0JywgTW96OiAnJywgTzogJ28nLCBtczogJ01TJyB9XG5cbiAgICAgICAgIGZvciAodmFyIHZlbmRvciBpbiB2ZW5kb3JzKVxuICAgICAgICAgICAgaWYgKHZlbmRvciArICdUcmFuc2l0aW9uJyBpbiBlbC5zdHlsZSkge1xuICAgICAgICAgICAgICAgdGhpcy52ZW5kb3JQcmVmaXggPSB2ZW5kb3JzW3ZlbmRvcl1cbiAgICAgICAgICAgICAgIHRoaXMudHJhbnNTdXBwb3J0ID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgfVxuICAgfVxuICAgRU5WLl9jaGVja1RyYW5zaXRpb24oKVxuXG4gICB2YXIgSHVtYW5lID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgIG8gfHwgKG8gPSB7fSlcbiAgICAgIHRoaXMucXVldWUgPSBbXVxuICAgICAgdGhpcy5iYXNlQ2xzID0gby5iYXNlQ2xzIHx8ICdodW1hbmUnXG4gICAgICB0aGlzLmFkZG5DbHMgPSBvLmFkZG5DbHMgfHwgJydcbiAgICAgIHRoaXMudGltZW91dCA9ICd0aW1lb3V0JyBpbiBvID8gby50aW1lb3V0IDogMjUwMFxuICAgICAgdGhpcy53YWl0Rm9yTW92ZSA9IG8ud2FpdEZvck1vdmUgfHwgZmFsc2VcbiAgICAgIHRoaXMuY2xpY2tUb0Nsb3NlID0gby5jbGlja1RvQ2xvc2UgfHwgZmFsc2VcbiAgICAgIHRoaXMudGltZW91dEFmdGVyTW92ZSA9IG8udGltZW91dEFmdGVyTW92ZSB8fCBmYWxzZSBcbiAgICAgIHRoaXMuY29udGFpbmVyID0gby5jb250YWluZXJcblxuICAgICAgdHJ5IHsgdGhpcy5fc2V0dXBFbCgpIH0gLy8gYXR0ZW1wdCB0byBzZXR1cCBlbGVtZW50c1xuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgRU5WLm9uKHdpbiwnbG9hZCcsRU5WLmJpbmQodGhpcy5fc2V0dXBFbCwgdGhpcykpIC8vIGRvbSB3YXNuJ3QgcmVhZHksIHdhaXQgdGlsbCByZWFkeVxuICAgICAgfVxuICAgfVxuXG4gICBIdW1hbmUucHJvdG90eXBlID0ge1xuICAgICAgY29uc3RydWN0b3I6IEh1bWFuZSxcbiAgICAgIF9zZXR1cEVsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgICAgIGlmICghdGhpcy5jb250YWluZXIpe1xuICAgICAgICAgICBpZihkb2MuYm9keSkgdGhpcy5jb250YWluZXIgPSBkb2MuYm9keTtcbiAgICAgICAgICAgZWxzZSB0aHJvdyAnZG9jdW1lbnQuYm9keSBpcyBudWxsJ1xuICAgICAgICAgfVxuICAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICB0aGlzLmVsID0gZWxcbiAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnQgPSBFTlYuYmluZChmdW5jdGlvbigpeyBpZiAoIXRoaXMudGltZW91dEFmdGVyTW92ZSl7dGhpcy5yZW1vdmUoKX0gZWxzZSB7c2V0VGltZW91dChFTlYuYmluZCh0aGlzLnJlbW92ZSx0aGlzKSx0aGlzLnRpbWVvdXQpO319LHRoaXMpXG4gICAgICAgICB0aGlzLnRyYW5zRXZlbnQgPSBFTlYuYmluZCh0aGlzLl9hZnRlckFuaW1hdGlvbix0aGlzKVxuICAgICAgICAgdGhpcy5fcnVuKClcbiAgICAgIH0sXG4gICAgICBfYWZ0ZXJUaW1lb3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICBpZiAoIUVOVi5jb25maWcodGhpcy5jdXJyZW50TXNnLndhaXRGb3JNb3ZlLHRoaXMud2FpdEZvck1vdmUpKSB0aGlzLnJlbW92ZSgpXG5cbiAgICAgICAgIGVsc2UgaWYgKCF0aGlzLnJlbW92ZUV2ZW50c1NldCkge1xuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCdtb3VzZW1vdmUnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICAgICBFTlYub24oZG9jLmJvZHksJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKGRvYy5ib2R5LCdrZXlwcmVzcycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIEVOVi5vbihkb2MuYm9keSwndG91Y2hzdGFydCcsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRzU2V0ID0gdHJ1ZVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9ydW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIGlmICh0aGlzLl9hbmltYXRpbmcgfHwgIXRoaXMucXVldWUubGVuZ3RoIHx8ICF0aGlzLmVsKSByZXR1cm5cblxuICAgICAgICAgdGhpcy5fYW5pbWF0aW5nID0gdHJ1ZVxuICAgICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50VGltZXIpXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lciA9IG51bGxcbiAgICAgICAgIH1cblxuICAgICAgICAgdmFyIG1zZyA9IHRoaXMucXVldWUuc2hpZnQoKVxuICAgICAgICAgdmFyIGNsaWNrVG9DbG9zZSA9IEVOVi5jb25maWcobXNnLmNsaWNrVG9DbG9zZSx0aGlzLmNsaWNrVG9DbG9zZSlcblxuICAgICAgICAgaWYgKGNsaWNrVG9DbG9zZSkge1xuICAgICAgICAgICAgRU5WLm9uKHRoaXMuZWwsJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgICAgRU5WLm9uKHRoaXMuZWwsJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICB9XG5cbiAgICAgICAgIHZhciB0aW1lb3V0ID0gRU5WLmNvbmZpZyhtc2cudGltZW91dCx0aGlzLnRpbWVvdXQpXG5cbiAgICAgICAgIGlmICh0aW1lb3V0ID4gMClcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWVyID0gc2V0VGltZW91dChFTlYuYmluZCh0aGlzLl9hZnRlclRpbWVvdXQsdGhpcyksIHRpbWVvdXQpXG5cbiAgICAgICAgIGlmIChFTlYuaXNBcnJheShtc2cuaHRtbCkpIG1zZy5odG1sID0gJzx1bD48bGk+Jyttc2cuaHRtbC5qb2luKCc8bGk+JykrJzwvdWw+J1xuXG4gICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9IG1zZy5odG1sXG4gICAgICAgICB0aGlzLmN1cnJlbnRNc2cgPSBtc2dcbiAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzXG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkge1xuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuICAgICAgICAgICAgc2V0VGltZW91dChFTlYuYmluZCh0aGlzLl9zaG93TXNnLHRoaXMpLDUwKVxuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNc2coKVxuICAgICAgICAgfVxuXG4gICAgICB9LFxuICAgICAgX3NldE9wYWNpdHk6IGZ1bmN0aW9uIChvcGFjaXR5KSB7XG4gICAgICAgICBpZiAoRU5WLnVzZUZpbHRlcil7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICB0aGlzLmVsLmZpbHRlcnMuaXRlbSgnRFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQWxwaGEnKS5PcGFjaXR5ID0gb3BhY2l0eSoxMDBcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXt9XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5vcGFjaXR5ID0gU3RyaW5nKG9wYWNpdHkpXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX3Nob3dNc2c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHZhciBhZGRuQ2xzID0gRU5WLmNvbmZpZyh0aGlzLmN1cnJlbnRNc2cuYWRkbkNscyx0aGlzLmFkZG5DbHMpXG4gICAgICAgICBpZiAoRU5WLnRyYW5zU3VwcG9ydCkge1xuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSB0aGlzLmJhc2VDbHMrJyAnK2FkZG5DbHMrJyAnK3RoaXMuYmFzZUNscysnLWFuaW1hdGUnXG4gICAgICAgICB9XG4gICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gMFxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSB0aGlzLmJhc2VDbHMrJyAnK2FkZG5DbHMrJyAnK3RoaXMuYmFzZUNscysnLWpzLWFuaW1hdGUnXG4gICAgICAgICAgICB0aGlzLl9zZXRPcGFjaXR5KDApIC8vIHJlc2V0IHZhbHVlIHNvIGhvdmVyIHN0YXRlcyB3b3JrXG4gICAgICAgICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgIGlmIChvcGFjaXR5IDwgMSkge1xuICAgICAgICAgICAgICAgICAgb3BhY2l0eSArPSAwLjFcbiAgICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5ID4gMSkgb3BhY2l0eSA9IDFcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3NldE9wYWNpdHkob3BhY2l0eSlcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGVsc2UgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcbiAgICAgICAgICAgIH0sIDMwKVxuICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIF9oaWRlTXNnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB2YXIgYWRkbkNscyA9IEVOVi5jb25maWcodGhpcy5jdXJyZW50TXNnLmFkZG5DbHMsdGhpcy5hZGRuQ2xzKVxuICAgICAgICAgaWYgKEVOVi50cmFuc1N1cHBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gdGhpcy5iYXNlQ2xzKycgJythZGRuQ2xzXG4gICAgICAgICAgICBFTlYub24odGhpcy5lbCxFTlYudmVuZG9yUHJlZml4ID8gRU5WLnZlbmRvclByZWZpeCsnVHJhbnNpdGlvbkVuZCcgOiAndHJhbnNpdGlvbmVuZCcsdGhpcy50cmFuc0V2ZW50KVxuICAgICAgICAgfVxuICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3BhY2l0eSA9IDFcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgIGlmKG9wYWNpdHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IDAuMVxuICAgICAgICAgICAgICAgICAgaWYgKG9wYWNpdHkgPCAwKSBvcGFjaXR5ID0gMFxuICAgICAgICAgICAgICAgICAgc2VsZi5fc2V0T3BhY2l0eShvcGFjaXR5KTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc2VsZi5lbC5jbGFzc05hbWUgPSBzZWxmLmJhc2VDbHMrJyAnK2FkZG5DbHNcbiAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgICBzZWxmLl9hZnRlckFuaW1hdGlvbigpXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAzMClcbiAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfYWZ0ZXJBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIGlmIChFTlYudHJhbnNTdXBwb3J0KSBFTlYub2ZmKHRoaXMuZWwsRU5WLnZlbmRvclByZWZpeCA/IEVOVi52ZW5kb3JQcmVmaXgrJ1RyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnLHRoaXMudHJhbnNFdmVudClcblxuICAgICAgICAgaWYgKHRoaXMuY3VycmVudE1zZy5jYikgdGhpcy5jdXJyZW50TXNnLmNiKClcbiAgICAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgICAgICB0aGlzLl9hbmltYXRpbmcgPSBmYWxzZVxuICAgICAgICAgdGhpcy5fcnVuKClcbiAgICAgIH0sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICB2YXIgY2IgPSB0eXBlb2YgZSA9PSAnZnVuY3Rpb24nID8gZSA6IG51bGxcblxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwnbW91c2Vtb3ZlJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZihkb2MuYm9keSwnY2xpY2snLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKGRvYy5ib2R5LCdrZXlwcmVzcycsdGhpcy5yZW1vdmVFdmVudClcbiAgICAgICAgIEVOVi5vZmYoZG9jLmJvZHksJ3RvdWNoc3RhcnQnLHRoaXMucmVtb3ZlRXZlbnQpXG4gICAgICAgICBFTlYub2ZmKHRoaXMuZWwsJ2NsaWNrJyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgRU5WLm9mZih0aGlzLmVsLCd0b3VjaHN0YXJ0Jyx0aGlzLnJlbW92ZUV2ZW50KVxuICAgICAgICAgdGhpcy5yZW1vdmVFdmVudHNTZXQgPSBmYWxzZVxuXG4gICAgICAgICBpZiAoY2IgJiYgdGhpcy5jdXJyZW50TXNnKSB0aGlzLmN1cnJlbnRNc2cuY2IgPSBjYlxuICAgICAgICAgaWYgKHRoaXMuX2FuaW1hdGluZykgdGhpcy5faGlkZU1zZygpXG4gICAgICAgICBlbHNlIGlmIChjYikgY2IoKVxuICAgICAgfSxcbiAgICAgIGxvZzogZnVuY3Rpb24gKGh0bWwsIG8sIGNiLCBkZWZhdWx0cykge1xuICAgICAgICAgdmFyIG1zZyA9IHt9XG4gICAgICAgICBpZiAoZGVmYXVsdHMpXG4gICAgICAgICAgIGZvciAodmFyIG9wdCBpbiBkZWZhdWx0cylcbiAgICAgICAgICAgICAgIG1zZ1tvcHRdID0gZGVmYXVsdHNbb3B0XVxuXG4gICAgICAgICBpZiAodHlwZW9mIG8gPT0gJ2Z1bmN0aW9uJykgY2IgPSBvXG4gICAgICAgICBlbHNlIGlmIChvKVxuICAgICAgICAgICAgZm9yICh2YXIgb3B0IGluIG8pIG1zZ1tvcHRdID0gb1tvcHRdXG5cbiAgICAgICAgIG1zZy5odG1sID0gaHRtbFxuICAgICAgICAgaWYgKGNiKSBtc2cuY2IgPSBjYlxuICAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKG1zZylcbiAgICAgICAgIHRoaXMuX3J1bigpXG4gICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfSxcbiAgICAgIHNwYXduOiBmdW5jdGlvbiAoZGVmYXVsdHMpIHtcbiAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChodG1sLCBvLCBjYikge1xuICAgICAgICAgICAgc2VsZi5sb2cuY2FsbChzZWxmLGh0bWwsbyxjYixkZWZhdWx0cylcbiAgICAgICAgICAgIHJldHVybiBzZWxmXG4gICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY3JlYXRlOiBmdW5jdGlvbiAobykgeyByZXR1cm4gbmV3IEh1bWFuZShvKSB9XG4gICB9XG4gICByZXR1cm4gbmV3IEh1bWFuZSgpXG59KVxuIiwiXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCBtcykge1xuXG4gIHZhciBpc1Rocm90dGxlZCA9IGZhbHNlLFxuICAgICAgc2F2ZWRBcmdzLFxuICAgICAgc2F2ZWRUaGlzO1xuXG4gIGZ1bmN0aW9uIHdyYXBwZXIoKSB7XG5cbiAgICBpZiAoaXNUaHJvdHRsZWQpIHtcbiAgICAgIHNhdmVkQXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHNhdmVkVGhpcyA9IHRoaXM7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgaXNUaHJvdHRsZWQgPSB0cnVlO1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlzVGhyb3R0bGVkID0gZmFsc2U7XG4gICAgICBpZiAoc2F2ZWRBcmdzKSB7XG4gICAgICAgIHdyYXBwZXIuYXBwbHkoc2F2ZWRUaGlzLCBzYXZlZEFyZ3MpO1xuICAgICAgICBzYXZlZEFyZ3MgPSBzYXZlZFRoaXMgPSBudWxsO1xuICAgICAgfVxuICAgIH0sIG1zKTtcbiAgfVxuXG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwiUHJpc20ubGFuZ3VhZ2VzLmNsaWtlID0ge1xuXHQnY29tbWVudCc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSlcXC9cXCpbXFx3XFxXXSo/XFwqXFwvL2csXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcOl0pXFwvXFwvLio/KFxccj9cXG58JCkvZyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF0sXG5cdCdzdHJpbmcnOiAvKFwifCcpKFxcXFw/LikqP1xcMS9nLFxuXHQnY2xhc3MtbmFtZSc6IHtcblx0XHRwYXR0ZXJuOiAvKCg/Oig/OmNsYXNzfGludGVyZmFjZXxleHRlbmRzfGltcGxlbWVudHN8dHJhaXR8aW5zdGFuY2VvZnxuZXcpXFxzKyl8KD86Y2F0Y2hcXHMrXFwoKSlbYS16MC05X1xcLlxcXFxdKy9pZyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0cHVuY3R1YXRpb246IC8oXFwufFxcXFwpL1xuXHRcdH1cblx0fSxcblx0J2tleXdvcmQnOiAvXFxiKGlmfGVsc2V8d2hpbGV8ZG98Zm9yfHJldHVybnxpbnxpbnN0YW5jZW9mfGZ1bmN0aW9ufG5ld3x0cnl8dGhyb3d8Y2F0Y2h8ZmluYWxseXxudWxsfGJyZWFrfGNvbnRpbnVlKVxcYi9nLFxuXHQnYm9vbGVhbic6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvZyxcblx0J2Z1bmN0aW9uJzoge1xuXHRcdHBhdHRlcm46IC9bYS16MC05X10rXFwoL2lnLFxuXHRcdGluc2lkZToge1xuXHRcdFx0cHVuY3R1YXRpb246IC9cXCgvXG5cdFx0fVxuXHR9LFxuXHQnbnVtYmVyJzogL1xcYi0/KDB4W1xcZEEtRmEtZl0rfFxcZCpcXC4/XFxkKyhbRWVdLT9cXGQrKT8pXFxiL2csXG5cdCdvcGVyYXRvcic6IC9bLStdezEsMn18IXw8PT98Pj0/fD17MSwzfXwmezEsMn18XFx8P1xcfHxcXD98XFwqfFxcL3xcXH58XFxefFxcJS9nLFxuXHQnaWdub3JlJzogLyYobHR8Z3R8YW1wKTsvZ2ksXG5cdCdwdW5jdHVhdGlvbic6IC9be31bXFxdOygpLC46XS9nXG59O1xuIiwiUHJpc20ubGFuZ3VhZ2VzLmNvZmZlZXNjcmlwdCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2phdmFzY3JpcHQnLCB7XG5cdCdjb21tZW50JzogW1xuXHRcdC8oWyNdezN9XFxzKlxccj9cXG4oLipcXHMqXFxyKlxcbiopXFxzKj9cXHI/XFxuWyNdezN9KS9nLFxuXHRcdC8oXFxzfF4pKFsjXXsxfVteI15cXHJeXFxuXXsyLH0/KFxccj9cXG58JCkpL2dcblx0XSxcblx0J2tleXdvcmQnOiAvXFxiKHRoaXN8d2luZG93fGRlbGV0ZXxjbGFzc3xleHRlbmRzfG5hbWVzcGFjZXxleHRlbmR8YXJ8bGV0fGlmfGVsc2V8d2hpbGV8ZG98Zm9yfGVhY2h8b2Z8cmV0dXJufGlufGluc3RhbmNlb2Z8bmV3fHdpdGh8dHlwZW9mfHRyeXxjYXRjaHxmaW5hbGx5fG51bGx8dW5kZWZpbmVkfGJyZWFrfGNvbnRpbnVlKVxcYi9nXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnY29mZmVlc2NyaXB0JywgJ2tleXdvcmQnLCB7XG5cdCdmdW5jdGlvbic6IHtcblx0XHRwYXR0ZXJuOiAvW2EtenxBLXpdK1xccypbOnw9XVxccyooXFwoWy58YS16XFxzfCx8Onx7fH18XFxcInxcXCd8PV0qXFwpKT9cXHMqLSZndDsvZ2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnZnVuY3Rpb24tbmFtZSc6IC9bXz9hLXotfEEtWi1dKyhcXHMqWzp8PV0pfCBAW18/JD9hLXotfEEtWi1dKyhcXHMqKXwgL2csXG5cdFx0XHQnb3BlcmF0b3InOiAvWy0rXXsxLDJ9fCF8PT8mbHQ7fD0/Jmd0O3w9ezEsMn18KCZhbXA7KXsxLDJ9fFxcfD9cXHx8XFw/fFxcKnxcXC8vZ1xuXHRcdH1cblx0fSxcblx0J2F0dHItbmFtZSc6IC9bXz9hLXotfEEtWi1dKyhcXHMqOil8IEBbXz8kP2Etei18QS1aLV0rKFxccyopfCAvZ1xufSk7XG4iLCJzZWxmID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKVxuXHQ/IHdpbmRvdyAgIC8vIGlmIGluIGJyb3dzZXJcblx0OiAoXG5cdFx0KHR5cGVvZiBXb3JrZXJHbG9iYWxTY29wZSAhPT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlKVxuXHRcdD8gc2VsZiAvLyBpZiBpbiB3b3JrZXJcblx0XHQ6IHt9ICAgLy8gaWYgaW4gbm9kZSBqc1xuXHQpO1xuXG4vKipcbiAqIFByaXNtOiBMaWdodHdlaWdodCwgcm9idXN0LCBlbGVnYW50IHN5bnRheCBoaWdobGlnaHRpbmdcbiAqIE1JVCBsaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwL1xuICogQGF1dGhvciBMZWEgVmVyb3UgaHR0cDovL2xlYS52ZXJvdS5tZVxuICovXG5cbnZhciBQcmlzbSA9IChmdW5jdGlvbigpe1xuXG4vLyBQcml2YXRlIGhlbHBlciB2YXJzXG52YXIgbGFuZyA9IC9cXGJsYW5nKD86dWFnZSk/LSg/IVxcKikoXFx3KylcXGIvaTtcblxudmFyIF8gPSBzZWxmLlByaXNtID0ge1xuXHR1dGlsOiB7XG5cdFx0ZW5jb2RlOiBmdW5jdGlvbiAodG9rZW5zKSB7XG5cdFx0XHRpZiAodG9rZW5zIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBUb2tlbih0b2tlbnMudHlwZSwgXy51dGlsLmVuY29kZSh0b2tlbnMuY29udGVudCksIHRva2Vucy5hbGlhcyk7XG5cdFx0XHR9IGVsc2UgaWYgKF8udXRpbC50eXBlKHRva2VucykgPT09ICdBcnJheScpIHtcblx0XHRcdFx0cmV0dXJuIHRva2Vucy5tYXAoXy51dGlsLmVuY29kZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdG9rZW5zLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHlwZTogZnVuY3Rpb24gKG8pIHtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdCAoXFx3KylcXF0vKVsxXTtcblx0XHR9LFxuXG5cdFx0Ly8gRGVlcCBjbG9uZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gKGUuZy4gdG8gZXh0ZW5kIGl0KVxuXHRcdGNsb25lOiBmdW5jdGlvbiAobykge1xuXHRcdFx0dmFyIHR5cGUgPSBfLnV0aWwudHlwZShvKTtcblxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ09iamVjdCc6XG5cdFx0XHRcdFx0dmFyIGNsb25lID0ge307XG5cblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbykge1xuXHRcdFx0XHRcdFx0aWYgKG8uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0XHRjbG9uZVtrZXldID0gXy51dGlsLmNsb25lKG9ba2V5XSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGNsb25lO1xuXG5cdFx0XHRcdGNhc2UgJ0FycmF5Jzpcblx0XHRcdFx0XHRyZXR1cm4gby5zbGljZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbztcblx0XHR9XG5cdH0sXG5cblx0bGFuZ3VhZ2VzOiB7XG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiAoaWQsIHJlZGVmKSB7XG5cdFx0XHR2YXIgbGFuZyA9IF8udXRpbC5jbG9uZShfLmxhbmd1YWdlc1tpZF0pO1xuXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gcmVkZWYpIHtcblx0XHRcdFx0bGFuZ1trZXldID0gcmVkZWZba2V5XTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxhbmc7XG5cdFx0fSxcblxuXHRcdC8vIEluc2VydCBhIHRva2VuIGJlZm9yZSBhbm90aGVyIHRva2VuIGluIGEgbGFuZ3VhZ2UgbGl0ZXJhbFxuXHRcdGluc2VydEJlZm9yZTogZnVuY3Rpb24gKGluc2lkZSwgYmVmb3JlLCBpbnNlcnQsIHJvb3QpIHtcblx0XHRcdHJvb3QgPSByb290IHx8IF8ubGFuZ3VhZ2VzO1xuXHRcdFx0dmFyIGdyYW1tYXIgPSByb290W2luc2lkZV07XG5cdFx0XHR2YXIgcmV0ID0ge307XG5cblx0XHRcdGZvciAodmFyIHRva2VuIGluIGdyYW1tYXIpIHtcblxuXHRcdFx0XHRpZiAoZ3JhbW1hci5oYXNPd25Qcm9wZXJ0eSh0b2tlbikpIHtcblxuXHRcdFx0XHRcdGlmICh0b2tlbiA9PSBiZWZvcmUpIHtcblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgbmV3VG9rZW4gaW4gaW5zZXJ0KSB7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGluc2VydC5oYXNPd25Qcm9wZXJ0eShuZXdUb2tlbikpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXRbbmV3VG9rZW5dID0gaW5zZXJ0W25ld1Rva2VuXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldFt0b2tlbl0gPSBncmFtbWFyW3Rva2VuXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcm9vdFtpbnNpZGVdID0gcmV0O1xuXHRcdH0sXG5cblx0XHQvLyBUcmF2ZXJzZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gd2l0aCBEZXB0aCBGaXJzdCBTZWFyY2hcblx0XHRERlM6IGZ1bmN0aW9uKG8sIGNhbGxiYWNrLCB0eXBlKSB7XG5cdFx0XHRmb3IgKHZhciBpIGluIG8pIHtcblx0XHRcdFx0aWYgKG8uaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKG8sIGksIG9baV0sIHR5cGUgfHwgaSk7XG5cblx0XHRcdFx0XHRpZiAoXy51dGlsLnR5cGUob1tpXSkgPT09ICdPYmplY3QnKSB7XG5cdFx0XHRcdFx0XHRfLmxhbmd1YWdlcy5ERlMob1tpXSwgY2FsbGJhY2spO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoXy51dGlsLnR5cGUob1tpXSkgPT09ICdBcnJheScpIHtcblx0XHRcdFx0XHRcdF8ubGFuZ3VhZ2VzLkRGUyhvW2ldLCBjYWxsYmFjaywgaSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdGhpZ2hsaWdodEFsbDogZnVuY3Rpb24oYXN5bmMsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnY29kZVtjbGFzcyo9XCJsYW5ndWFnZS1cIl0sIFtjbGFzcyo9XCJsYW5ndWFnZS1cIl0gY29kZSwgY29kZVtjbGFzcyo9XCJsYW5nLVwiXSwgW2NsYXNzKj1cImxhbmctXCJdIGNvZGUnKTtcblxuXHRcdGZvciAodmFyIGk9MCwgZWxlbWVudDsgZWxlbWVudCA9IGVsZW1lbnRzW2krK107KSB7XG5cdFx0XHRfLmhpZ2hsaWdodEVsZW1lbnQoZWxlbWVudCwgYXN5bmMgPT09IHRydWUsIGNhbGxiYWNrKTtcblx0XHR9XG5cdH0sXG5cblx0aGlnaGxpZ2h0RWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCwgYXN5bmMsIGNhbGxiYWNrKSB7XG5cdFx0Ly8gRmluZCBsYW5ndWFnZVxuXHRcdHZhciBsYW5ndWFnZSwgZ3JhbW1hciwgcGFyZW50ID0gZWxlbWVudDtcblxuXHRcdHdoaWxlIChwYXJlbnQgJiYgIWxhbmcudGVzdChwYXJlbnQuY2xhc3NOYW1lKSkge1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0bGFuZ3VhZ2UgPSAocGFyZW50LmNsYXNzTmFtZS5tYXRjaChsYW5nKSB8fCBbLCcnXSlbMV07XG5cdFx0XHRncmFtbWFyID0gXy5sYW5ndWFnZXNbbGFuZ3VhZ2VdO1xuXHRcdH1cblxuXHRcdGlmICghZ3JhbW1hcikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNldCBsYW5ndWFnZSBvbiB0aGUgZWxlbWVudCwgaWYgbm90IHByZXNlbnRcblx0XHRlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UobGFuZywgJycpLnJlcGxhY2UoL1xccysvZywgJyAnKSArICcgbGFuZ3VhZ2UtJyArIGxhbmd1YWdlO1xuXG5cdFx0Ly8gU2V0IGxhbmd1YWdlIG9uIHRoZSBwYXJlbnQsIGZvciBzdHlsaW5nXG5cdFx0cGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXG5cdFx0aWYgKC9wcmUvaS50ZXN0KHBhcmVudC5ub2RlTmFtZSkpIHtcblx0XHRcdHBhcmVudC5jbGFzc05hbWUgPSBwYXJlbnQuY2xhc3NOYW1lLnJlcGxhY2UobGFuZywgJycpLnJlcGxhY2UoL1xccysvZywgJyAnKSArICcgbGFuZ3VhZ2UtJyArIGxhbmd1YWdlO1xuXHRcdH1cblxuXHRcdHZhciBjb2RlID0gZWxlbWVudC50ZXh0Q29udGVudDtcblxuXHRcdGlmKCFjb2RlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGVudiA9IHtcblx0XHRcdGVsZW1lbnQ6IGVsZW1lbnQsXG5cdFx0XHRsYW5ndWFnZTogbGFuZ3VhZ2UsXG5cdFx0XHRncmFtbWFyOiBncmFtbWFyLFxuXHRcdFx0Y29kZTogY29kZVxuXHRcdH07XG5cblx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLWhpZ2hsaWdodCcsIGVudik7XG5cblx0XHRpZiAoYXN5bmMgJiYgc2VsZi5Xb3JrZXIpIHtcblx0XHRcdHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKF8uZmlsZW5hbWUpO1xuXG5cdFx0XHR3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBUb2tlbi5zdHJpbmdpZnkoSlNPTi5wYXJzZShldnQuZGF0YSksIGxhbmd1YWdlKTtcblxuXHRcdFx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLWluc2VydCcsIGVudik7XG5cblx0XHRcdFx0ZW52LmVsZW1lbnQuaW5uZXJIVE1MID0gZW52LmhpZ2hsaWdodGVkQ29kZTtcblxuXHRcdFx0XHRjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKGVudi5lbGVtZW50KTtcblx0XHRcdFx0Xy5ob29rcy5ydW4oJ2FmdGVyLWhpZ2hsaWdodCcsIGVudik7XG5cdFx0XHR9O1xuXG5cdFx0XHR3b3JrZXIucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRsYW5ndWFnZTogZW52Lmxhbmd1YWdlLFxuXHRcdFx0XHRjb2RlOiBlbnYuY29kZVxuXHRcdFx0fSkpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBfLmhpZ2hsaWdodChlbnYuY29kZSwgZW52LmdyYW1tYXIsIGVudi5sYW5ndWFnZSlcblxuXHRcdFx0Xy5ob29rcy5ydW4oJ2JlZm9yZS1pbnNlcnQnLCBlbnYpO1xuXG5cdFx0XHRlbnYuZWxlbWVudC5pbm5lckhUTUwgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlO1xuXG5cdFx0XHRjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKGVsZW1lbnQpO1xuXG5cdFx0XHRfLmhvb2tzLnJ1bignYWZ0ZXItaGlnaGxpZ2h0JywgZW52KTtcblx0XHR9XG5cdH0sXG5cblx0aGlnaGxpZ2h0OiBmdW5jdGlvbiAodGV4dCwgZ3JhbW1hciwgbGFuZ3VhZ2UpIHtcblx0XHR2YXIgdG9rZW5zID0gXy50b2tlbml6ZSh0ZXh0LCBncmFtbWFyKTtcblx0XHRyZXR1cm4gVG9rZW4uc3RyaW5naWZ5KF8udXRpbC5lbmNvZGUodG9rZW5zKSwgbGFuZ3VhZ2UpO1xuXHR9LFxuXG5cdHRva2VuaXplOiBmdW5jdGlvbih0ZXh0LCBncmFtbWFyLCBsYW5ndWFnZSkge1xuXHRcdHZhciBUb2tlbiA9IF8uVG9rZW47XG5cblx0XHR2YXIgc3RyYXJyID0gW3RleHRdO1xuXG5cdFx0dmFyIHJlc3QgPSBncmFtbWFyLnJlc3Q7XG5cblx0XHRpZiAocmVzdCkge1xuXHRcdFx0Zm9yICh2YXIgdG9rZW4gaW4gcmVzdCkge1xuXHRcdFx0XHRncmFtbWFyW3Rva2VuXSA9IHJlc3RbdG9rZW5dO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWxldGUgZ3JhbW1hci5yZXN0O1xuXHRcdH1cblxuXHRcdHRva2VubG9vcDogZm9yICh2YXIgdG9rZW4gaW4gZ3JhbW1hcikge1xuXHRcdFx0aWYoIWdyYW1tYXIuaGFzT3duUHJvcGVydHkodG9rZW4pIHx8ICFncmFtbWFyW3Rva2VuXSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHBhdHRlcm5zID0gZ3JhbW1hclt0b2tlbl07XG5cdFx0XHRwYXR0ZXJucyA9IChfLnV0aWwudHlwZShwYXR0ZXJucykgPT09IFwiQXJyYXlcIikgPyBwYXR0ZXJucyA6IFtwYXR0ZXJuc107XG5cblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgcGF0dGVybnMubGVuZ3RoOyArK2opIHtcblx0XHRcdFx0dmFyIHBhdHRlcm4gPSBwYXR0ZXJuc1tqXSxcblx0XHRcdFx0XHRpbnNpZGUgPSBwYXR0ZXJuLmluc2lkZSxcblx0XHRcdFx0XHRsb29rYmVoaW5kID0gISFwYXR0ZXJuLmxvb2tiZWhpbmQsXG5cdFx0XHRcdFx0bG9va2JlaGluZExlbmd0aCA9IDAsXG5cdFx0XHRcdFx0YWxpYXMgPSBwYXR0ZXJuLmFsaWFzO1xuXG5cdFx0XHRcdHBhdHRlcm4gPSBwYXR0ZXJuLnBhdHRlcm4gfHwgcGF0dGVybjtcblxuXHRcdFx0XHRmb3IgKHZhciBpPTA7IGk8c3RyYXJyLmxlbmd0aDsgaSsrKSB7IC8vIERvbuKAmXQgY2FjaGUgbGVuZ3RoIGFzIGl0IGNoYW5nZXMgZHVyaW5nIHRoZSBsb29wXG5cblx0XHRcdFx0XHR2YXIgc3RyID0gc3RyYXJyW2ldO1xuXG5cdFx0XHRcdFx0aWYgKHN0cmFyci5sZW5ndGggPiB0ZXh0Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Ly8gU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsIEFCT1JULCBBQk9SVCFcblx0XHRcdFx0XHRcdGJyZWFrIHRva2VubG9vcDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoc3RyIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHBhdHRlcm4ubGFzdEluZGV4ID0gMDtcblxuXHRcdFx0XHRcdHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyhzdHIpO1xuXG5cdFx0XHRcdFx0aWYgKG1hdGNoKSB7XG5cdFx0XHRcdFx0XHRpZihsb29rYmVoaW5kKSB7XG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmRMZW5ndGggPSBtYXRjaFsxXS5sZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHZhciBmcm9tID0gbWF0Y2guaW5kZXggLSAxICsgbG9va2JlaGluZExlbmd0aCxcblx0XHRcdFx0XHRcdFx0bWF0Y2ggPSBtYXRjaFswXS5zbGljZShsb29rYmVoaW5kTGVuZ3RoKSxcblx0XHRcdFx0XHRcdFx0bGVuID0gbWF0Y2gubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHR0byA9IGZyb20gKyBsZW4sXG5cdFx0XHRcdFx0XHRcdGJlZm9yZSA9IHN0ci5zbGljZSgwLCBmcm9tICsgMSksXG5cdFx0XHRcdFx0XHRcdGFmdGVyID0gc3RyLnNsaWNlKHRvICsgMSk7XG5cblx0XHRcdFx0XHRcdHZhciBhcmdzID0gW2ksIDFdO1xuXG5cdFx0XHRcdFx0XHRpZiAoYmVmb3JlKSB7XG5cdFx0XHRcdFx0XHRcdGFyZ3MucHVzaChiZWZvcmUpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgd3JhcHBlZCA9IG5ldyBUb2tlbih0b2tlbiwgaW5zaWRlPyBfLnRva2VuaXplKG1hdGNoLCBpbnNpZGUpIDogbWF0Y2gsIGFsaWFzKTtcblxuXHRcdFx0XHRcdFx0YXJncy5wdXNoKHdyYXBwZWQpO1xuXG5cdFx0XHRcdFx0XHRpZiAoYWZ0ZXIpIHtcblx0XHRcdFx0XHRcdFx0YXJncy5wdXNoKGFmdGVyKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0QXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShzdHJhcnIsIGFyZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzdHJhcnI7XG5cdH0sXG5cblx0aG9va3M6IHtcblx0XHRhbGw6IHt9LFxuXG5cdFx0YWRkOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBob29rcyA9IF8uaG9va3MuYWxsO1xuXG5cdFx0XHRob29rc1tuYW1lXSA9IGhvb2tzW25hbWVdIHx8IFtdO1xuXG5cdFx0XHRob29rc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcblx0XHR9LFxuXG5cdFx0cnVuOiBmdW5jdGlvbiAobmFtZSwgZW52KSB7XG5cdFx0XHR2YXIgY2FsbGJhY2tzID0gXy5ob29rcy5hbGxbbmFtZV07XG5cblx0XHRcdGlmICghY2FsbGJhY2tzIHx8ICFjYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaT0wLCBjYWxsYmFjazsgY2FsbGJhY2sgPSBjYWxsYmFja3NbaSsrXTspIHtcblx0XHRcdFx0Y2FsbGJhY2soZW52KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbnZhciBUb2tlbiA9IF8uVG9rZW4gPSBmdW5jdGlvbih0eXBlLCBjb250ZW50LCBhbGlhcykge1xuXHR0aGlzLnR5cGUgPSB0eXBlO1xuXHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuXHR0aGlzLmFsaWFzID0gYWxpYXM7XG59O1xuXG5Ub2tlbi5zdHJpbmdpZnkgPSBmdW5jdGlvbihvLCBsYW5ndWFnZSwgcGFyZW50KSB7XG5cdGlmICh0eXBlb2YgbyA9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKSA9PSAnW29iamVjdCBBcnJheV0nKSB7XG5cdFx0cmV0dXJuIG8ubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBUb2tlbi5zdHJpbmdpZnkoZWxlbWVudCwgbGFuZ3VhZ2UsIG8pO1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0dmFyIGVudiA9IHtcblx0XHR0eXBlOiBvLnR5cGUsXG5cdFx0Y29udGVudDogVG9rZW4uc3RyaW5naWZ5KG8uY29udGVudCwgbGFuZ3VhZ2UsIHBhcmVudCksXG5cdFx0dGFnOiAnc3BhbicsXG5cdFx0Y2xhc3NlczogWyd0b2tlbicsIG8udHlwZV0sXG5cdFx0YXR0cmlidXRlczoge30sXG5cdFx0bGFuZ3VhZ2U6IGxhbmd1YWdlLFxuXHRcdHBhcmVudDogcGFyZW50XG5cdH07XG5cblx0aWYgKGVudi50eXBlID09ICdjb21tZW50Jykge1xuXHRcdGVudi5hdHRyaWJ1dGVzWydzcGVsbGNoZWNrJ10gPSAndHJ1ZSc7XG5cdH1cblxuXHRpZiAoby5hbGlhcykge1xuXHRcdHZhciBhbGlhc2VzID0gXy51dGlsLnR5cGUoby5hbGlhcykgPT09ICdBcnJheScgPyBvLmFsaWFzIDogW28uYWxpYXNdO1xuXHRcdEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVudi5jbGFzc2VzLCBhbGlhc2VzKTtcblx0fVxuXG5cdF8uaG9va3MucnVuKCd3cmFwJywgZW52KTtcblxuXHR2YXIgYXR0cmlidXRlcyA9ICcnO1xuXG5cdGZvciAodmFyIG5hbWUgaW4gZW52LmF0dHJpYnV0ZXMpIHtcblx0XHRhdHRyaWJ1dGVzICs9IG5hbWUgKyAnPVwiJyArIChlbnYuYXR0cmlidXRlc1tuYW1lXSB8fCAnJykgKyAnXCInO1xuXHR9XG5cblx0cmV0dXJuICc8JyArIGVudi50YWcgKyAnIGNsYXNzPVwiJyArIGVudi5jbGFzc2VzLmpvaW4oJyAnKSArICdcIiAnICsgYXR0cmlidXRlcyArICc+JyArIGVudi5jb250ZW50ICsgJzwvJyArIGVudi50YWcgKyAnPic7XG5cbn07XG5cbmlmICghc2VsZi5kb2N1bWVudCkge1xuXHRpZiAoIXNlbGYuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdC8vIGluIE5vZGUuanNcblx0XHRyZXR1cm4gc2VsZi5QcmlzbTtcblx0fVxuIFx0Ly8gSW4gd29ya2VyXG5cdHNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldnQuZGF0YSksXG5cdFx0ICAgIGxhbmcgPSBtZXNzYWdlLmxhbmd1YWdlLFxuXHRcdCAgICBjb2RlID0gbWVzc2FnZS5jb2RlO1xuXG5cdFx0c2VsZi5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShfLnV0aWwuZW5jb2RlKF8udG9rZW5pemUoY29kZSwgXy5sYW5ndWFnZXNbbGFuZ10pKSkpO1xuXHRcdHNlbGYuY2xvc2UoKTtcblx0fSwgZmFsc2UpO1xuXG5cdHJldHVybiBzZWxmLlByaXNtO1xufVxuXG4vLyBHZXQgY3VycmVudCBzY3JpcHQgYW5kIGhpZ2hsaWdodFxudmFyIHNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcblxuc2NyaXB0ID0gc2NyaXB0W3NjcmlwdC5sZW5ndGggLSAxXTtcblxuaWYgKHNjcmlwdCkge1xuXHRfLmZpbGVuYW1lID0gc2NyaXB0LnNyYztcblxuXHRpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAmJiAhc2NyaXB0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1tYW51YWwnKSkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBfLmhpZ2hsaWdodEFsbCk7XG5cdH1cbn1cblxucmV0dXJuIHNlbGYuUHJpc207XG5cbn0pKCk7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IFByaXNtO1xufVxuIiwiUHJpc20ubGFuZ3VhZ2VzLmNzcy5zZWxlY3RvciA9IHtcblx0cGF0dGVybjogL1teXFx7XFx9XFxzXVteXFx7XFx9XSooPz1cXHMqXFx7KS9nLFxuXHRpbnNpZGU6IHtcblx0XHQncHNldWRvLWVsZW1lbnQnOiAvOig/OmFmdGVyfGJlZm9yZXxmaXJzdC1sZXR0ZXJ8Zmlyc3QtbGluZXxzZWxlY3Rpb24pfDo6Wy1cXHddKy9nLFxuXHRcdCdwc2V1ZG8tY2xhc3MnOiAvOlstXFx3XSsoPzpcXCguKlxcKSk/L2csXG5cdFx0J2NsYXNzJzogL1xcLlstOlxcLlxcd10rL2csXG5cdFx0J2lkJzogLyNbLTpcXC5cXHddKy9nXG5cdH1cbn07XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2NzcycsICdpZ25vcmUnLCB7XG5cdCdoZXhjb2RlJzogLyNbXFxkYS1mXXszLDZ9L2dpLFxuXHQnZW50aXR5JzogL1xcXFxbXFxkYS1mXXsxLDh9L2dpLFxuXHQnbnVtYmVyJzogL1tcXGQlXFwuXSsvZ1xufSk7IiwiUHJpc20ubGFuZ3VhZ2VzLmNzcyA9IHtcblx0J2NvbW1lbnQnOiAvXFwvXFwqW1xcd1xcV10qP1xcKlxcLy9nLFxuXHQnYXRydWxlJzoge1xuXHRcdHBhdHRlcm46IC9AW1xcdy1dKz8uKj8oO3woPz1cXHMqeykpL2dpLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3B1bmN0dWF0aW9uJzogL1s7Ol0vZ1xuXHRcdH1cblx0fSxcblx0J3VybCc6IC91cmxcXCgoW1wiJ10/KS4qP1xcMVxcKS9naSxcblx0J3NlbGVjdG9yJzogL1teXFx7XFx9XFxzXVteXFx7XFx9O10qKD89XFxzKlxceykvZyxcblx0J3Byb3BlcnR5JzogLyhcXGJ8XFxCKVtcXHctXSsoPz1cXHMqOikvaWcsXG5cdCdzdHJpbmcnOiAvKFwifCcpKFxcXFw/LikqP1xcMS9nLFxuXHQnaW1wb3J0YW50JzogL1xcQiFpbXBvcnRhbnRcXGIvZ2ksXG5cdCdwdW5jdHVhdGlvbic6IC9bXFx7XFx9OzpdL2csXG5cdCdmdW5jdGlvbic6IC9bLWEtejAtOV0rKD89XFwoKS9pZ1xufTtcblxuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya3VwJywgJ3RhZycsIHtcblx0XHQnc3R5bGUnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvPHN0eWxlW1xcd1xcV10qPz5bXFx3XFxXXSo/PFxcL3N0eWxlPi9pZyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQndGFnJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC88c3R5bGVbXFx3XFxXXSo/Pnw8XFwvc3R5bGU+L2lnLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcuaW5zaWRlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5jc3Ncblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSIsIlByaXNtLmxhbmd1YWdlcy5odHRwID0ge1xuICAgICdyZXF1ZXN0LWxpbmUnOiB7XG4gICAgICAgIHBhdHRlcm46IC9eKFBPU1R8R0VUfFBVVHxERUxFVEV8T1BUSU9OU3xQQVRDSHxUUkFDRXxDT05ORUNUKVxcYlxcc2h0dHBzPzpcXC9cXC9cXFMrXFxzSFRUUFxcL1swLTkuXSsvZyxcbiAgICAgICAgaW5zaWRlOiB7XG4gICAgICAgICAgICAvLyBIVFRQIFZlcmJcbiAgICAgICAgICAgIHByb3BlcnR5OiAvXlxcYihQT1NUfEdFVHxQVVR8REVMRVRFfE9QVElPTlN8UEFUQ0h8VFJBQ0V8Q09OTkVDVClcXGIvZyxcbiAgICAgICAgICAgIC8vIFBhdGggb3IgcXVlcnkgYXJndW1lbnRcbiAgICAgICAgICAgICdhdHRyLW5hbWUnOiAvOlxcdysvZ1xuICAgICAgICB9XG4gICAgfSxcbiAgICAncmVzcG9uc2Utc3RhdHVzJzoge1xuICAgICAgICBwYXR0ZXJuOiAvXkhUVFBcXC8xLlswMV0gWzAtOV0rLiovZyxcbiAgICAgICAgaW5zaWRlOiB7XG4gICAgICAgICAgICAvLyBTdGF0dXMsIGUuZy4gMjAwIE9LXG4gICAgICAgICAgICBwcm9wZXJ0eTogL1swLTldK1tBLVpcXHMtXSskL2dcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8gSFRUUCBoZWFkZXIgbmFtZVxuICAgIGtleXdvcmQ6IC9eW1xcdy1dKzooPz0uKykvZ21cbn07XG5cbi8vIENyZWF0ZSBhIG1hcHBpbmcgb2YgQ29udGVudC1UeXBlIGhlYWRlcnMgdG8gbGFuZ3VhZ2UgZGVmaW5pdGlvbnNcbnZhciBodHRwTGFuZ3VhZ2VzID0ge1xuICAgICdhcHBsaWNhdGlvbi9qc29uJzogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHQsXG4gICAgJ2FwcGxpY2F0aW9uL3htbCc6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAsXG4gICAgJ3RleHQveG1sJzogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cCxcbiAgICAndGV4dC9odG1sJzogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cFxufTtcblxuLy8gSW5zZXJ0IGVhY2ggY29udGVudCB0eXBlIHBhcnNlciB0aGF0IGhhcyBpdHMgYXNzb2NpYXRlZCBsYW5ndWFnZVxuLy8gY3VycmVudGx5IGxvYWRlZC5cbmZvciAodmFyIGNvbnRlbnRUeXBlIGluIGh0dHBMYW5ndWFnZXMpIHtcbiAgICBpZiAoaHR0cExhbmd1YWdlc1tjb250ZW50VHlwZV0pIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICAgICAgb3B0aW9uc1tjb250ZW50VHlwZV0gPSB7XG4gICAgICAgICAgICBwYXR0ZXJuOiBuZXcgUmVnRXhwKCcoY29udGVudC10eXBlOlxcXFxzKicgKyBjb250ZW50VHlwZSArICdbXFxcXHdcXFxcV10qPylcXFxcblxcXFxuW1xcXFx3XFxcXFddKicsICdnaScpLFxuICAgICAgICAgICAgbG9va2JlaGluZDogdHJ1ZSxcbiAgICAgICAgICAgIGluc2lkZToge1xuICAgICAgICAgICAgICAgIHJlc3Q6IGh0dHBMYW5ndWFnZXNbY29udGVudFR5cGVdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2h0dHAnLCAna2V5d29yZCcsIG9wdGlvbnMpO1xuICAgIH1cbn1cbiIsIlByaXNtLmxhbmd1YWdlcy5qYXZhID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhYnN0cmFjdHxjb250aW51ZXxmb3J8bmV3fHN3aXRjaHxhc3NlcnR8ZGVmYXVsdHxnb3RvfHBhY2thZ2V8c3luY2hyb25pemVkfGJvb2xlYW58ZG98aWZ8cHJpdmF0ZXx0aGlzfGJyZWFrfGRvdWJsZXxpbXBsZW1lbnRzfHByb3RlY3RlZHx0aHJvd3xieXRlfGVsc2V8aW1wb3J0fHB1YmxpY3x0aHJvd3N8Y2FzZXxlbnVtfGluc3RhbmNlb2Z8cmV0dXJufHRyYW5zaWVudHxjYXRjaHxleHRlbmRzfGludHxzaG9ydHx0cnl8Y2hhcnxmaW5hbHxpbnRlcmZhY2V8c3RhdGljfHZvaWR8Y2xhc3N8ZmluYWxseXxsb25nfHN0cmljdGZwfHZvbGF0aWxlfGNvbnN0fGZsb2F0fG5hdGl2ZXxzdXBlcnx3aGlsZSlcXGIvZyxcblx0J251bWJlcic6IC9cXGIwYlswMV0rXFxifFxcYjB4W1xcZGEtZl0qXFwuP1tcXGRhLWZwXFwtXStcXGJ8XFxiXFxkKlxcLj9cXGQrW2VdP1tcXGRdKltkZl1cXGJ8XFxXXFxkKlxcLj9cXGQrXFxiL2dpLFxuXHQnb3BlcmF0b3InOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFwuXSkoPzpcXCs9fFxcK1xcKz98LT18LS0/fCE9P3w8ezEsMn09P3w+ezEsM309P3w9PT98Jj18JiY/fFxcfD18XFx8XFx8P3xcXD98XFwqPT98XFwvPT98JT0/fFxcXj0/fDp8fikvZ20sXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59KTsiLCJQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQna2V5d29yZCc6IC9cXGIoYnJlYWt8Y2FzZXxjYXRjaHxjbGFzc3xjb25zdHxjb250aW51ZXxkZWJ1Z2dlcnxkZWZhdWx0fGRlbGV0ZXxkb3xlbHNlfGVudW18ZXhwb3J0fGV4dGVuZHN8ZmFsc2V8ZmluYWxseXxmb3J8ZnVuY3Rpb258Z2V0fGlmfGltcGxlbWVudHN8aW1wb3J0fGlufGluc3RhbmNlb2Z8aW50ZXJmYWNlfGxldHxuZXd8bnVsbHxwYWNrYWdlfHByaXZhdGV8cHJvdGVjdGVkfHB1YmxpY3xyZXR1cm58c2V0fHN0YXRpY3xzdXBlcnxzd2l0Y2h8dGhpc3x0aHJvd3x0cnVlfHRyeXx0eXBlb2Z8dmFyfHZvaWR8d2hpbGV8d2l0aHx5aWVsZClcXGIvZyxcblx0J251bWJlcic6IC9cXGItPygweFtcXGRBLUZhLWZdK3xcXGQqXFwuP1xcZCsoW0VlXS0/XFxkKyk/fE5hTnwtP0luZmluaXR5KVxcYi9nXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnamF2YXNjcmlwdCcsICdrZXl3b3JkJywge1xuXHQncmVnZXgnOiB7XG5cdFx0cGF0dGVybjogLyhefFteL10pXFwvKD8hXFwvKShcXFsuKz9dfFxcXFwufFteL1xcclxcbl0pK1xcL1tnaW1dezAsM30oPz1cXHMqKCR8W1xcclxcbiwuO30pXSkpL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59KTtcblxuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya3VwJywgJ3RhZycsIHtcblx0XHQnc2NyaXB0Jzoge1xuXHRcdFx0cGF0dGVybjogLzxzY3JpcHRbXFx3XFxXXSo/PltcXHdcXFddKj88XFwvc2NyaXB0Pi9pZyxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQndGFnJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC88c2NyaXB0W1xcd1xcV10qPz58PFxcL3NjcmlwdD4vaWcsXG5cdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS5sYW5ndWFnZXMubWFya3VwLnRhZy5pbnNpZGVcblx0XHRcdFx0fSxcblx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuIiwiUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cCA9IHtcblx0J2NvbW1lbnQnOiAvPCEtLVtcXHdcXFddKj8tLT4vZyxcblx0J3Byb2xvZyc6IC88XFw/Lis/XFw/Pi8sXG5cdCdkb2N0eXBlJzogLzwhRE9DVFlQRS4rPz4vLFxuXHQnY2RhdGEnOiAvPCFcXFtDREFUQVxcW1tcXHdcXFddKj9dXT4vaSxcblx0J3RhZyc6IHtcblx0XHRwYXR0ZXJuOiAvPFxcLz9bXFx3Oi1dK1xccyooPzpcXHMrW1xcdzotXSsoPzo9KD86KFwifCcpKFxcXFw/W1xcd1xcV10pKj9cXDF8W15cXHMnXCI+PV0rKSk/XFxzKikqXFwvPz4vZ2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQndGFnJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvXjxcXC8/W1xcdzotXSsvaSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL148XFwvPy8sXG5cdFx0XHRcdFx0J25hbWVzcGFjZSc6IC9eW1xcdy1dKz86L1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2F0dHItdmFsdWUnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC89KD86KCd8XCIpW1xcd1xcV10qPyhcXDEpfFteXFxzPl0rKS9naSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogLz18PnxcIi9nXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQncHVuY3R1YXRpb24nOiAvXFwvPz4vZyxcblx0XHRcdCdhdHRyLW5hbWUnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9bXFx3Oi1dKy9nLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnbmFtZXNwYWNlJzogL15bXFx3LV0rPzovXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblx0fSxcblx0J2VudGl0eSc6IC9cXCYjP1tcXGRhLXpdezEsOH07L2dpXG59O1xuXG4vLyBQbHVnaW4gdG8gbWFrZSBlbnRpdHkgdGl0bGUgc2hvdyB0aGUgcmVhbCBlbnRpdHksIGlkZWEgYnkgUm9tYW4gS29tYXJvdlxuUHJpc20uaG9va3MuYWRkKCd3cmFwJywgZnVuY3Rpb24oZW52KSB7XG5cblx0aWYgKGVudi50eXBlID09PSAnZW50aXR5Jykge1xuXHRcdGVudi5hdHRyaWJ1dGVzWyd0aXRsZSddID0gZW52LmNvbnRlbnQucmVwbGFjZSgvJmFtcDsvLCAnJicpO1xuXHR9XG59KTtcbiIsIlByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICd2YXJpYWJsZScsIHtcblx0J3RoaXMnOiAvXFwkdGhpcy9nLFxuXHQnZ2xvYmFsJzogL1xcJF8/KEdMT0JBTFN8U0VSVkVSfEdFVHxQT1NUfEZJTEVTfFJFUVVFU1R8U0VTU0lPTnxFTlZ8Q09PS0lFfEhUVFBfUkFXX1BPU1RfREFUQXxhcmdjfGFyZ3Z8cGhwX2Vycm9ybXNnfGh0dHBfcmVzcG9uc2VfaGVhZGVyKS9nLFxuXHQnc2NvcGUnOiB7XG5cdFx0cGF0dGVybjogL1xcYltcXHdcXFxcXSs6Oi9nLFxuXHRcdGluc2lkZToge1xuXHRcdFx0a2V5d29yZDogLyhzdGF0aWN8c2VsZnxwYXJlbnQpLyxcblx0XHRcdHB1bmN0dWF0aW9uOiAvKDo6fFxcXFwpL1xuXHRcdH1cblx0fVxufSk7IiwiLyoqXG4gKiBPcmlnaW5hbCBieSBBYXJvbiBIYXJ1bjogaHR0cDovL2FhaGFjcmVhdGl2ZS5jb20vMjAxMi8wNy8zMS9waHAtc3ludGF4LWhpZ2hsaWdodGluZy1wcmlzbS9cbiAqIE1vZGlmaWVkIGJ5IE1pbGVzIEpvaG5zb246IGh0dHA6Ly9taWxlc2oubWVcbiAqXG4gKiBTdXBwb3J0cyB0aGUgZm9sbG93aW5nOlxuICogXHRcdC0gRXh0ZW5kcyBjbGlrZSBzeW50YXhcbiAqIFx0XHQtIFN1cHBvcnQgZm9yIFBIUCA1LjMrIChuYW1lc3BhY2VzLCB0cmFpdHMsIGdlbmVyYXRvcnMsIGV0YylcbiAqIFx0XHQtIFNtYXJ0ZXIgY29uc3RhbnQgYW5kIGZ1bmN0aW9uIG1hdGNoaW5nXG4gKlxuICogQWRkcyB0aGUgZm9sbG93aW5nIG5ldyB0b2tlbiBjbGFzc2VzOlxuICogXHRcdGNvbnN0YW50LCBkZWxpbWl0ZXIsIHZhcmlhYmxlLCBmdW5jdGlvbiwgcGFja2FnZVxuICovXG5cblByaXNtLmxhbmd1YWdlcy5waHAgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjbGlrZScsIHtcblx0J2tleXdvcmQnOiAvXFxiKGFuZHxvcnx4b3J8YXJyYXl8YXN8YnJlYWt8Y2FzZXxjZnVuY3Rpb258Y2xhc3N8Y29uc3R8Y29udGludWV8ZGVjbGFyZXxkZWZhdWx0fGRpZXxkb3xlbHNlfGVsc2VpZnxlbmRkZWNsYXJlfGVuZGZvcnxlbmRmb3JlYWNofGVuZGlmfGVuZHN3aXRjaHxlbmR3aGlsZXxleHRlbmRzfGZvcnxmb3JlYWNofGZ1bmN0aW9ufGluY2x1ZGV8aW5jbHVkZV9vbmNlfGdsb2JhbHxpZnxuZXd8cmV0dXJufHN0YXRpY3xzd2l0Y2h8dXNlfHJlcXVpcmV8cmVxdWlyZV9vbmNlfHZhcnx3aGlsZXxhYnN0cmFjdHxpbnRlcmZhY2V8cHVibGljfGltcGxlbWVudHN8cHJpdmF0ZXxwcm90ZWN0ZWR8cGFyZW50fHRocm93fG51bGx8ZWNob3xwcmludHx0cmFpdHxuYW1lc3BhY2V8ZmluYWx8eWllbGR8Z290b3xpbnN0YW5jZW9mfGZpbmFsbHl8dHJ5fGNhdGNoKVxcYi9pZyxcblx0J2NvbnN0YW50JzogL1xcYltBLVowLTlfXXsyLH1cXGIvZyxcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pKFxcL1xcKltcXHdcXFddKj9cXCpcXC98KF58W146XSkoXFwvXFwvfCMpLio/KFxccj9cXG58JCkpL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgncGhwJywgJ2tleXdvcmQnLCB7XG5cdCdkZWxpbWl0ZXInOiAvKFxcPz58PFxcP3BocHw8XFw/KS9pZyxcblx0J3ZhcmlhYmxlJzogLyhcXCRcXHcrKVxcYi9pZyxcblx0J3BhY2thZ2UnOiB7XG5cdFx0cGF0dGVybjogLyhcXFxcfG5hbWVzcGFjZVxccyt8dXNlXFxzKylbXFx3XFxcXF0rL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdHB1bmN0dWF0aW9uOiAvXFxcXC9cblx0XHR9XG5cdH1cbn0pO1xuXG4vLyBNdXN0IGJlIGRlZmluZWQgYWZ0ZXIgdGhlIGZ1bmN0aW9uIHBhdHRlcm5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICdvcGVyYXRvcicsIHtcblx0J3Byb3BlcnR5Jzoge1xuXHRcdHBhdHRlcm46IC8oLT4pW1xcd10rL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9XG59KTtcblxuLy8gQWRkIEhUTUwgc3VwcG9ydCBvZiB0aGUgbWFya3VwIGxhbmd1YWdlIGV4aXN0c1xuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblxuXHQvLyBUb2tlbml6ZSBhbGwgaW5saW5lIFBIUCBibG9ja3MgdGhhdCBhcmUgd3JhcHBlZCBpbiA8P3BocCA/PlxuXHQvLyBUaGlzIGFsbG93cyBmb3IgZWFzeSBQSFAgKyBtYXJrdXAgaGlnaGxpZ2h0aW5nXG5cdFByaXNtLmhvb2tzLmFkZCgnYmVmb3JlLWhpZ2hsaWdodCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgIT09ICdwaHAnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZW52LnRva2VuU3RhY2sgPSBbXTtcblxuXHRcdGVudi5iYWNrdXBDb2RlID0gZW52LmNvZGU7XG5cdFx0ZW52LmNvZGUgPSBlbnYuY29kZS5yZXBsYWNlKC8oPzo8XFw/cGhwfDxcXD8pW1xcd1xcV10qPyg/OlxcPz4pL2lnLCBmdW5jdGlvbihtYXRjaCkge1xuXHRcdFx0ZW52LnRva2VuU3RhY2sucHVzaChtYXRjaCk7XG5cblx0XHRcdHJldHVybiAne3t7UEhQJyArIGVudi50b2tlblN0YWNrLmxlbmd0aCArICd9fX0nO1xuXHRcdH0pO1xuXHR9KTtcblxuXHQvLyBSZXN0b3JlIGVudi5jb2RlIGZvciBvdGhlciBwbHVnaW5zIChlLmcuIGxpbmUtbnVtYmVycylcblx0UHJpc20uaG9va3MuYWRkKCdiZWZvcmUtaW5zZXJ0JywgZnVuY3Rpb24oZW52KSB7XG5cdFx0aWYgKGVudi5sYW5ndWFnZSA9PT0gJ3BocCcpIHtcblx0XHRcdGVudi5jb2RlID0gZW52LmJhY2t1cENvZGU7XG5cdFx0XHRkZWxldGUgZW52LmJhY2t1cENvZGU7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBSZS1pbnNlcnQgdGhlIHRva2VucyBhZnRlciBoaWdobGlnaHRpbmdcblx0UHJpc20uaG9va3MuYWRkKCdhZnRlci1oaWdobGlnaHQnLCBmdW5jdGlvbihlbnYpIHtcblx0XHRpZiAoZW52Lmxhbmd1YWdlICE9PSAncGhwJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwLCB0OyB0ID0gZW52LnRva2VuU3RhY2tbaV07IGkrKykge1xuXHRcdFx0ZW52LmhpZ2hsaWdodGVkQ29kZSA9IGVudi5oaWdobGlnaHRlZENvZGUucmVwbGFjZSgne3t7UEhQJyArIChpICsgMSkgKyAnfX19JywgUHJpc20uaGlnaGxpZ2h0KHQsIGVudi5ncmFtbWFyLCAncGhwJykpO1xuXHRcdH1cblxuXHRcdGVudi5lbGVtZW50LmlubmVySFRNTCA9IGVudi5oaWdobGlnaHRlZENvZGU7XG5cdH0pO1xuXG5cdC8vIFdyYXAgdG9rZW5zIGluIGNsYXNzZXMgdGhhdCBhcmUgbWlzc2luZyB0aGVtXG5cdFByaXNtLmhvb2tzLmFkZCgnd3JhcCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgPT09ICdwaHAnICYmIGVudi50eXBlID09PSAnbWFya3VwJykge1xuXHRcdFx0ZW52LmNvbnRlbnQgPSBlbnYuY29udGVudC5yZXBsYWNlKC8oXFx7XFx7XFx7UEhQWzAtOV0rXFx9XFx9XFx9KS9nLCBcIjxzcGFuIGNsYXNzPVxcXCJ0b2tlbiBwaHBcXFwiPiQxPC9zcGFuPlwiKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIEFkZCB0aGUgcnVsZXMgYmVmb3JlIGFsbCBvdGhlcnNcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgncGhwJywgJ2NvbW1lbnQnLCB7XG5cdFx0J21hcmt1cCc6IHtcblx0XHRcdHBhdHRlcm46IC88W14/XVxcLz8oLio/KT4vZyxcblx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cFxuXHRcdH0sXG5cdFx0J3BocCc6IC9cXHtcXHtcXHtQSFBbMC05XStcXH1cXH1cXH0vZ1xuXHR9KTtcbn1cbiIsIlByaXNtLmxhbmd1YWdlcy5weXRob249IHsgXG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKSMuKj8oXFxyP1xcbnwkKS9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J3N0cmluZyc6IC9cIlwiXCJbXFxzXFxTXSs/XCJcIlwifChcInwnKShcXFxcPy4pKj9cXDEvZyxcblx0J2tleXdvcmQnIDogL1xcYihhc3xhc3NlcnR8YnJlYWt8Y2xhc3N8Y29udGludWV8ZGVmfGRlbHxlbGlmfGVsc2V8ZXhjZXB0fGV4ZWN8ZmluYWxseXxmb3J8ZnJvbXxnbG9iYWx8aWZ8aW1wb3J0fGlufGlzfGxhbWJkYXxwYXNzfHByaW50fHJhaXNlfHJldHVybnx0cnl8d2hpbGV8d2l0aHx5aWVsZClcXGIvZyxcblx0J2Jvb2xlYW4nIDogL1xcYihUcnVlfEZhbHNlKVxcYi9nLFxuXHQnbnVtYmVyJyA6IC9cXGItPygweCk/XFxkKlxcLj9bXFxkYS1mXStcXGIvZyxcblx0J29wZXJhdG9yJyA6IC9bLStdezEsMn18PT8mbHQ7fD0/Jmd0O3whfD17MSwyfXwoJil7MSwyfXwoJmFtcDspezEsMn18XFx8P1xcfHxcXD98XFwqfFxcL3x+fFxcXnwlfFxcYihvcnxhbmR8bm90KVxcYi9nLFxuXHQnaWdub3JlJyA6IC8mKGx0fGd0fGFtcCk7L2dpLFxuXHQncHVuY3R1YXRpb24nIDogL1t7fVtcXF07KCksLjpdL2dcbn07XG5cbiIsIi8qKlxuICogT3JpZ2luYWwgYnkgU2FtdWVsIEZsb3Jlc1xuICpcbiAqIEFkZHMgdGhlIGZvbGxvd2luZyBuZXcgdG9rZW4gY2xhc3NlczpcbiAqIFx0XHRjb25zdGFudCwgYnVpbHRpbiwgdmFyaWFibGUsIHN5bWJvbCwgcmVnZXhcbiAqL1xuUHJpc20ubGFuZ3VhZ2VzLnJ1YnkgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjbGlrZScsIHtcblx0J2NvbW1lbnQnOiAvI1teXFxyXFxuXSooXFxyP1xcbnwkKS9nLFxuXHQna2V5d29yZCc6IC9cXGIoYWxpYXN8YW5kfEJFR0lOfGJlZ2lufGJyZWFrfGNhc2V8Y2xhc3N8ZGVmfGRlZmluZV9tZXRob2R8ZGVmaW5lZHxkb3xlYWNofGVsc2V8ZWxzaWZ8RU5EfGVuZHxlbnN1cmV8ZmFsc2V8Zm9yfGlmfGlufG1vZHVsZXxuZXd8bmV4dHxuaWx8bm90fG9yfHJhaXNlfHJlZG98cmVxdWlyZXxyZXNjdWV8cmV0cnl8cmV0dXJufHNlbGZ8c3VwZXJ8dGhlbnx0aHJvd3x0cnVlfHVuZGVmfHVubGVzc3x1bnRpbHx3aGVufHdoaWxlfHlpZWxkKVxcYi9nLFxuXHQnYnVpbHRpbic6IC9cXGIoQXJyYXl8QmlnbnVtfEJpbmRpbmd8Q2xhc3N8Q29udGludWF0aW9ufERpcnxFeGNlcHRpb258RmFsc2VDbGFzc3xGaWxlfFN0YXR8RmlsZXxGaXhudW18RmxvYWR8SGFzaHxJbnRlZ2VyfElPfE1hdGNoRGF0YXxNZXRob2R8TW9kdWxlfE5pbENsYXNzfE51bWVyaWN8T2JqZWN0fFByb2N8UmFuZ2V8UmVnZXhwfFN0cmluZ3xTdHJ1Y3R8VE1TfFN5bWJvbHxUaHJlYWRHcm91cHxUaHJlYWR8VGltZXxUcnVlQ2xhc3MpXFxiLyxcblx0J2NvbnN0YW50JzogL1xcYltBLVpdW2EtekEtWl8wLTldKls/IV0/XFxiL2dcbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdydWJ5JywgJ2tleXdvcmQnLCB7XG5cdCdyZWdleCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W14vXSlcXC8oPyFcXC8pKFxcWy4rP118XFxcXC58W14vXFxyXFxuXSkrXFwvW2dpbV17MCwzfSg/PVxccyooJHxbXFxyXFxuLC47fSldKSkvZyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCd2YXJpYWJsZSc6IC9bQCRdK1xcYlthLXpBLVpfXVthLXpBLVpfMC05XSpbPyFdP1xcYi9nLFxuXHQnc3ltYm9sJzogLzpcXGJbYS16QS1aX11bYS16QS1aXzAtOV0qWz8hXT9cXGIvZ1xufSk7XG4iLCJQcmlzbS5sYW5ndWFnZXMuc2NzcyA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NzcycsIHtcblx0J2NvbW1lbnQnOiB7XG5cdFx0cGF0dGVybjogLyhefFteXFxcXF0pKFxcL1xcKltcXHdcXFddKj9cXCpcXC98XFwvXFwvLio/KFxccj9cXG58JCkpL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQvLyBhdHVybGUgaXMganVzdCB0aGUgQCoqKiwgbm90IHRoZSBlbnRpcmUgcnVsZSAodG8gaGlnaGxpZ2h0IHZhciAmIHN0dWZmcylcblx0Ly8gKyBhZGQgYWJpbGl0eSB0byBoaWdobGlnaHQgbnVtYmVyICYgdW5pdCBmb3IgbWVkaWEgcXVlcmllc1xuXHQnYXRydWxlJzogL0BbXFx3LV0rKD89XFxzKyhcXCh8XFx7fDspKS9naSxcblx0Ly8gdXJsLCBjb21wYXNzaWZpZWRcblx0J3VybCc6IC8oWy1hLXpdKy0pKnVybCg/PVxcKCkvZ2ksXG5cdC8vIENTUyBzZWxlY3RvciByZWdleCBpcyBub3QgYXBwcm9wcmlhdGUgZm9yIFNhc3Ncblx0Ly8gc2luY2UgdGhlcmUgY2FuIGJlIGxvdCBtb3JlIHRoaW5ncyAodmFyLCBAIGRpcmVjdGl2ZSwgbmVzdGluZy4uKVxuXHQvLyBhIHNlbGVjdG9yIG11c3Qgc3RhcnQgYXQgdGhlIGVuZCBvZiBhIHByb3BlcnR5IG9yIGFmdGVyIGEgYnJhY2UgKGVuZCBvZiBvdGhlciBydWxlcyBvciBuZXN0aW5nKVxuXHQvLyBpdCBjYW4gY29udGFpbiBzb21lIGNhcmFjdGVycyB0aGF0IGFyZW4ndCB1c2VkIGZvciBkZWZpbmluZyBydWxlcyBvciBlbmQgb2Ygc2VsZWN0b3IsICYgKHBhcmVudCBzZWxlY3RvciksIG9yIGludGVycG9sYXRlZCB2YXJpYWJsZVxuXHQvLyB0aGUgZW5kIG9mIGEgc2VsZWN0b3IgaXMgZm91bmQgd2hlbiB0aGVyZSBpcyBubyBydWxlcyBpbiBpdCAoIHt9IG9yIHtcXHN9KSBvciBpZiB0aGVyZSBpcyBhIHByb3BlcnR5IChiZWNhdXNlIGFuIGludGVycG9sYXRlZCB2YXJcblx0Ly8gY2FuIFwicGFzc1wiIGFzIGEgc2VsZWN0b3ItIGUuZzogcHJvcGVyI3skZXJ0eX0pXG5cdC8vIHRoaXMgb25lIHdhcyBhcmQgdG8gZG8sIHNvIHBsZWFzZSBiZSBjYXJlZnVsIGlmIHlvdSBlZGl0IHRoaXMgb25lIDopXG5cdCdzZWxlY3Rvcic6IC8oW15AO1xce1xcfVxcKFxcKV0/KFteQDtcXHtcXH1cXChcXCldfCZ8XFwjXFx7XFwkWy1fXFx3XStcXH0pKykoPz1cXHMqXFx7KFxcfXxcXHN8W15cXH1dKyg6fFxceylbXlxcfV0rKSkvZ21cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdzY3NzJywgJ2F0cnVsZScsIHtcblx0J2tleXdvcmQnOiAvQChpZnxlbHNlIGlmfGVsc2V8Zm9yfGVhY2h8d2hpbGV8aW1wb3J0fGV4dGVuZHxkZWJ1Z3x3YXJufG1peGlufGluY2x1ZGV8ZnVuY3Rpb258cmV0dXJufGNvbnRlbnQpfCg/PUBmb3JcXHMrXFwkWy1fXFx3XStcXHMpK2Zyb20vaVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3Njc3MnLCAncHJvcGVydHknLCB7XG5cdC8vIHZhciBhbmQgaW50ZXJwb2xhdGVkIHZhcnNcblx0J3ZhcmlhYmxlJzogLygoXFwkWy1fXFx3XSspfCgjXFx7XFwkWy1fXFx3XStcXH0pKS9pXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnc2NzcycsICdpZ25vcmUnLCB7XG5cdCdwbGFjZWhvbGRlcic6IC8lWy1fXFx3XSsvaSxcblx0J3N0YXRlbWVudCc6IC9cXEIhKGRlZmF1bHR8b3B0aW9uYWwpXFxiL2dpLFxuXHQnYm9vbGVhbic6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvZyxcblx0J251bGwnOiAvXFxiKG51bGwpXFxiL2csXG5cdCdvcGVyYXRvcic6IC9cXHMrKFstK117MSwyfXw9ezEsMn18IT18XFx8P1xcfHxcXD98XFwqfFxcL3xcXCUpXFxzKy9nXG59KTtcbiIsIlByaXNtLmxhbmd1YWdlcy5zcWw9IHsgXG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKShcXC9cXCpbXFx3XFxXXSo/XFwqXFwvfCgoLS0pfChcXC9cXC8pfCMpLio/KFxccj9cXG58JCkpL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQnc3RyaW5nJyA6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15AXSkoXCJ8JykoXFxcXD9bXFxzXFxTXSkqP1xcMi9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J3ZhcmlhYmxlJzogL0BbXFx3LiRdK3xAKFwifCd8YCkoXFxcXD9bXFxzXFxTXSkrP1xcMS9nLFxuXHQnZnVuY3Rpb24nOiAvXFxiKD86Q09VTlR8U1VNfEFWR3xNSU58TUFYfEZJUlNUfExBU1R8VUNBU0V8TENBU0V8TUlEfExFTnxST1VORHxOT1d8Rk9STUFUKSg/PVxccypcXCgpL2lnLCAvLyBTaG91bGQgd2UgaGlnaGxpZ2h0IHVzZXIgZGVmaW5lZCBmdW5jdGlvbnMgdG9vP1xuXHQna2V5d29yZCc6IC9cXGIoPzpBQ1RJT058QUREfEFGVEVSfEFMR09SSVRITXxBTFRFUnxBTkFMWVpFfEFQUExZfEFTfEFTQ3xBVVRIT1JJWkFUSU9OfEJBQ0tVUHxCREJ8QkVHSU58QkVSS0VMRVlEQnxCSUdJTlR8QklOQVJZfEJJVHxCTE9CfEJPT0x8Qk9PTEVBTnxCUkVBS3xCUk9XU0V8QlRSRUV8QlVMS3xCWXxDQUxMfENBU0NBREV8Q0FTQ0FERUR8Q0FTRXxDSEFJTnxDSEFSIFZBUllJTkd8Q0hBUkFDVEVSIFZBUllJTkd8Q0hFQ0t8Q0hFQ0tQT0lOVHxDTE9TRXxDTFVTVEVSRUR8Q09BTEVTQ0V8Q09MVU1OfENPTFVNTlN8Q09NTUVOVHxDT01NSVR8Q09NTUlUVEVEfENPTVBVVEV8Q09OTkVDVHxDT05TSVNURU5UfENPTlNUUkFJTlR8Q09OVEFJTlN8Q09OVEFJTlNUQUJMRXxDT05USU5VRXxDT05WRVJUfENSRUFURXxDUk9TU3xDVVJSRU5UfENVUlJFTlRfREFURXxDVVJSRU5UX1RJTUV8Q1VSUkVOVF9USU1FU1RBTVB8Q1VSUkVOVF9VU0VSfENVUlNPUnxEQVRBfERBVEFCQVNFfERBVEFCQVNFU3xEQVRFVElNRXxEQkNDfERFQUxMT0NBVEV8REVDfERFQ0lNQUx8REVDTEFSRXxERUZBVUxUfERFRklORVJ8REVMQVlFRHxERUxFVEV8REVOWXxERVNDfERFU0NSSUJFfERFVEVSTUlOSVNUSUN8RElTQUJMRXxESVNDQVJEfERJU0t8RElTVElOQ1R8RElTVElOQ1RST1d8RElTVFJJQlVURUR8RE98RE9VQkxFfERPVUJMRSBQUkVDSVNJT058RFJPUHxEVU1NWXxEVU1QfERVTVBGSUxFfERVUExJQ0FURSBLRVl8RUxTRXxFTkFCTEV8RU5DTE9TRUQgQll8RU5EfEVOR0lORXxFTlVNfEVSUkxWTHxFUlJPUlN8RVNDQVBFfEVTQ0FQRUQgQll8RVhDRVBUfEVYRUN8RVhFQ1VURXxFWElUfEVYUExBSU58RVhURU5ERUR8RkVUQ0h8RklFTERTfEZJTEV8RklMTEZBQ1RPUnxGSVJTVHxGSVhFRHxGTE9BVHxGT0xMT1dJTkd8Rk9SfEZPUiBFQUNIIFJPV3xGT1JDRXxGT1JFSUdOfEZSRUVURVhUfEZSRUVURVhUVEFCTEV8RlJPTXxGVUxMfEZVTkNUSU9OfEdFT01FVFJZfEdFT01FVFJZQ09MTEVDVElPTnxHTE9CQUx8R09UT3xHUkFOVHxHUk9VUHxIQU5ETEVSfEhBU0h8SEFWSU5HfEhPTERMT0NLfElERU5USVRZfElERU5USVRZX0lOU0VSVHxJREVOVElUWUNPTHxJRnxJR05PUkV8SU1QT1JUfElOREVYfElORklMRXxJTk5FUnxJTk5PREJ8SU5PVVR8SU5TRVJUfElOVHxJTlRFR0VSfElOVEVSU0VDVHxJTlRPfElOVk9LRVJ8SVNPTEFUSU9OIExFVkVMfEpPSU58S0VZfEtFWVN8S0lMTHxMQU5HVUFHRSBTUUx8TEFTVHxMRUZUfExJTUlUfExJTkVOT3xMSU5FU3xMSU5FU1RSSU5HfExPQUR8TE9DQUx8TE9DS3xMT05HQkxPQnxMT05HVEVYVHxNQVRDSHxNQVRDSEVEfE1FRElVTUJMT0J8TUVESVVNSU5UfE1FRElVTVRFWFR8TUVSR0V8TUlERExFSU5UfE1PRElGSUVTIFNRTCBEQVRBfE1PRElGWXxNVUxUSUxJTkVTVFJJTkd8TVVMVElQT0lOVHxNVUxUSVBPTFlHT058TkFUSU9OQUx8TkFUSU9OQUwgQ0hBUiBWQVJZSU5HfE5BVElPTkFMIENIQVJBQ1RFUnxOQVRJT05BTCBDSEFSQUNURVIgVkFSWUlOR3xOQVRJT05BTCBWQVJDSEFSfE5BVFVSQUx8TkNIQVJ8TkNIQVIgVkFSQ0hBUnxORVhUfE5PfE5PIFNRTHxOT0NIRUNLfE5PQ1lDTEV8Tk9OQ0xVU1RFUkVEfE5VTExJRnxOVU1FUklDfE9GfE9GRnxPRkZTRVRTfE9OfE9QRU58T1BFTkRBVEFTT1VSQ0V8T1BFTlFVRVJZfE9QRU5ST1dTRVR8T1BUSU1JWkV8T1BUSU9OfE9QVElPTkFMTFl8T1JERVJ8T1VUfE9VVEVSfE9VVEZJTEV8T1ZFUnxQQVJUSUFMfFBBUlRJVElPTnxQRVJDRU5UfFBJVk9UfFBMQU58UE9JTlR8UE9MWUdPTnxQUkVDRURJTkd8UFJFQ0lTSU9OfFBSRVZ8UFJJTUFSWXxQUklOVHxQUklWSUxFR0VTfFBST0N8UFJPQ0VEVVJFfFBVQkxJQ3xQVVJHRXxRVUlDS3xSQUlTRVJST1J8UkVBRHxSRUFEUyBTUUwgREFUQXxSRUFEVEVYVHxSRUFMfFJFQ09ORklHVVJFfFJFRkVSRU5DRVN8UkVMRUFTRXxSRU5BTUV8UkVQRUFUQUJMRXxSRVBMSUNBVElPTnxSRVFVSVJFfFJFU1RPUkV8UkVTVFJJQ1R8UkVUVVJOfFJFVFVSTlN8UkVWT0tFfFJJR0hUfFJPTExCQUNLfFJPVVRJTkV8Uk9XQ09VTlR8Uk9XR1VJRENPTHxST1dTP3xSVFJFRXxSVUxFfFNBVkV8U0FWRVBPSU5UfFNDSEVNQXxTRUxFQ1R8U0VSSUFMfFNFUklBTElaQUJMRXxTRVNTSU9OfFNFU1NJT05fVVNFUnxTRVR8U0VUVVNFUnxTSEFSRSBNT0RFfFNIT1d8U0hVVERPV058U0lNUExFfFNNQUxMSU5UfFNOQVBTSE9UfFNPTUV8U09OQU1FfFNUQVJUfFNUQVJUSU5HIEJZfFNUQVRJU1RJQ1N8U1RBVFVTfFNUUklQRUR8U1lTVEVNX1VTRVJ8VEFCTEV8VEFCTEVTfFRBQkxFU1BBQ0V8VEVNUCg/Ok9SQVJZKT98VEVNUFRBQkxFfFRFUk1JTkFURUQgQll8VEVYVHxURVhUU0laRXxUSEVOfFRJTUVTVEFNUHxUSU5ZQkxPQnxUSU5ZSU5UfFRJTllURVhUfFRPfFRPUHxUUkFOfFRSQU5TQUNUSU9OfFRSQU5TQUNUSU9OU3xUUklHR0VSfFRSVU5DQVRFfFRTRVFVQUx8VFlQRXxUWVBFU3xVTkJPVU5ERUR8VU5DT01NSVRURUR8VU5ERUZJTkVEfFVOSU9OfFVOUElWT1R8VVBEQVRFfFVQREFURVRFWFR8VVNBR0V8VVNFfFVTRVJ8VVNJTkd8VkFMVUV8VkFMVUVTfFZBUkJJTkFSWXxWQVJDSEFSfFZBUkNIQVJBQ1RFUnxWQVJZSU5HfFZJRVd8V0FJVEZPUnxXQVJOSU5HU3xXSEVOfFdIRVJFfFdISUxFfFdJVEh8V0lUSCBST0xMVVB8V0lUSElOfFdPUkt8V1JJVEV8V1JJVEVURVhUKVxcYi9naSxcblx0J2Jvb2xlYW4nOiAvXFxiKD86VFJVRXxGQUxTRXxOVUxMKVxcYi9naSxcblx0J251bWJlcic6IC9cXGItPygweCk/XFxkKlxcLj9bXFxkYS1mXStcXGIvZyxcblx0J29wZXJhdG9yJzogL1xcYig/OkFMTHxBTkR8QU5ZfEJFVFdFRU58RVhJU1RTfElOfExJS0V8Tk9UfE9SfElTfFVOSVFVRXxDSEFSQUNURVIgU0VUfENPTExBVEV8RElWfE9GRlNFVHxSRUdFWFB8UkxJS0V8U09VTkRTIExJS0V8WE9SKVxcYnxbLStdezF9fCF8Wz08Pl17MSwyfXwoJil7MSwyfXxcXHw/XFx8fFxcP3xcXCp8XFwvL2dpLFxuXHQncHVuY3R1YXRpb24nOiAvWztbXFxdKClgLC5dL2dcbn07IiwidmFyIHRocm90dGxlID0gcmVxdWlyZSgnbGliL3Rocm90dGxlJyk7XG5cbmZ1bmN0aW9uIFR1dG9yaWFsTWFwKGVsZW0pIHtcbiAgdGhpcy5lbGVtID0gZWxlbTtcblxuICB0aGlzLnNob3dUYXNrc0NoZWNrYm94ID0gZWxlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS10dXRvcmlhbC1tYXAtc2hvdy10YXNrc10nKTtcbiAgdGhpcy5zaG93VGFza3NDaGVja2JveC5jaGVja2VkID0gK2xvY2FsU3RvcmFnZS5zaG93VGFza3NDaGVja2JveDtcbiAgdGhpcy51cGRhdGVTaG93VGFza3MoKTtcblxuICB0aGlzLnNob3dUYXNrc0NoZWNrYm94Lm9uY2hhbmdlID0gdGhpcy51cGRhdGVTaG93VGFza3MuYmluZCh0aGlzKTtcblxuICB0aGlzLmZpbHRlcklucHV0ID0gdGhpcy5lbGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXR1dG9yaWFsLW1hcC1maWx0ZXJdJyk7XG5cbiAgdGhpcy5maWx0ZXJJbnB1dC5vbmlucHV0ID0gdGhpcy5vbkZpbHRlcklucHV0LmJpbmQodGhpcyk7XG59XG5cblR1dG9yaWFsTWFwLnByb3RvdHlwZS51cGRhdGVTaG93VGFza3MgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuc2hvd1Rhc2tzQ2hlY2tib3guY2hlY2tlZCkge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QuYWRkKCd0dXRvcmlhbC1tYXBfc2hvdy10YXNrcycpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCd0dXRvcmlhbC1tYXBfc2hvdy10YXNrcycpO1xuICB9XG5cbiAgbG9jYWxTdG9yYWdlLnNob3dUYXNrc0NoZWNrYm94ID0gdGhpcy5zaG93VGFza3NDaGVja2JveC5jaGVja2VkID8gXCIxXCIgOiBcIjBcIjtcbn07XG5cblR1dG9yaWFsTWFwLnByb3RvdHlwZS5vbkZpbHRlcklucHV0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgdGhpcy50aHJvdHRsZUZpbHRlcihldmVudC50YXJnZXQudmFsdWUpO1xufTtcblxuVHV0b3JpYWxNYXAucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZmlsdGVySW5wdXQuZm9jdXMoKTtcbn07XG5cblR1dG9yaWFsTWFwLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gIHZhciBzaG93aW5nVGFza3MgPSB0aGlzLnNob3dUYXNrc0NoZWNrYm94LmNoZWNrZWQ7XG5cbiAgdmFyIGxpbmtzID0gdGhpcy5lbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJy50dXRvcmlhbC1tYXAtbGluaycpO1xuXG4gIHZhciB0b3BJdGVtcyA9IHRoaXMuZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCcudHV0b3JpYWwtbWFwX19pdGVtJyk7XG5cbiAgZnVuY3Rpb24gY2hlY2tMaU1hdGNoKGxpKSB7XG4gICAgcmV0dXJuIGlzU3ViU2VxdWVuY2UobGkucXVlcnlTZWxlY3RvcignYScpLmlubmVySFRNTC50b0xvd2VyQ2FzZSgpLCB2YWx1ZS5yZXBsYWNlKC9cXHMvZywgJycpKTtcbiAgfVxuXG4gIC8vIGFuIGl0ZW0gaXMgc2hvd24gaWYgYW55IG9mIGl0cyBjaGlsZHJlbiBpcyBzaG93biBPUiBpdCdzIGxpbmsgbWF0Y2hlcyB0aGUgZmlsdGVyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9wSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbGkgPSB0b3BJdGVtc1tpXTtcbiAgICB2YXIgc3ViSXRlbXMgPSBsaS5xdWVyeVNlbGVjdG9yQWxsKCcudHV0b3JpYWwtbWFwX19zdWItaXRlbScpO1xuXG4gICAgdmFyIGNoaWxkTWF0Y2ggPSBBcnJheS5wcm90b3R5cGUucmVkdWNlLmNhbGwoc3ViSXRlbXMsIGZ1bmN0aW9uKHByZXZWYWx1ZSwgc3ViSXRlbSkge1xuXG4gICAgICB2YXIgY2hpbGRNYXRjaCA9IGZhbHNlO1xuXG4gICAgICBpZiAoc2hvd2luZ1Rhc2tzKSB7XG4gICAgICAgIHZhciBzdWJJdGVtcyA9IHN1Ykl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLnR1dG9yaWFsLW1hcF9fc3ViLXN1Yi1pdGVtJyk7XG4gICAgICAgIGNoaWxkTWF0Y2ggPSBBcnJheS5wcm90b3R5cGUucmVkdWNlLmNhbGwoc3ViSXRlbXMsIGZ1bmN0aW9uKHByZXZWYWx1ZSwgc3ViSXRlbSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGNoZWNrTGlNYXRjaChzdWJJdGVtKTtcbiAgICAgICAgICBzdWJJdGVtLmhpZGRlbiA9ICFtYXRjaDtcbiAgICAgICAgICByZXR1cm4gcHJldlZhbHVlIHx8IG1hdGNoO1xuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBtYXRjaCA9IGNoaWxkTWF0Y2ggfHwgY2hlY2tMaU1hdGNoKHN1Ykl0ZW0pO1xuICAgICAgLy9jb25zb2xlLmxvZyhzdWJJdGVtLCBtYXRjaCk7XG4gICAgICBzdWJJdGVtLmhpZGRlbiA9ICFtYXRjaDtcblxuICAgICAgcmV0dXJuIHByZXZWYWx1ZSB8fCBtYXRjaDtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICBsaS5oaWRkZW4gPSAhKGNoaWxkTWF0Y2ggfHwgY2hlY2tMaU1hdGNoKGxpKSk7XG5cbiAgfVxuXG59O1xuXG5UdXRvcmlhbE1hcC5wcm90b3R5cGUudGhyb3R0bGVGaWx0ZXIgPSB0aHJvdHRsZShUdXRvcmlhbE1hcC5wcm90b3R5cGUuZmlsdGVyLCAyMDApO1xuXG5cbmZ1bmN0aW9uIGlzU3ViU2VxdWVuY2Uoc3RyMSwgc3RyMikge1xuICB2YXIgaSA9IDA7XG4gIHZhciBqID0gMDtcbiAgd2hpbGUgKGkgPCBzdHIxLmxlbmd0aCAmJiBqIDwgc3RyMi5sZW5ndGgpIHtcbiAgICBpZiAoc3RyMVtpXSA9PSBzdHIyW2pdKSB7XG4gICAgICBpKys7XG4gICAgICBqKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGogPT0gc3RyMi5sZW5ndGg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHV0b3JpYWxNYXA7XG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnY2xpZW50L3hocicpO1xuXG52YXIgZGVsZWdhdGUgPSByZXF1aXJlKCdjbGllbnQvZGVsZWdhdGUnKTtcbnZhciBNb2RhbCA9IHJlcXVpcmUoJ2NsaWVudC9oZWFkJykuTW9kYWw7XG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoJ2NsaWVudC9zcGlubmVyJyk7XG5cbi8qKlxuICogT3B0aW9uczpcbiAqICAgLSBjYWxsYmFjazogZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHN1Y2Nlc3NmdWwgbG9naW4gKGJ5IGRlZmF1bHQgLSBnbyB0byBzdWNjZXNzUmVkaXJlY3QpXG4gKiAgIC0gbWVzc2FnZTogZm9ybSBtZXNzYWdlIHRvIGJlIHNob3duIHdoZW4gdGhlIGxvZ2luIGZvcm0gYXBwZWFycyAoXCJMb2cgaW4gdG8gbGVhdmUgdGhlIGNvbW1lbnRcIilcbiAqICAgLSBzdWNjZXNzUmVkaXJlY3Q6IHRoZSBwYWdlIHRvIHJlZGlyZWN0IChjdXJyZW50IHBhZ2UgYnkgZGVmYXVsdClcbiAqICAgICAgIC0gYWZ0ZXIgaW1tZWRpYXRlIGxvZ2luXG4gKiAgICAgICAtIGFmdGVyIHJlZ2lzdHJhdGlvbiBmb3IgXCJjb25maXJtIGVtYWlsXCIgbGlua1xuICovXG5mdW5jdGlvbiBUdXRvcmlhbE1hcE1vZGFsKCkge1xuICBNb2RhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIHZhciBzcGlubmVyID0gbmV3IFNwaW5uZXIoKTtcbiAgdGhpcy5zZXRDb250ZW50KHNwaW5uZXIuZWxlbSk7XG4gIHNwaW5uZXIuc3RhcnQoKTtcblxuICB2YXIgcmVxdWVzdCA9IHRoaXMucmVxdWVzdCh7XG4gICAgdXJsOiAnL3R1dG9yaWFsL21hcCdcbiAgfSk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgd3JhcHBlci5jbGFzc05hbWUgPSAndHV0b3JpYWwtbWFwLW92ZXJsYXknO1xuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gZXZlbnQucmVzdWx0ICsgJzxidXR0b24gY2xhc3M9XCJjbG9zZS1idXR0b24gdHV0b3JpYWwtbWFwLW92ZXJsYXlfX2Nsb3NlXCI+PC9idXR0b24+JztcbiAgICBzZWxmLnNldENvbnRlbnQod3JhcHBlcik7XG4gIH0pO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZmFpbCcsIGZ1bmN0aW9uKCkge1xuICAgIHNlbGYucmVtb3ZlKCk7XG4gIH0pO1xuXG4gIHJlcXVlc3Quc2VuZCgpO1xufVxuXG5UdXRvcmlhbE1hcE1vZGFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTW9kYWwucHJvdG90eXBlKTtcblxuZGVsZWdhdGUuZGVsZWdhdGVNaXhpbihUdXRvcmlhbE1hcE1vZGFsLnByb3RvdHlwZSk7XG5cblR1dG9yaWFsTWFwTW9kYWwucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciByZXF1ZXN0ID0geGhyKG9wdGlvbnMpO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uRW5kID0gdGhpcy5zdGFydFJlcXVlc3RJbmRpY2F0aW9uKCk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkZW5kJywgb25FbmQpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuVHV0b3JpYWxNYXBNb2RhbC5wcm90b3R5cGUuc3RhcnRSZXF1ZXN0SW5kaWNhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNob3dPdmVybGF5KCk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICByZXR1cm4gZnVuY3Rpb24gb25FbmQoKSB7XG4gICAgc2VsZi5oaWRlT3ZlcmxheSgpO1xuICB9O1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFR1dG9yaWFsTWFwTW9kYWw7XG4iLCJyZXF1aXJlKCdjbGllbnQvcG9seWZpbGwnKTtcbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2NsaWVudC9kZWxlZ2F0ZScpO1xudmFyIHByaXNtID0gcmVxdWlyZSgnY2xpZW50L3ByaXNtJyk7XG52YXIgZmluZENsb3Nlc3QgPSByZXF1aXJlKCdjbGllbnQvZG9tL2ZpbmRDbG9zZXN0Jyk7XG52YXIgeGhyID0gcmVxdWlyZSgnY2xpZW50L3hocicpO1xudmFyIFR1dG9yaWFsTWFwTW9kYWwgPSByZXF1aXJlKCcuL3R1dG9yaWFsTWFwTW9kYWwnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgaW5pdFRhc2tCdXR0b25zKCk7XG5cbiAgZGVsZWdhdGUoZG9jdW1lbnQsICdbZGF0YS1hY3Rpb249XCJ0dXRvcmlhbC1tYXBcIl0nLCAnY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIG5ldyBUdXRvcmlhbE1hcE1vZGFsKCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfSk7XG5cbiAgcHJpc20oKTtcbn07XG5cbmV4cG9ydHMuVHV0b3JpYWxNYXAgPSByZXF1aXJlKCcuL3R1dG9yaWFsTWFwJyk7XG5cbmZ1bmN0aW9uIGluaXRUYXNrQnV0dG9ucygpIHtcbiAgLy8gc29sdXRpb24gYnV0dG9uXG4gIGRlbGVnYXRlKGRvY3VtZW50LCAnLnRhc2tfX3NvbHV0aW9uJywgJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBmaW5kQ2xvc2VzdChldmVudC50YXJnZXQsICcudGFzaycpLmNsYXNzTGlzdC50b2dnbGUoJ3Rhc2tfX2Fuc3dlcl9vcGVuJyk7XG4gIH0pO1xuXG4gIC8vIGNsb3NlIHNvbHV0aW9uIGJ1dHRvblxuICBkZWxlZ2F0ZShkb2N1bWVudCwgJy50YXNrX19hbnN3ZXItY2xvc2UnLCAnY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGZpbmRDbG9zZXN0KGV2ZW50LnRhcmdldCwgJy50YXNrJykuY2xhc3NMaXN0LnRvZ2dsZSgndGFza19fYW5zd2VyX29wZW4nKTtcbiAgfSk7XG5cbiAgLy8gZXZlcnkgc3RlcCBidXR0b24gKGlmIGFueSBzdGVwcylcbiAgZGVsZWdhdGUoZG9jdW1lbnQsICcudGFza19fc3RlcC1zaG93JywgJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBmaW5kQ2xvc2VzdChldmVudC50YXJnZXQsICcudGFza19fc3RlcCcpLmNsYXNzTGlzdC50b2dnbGUoJ3Rhc2tfX3N0ZXBfb3BlbicpO1xuICB9KTtcbn1cbiJdfQ==
