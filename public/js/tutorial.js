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
({"/root/javascript-nodejs/node_modules/bem-jade/index.js":[function(require,module,exports){
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


},{"./polyfill":"/root/javascript-nodejs/node_modules/client/polyfill/index.js"}],"/root/javascript-nodejs/node_modules/client/dom/closest.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/client/isScrolledIntoView.js":[function(require,module,exports){

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

},{}],"/root/javascript-nodejs/node_modules/client/polyfill/dom4.js":[function(require,module,exports){
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

},{"./dom4":"/root/javascript-nodejs/node_modules/client/polyfill/dom4.js"}],"/root/javascript-nodejs/node_modules/client/prism/codeBox.jade":[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bem, run, isJS) {
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
jade_mixins["b"].call({
block: function(){
jade_mixins["b"].call({
block: function(){
if ( run)
{
jade_mixins["e"].call({
block: function(){
var title = isJS ? "выполнить" : "показать"
jade_mixins["e"].call({
attributes: {"href": "#","title": jade.escape(title),"data-action": "run","class": "button_run"}
}, 'a');
},
attributes: {"class": "tool"}
});
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"href": "#","title": "открыть в песочнице","data-action": "edit","class": "button_edit"}
}, 'a');
},
attributes: {"class": "tool"}
});
}
},
attributes: {"class": "toolbar __toolbar"}
});
jade_mixins["e"].call({
attributes: {"data-code": "1","class": "code"}
});
},
attributes: {"class": "codebox __codebox"}
});
},
attributes: {"class": "code-example"}
});}.call(this,"bem" in locals_for_with?locals_for_with.bem:typeof bem!=="undefined"?bem:undefined,"run" in locals_for_with?locals_for_with.run:typeof run!=="undefined"?run:undefined,"isJS" in locals_for_with?locals_for_with.isJS:typeof isJS!=="undefined"?isJS:undefined));;return buf.join("");
}
)(params); }

},{"jade/lib/runtime.js":"/root/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/root/javascript-nodejs/node_modules/client/prism/codeBox.js":[function(require,module,exports){
var template = require('./codeBox.jade');
var iframeResize = require('./iframeResize');
var isScrolledIntoView = require('client/isScrolledIntoView');
var clientRender = require('client/clientRender');

function CodeBox(pre) {
  var code = pre.code;

  var isJS = pre.classList.contains('language-javascript');
  var isHTML = pre.classList.contains('language-markup');
  var isTrusted = pre.dataset.trusted;
  var jsFrame;
  var htmlResult;
  var isFirstRun = true;

  var locals = {
    isJS: isJS,
    isHTML: isHTML,
    run: pre.dataset.run
  };

  var rendered = clientRender(template, locals);

  pre.insertAdjacentHTML("afterEnd", rendered);
  var elem = pre.nextSibling;
  elem.querySelector('[data-code]').appendChild(pre);

  if (!isJS && !isHTML) return;

  if (pre.dataset.run) {
    elem.querySelector('[data-action="run"]').onclick = function() {
      this.blur();
      run();
      return false;
    };

    elem.querySelector('[data-action="edit"]').onclick = function() {
      this.blur();
      edit();
      return false;
    };
  }

  if (pre.dataset.autorun) {
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

    if (htmlResult && pre.dataset.refresh) {
      htmlResult.remove();
      htmlResult = null;
    }

    if (!htmlResult) {
      frame = document.createElement('iframe');
      frame.name = 'frame-'+Math.random();
      frame.className = 'result__iframe';

      if (pre.dataset.demoHeight === "0") {
        frame.style.display = 'none';
        hasHeight = true;
      } else if (pre.dataset.demoHeight) {
        var height = +pre.dataset.demoHeight;
        if (!isTrusted) height = Math.min(height, 800);
        if (height) {
          frame.style.height = height + 'px';
          hasHeight = true;
        }
      }

      htmlResult = document.createElement('div');
      htmlResult.className = "result code-example__result";
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
        iframeResize(frame);
      }

      if (!(isFirstRun && pre.dataset.autorun)) {
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

      if (!(isFirstRun && pre.dataset.autorun)) {
        frame.onload = function() {

          if (!hasHeight) {
            iframeResize(frame);
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
      var evalFunc = window.execScript || function (code) {
        window["eval"].call(window, code);
      };

      try {
        evalFunc(code);
      } catch (e) {
        alert("Ошибка: " + e.message);
      }
    } else {

      if (pre.dataset.refresh && jsFrame) {
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
      html = '<!DOCTYPE html>\n<html>\n\n<body>\n  <script>\n'+codeIndented+'\n  </script>\n</body>\n\n</html>';
    }

    var form = document.createElement('form');
    form.action = "http://plnkr.co/edit/?p=preview";
    form.method = "POST";
    form.enctype = "multipart/form-data";
    form.target = "_blank";

    document.body.appendChild(form);

    var input = document.createElement('input');
    input.name = "files[index.html]";
    input.type = 'hidden';
    input.value = html;
    form.appendChild(input);

    var input = document.createElement('input');
    input.type = 'hidden';
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
      result = result.replace('<html>','<html>\n<head>\n  <meta charset="utf-8">\n</head><body>\n');
    }

    if (!hasBodyEnd) {
      result = result.replace('</html>','\n</body>\n</html>');
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

module.exports = CodeBox;

},{"./codeBox.jade":"/root/javascript-nodejs/node_modules/client/prism/codeBox.jade","./iframeResize":"/root/javascript-nodejs/node_modules/client/prism/iframeResize.js","client/clientRender":"/root/javascript-nodejs/node_modules/client/clientRender.js","client/isScrolledIntoView":"/root/javascript-nodejs/node_modules/client/isScrolledIntoView.js"}],"/root/javascript-nodejs/node_modules/client/prism/iframeBox.jade":[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bem, external, edit, zip) {
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
jade_mixins["b"].call({
block: function(){
jade_mixins["b"].call({
block: function(){
if ( external)
{
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"href": jade.escape(external.href),"target": "_blank","title": "открыть в новом окне","class": "button_external"}
}, 'a');
},
attributes: {"class": "tool"}
});
}
if ( edit)
{
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"href": jade.escape(edit.href),"target": "_blank","title": "открыть в песочнице окне","class": "button_edit"}
}, 'a');
},
attributes: {"class": "tool"}
});
}
if ( zip)
{
jade_mixins["e"].call({
block: function(){
jade_mixins["e"].call({
attributes: {"href": jade.escape(zip.href),"target": "_blank","title": "скачать архив","class": "button_zip"}
}, 'a');
},
attributes: {"class": "tool"}
});
}
},
attributes: {"class": "toolbar __toolbar"}
});
},
attributes: {"data-result": "1","class": "result __result"}
});
},
attributes: {"class": "code-example"}
});}.call(this,"bem" in locals_for_with?locals_for_with.bem:typeof bem!=="undefined"?bem:undefined,"external" in locals_for_with?locals_for_with.external:typeof external!=="undefined"?external:undefined,"edit" in locals_for_with?locals_for_with.edit:typeof edit!=="undefined"?edit:undefined,"zip" in locals_for_with?locals_for_with.zip:typeof zip!=="undefined"?zip:undefined));;return buf.join("");
}
)(params); }

},{"jade/lib/runtime.js":"/root/javascript-nodejs/node_modules/jade/lib/runtime.js"}],"/root/javascript-nodejs/node_modules/client/prism/iframeBox.js":[function(require,module,exports){

var clientRender = require('client/clientRender');
var template = require('./iframeBox.jade');
var iframeResize = require('./iframeResize');

function IframeBox(iframe) {


  var locals = { };

  if (iframe.dataset.external) {
    locals.external = {
      href: iframe.getAttribute('src')
    };
  }


  if (iframe.dataset.play) {
    locals.edit = {
      href: 'http://plnkr.co/edit/' + iframe.dataset.play + '?p=preview'
    };
  }


  if (iframe.dataset.zip) {
    locals.zip = {
      href: '/zip' + iframe.getAttribute('src')
    };
  }

  var rendered = clientRender(template, locals);
  iframe.insertAdjacentHTML("afterEnd", rendered);
  var elem = iframe.nextSibling;

  elem.querySelector("[data-result]").appendChild(iframe);


  if (iframe.dataset.demoHeight) {
    var height = +iframe.dataset.demoHeight;
    if (!iframe.dataset.trusted) height = Math.min(height, 800);
    iframe.style.height = height + 'px';
  } else {
    iframe.onload = function() {
      iframeResize(iframe, function(err) {
        if (err) iframe.style.height = '100px';
      });
    };
  }

  if (iframe.dataset.playError) {
    elem.insertAdjacentHTML("afterBegin", '<div class="format_error">' + esc(iframe.dataset.playError) + '</div>');
  }
}


function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = IframeBox;

},{"./iframeBox.jade":"/root/javascript-nodejs/node_modules/client/prism/iframeBox.jade","./iframeResize":"/root/javascript-nodejs/node_modules/client/prism/iframeResize.js","client/clientRender":"/root/javascript-nodejs/node_modules/client/clientRender.js"}],"/root/javascript-nodejs/node_modules/client/prism/iframeResize.js":[function(require,module,exports){

function iframeResize(ifrElem, callback) {
  if (!callback) callback = function(){};

  var timeoutTimer = setTimeout(function() {
    callback(new Error("timeout"));
  }, 500);

  function done(err) {
    clearTimeout(timeoutTimer);
    callback(err);
  }

  // throw right now if cross-domain
  try {
    /* jshint -W030 */
    (ifrElem.contentDocument || ifrElem.contentWindow.document).body;
  } catch(e) {
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
      var doc = this.contentDocument || this.contentWindow.document;
      var height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
      ifrElem.style.display = 'block';
      ifrElem.style.height = height + 10 + 'px';
      cloneIframe.remove();
      done();
    };

    document.body.appendChild(cloneIframe);
    return;
  }

  ifrElem.style.display = 'block';
  ifrElem.style.height = '1px';

  var doc = ifrElem.contentDocument || ifrElem.contentWindow.document;
  var height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
  ifrElem.style.height = height + 10 + 'px';
  done();
}

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

},{}],"/root/javascript-nodejs/node_modules/client/prism/index.js":[function(require,module,exports){
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
var IframeBox = require('./iframeBox');

module.exports = function () {
  document.removeEventListener('DOMContentLoaded', Prism.highlightAll);

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


  function addBlockHighlight(pre) {

    var lines = pre.dataset.highlightBlock;

    if (!lines) {
      return;
    }

    var ranges = lines.replace(/\s+/g, '').split(',');

    /*jshint -W084 */
    for (var i = 0, range; range = ranges[i++];) {
      range = range.split('-');

      var start = +range[0],
          end = +range[1] || start;


      var mask = '<div class="block-highlight" data-start="'+start+'" data-end="'+end+'">' +
        new Array(start + 1).join('\n') +
        '<div class="mask">' + new Array(end - start + 2).join('\n') + '</div></div>';

      pre.insertAdjacentHTML("afterBegin", mask);
    }

  }


  function addInlineHighlight(pre) {
    var ranges = pre.dataset.highlightInline;

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


  document.addEventListener('DOMContentLoaded', function() {

    // highlight inline
    var codePreElems = document.querySelectorAll('pre[class*="language-"]');

    for (var i = 0; i < codePreElems.length; i++) {
      var codePreElem = codePreElems[i];

      // already highlighted
      if (codePreElem.code) continue;

      codePreElem.code = unesc(codePreElem.innerHTML);

      // wrap <pre>...</pre> content in <pre><code>...</code></pre>
      var codeElem = document.createElement('code');
      while(codePreElem.firstChild) {
        codeElem.appendChild(codePreElem.firstChild);
      }
      codePreElem.appendChild(codeElem);

      Prism.highlightElement(codeElem);

      addLineNumbers(codePreElem);
      addBlockHighlight(codePreElem);
      addInlineHighlight(codePreElem);
      new CodeBox(codePreElem);
    }


    var iframeResultElems = document.querySelectorAll('iframe.result__iframe');

    for (var i = 0; i < iframeResultElems.length; i++) {
      var iframeElem = iframeResultElems[i];
      new IframeBox(iframeElem);
    }
  });

};


// fixme: require lodash.escape instead
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function unesc(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

},{"./codeBox":"/root/javascript-nodejs/node_modules/client/prism/codeBox.js","./iframeBox":"/root/javascript-nodejs/node_modules/client/prism/iframeBox.js","prismjs/components/prism-clike.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-clike.js","prismjs/components/prism-coffeescript.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-coffeescript.js","prismjs/components/prism-core.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-core.js","prismjs/components/prism-css-extras.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-css-extras.js","prismjs/components/prism-css.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-css.js","prismjs/components/prism-http.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-http.js","prismjs/components/prism-java.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-java.js","prismjs/components/prism-javascript.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-javascript.js","prismjs/components/prism-markup.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-markup.js","prismjs/components/prism-php-extras.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-php-extras.js","prismjs/components/prism-php.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-php.js","prismjs/components/prism-python.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-python.js","prismjs/components/prism-ruby.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-ruby.js","prismjs/components/prism-scss.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-scss.js","prismjs/components/prism-sql.js":"/root/javascript-nodejs/node_modules/prismjs/components/prism-sql.js"}],"/root/javascript-nodejs/node_modules/jade/lib/runtime.js":[function(require,module,exports){
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

},{"fs":"/root/javascript-nodejs/node_modules/browserify/lib/_empty.js"}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-clike.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-coffeescript.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-core.js":[function(require,module,exports){
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
		DFS: function(o, callback) {
			for (var i in o) {
				callback.call(o, i, o[i]);

				if (_.util.type(o) === 'Object') {
					_.languages.DFS(o[i], callback);
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-css-extras.js":[function(require,module,exports){
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
},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-css.js":[function(require,module,exports){
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
},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-http.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-java.js":[function(require,module,exports){
Prism.languages.java = Prism.languages.extend('clike', {
	'keyword': /\b(abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/g,
	'number': /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+[e]?[\d]*[df]\b|\W\d*\.?\d+\b/gi,
	'operator': {
		pattern: /(^|[^\.])(?:\+=|\+\+?|-=|--?|!=?|<{1,2}=?|>{1,3}=?|==?|&=|&&?|\|=|\|\|?|\?|\*=?|\/=?|%=?|\^=?|:|~)/gm,
		lookbehind: true
	}
});
},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-javascript.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-markup.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-php-extras.js":[function(require,module,exports){
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
},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-php.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-python.js":[function(require,module,exports){
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


},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-ruby.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-scss.js":[function(require,module,exports){
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

},{}],"/root/javascript-nodejs/node_modules/prismjs/components/prism-sql.js":[function(require,module,exports){
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
},{}],"tutorial/client":[function(require,module,exports){
require('client/polyfill');
var delegate = require('client/delegate');
var prism = require('client/prism');
var closest = require('client/dom/closest');

exports.init = function() {

  initTaskButtons();
  prism();
};


function initTaskButtons() {
  // solution button
  delegate(document.body, '.tasks__solution', 'click', function(event) {
    closest(event.target, '.tasks__task').classList.toggle('tasks__task_answer_open');
  });

  // close solution button
  delegate(document.body, '.tasks__answer-close', 'click', function(event) {
    closest(event.target, '.tasks__task').classList.toggle('tasks__task_answer_open');
  });

  // every step button (if any steps)
  delegate(document.body, '.tasks__step-show', 'click', function(event) {
    closest(event.target, '.tasks__step').classList.toggle('tasks__step_open');
  });
}

},{"client/delegate":"/root/javascript-nodejs/node_modules/client/delegate.js","client/dom/closest":"/root/javascript-nodejs/node_modules/client/dom/closest.js","client/polyfill":"/root/javascript-nodejs/node_modules/client/polyfill/index.js","client/prism":"/root/javascript-nodejs/node_modules/client/prism/index.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svcHJlbHVkZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9iZW0tamFkZS9pbmRleC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L2NsaWVudFJlbmRlci5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvZGVsZWdhdGUuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L2RvbS9jbG9zZXN0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9pc1Njcm9sbGVkSW50b1ZpZXcuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L3BvbHlmaWxsL2RvbTQuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L3BvbHlmaWxsL2luZGV4LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9wcmlzbS9jb2RlQm94LmphZGUiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L3ByaXNtL2NvZGVCb3guanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L3ByaXNtL2lmcmFtZUJveC5qYWRlIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL2NsaWVudC9wcmlzbS9pZnJhbWVCb3guanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvY2xpZW50L3ByaXNtL2lmcmFtZVJlc2l6ZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9jbGllbnQvcHJpc20vaW5kZXguanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvamFkZS9saWIvcnVudGltZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY2xpa2UuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWNvZmZlZXNjcmlwdC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY29yZS5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY3NzLWV4dHJhcy5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY3NzLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1odHRwLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1qYXZhLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1qYXZhc2NyaXB0LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1tYXJrdXAuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLXBocC1leHRyYXMuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvcHJpc21qcy9jb21wb25lbnRzL3ByaXNtLXBocC5qcyIsIi9yb290L2phdmFzY3JpcHQtbm9kZWpzL25vZGVfbW9kdWxlcy9wcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tcHl0aG9uLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1ydWJ5LmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1zY3NzLmpzIiwiL3Jvb3QvamF2YXNjcmlwdC1ub2RlanMvbm9kZV9tb2R1bGVzL3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1zcWwuanMiLCIvcm9vdC9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvdHV0b3JpYWwvY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdllBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIG1vZHVsZXMgYXJlIGRlZmluZWQgYXMgYW4gYXJyYXlcbi8vIFsgbW9kdWxlIGZ1bmN0aW9uLCBtYXAgb2YgcmVxdWlyZXVpcmVzIF1cbi8vXG4vLyBtYXAgb2YgcmVxdWlyZXVpcmVzIGlzIHNob3J0IHJlcXVpcmUgbmFtZSAtPiBudW1lcmljIHJlcXVpcmVcbi8vXG4vLyBhbnl0aGluZyBkZWZpbmVkIGluIGEgcHJldmlvdXMgYnVuZGxlIGlzIGFjY2Vzc2VkIHZpYSB0aGVcbi8vIG9yaWcgbWV0aG9kIHdoaWNoIGlzIHRoZSByZXF1aXJldWlyZSBmb3IgcHJldmlvdXMgYnVuZGxlc1xuXG4oZnVuY3Rpb24gb3V0ZXIgKG1vZHVsZXMsIGNhY2hlLCBlbnRyeSkge1xuICAgIC8vIFNhdmUgdGhlIHJlcXVpcmUgZnJvbSBwcmV2aW91cyBidW5kbGUgdG8gdGhpcyBjbG9zdXJlIGlmIGFueVxuICAgIHZhciBwcmV2aW91c1JlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtcblxuICAgIGZ1bmN0aW9uIG5ld1JlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICAgICAgaWYoIWNhY2hlW25hbWVdKSB7XG4gICAgICAgICAgICBpZighbW9kdWxlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGNhbm5vdCBmaW5kIHRoZSB0aGUgbW9kdWxlIHdpdGhpbiBvdXIgaW50ZXJuYWwgbWFwIG9yXG4gICAgICAgICAgICAgICAgLy8gY2FjaGUganVtcCB0byB0aGUgY3VycmVudCBnbG9iYWwgcmVxdWlyZSBpZS4gdGhlIGxhc3QgYnVuZGxlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3YXMgYWRkZWQgdG8gdGhlIHBhZ2UuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG4gICAgICAgICAgICAgICAgaWYgKCFqdW1wZWQgJiYgY3VycmVudFJlcXVpcmUpIHJldHVybiBjdXJyZW50UmVxdWlyZShuYW1lLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciBidW5kbGVzIG9uIHRoaXMgcGFnZSB0aGUgcmVxdWlyZSBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzIG9uZSBpcyBzYXZlZCB0byAncHJldmlvdXNSZXF1aXJlJy4gUmVwZWF0IHRoaXMgYXNcbiAgICAgICAgICAgICAgICAvLyBtYW55IHRpbWVzIGFzIHRoZXJlIGFyZSBidW5kbGVzIHVudGlsIHRoZSBtb2R1bGUgaXMgZm91bmQgb3JcbiAgICAgICAgICAgICAgICAvLyB3ZSBleGhhdXN0IHRoZSByZXF1aXJlIGNoYWluLlxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c1JlcXVpcmUpIHJldHVybiBwcmV2aW91c1JlcXVpcmUobmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgbW9kdWxlIFxcJycgKyBuYW1lICsgJ1xcJycpO1xuICAgICAgICAgICAgICAgIGVyci5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtID0gY2FjaGVbbmFtZV0gPSB7ZXhwb3J0czp7fX07XG4gICAgICAgICAgICBtb2R1bGVzW25hbWVdWzBdLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbih4KXtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBtb2R1bGVzW25hbWVdWzFdW3hdO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdSZXF1aXJlKGlkID8gaWQgOiB4KTtcbiAgICAgICAgICAgIH0sbSxtLmV4cG9ydHMsb3V0ZXIsbW9kdWxlcyxjYWNoZSxlbnRyeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlW25hbWVdLmV4cG9ydHM7XG4gICAgfVxuICAgIGZvcih2YXIgaT0wO2k8ZW50cnkubGVuZ3RoO2krKykgbmV3UmVxdWlyZShlbnRyeVtpXSk7XG5cbiAgICAvLyBPdmVycmlkZSB0aGUgY3VycmVudCByZXF1aXJlIHdpdGggdGhpcyBuZXcgb25lXG4gICAgcmV0dXJuIG5ld1JlcXVpcmU7XG59KVxuIiwiLy8gQWRhcHRlZCBmcm9tIGJlbXRvLmphZGUsIGNvcHlyaWdodChjKSAyMDEyIFJvbWFuIEtvbWFyb3YgPGtpenVAa2l6dS5ydT5cblxuLyoganNoaW50IC1XMTA2ICovXG5cbnZhciBqYWRlID0gcmVxdWlyZSgnamFkZS9saWIvcnVudGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gIHNldHRpbmdzID0gc2V0dGluZ3MgfHwge307XG5cbiAgc2V0dGluZ3MucHJlZml4ID0gc2V0dGluZ3MucHJlZml4IHx8ICcnO1xuICBzZXR0aW5ncy5lbGVtZW50ID0gc2V0dGluZ3MuZWxlbWVudCB8fCAnX18nO1xuICBzZXR0aW5ncy5tb2RpZmllciA9IHNldHRpbmdzLm1vZGlmaWVyIHx8ICdfJztcbiAgc2V0dGluZ3MuZGVmYXVsdF90YWcgPSBzZXR0aW5ncy5kZWZhdWx0X3RhZyB8fCAnZGl2JztcblxuICByZXR1cm4gZnVuY3Rpb24oYnVmLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnLCBpc0VsZW1lbnQpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiLS0+XCIsIGFyZ3VtZW50cyk7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5ibG9jaztcbiAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMuYXR0cmlidXRlcyB8fCB7fTtcblxuICAgIC8vIFJld3JpdGluZyB0aGUgY2xhc3MgZm9yIGVsZW1lbnRzIGFuZCBtb2RpZmllcnNcbiAgICBpZiAoYXR0cmlidXRlcy5jbGFzcykge1xuICAgICAgdmFyIGJlbV9jbGFzc2VzID0gYXR0cmlidXRlcy5jbGFzcztcblxuICAgICAgaWYgKGJlbV9jbGFzc2VzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgYmVtX2NsYXNzZXMgPSBiZW1fY2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgICBiZW1fY2xhc3NlcyA9IGJlbV9jbGFzc2VzLnNwbGl0KCcgJyk7XG5cbiAgICAgIHZhciBiZW1fYmxvY2s7XG4gICAgICB0cnkge1xuICAgICAgICBiZW1fYmxvY2sgPSBiZW1fY2xhc3Nlc1swXS5tYXRjaChuZXcgUmVnRXhwKCdeKCgoPyEnICsgc2V0dGluZ3MuZWxlbWVudCArICd8JyArIHNldHRpbmdzLm1vZGlmaWVyICsgJykuKSspJykpWzFdO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmNvcnJlY3QgYmVtIGNsYXNzOiBcIiArIGJlbV9jbGFzc2VzWzBdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0VsZW1lbnQpIHtcbiAgICAgICAgYmVtX2NoYWluW2JlbV9jaGFpbi5sZW5ndGhdID0gYmVtX2Jsb2NrO1xuICAgICAgICBiZW1fY2xhc3Nlc1swXSA9IGJlbV9jbGFzc2VzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVtX2NsYXNzZXNbMF0gPSBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDFdICsgc2V0dGluZ3MuZWxlbWVudCArIGJlbV9jbGFzc2VzWzBdO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudF9ibG9jayA9IChpc0VsZW1lbnQgPyBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDFdICsgc2V0dGluZ3MuZWxlbWVudCA6ICcnKSArIGJlbV9ibG9jaztcblxuICAgICAgLy8gQWRkaW5nIHRoZSBibG9jayBpZiB0aGVyZSBpcyBvbmx5IG1vZGlmaWVyIGFuZC9vciBlbGVtZW50XG4gICAgICBpZiAoYmVtX2NsYXNzZXMuaW5kZXhPZihjdXJyZW50X2Jsb2NrKSA9PT0gLTEpIHtcbiAgICAgICAgYmVtX2NsYXNzZXNbYmVtX2NsYXNzZXMubGVuZ3RoXSA9IGN1cnJlbnRfYmxvY2s7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmVtX2NsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtsYXNzID0gYmVtX2NsYXNzZXNbaV07XG5cbiAgICAgICAgaWYgKGtsYXNzLm1hdGNoKG5ldyBSZWdFeHAoJ14oPyEnICsgc2V0dGluZ3MuZWxlbWVudCArICcpJyArIHNldHRpbmdzLm1vZGlmaWVyKSkpIHtcbiAgICAgICAgICAvLyBFeHBhbmRpbmcgdGhlIG1vZGlmaWVyc1xuICAgICAgICAgIGJlbV9jbGFzc2VzW2ldID0gY3VycmVudF9ibG9jayArIGtsYXNzO1xuICAgICAgICB9IGVsc2UgaWYgKGtsYXNzLm1hdGNoKG5ldyBSZWdFeHAoJ14nICsgc2V0dGluZ3MuZWxlbWVudCkpKSB7XG4gICAgICAgICAgLy8tIEV4cGFuZGluZyB0aGUgbWl4ZWQgaW4gZWxlbWVudHNcbiAgICAgICAgICBpZiAoYmVtX2NoYWluW2JlbV9jaGFpbi5sZW5ndGggLSAyXSkge1xuICAgICAgICAgICAgYmVtX2NsYXNzZXNbaV0gPSBiZW1fY2hhaW5bYmVtX2NoYWluLmxlbmd0aCAtIDJdICsga2xhc3M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJlbV9jbGFzc2VzW2ldID0gYmVtX2NoYWluW2JlbV9jaGFpbi5sZW5ndGggLSAxXSArIGtsYXNzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZGluZyBwcmVmaXhlc1xuICAgICAgICBpZiAoYmVtX2NsYXNzZXNbaV0ubWF0Y2gobmV3IFJlZ0V4cCgnXicgKyBjdXJyZW50X2Jsb2NrICsgJygkfCg/PScgKyBzZXR0aW5ncy5lbGVtZW50ICsgJ3wnICsgc2V0dGluZ3MubW9kaWZpZXIgKyAnKSknKSkpIHtcbiAgICAgICAgICBiZW1fY2xhc3Nlc1tpXSA9IHNldHRpbmdzLnByZWZpeCArIGJlbV9jbGFzc2VzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFdyaXRlIG1vZGlmaWVkIGNsYXNzZXMgdG8gYXR0cmlidXRlcyBpbiB0aGUgY29ycmVjdCBvcmRlclxuICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGJlbV9jbGFzc2VzLnNvcnQoKS5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgYmVtX3RhZyhidWYsIGJsb2NrLCBhdHRyaWJ1dGVzLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnKTtcblxuICAgIC8vIENsb3NpbmcgYWN0aW9ucyAocmVtb3ZlIHRoZSBjdXJyZW50IGJsb2NrIGZyb20gdGhlIGNoYWluKVxuICAgIGlmICghaXNFbGVtZW50KSB7XG4gICAgICBiZW1fY2hhaW4ucG9wKCk7XG4gICAgfVxuICAgIGJlbV9jaGFpbl9jb250ZXh0cy5wb3AoKTtcbiAgfTtcblxuXG4gIC8vIHVzZWQgZm9yIHR3ZWFraW5nIHdoYXQgdGFnIHdlIGFyZSB0aHJvd2luZyBhbmQgZG8gd2UgbmVlZCB0byB3cmFwIGFueXRoaW5nIGhlcmVcbiAgZnVuY3Rpb24gYmVtX3RhZyhidWYsIGJsb2NrLCBhdHRyaWJ1dGVzLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnKSB7XG4gICAgLy8gcmV3cml0aW5nIHRhZyBuYW1lIG9uIGRpZmZlcmVudCBjb250ZXh0c1xuICAgIHZhciBuZXdUYWcgPSB0YWcgfHwgc2V0dGluZ3MuZGVmYXVsdF90YWc7XG4gICAgdmFyIGNvbnRleHRJbmRleCA9IGJlbV9jaGFpbl9jb250ZXh0cy5sZW5ndGg7XG5cbiAgICAvL0NoZWNrcyBmb3IgY29udGV4dHMgaWYgbm8gdGFnIGdpdmVuXG4gICAgLy9jb25zb2xlLmxvZyhiZW1fY2hhaW5fY29udGV4dHMsIHRhZyk7XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdpbmxpbmUnKSB7XG4gICAgICAgIG5ld1RhZyA9ICdzcGFuJztcbiAgICAgIH0gZWxzZSBpZiAoYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdID09PSAnbGlzdCcpIHtcbiAgICAgICAgbmV3VGFnID0gJ2xpJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL0F0dHJpYnV0ZXMgY29udGV4dCBjaGVja3NcbiAgICBpZiAoYXR0cmlidXRlcy5ocmVmKSB7XG4gICAgICBuZXdUYWcgPSAnYSc7XG4gICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzLmZvcikge1xuICAgICAgbmV3VGFnID0gJ2xhYmVsJztcbiAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZXMuc3JjKSB7XG4gICAgICBuZXdUYWcgPSAnaW1nJztcbiAgICB9XG5cbiAgICAvL0NvbnRleHR1YWwgd3JhcHBlcnNcbiAgICBpZiAoYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdID09PSAnbGlzdCcgJiYgbmV3VGFnICE9PSAnbGknKSB7XG4gICAgICBidWYucHVzaCgnPGxpPicpO1xuICAgIH0gZWxzZSBpZiAoYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdICE9PSAnbGlzdCcgJiYgYmVtX2NoYWluX2NvbnRleHRzW2NvbnRleHRJbmRleCAtIDFdICE9PSAncHNldWRvLWxpc3QnICYmIG5ld1RhZyA9PT0gJ2xpJykge1xuICAgICAgYnVmLnB1c2goJzx1bD4nKTtcbiAgICAgIGJlbV9jaGFpbl9jb250ZXh0c1tiZW1fY2hhaW5fY29udGV4dHMubGVuZ3RoXSA9ICdwc2V1ZG8tbGlzdCc7XG4gICAgfSBlbHNlIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdwc2V1ZG8tbGlzdCcgJiYgbmV3VGFnICE9PSAnbGknKSB7XG4gICAgICBidWYucHVzaCgnPC91bD4nKTtcbiAgICAgIGJlbV9jaGFpbl9jb250ZXh0cy5wb3AoKTtcbiAgICB9XG5cbiAgICAvL1NldHRpbmcgY29udGV4dFxuICAgIGlmIChbJ2EnLCAnYWJicicsICdhY3JvbnltJywgJ2InLCAnYnInLCAnY29kZScsICdlbScsICdmb250JywgJ2knLCAnaW1nJywgJ2lucycsICdrYmQnLCAnbWFwJywgJ3NhbXAnLCAnc21hbGwnLCAnc3BhbicsICdzdHJvbmcnLCAnc3ViJywgJ3N1cCcsICdsYWJlbCcsICdwJywgJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2J10uaW5kZXhPZihuZXdUYWcpICE9PSAtMSkge1xuICAgICAgYmVtX2NoYWluX2NvbnRleHRzW2JlbV9jaGFpbl9jb250ZXh0cy5sZW5ndGhdID0gJ2lubGluZSc7XG4gICAgfSBlbHNlIGlmIChbJ3VsJywgJ29sJ10uaW5kZXhPZihuZXdUYWcpICE9PSAtMSkge1xuICAgICAgYmVtX2NoYWluX2NvbnRleHRzW2JlbV9jaGFpbl9jb250ZXh0cy5sZW5ndGhdID0gJ2xpc3QnO1xuICAgIH0gZWxzZSB7XG4gICAgICBiZW1fY2hhaW5fY29udGV4dHNbYmVtX2NoYWluX2NvbnRleHRzLmxlbmd0aF0gPSAnYmxvY2snO1xuICAgIH1cblxuICAgIHN3aXRjaCAobmV3VGFnKSB7XG4gICAgY2FzZSAnaW1nJzpcbiAgICAgIC8vIElmIHRoZXJlIGlzIG5vIHRpdGxlIHdlIGRvbid0IG5lZWQgaXQgdG8gc2hvdyBldmVuIGlmIHRoZXJlIGlzIHNvbWUgYWx0XG4gICAgICBpZiAoYXR0cmlidXRlcy5hbHQgJiYgIWF0dHJpYnV0ZXMudGl0bGUpIHtcbiAgICAgICAgYXR0cmlidXRlcy50aXRsZSA9ICcnO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgaGF2ZSB0aXRsZSwgd2UgbXVzdCBoYXZlIGl0IGluIGFsdCBpZiBpdCdzIG5vdCBzZXRcbiAgICAgIGlmIChhdHRyaWJ1dGVzLnRpdGxlICYmICFhdHRyaWJ1dGVzLmFsdCkge1xuICAgICAgICBhdHRyaWJ1dGVzLmFsdCA9IGF0dHJpYnV0ZXMudGl0bGU7XG4gICAgICB9XG4gICAgICBpZiAoIWF0dHJpYnV0ZXMuYWx0KSB7XG4gICAgICAgIGF0dHJpYnV0ZXMuYWx0ID0gJyc7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICBpZiAoIWF0dHJpYnV0ZXMudHlwZSkge1xuICAgICAgICBhdHRyaWJ1dGVzLnR5cGUgPSBcInRleHRcIjtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2h0bWwnOlxuICAgICAgYnVmLnB1c2goJzwhRE9DVFlQRSBIVE1MPicpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYSc6XG4gICAgICBpZiAoIWF0dHJpYnV0ZXMuaHJlZikge1xuICAgICAgICBhdHRyaWJ1dGVzLmhyZWYgPSAnIyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYnVmLnB1c2goJzwnICsgbmV3VGFnICsgamFkZS5hdHRycyhqYWRlLm1lcmdlKFthdHRyaWJ1dGVzXSksIHRydWUpICsgXCI+XCIpO1xuXG4gICAgaWYgKGJsb2NrKSBibG9jaygpO1xuXG4gICAgaWYgKFsnYXJlYScsICdiYXNlJywgJ2JyJywgJ2NvbCcsICdlbWJlZCcsICdocicsICdpbWcnLCAnaW5wdXQnLCAna2V5Z2VuJywgJ2xpbmsnLCAnbWVudWl0ZW0nLCAnbWV0YScsICdwYXJhbScsICdzb3VyY2UnLCAndHJhY2snLCAnd2JyJ10uaW5kZXhPZihuZXdUYWcpID09IC0xKSB7XG4gICAgICBidWYucHVzaCgnPC8nICsgbmV3VGFnICsgJz4nKTtcbiAgICB9XG5cbiAgICAvLyBDbG9zaW5nIGFsbCB0aGUgd3JhcHBlciB0YWlsc1xuICAgIGlmIChiZW1fY2hhaW5fY29udGV4dHNbY29udGV4dEluZGV4IC0gMV0gPT09ICdsaXN0JyAmJiBuZXdUYWcgIT0gJ2xpJykge1xuICAgICAgYnVmLnB1c2goJzwvbGk+Jyk7XG4gICAgfVxuICB9XG5cblxufTtcbiIsbnVsbCwidmFyIGJlbSA9IHJlcXVpcmUoJ2JlbS1qYWRlJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0ZW1wbGF0ZSwgbG9jYWxzKSB7XG4gIGxvY2FscyA9IGxvY2FscyA/IE9iamVjdC5jcmVhdGUobG9jYWxzKSA6IHt9O1xuICBhZGRTdGFuZGFyZEhlbHBlcnMobG9jYWxzKTtcblxuICByZXR1cm4gdGVtcGxhdGUobG9jYWxzKTtcbn07XG5cbmZ1bmN0aW9uIGFkZFN0YW5kYXJkSGVscGVycyhsb2NhbHMpIHtcbiAgbG9jYWxzLmJlbSA9IGJlbTtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5cbmZ1bmN0aW9uIGZpbmREZWxlZ2F0ZVRhcmdldChldmVudCwgc2VsZWN0b3IpIHtcbiAgdmFyIGN1cnJlbnROb2RlID0gZXZlbnQudGFyZ2V0O1xuICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICBpZiAoY3VycmVudE5vZGUubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiBjdXJyZW50Tm9kZTtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudE5vZGUgPT0gZXZlbnQuY3VycmVudFRhcmdldCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucGFyZW50RWxlbWVudDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gZGVsZWdhdGUodGFibGUsICd0aCcsIGNsaWNrLCBoYW5kbGVyKVxuLy8gdGFibGVcbi8vICAgdGhlYWRcbi8vICAgICB0aCAgICAgICAgIF4qXG4vLyAgICAgICBjb2RlICA8LS1cbmZ1bmN0aW9uIGRlbGVnYXRlKHRvcEVsZW1lbnQsIHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQpIHtcbiAgLyoganNoaW50IC1XMDQwICovXG4gIHRvcEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGZvdW5kID0gZmluZERlbGVnYXRlVGFyZ2V0KGV2ZW50LCBzZWxlY3Rvcik7XG5cbiAgICAvLyAuY3VycmVudFRhcmdldCBpcyByZWFkIG9ubHksIEkgY2FuIG5vdCBvdmVyd3JpdGUgaXQgdG8gdGhlIFwiZm91bmRcIiBlbGVtZW50XG4gICAgLy8gT2JqZWN0LmNyZWF0ZSB3cmFwcGVyIHdvdWxkIGJyZWFrIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAvLyBzbywga2VlcCBpbiBtaW5kOlxuICAgIC8vIC0tPiBldmVudC5jdXJyZW50VGFyZ2V0IGlzIGFsd2F5cyB0aGUgdG9wLWxldmVsIChkZWxlZ2F0aW5nKSBlbGVtZW50IVxuICAgIC8vIHVzZSBcInRoaXNcIiB0byBnZXQgdGhlIGZvdW5kIHRhcmdldFxuXG4gICAgZXZlbnQuZGVsZWdhdGVUYXJnZXQgPSBmb3VuZDsgLy8gdXNlIGluc3RlYWQgb2YgXCJ0aGlzXCIgaW4gb2JqZWN0IG1ldGhvZHNcblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgLy8gaWYgaW4gY29udGV4dCBvZiBvYmplY3QsIHVzZSBvYmplY3QgYXMgdGhpcyxcbiAgICAgIGhhbmRsZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIGV2ZW50KTtcbiAgICB9XG4gIH0pO1xufVxuXG5kZWxlZ2F0ZS5kZWxlZ2F0ZU1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gIG9iai5kZWxlZ2F0ZSA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICBkZWxlZ2F0ZSh0aGlzLmVsZW0sIHNlbGVjdG9yLCBldmVudE5hbWUsIGhhbmRsZXIsIHRoaXMpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWxlZ2F0ZTtcblxuIiwiLy8gZmluZCB0aGUgbmVhcmVzdCBhbmNlc3RvciBtYXRjaGluZyBzZWxlY3RvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtLCBzZWxlY3Rvcikge1xuXG4gIHdoaWxlIChlbGVtKSB7XG4gICAgaWYgKGVsZW0ubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtID0gZWxlbS5wYXJlbnRFbGVtZW50O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcblxufTtcbiIsIlxuZnVuY3Rpb24gaXNTY3JvbGxlZEludG9WaWV3KGVsZW0pIHtcbiAgdmFyIGNvb3JkcyA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgdmFyIHZpc2libGVIZWlnaHQgPSAwO1xuXG4gIGlmIChjb29yZHMudG9wIDwgMCkge1xuICAgIHZpc2libGVIZWlnaHQgPSBjb29yZHMuYm90dG9tO1xuICB9IGVsc2UgaWYgKGNvb3Jkcy5ib3R0b20gPiB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcbiAgICB2aXNpYmxlSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gdG9wO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHZpc2libGVIZWlnaHQgPiAxMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1Njcm9sbGVkSW50b1ZpZXc7XG4iLCJmdW5jdGlvbiB0ZXh0Tm9kZUlmU3RyaW5nKG5vZGUpIHtcbiAgcmV0dXJuIHR5cGVvZiBub2RlID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpIDogbm9kZTtcbn1cblxuZnVuY3Rpb24gbXV0YXRpb25NYWNybyhub2Rlcykge1xuICBpZiAobm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHRleHROb2RlSWZTdHJpbmcobm9kZXNbMF0pO1xuICB9XG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIGxpc3QgPSBbXS5zbGljZS5jYWxsKG5vZGVzKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0ZXh0Tm9kZUlmU3RyaW5nKGxpc3RbaV0pKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbnZhciBtZXRob2RzID0ge1xuICBtYXRjaGVzOiBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yLFxuICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnROb2RlID0gdGhpcy5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm4gcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gIH1cbn07XG5cbmZvciAodmFyIG1ldGhvZE5hbWUgaW4gbWV0aG9kcykge1xuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlW21ldGhvZE5hbWVdKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBtZXRob2RzW21ldGhvZE5hbWVdO1xuICB9XG59XG5cbnRyeSB7XG4gIG5ldyBDdXN0b21FdmVudChcIklFIGhhcyBDdXN0b21FdmVudCwgYnV0IGRvZXNuJ3Qgc3VwcG9ydCBjb25zdHJ1Y3RvclwiKTtcbn0gY2F0Y2ggKGUpIHtcblxuICB3aW5kb3cuQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbihldmVudCwgcGFyYW1zKSB7XG4gICAgdmFyIGV2dDtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgcmV0dXJuIGV2dDtcbiAgfTtcblxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHdpbmRvdy5FdmVudC5wcm90b3R5cGUpO1xufVxuXG4iLCJyZXF1aXJlKCcuL2RvbTQnKTtcbiIsInZhciBqYWRlID0gcmVxdWlyZSgnamFkZS9saWIvcnVudGltZS5qcycpO1xubW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24ocGFyYW1zKSB7IGlmIChwYXJhbXMpIHtwYXJhbXMucmVxdWlyZSA9IHJlcXVpcmU7fSByZXR1cm4gKFxuZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChiZW0sIHJ1biwgaXNKUykge1xuYnVmLnB1c2goXCJcIik7XG52YXIgYmVtX2NoYWluID0gW107XG52YXIgYmVtX2NoYWluX2NvbnRleHRzID0gWydibG9jayddO1xuamFkZV9taXhpbnNbXCJiXCJdID0gZnVuY3Rpb24odGFnLCBpc0VsZW1lbnQpe1xudmFyIGJsb2NrID0gKHRoaXMgJiYgdGhpcy5ibG9jayksIGF0dHJpYnV0ZXMgPSAodGhpcyAmJiB0aGlzLmF0dHJpYnV0ZXMpIHx8IHt9O1xuYmVtLmNhbGwodGhpcywgYnVmLCBiZW1fY2hhaW4sIGJlbV9jaGFpbl9jb250ZXh0cywgdGFnLCBpc0VsZW1lbnQpXG59O1xuamFkZV9taXhpbnNbXCJlXCJdID0gZnVuY3Rpb24odGFnKXtcbnZhciBibG9jayA9ICh0aGlzICYmIHRoaXMuYmxvY2spLCBhdHRyaWJ1dGVzID0gKHRoaXMgJiYgdGhpcy5hdHRyaWJ1dGVzKSB8fCB7fTtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuYmxvY2sgJiYgYmxvY2soKTtcbn0sXG5hdHRyaWJ1dGVzOiBqYWRlLm1lcmdlKFthdHRyaWJ1dGVzXSlcbn0sIHRhZywgdHJ1ZSk7XG59O1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuaWYgKCBydW4pXG57XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbnZhciB0aXRsZSA9IGlzSlMgPyBcItCy0YvQv9C+0LvQvdC40YLRjFwiIDogXCLQv9C+0LrQsNC30LDRgtGMXCJcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImhyZWZcIjogXCIjXCIsXCJ0aXRsZVwiOiBqYWRlLmVzY2FwZSh0aXRsZSksXCJkYXRhLWFjdGlvblwiOiBcInJ1blwiLFwiY2xhc3NcIjogXCJidXR0b25fcnVuXCJ9XG59LCAnYScpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidG9vbFwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImhyZWZcIjogXCIjXCIsXCJ0aXRsZVwiOiBcItC+0YLQutGA0YvRgtGMINCyINC/0LXRgdC+0YfQvdC40YbQtVwiLFwiZGF0YS1hY3Rpb25cIjogXCJlZGl0XCIsXCJjbGFzc1wiOiBcImJ1dHRvbl9lZGl0XCJ9XG59LCAnYScpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidG9vbFwifVxufSk7XG59XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0b29sYmFyIF9fdG9vbGJhclwifVxufSk7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJkYXRhLWNvZGVcIjogXCIxXCIsXCJjbGFzc1wiOiBcImNvZGVcIn1cbn0pO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwiY29kZWJveCBfX2NvZGVib3hcIn1cbn0pO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwiY29kZS1leGFtcGxlXCJ9XG59KTt9LmNhbGwodGhpcyxcImJlbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguYmVtOnR5cGVvZiBiZW0hPT1cInVuZGVmaW5lZFwiP2JlbTp1bmRlZmluZWQsXCJydW5cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnJ1bjp0eXBlb2YgcnVuIT09XCJ1bmRlZmluZWRcIj9ydW46dW5kZWZpbmVkLFwiaXNKU1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguaXNKUzp0eXBlb2YgaXNKUyE9PVwidW5kZWZpbmVkXCI/aXNKUzp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufVxuKShwYXJhbXMpOyB9XG4vL0Agc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJaUlzSW1acGJHVWlPaUl2Y205dmRDOXFZWFpoYzJOeWFYQjBMVzV2WkdWcWN5OXViMlJsWDIxdlpIVnNaWE12WTJ4cFpXNTBMM0J5YVhOdEwyTnZaR1ZDYjNndWFtRmtaUzVxY3lJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYlhYMD0iLCJ2YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL2NvZGVCb3guamFkZScpO1xudmFyIGlmcmFtZVJlc2l6ZSA9IHJlcXVpcmUoJy4vaWZyYW1lUmVzaXplJyk7XG52YXIgaXNTY3JvbGxlZEludG9WaWV3ID0gcmVxdWlyZSgnY2xpZW50L2lzU2Nyb2xsZWRJbnRvVmlldycpO1xudmFyIGNsaWVudFJlbmRlciA9IHJlcXVpcmUoJ2NsaWVudC9jbGllbnRSZW5kZXInKTtcblxuZnVuY3Rpb24gQ29kZUJveChwcmUpIHtcbiAgdmFyIGNvZGUgPSBwcmUuY29kZTtcblxuICB2YXIgaXNKUyA9IHByZS5jbGFzc0xpc3QuY29udGFpbnMoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKTtcbiAgdmFyIGlzSFRNTCA9IHByZS5jbGFzc0xpc3QuY29udGFpbnMoJ2xhbmd1YWdlLW1hcmt1cCcpO1xuICB2YXIgaXNUcnVzdGVkID0gcHJlLmRhdGFzZXQudHJ1c3RlZDtcbiAgdmFyIGpzRnJhbWU7XG4gIHZhciBodG1sUmVzdWx0O1xuICB2YXIgaXNGaXJzdFJ1biA9IHRydWU7XG5cbiAgdmFyIGxvY2FscyA9IHtcbiAgICBpc0pTOiBpc0pTLFxuICAgIGlzSFRNTDogaXNIVE1MLFxuICAgIHJ1bjogcHJlLmRhdGFzZXQucnVuXG4gIH07XG5cbiAgdmFyIHJlbmRlcmVkID0gY2xpZW50UmVuZGVyKHRlbXBsYXRlLCBsb2NhbHMpO1xuXG4gIHByZS5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlckVuZFwiLCByZW5kZXJlZCk7XG4gIHZhciBlbGVtID0gcHJlLm5leHRTaWJsaW5nO1xuICBlbGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvZGVdJykuYXBwZW5kQ2hpbGQocHJlKTtcblxuICBpZiAoIWlzSlMgJiYgIWlzSFRNTCkgcmV0dXJuO1xuXG4gIGlmIChwcmUuZGF0YXNldC5ydW4pIHtcbiAgICBlbGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cInJ1blwiXScpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgcnVuKCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIGVsZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwiZWRpdFwiXScpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgZWRpdCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJlLmRhdGFzZXQuYXV0b3J1bikge1xuICAgIHNldFRpbWVvdXQocnVuLCAxMCk7XG4gIH1cblxuICBmdW5jdGlvbiBwb3N0SlNGcmFtZSgpIHtcbiAgICB2YXIgd2luID0ganNGcmFtZVswXS5jb250ZW50V2luZG93O1xuICAgIGlmICh0eXBlb2Ygd2luLnBvc3RNZXNzYWdlICE9ICdmdW5jdGlvbicpIHtcbiAgICAgIGFsZXJ0KFwi0JjQt9Cy0LjQvdC40YLQtSwg0LfQsNC/0YPRgdC6INC60L7QtNCwINGC0YDQtdCx0YPQtdGCINCx0L7Qu9C10LUg0YHQvtCy0YDQtdC80LXQvdC90YvQuSDQsdGA0LDRg9C30LXRgFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgd2luLnBvc3RNZXNzYWdlKGNvZGUsICdodHRwOi8vcnUubG9va2F0Y29kZS5jb20vc2hvd2pzJyk7XG4gIH1cblxuICBmdW5jdGlvbiBydW5IVE1MKCkge1xuXG4gICAgdmFyIGhhc0hlaWdodCA9IGZhbHNlO1xuICAgIHZhciBmcmFtZTtcblxuICAgIGlmIChodG1sUmVzdWx0ICYmIHByZS5kYXRhc2V0LnJlZnJlc2gpIHtcbiAgICAgIGh0bWxSZXN1bHQucmVtb3ZlKCk7XG4gICAgICBodG1sUmVzdWx0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIWh0bWxSZXN1bHQpIHtcbiAgICAgIGZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICBmcmFtZS5uYW1lID0gJ2ZyYW1lLScrTWF0aC5yYW5kb20oKTtcbiAgICAgIGZyYW1lLmNsYXNzTmFtZSA9ICdyZXN1bHRfX2lmcmFtZSc7XG5cbiAgICAgIGlmIChwcmUuZGF0YXNldC5kZW1vSGVpZ2h0ID09PSBcIjBcIikge1xuICAgICAgICBmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBoYXNIZWlnaHQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChwcmUuZGF0YXNldC5kZW1vSGVpZ2h0KSB7XG4gICAgICAgIHZhciBoZWlnaHQgPSArcHJlLmRhdGFzZXQuZGVtb0hlaWdodDtcbiAgICAgICAgaWYgKCFpc1RydXN0ZWQpIGhlaWdodCA9IE1hdGgubWluKGhlaWdodCwgODAwKTtcbiAgICAgICAgaWYgKGhlaWdodCkge1xuICAgICAgICAgIGZyYW1lLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgICAgICAgaGFzSGVpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBodG1sUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBodG1sUmVzdWx0LmNsYXNzTmFtZSA9IFwicmVzdWx0IGNvZGUtZXhhbXBsZV9fcmVzdWx0XCI7XG4gICAgICBodG1sUmVzdWx0LmFwcGVuZENoaWxkKGZyYW1lKTtcblxuICAgICAgZWxlbS5hcHBlbmRDaGlsZChodG1sUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnJhbWUgPSBodG1sUmVzdWx0LnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpO1xuICAgIH1cblxuICAgIGlmIChpc1RydXN0ZWQpIHtcbiAgICAgIHZhciBkb2MgPSBmcmFtZS5jb250ZW50RG9jdW1lbnQgfHwgZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcblxuICAgICAgZG9jLm9wZW4oKTtcbiAgICAgIGRvYy53cml0ZShub3JtYWxpemVIdG1sKGNvZGUpKTtcbiAgICAgIGRvYy5jbG9zZSgpO1xuXG4gICAgICBpZiAoIWhhc0hlaWdodCkge1xuICAgICAgICBpZnJhbWVSZXNpemUoZnJhbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIShpc0ZpcnN0UnVuICYmIHByZS5kYXRhc2V0LmF1dG9ydW4pKSB7XG4gICAgICAgIGlmICghaXNTY3JvbGxlZEludG9WaWV3KGh0bWxSZXN1bHQpKSB7XG4gICAgICAgICAgaHRtbFJlc3VsdC5zY3JvbGxJbnRvVmlldyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIGZvcm0ubWV0aG9kID0gJ1BPU1QnO1xuICAgICAgZm9ybS5lbmN0eXBlID0gXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIjtcbiAgICAgIGZvcm0uYWN0aW9uID0gXCJodHRwOi8vcnUubG9va2F0Y29kZS5jb20vc2hvd2h0bWxcIjtcbiAgICAgIGZvcm0udGFyZ2V0ID0gZnJhbWUubmFtZTtcblxuICAgICAgdmFyIHRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgIHRleHRhcmVhLm5hbWUgPSAnY29kZSc7XG4gICAgICB0ZXh0YXJlYS52YWx1ZSA9IG5vcm1hbGl6ZUh0bWwoY29kZSk7XG4gICAgICBmb3JtLmFwcGVuZENoaWxkKHRleHRhcmVhKTtcblxuICAgICAgZnJhbWUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZm9ybSwgZnJhbWUubmV4dFNpYmxpbmcpO1xuICAgICAgZm9ybS5zdWJtaXQoKTtcbiAgICAgIGZvcm0ucmVtb3ZlKCk7XG5cbiAgICAgIGlmICghKGlzRmlyc3RSdW4gJiYgcHJlLmRhdGFzZXQuYXV0b3J1bikpIHtcbiAgICAgICAgZnJhbWUub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICBpZiAoIWhhc0hlaWdodCkge1xuICAgICAgICAgICAgaWZyYW1lUmVzaXplKGZyYW1lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWlzU2Nyb2xsZWRJbnRvVmlldyhodG1sUmVzdWx0KSkge1xuICAgICAgICAgICAgaHRtbFJlc3VsdC5zY3JvbGxJbnRvVmlldyhmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgZnVuY3Rpb24gcnVuSlMoKSB7XG5cbiAgICBpZiAoaXNUcnVzdGVkKSB7XG4gICAgICB2YXIgZXZhbEZ1bmMgPSB3aW5kb3cuZXhlY1NjcmlwdCB8fCBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICB3aW5kb3dbXCJldmFsXCJdLmNhbGwod2luZG93LCBjb2RlKTtcbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGV2YWxGdW5jKGNvZGUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhbGVydChcItCe0YjQuNCx0LrQsDogXCIgKyBlLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICAgIGlmIChwcmUuZGF0YXNldC5yZWZyZXNoICYmIGpzRnJhbWUpIHtcbiAgICAgICAganNGcmFtZS5yZW1vdmUoKTtcbiAgICAgICAganNGcmFtZSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICghanNGcmFtZSkge1xuICAgICAgICAvLyBjcmVhdGUgaWZyYW1lIGZvciBqc1xuICAgICAgICBqc0ZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgIGpzRnJhbWUuY2xhc3NOYW1lID0gJ2pzLWZyYW1lJztcbiAgICAgICAganNGcmFtZS5zcmMgPSAnaHR0cDovL3J1Lmxvb2thdGNvZGUuY29tL3Nob3dqcyc7XG4gICAgICAgIGpzRnJhbWUuc3R5bGUud2lkdGggPSAwO1xuICAgICAgICBqc0ZyYW1lLnN0eWxlLmhlaWdodCA9IDA7XG4gICAgICAgIGpzRnJhbWUuc3R5bGUuYm9yZGVyID0gJ25vbmUnO1xuICAgICAgICBqc0ZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHBvc3RKU0ZyYW1lKCk7XG4gICAgICAgIH07XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoanNGcmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3N0SlNGcmFtZSgpO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZWRpdCgpIHtcblxuICAgIHZhciBodG1sO1xuICAgIGlmIChpc0hUTUwpIHtcbiAgICAgIGh0bWwgPSBub3JtYWxpemVIdG1sKGNvZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29kZUluZGVudGVkID0gY29kZS5yZXBsYWNlKC9eL2dpbSwgJyAgICAnKTtcbiAgICAgIGh0bWwgPSAnPCFET0NUWVBFIGh0bWw+XFxuPGh0bWw+XFxuXFxuPGJvZHk+XFxuICA8c2NyaXB0PlxcbicrY29kZUluZGVudGVkKydcXG4gIDwvc2NyaXB0PlxcbjwvYm9keT5cXG5cXG48L2h0bWw+JztcbiAgICB9XG5cbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgICBmb3JtLmFjdGlvbiA9IFwiaHR0cDovL3BsbmtyLmNvL2VkaXQvP3A9cHJldmlld1wiO1xuICAgIGZvcm0ubWV0aG9kID0gXCJQT1NUXCI7XG4gICAgZm9ybS5lbmN0eXBlID0gXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCI7XG4gICAgZm9ybS50YXJnZXQgPSBcIl9ibGFua1wiO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgaW5wdXQubmFtZSA9IFwiZmlsZXNbaW5kZXguaHRtbF1cIjtcbiAgICBpbnB1dC50eXBlID0gJ2hpZGRlbic7XG4gICAgaW5wdXQudmFsdWUgPSBodG1sO1xuICAgIGZvcm0uYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG4gICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICBpbnB1dC50eXBlID0gJ2hpZGRlbic7XG4gICAgaW5wdXQubmFtZSA9IFwiZGVzY3JpcHRpb25cIjtcbiAgICBpbnB1dC52YWx1ZSA9IFwiRm9yayBmcm9tIFwiICsgd2luZG93LmxvY2F0aW9uO1xuICAgIGZvcm0uYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG4gICAgZm9ybS5zdWJtaXQoKTtcbiAgICBmb3JtLnJlbW92ZSgpO1xuICB9XG5cblxuICBmdW5jdGlvbiBub3JtYWxpemVIdG1sKCkge1xuICAgIHZhciBjb2RlTGMgPSBjb2RlLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIGhhc0JvZHlTdGFydCA9IGNvZGVMYy5tYXRjaCgnPGJvZHk+Jyk7XG4gICAgdmFyIGhhc0JvZHlFbmQgPSBjb2RlTGMubWF0Y2goJzwvYm9keT4nKTtcbiAgICB2YXIgaGFzSHRtbFN0YXJ0ID0gY29kZUxjLm1hdGNoKCc8aHRtbD4nKTtcbiAgICB2YXIgaGFzSHRtbEVuZCA9IGNvZGVMYy5tYXRjaCgnPC9odG1sPicpO1xuXG4gICAgdmFyIGhhc0RvY1R5cGUgPSBjb2RlTGMubWF0Y2goL15cXHMqPCFkb2N0eXBlLyk7XG5cbiAgICBpZiAoaGFzRG9jVHlwZSkge1xuICAgICAgcmV0dXJuIGNvZGU7XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IGNvZGU7XG5cbiAgICBpZiAoIWhhc0h0bWxTdGFydCkge1xuICAgICAgcmVzdWx0ID0gJzxodG1sPlxcbicgKyByZXN1bHQ7XG4gICAgfVxuXG4gICAgaWYgKCFoYXNIdG1sRW5kKSB7XG4gICAgICByZXN1bHQgPSByZXN1bHQgKyAnXFxuPC9odG1sPic7XG4gICAgfVxuXG4gICAgaWYgKCFoYXNCb2R5U3RhcnQpIHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKCc8aHRtbD4nLCc8aHRtbD5cXG48aGVhZD5cXG4gIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxcbjwvaGVhZD48Ym9keT5cXG4nKTtcbiAgICB9XG5cbiAgICBpZiAoIWhhc0JvZHlFbmQpIHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKCc8L2h0bWw+JywnXFxuPC9ib2R5PlxcbjwvaHRtbD4nKTtcbiAgICB9XG5cbiAgICByZXN1bHQgPSAnPCFET0NUWVBFIEhUTUw+XFxuJyArIHJlc3VsdDtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG5cbiAgZnVuY3Rpb24gcnVuKCkge1xuICAgIGlmIChpc0pTKSB7XG4gICAgICBydW5KUygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBydW5IVE1MKCk7XG4gICAgfVxuICAgIGlzRmlyc3RSdW4gPSBmYWxzZTtcbiAgfVxuXG5cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvZGVCb3g7XG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoJ2phZGUvbGliL3J1bnRpbWUuanMnKTtcbm1vZHVsZS5leHBvcnRzPWZ1bmN0aW9uKHBhcmFtcykgeyBpZiAocGFyYW1zKSB7cGFyYW1zLnJlcXVpcmUgPSByZXF1aXJlO30gcmV0dXJuIChcbmZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYmVtLCBleHRlcm5hbCwgZWRpdCwgemlwKSB7XG5idWYucHVzaChcIlwiKTtcbnZhciBiZW1fY2hhaW4gPSBbXTtcbnZhciBiZW1fY2hhaW5fY29udGV4dHMgPSBbJ2Jsb2NrJ107XG5qYWRlX21peGluc1tcImJcIl0gPSBmdW5jdGlvbih0YWcsIGlzRWxlbWVudCl7XG52YXIgYmxvY2sgPSAodGhpcyAmJiB0aGlzLmJsb2NrKSwgYXR0cmlidXRlcyA9ICh0aGlzICYmIHRoaXMuYXR0cmlidXRlcykgfHwge307XG5iZW0uY2FsbCh0aGlzLCBidWYsIGJlbV9jaGFpbiwgYmVtX2NoYWluX2NvbnRleHRzLCB0YWcsIGlzRWxlbWVudClcbn07XG5qYWRlX21peGluc1tcImVcIl0gPSBmdW5jdGlvbih0YWcpe1xudmFyIGJsb2NrID0gKHRoaXMgJiYgdGhpcy5ibG9jayksIGF0dHJpYnV0ZXMgPSAodGhpcyAmJiB0aGlzLmF0dHJpYnV0ZXMpIHx8IHt9O1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5ibG9jayAmJiBibG9jaygpO1xufSxcbmF0dHJpYnV0ZXM6IGphZGUubWVyZ2UoW2F0dHJpYnV0ZXNdKVxufSwgdGFnLCB0cnVlKTtcbn07XG5qYWRlX21peGluc1tcImJcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiYlwiXS5jYWxsKHtcbmJsb2NrOiBmdW5jdGlvbigpe1xuamFkZV9taXhpbnNbXCJiXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5pZiAoIGV4dGVybmFsKVxue1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJocmVmXCI6IGphZGUuZXNjYXBlKGV4dGVybmFsLmhyZWYpLFwidGFyZ2V0XCI6IFwiX2JsYW5rXCIsXCJ0aXRsZVwiOiBcItC+0YLQutGA0YvRgtGMINCyINC90L7QstC+0Lwg0L7QutC90LVcIixcImNsYXNzXCI6IFwiYnV0dG9uX2V4dGVybmFsXCJ9XG59LCAnYScpO1xufSxcbmF0dHJpYnV0ZXM6IHtcImNsYXNzXCI6IFwidG9vbFwifVxufSk7XG59XG5pZiAoIGVkaXQpXG57XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5ibG9jazogZnVuY3Rpb24oKXtcbmphZGVfbWl4aW5zW1wiZVwiXS5jYWxsKHtcbmF0dHJpYnV0ZXM6IHtcImhyZWZcIjogamFkZS5lc2NhcGUoZWRpdC5ocmVmKSxcInRhcmdldFwiOiBcIl9ibGFua1wiLFwidGl0bGVcIjogXCLQvtGC0LrRgNGL0YLRjCDQsiDQv9C10YHQvtGH0L3QuNGG0LUg0L7QutC90LVcIixcImNsYXNzXCI6IFwiYnV0dG9uX2VkaXRcIn1cbn0sICdhJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0b29sXCJ9XG59KTtcbn1cbmlmICggemlwKVxue1xuamFkZV9taXhpbnNbXCJlXCJdLmNhbGwoe1xuYmxvY2s6IGZ1bmN0aW9uKCl7XG5qYWRlX21peGluc1tcImVcIl0uY2FsbCh7XG5hdHRyaWJ1dGVzOiB7XCJocmVmXCI6IGphZGUuZXNjYXBlKHppcC5ocmVmKSxcInRhcmdldFwiOiBcIl9ibGFua1wiLFwidGl0bGVcIjogXCLRgdC60LDRh9Cw0YLRjCDQsNGA0YXQuNCyXCIsXCJjbGFzc1wiOiBcImJ1dHRvbl96aXBcIn1cbn0sICdhJyk7XG59LFxuYXR0cmlidXRlczoge1wiY2xhc3NcIjogXCJ0b29sXCJ9XG59KTtcbn1cbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcInRvb2xiYXIgX190b29sYmFyXCJ9XG59KTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJkYXRhLXJlc3VsdFwiOiBcIjFcIixcImNsYXNzXCI6IFwicmVzdWx0IF9fcmVzdWx0XCJ9XG59KTtcbn0sXG5hdHRyaWJ1dGVzOiB7XCJjbGFzc1wiOiBcImNvZGUtZXhhbXBsZVwifVxufSk7fS5jYWxsKHRoaXMsXCJiZW1cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmJlbTp0eXBlb2YgYmVtIT09XCJ1bmRlZmluZWRcIj9iZW06dW5kZWZpbmVkLFwiZXh0ZXJuYWxcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmV4dGVybmFsOnR5cGVvZiBleHRlcm5hbCE9PVwidW5kZWZpbmVkXCI/ZXh0ZXJuYWw6dW5kZWZpbmVkLFwiZWRpdFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguZWRpdDp0eXBlb2YgZWRpdCE9PVwidW5kZWZpbmVkXCI/ZWRpdDp1bmRlZmluZWQsXCJ6aXBcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnppcDp0eXBlb2YgemlwIT09XCJ1bmRlZmluZWRcIj96aXA6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn1cbikocGFyYW1zKTsgfVxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lJdmNtOXZkQzlxWVhaaGMyTnlhWEIwTFc1dlpHVnFjeTl1YjJSbFgyMXZaSFZzWlhNdlkyeHBaVzUwTDNCeWFYTnRMMmxtY21GdFpVSnZlQzVxWVdSbExtcHpJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHRkZlE9PSIsIlxudmFyIGNsaWVudFJlbmRlciA9IHJlcXVpcmUoJ2NsaWVudC9jbGllbnRSZW5kZXInKTtcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vaWZyYW1lQm94LmphZGUnKTtcbnZhciBpZnJhbWVSZXNpemUgPSByZXF1aXJlKCcuL2lmcmFtZVJlc2l6ZScpO1xuXG5mdW5jdGlvbiBJZnJhbWVCb3goaWZyYW1lKSB7XG5cblxuICB2YXIgbG9jYWxzID0geyB9O1xuXG4gIGlmIChpZnJhbWUuZGF0YXNldC5leHRlcm5hbCkge1xuICAgIGxvY2Fscy5leHRlcm5hbCA9IHtcbiAgICAgIGhyZWY6IGlmcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyYycpXG4gICAgfTtcbiAgfVxuXG5cbiAgaWYgKGlmcmFtZS5kYXRhc2V0LnBsYXkpIHtcbiAgICBsb2NhbHMuZWRpdCA9IHtcbiAgICAgIGhyZWY6ICdodHRwOi8vcGxua3IuY28vZWRpdC8nICsgaWZyYW1lLmRhdGFzZXQucGxheSArICc/cD1wcmV2aWV3J1xuICAgIH07XG4gIH1cblxuXG4gIGlmIChpZnJhbWUuZGF0YXNldC56aXApIHtcbiAgICBsb2NhbHMuemlwID0ge1xuICAgICAgaHJlZjogJy96aXAnICsgaWZyYW1lLmdldEF0dHJpYnV0ZSgnc3JjJylcbiAgICB9O1xuICB9XG5cbiAgdmFyIHJlbmRlcmVkID0gY2xpZW50UmVuZGVyKHRlbXBsYXRlLCBsb2NhbHMpO1xuICBpZnJhbWUuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJFbmRcIiwgcmVuZGVyZWQpO1xuICB2YXIgZWxlbSA9IGlmcmFtZS5uZXh0U2libGluZztcblxuICBlbGVtLnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1yZXN1bHRdXCIpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG5cblxuICBpZiAoaWZyYW1lLmRhdGFzZXQuZGVtb0hlaWdodCkge1xuICAgIHZhciBoZWlnaHQgPSAraWZyYW1lLmRhdGFzZXQuZGVtb0hlaWdodDtcbiAgICBpZiAoIWlmcmFtZS5kYXRhc2V0LnRydXN0ZWQpIGhlaWdodCA9IE1hdGgubWluKGhlaWdodCwgODAwKTtcbiAgICBpZnJhbWUuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgfSBlbHNlIHtcbiAgICBpZnJhbWUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZnJhbWVSZXNpemUoaWZyYW1lLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYgKGVycikgaWZyYW1lLnN0eWxlLmhlaWdodCA9ICcxMDBweCc7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKGlmcmFtZS5kYXRhc2V0LnBsYXlFcnJvcikge1xuICAgIGVsZW0uaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJCZWdpblwiLCAnPGRpdiBjbGFzcz1cImZvcm1hdF9lcnJvclwiPicgKyBlc2MoaWZyYW1lLmRhdGFzZXQucGxheUVycm9yKSArICc8L2Rpdj4nKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGVzYyhzdHIpIHtcbiAgcmV0dXJuIHN0clxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSWZyYW1lQm94O1xuIiwiXG5mdW5jdGlvbiBpZnJhbWVSZXNpemUoaWZyRWxlbSwgY2FsbGJhY2spIHtcbiAgaWYgKCFjYWxsYmFjaykgY2FsbGJhY2sgPSBmdW5jdGlvbigpe307XG5cbiAgdmFyIHRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgY2FsbGJhY2sobmV3IEVycm9yKFwidGltZW91dFwiKSk7XG4gIH0sIDUwMCk7XG5cbiAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dFRpbWVyKTtcbiAgICBjYWxsYmFjayhlcnIpO1xuICB9XG5cbiAgLy8gdGhyb3cgcmlnaHQgbm93IGlmIGNyb3NzLWRvbWFpblxuICB0cnkge1xuICAgIC8qIGpzaGludCAtVzAzMCAqL1xuICAgIChpZnJFbGVtLmNvbnRlbnREb2N1bWVudCB8fCBpZnJFbGVtLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpLmJvZHk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGlmcmFtZVJlc2l6ZUNyb3NzRG9tYWluKGlmckVsZW0sIGRvbmUpO1xuICB9XG5cblxuICAvLyBISU5UOiBJIHNob3VsbmQndCBtb3ZlIGlmcmFtZSBpbiBET00sIGJlY2F1c2UgaXQgd2lsbCByZWxvYWQgaXQncyBjb250ZW50cyB3aGVuIGFwcGVuZGVkL2luc2VydGVkIGFueXdoZXJlIVxuICAvLyBzbyBJIGNyZWF0ZSBhIGNsb25lIGFuZCB3b3JrIG9uIGl0XG4gIGlmICghaWZyRWxlbS5vZmZzZXRXaWR0aCkge1xuICAgIC8vIGNsb25lIGlmcmFtZSBhdCBhbm90aGVyIHBsYWNlIHRvIHNlZSB0aGUgc2l6ZVxuICAgIHZhciBjbG9uZUlmcmFtZSA9IGlmckVsZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgIGNsb25lSWZyYW1lLm5hbWUgPSBcIlwiO1xuXG4gICAgY2xvbmVJZnJhbWUuc3R5bGUuaGVpZ2h0ID0gJzUwcHgnO1xuICAgIGNsb25lSWZyYW1lLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBjbG9uZUlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBjbG9uZUlmcmFtZS5zdHlsZS50b3AgPSAnMTAwMDBweCc7XG5cbiAgICBjbG9uZUlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkb2MgPSB0aGlzLmNvbnRlbnREb2N1bWVudCB8fCB0aGlzLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gICAgICB2YXIgaGVpZ2h0ID0gZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQgfHwgZG9jLmJvZHkuc2Nyb2xsSGVpZ2h0O1xuICAgICAgaWZyRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgIGlmckVsZW0uc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgMTAgKyAncHgnO1xuICAgICAgY2xvbmVJZnJhbWUucmVtb3ZlKCk7XG4gICAgICBkb25lKCk7XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2xvbmVJZnJhbWUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmckVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIGlmckVsZW0uc3R5bGUuaGVpZ2h0ID0gJzFweCc7XG5cbiAgdmFyIGRvYyA9IGlmckVsZW0uY29udGVudERvY3VtZW50IHx8IGlmckVsZW0uY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgdmFyIGhlaWdodCA9IGRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0IHx8IGRvYy5ib2R5LnNjcm9sbEhlaWdodDtcbiAgaWZyRWxlbS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAxMCArICdweCc7XG4gIGRvbmUoKTtcbn1cblxuZnVuY3Rpb24gaWZyYW1lUmVzaXplQ3Jvc3NEb21haW4oaWZyRWxlbSwgY2FsbGJhY2spIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkIHlldFwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZnJhbWVSZXNpemU7XG5cbi8qXG53aW5kb3cub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICBpZiAoZS5vcmlnaW4gIT0gXCJodHRwOi8vcnUubG9va2F0Y29kZS5jb21cIikgcmV0dXJuO1xuICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgaWYgKCFkYXRhIHx8IGRhdGEuY21kICE9IFwicmVzaXplLWlmcmFtZVwiKSByZXR1cm47XG4gIHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoZGF0YS5uYW1lKVswXTtcblxuICBlbGVtLnN0eWxlLmhlaWdodCA9ICtkYXRhLmhlaWdodCArIDEwICsgXCJweFwiO1xuICB2YXIgZGVmZXJyZWQgPSBpZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5kZWZlcnJlZHNbZGF0YS5pZF07XG4gIGRlZmVycmVkLnJlc29sdmUoKTtcbn07XG5cbmZ1bmN0aW9uIGlmcmFtZVJlc2l6ZUNyb3NzRG9tYWluKGlmckVsZW0sIGNhbGxiYWNrKSB7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBjYWxsYmFjayhuZXcgRXJyb3IoXCJ0aW1lb3V0XCIpKTtcbiAgfSwgNTAwKTtcblxuICB0cnkge1xuICAgIC8vIHRyeSB0byBzZWUgaWYgcmVzaXplciBjYW4gd29yayBvbiB0aGlzIGlmcmFtZVxuICAgIGlmckVsZW0uY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcInRlc3RcIiwgXCJodHRwOi8vcnUubG9va2F0Y29kZS5jb21cIik7XG4gIH0gY2F0Y2goZSkge1xuICAgIC8vIGlmcmFtZSBmcm9tIGFub3RoZXIgZG9tYWluLCBzb3JyeVxuICAgIGNhbGxiYWNrKG5ldyBFcnJvcihcInRoZSByZXNpemVyIG11c3QgYmUgZnJvbSBydS5sb29rYXRjb2RlLmNvbVwiKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFpZnJFbGVtLm9mZnNldFdpZHRoKSB7XG4gICAgLy8gbW92ZSBpZnJhbWUgdG8gYW5vdGhlciBwbGFjZSB0byByZXNpemUgdGhlcmVcbiAgICB2YXIgcGxhY2Vob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgaWZyRWxlbS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwbGFjZWhvbGRlciwgaWZyRWxlbSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJFbGVtKTtcbiAgfVxuXG4gIGlmckVsZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICB2YXIgaWQgPSBcIlwiICsgTWF0aC5yYW5kb20oKTtcbiAgdmFyIG1lc3NhZ2UgPSB7IGNtZDogJ3Jlc2l6ZS1pZnJhbWUnLCBuYW1lOiBpZnJFbGVtWzBdLm5hbWUsIGlkOiBpZCB9O1xuICAvLyBUT0RPXG4gIGlmcmFtZVJlc2l6ZUNyb3NzRG9tYWluLmRlZmVycmVkc1tpZF0gPSBkZWZlcnJlZDtcbiAgZGVmZXJyZWQuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSBpZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5kZWZlcnJlZHNbaWRdO1xuICB9KTtcblxuICB2YXIgZnJhbWUgPSBpZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5pZnJhbWU7XG4gIGlmIChmcmFtZS5sb2FkZWQpIHtcbiAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpLCBcImh0dHA6Ly9ydS5sb29rYXRjb2RlLmNvbVwiKTtcbiAgfSBlbHNlIHtcbiAgICBmcmFtZS5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShtZXNzYWdlKSwgXCJodHRwOi8vcnUubG9va2F0Y29kZS5jb21cIik7XG4gICAgfSk7XG4gIH1cblxuICBpZiAocGxhY2Vob2xkZXIpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcGxhY2Vob2xkZXIucmVwbGFjZVdpdGgoaWZyRWxlbSk7XG4gICAgfSwgMjApO1xuICB9XG5cbiAgcmV0dXJuIGRlZmVycmVkO1xufVxuXG5pZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5kZWZlcnJlZHMgPSB7fTtcbmlmcmFtZVJlc2l6ZUNyb3NzRG9tYWluLmlmcmFtZSA9ICQoJzxpZnJhbWUgc3JjPVwiaHR0cDovL3J1Lmxvb2thdGNvZGUuY29tL2ZpbGVzL2lmcmFtZS1yZXNpemUuaHRtbFwiIHN0eWxlPVwiZGlzcGxheTpub25lXCI+PC9pZnJhbWU+JykucHJlcGVuZFRvKCdib2R5Jyk7XG5pZnJhbWVSZXNpemVDcm9zc0RvbWFpbi5pZnJhbWUub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgdGhpcy5sb2FkZWQgPSB0cnVlO1xufSk7XG4qL1xuIiwicmVxdWlyZSgncHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWNvcmUuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1tYXJrdXAuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jc3MuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1jc3MtZXh0cmFzLmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY2xpa2UuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1qYXZhc2NyaXB0LmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tY29mZmVlc2NyaXB0LmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20taHR0cC5qcycpO1xucmVxdWlyZSgncHJpc21qcy9jb21wb25lbnRzL3ByaXNtLXNjc3MuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1zcWwuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1waHAuanMnKTtcbnJlcXVpcmUoJ3ByaXNtanMvY29tcG9uZW50cy9wcmlzbS1waHAtZXh0cmFzLmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tcHl0aG9uLmpzJyk7XG5yZXF1aXJlKCdwcmlzbWpzL2NvbXBvbmVudHMvcHJpc20tcnVieS5qcycpO1xucmVxdWlyZSgncHJpc21qcy9jb21wb25lbnRzL3ByaXNtLWphdmEuanMnKTtcblxudmFyIENvZGVCb3ggPSByZXF1aXJlKCcuL2NvZGVCb3gnKTtcbnZhciBJZnJhbWVCb3ggPSByZXF1aXJlKCcuL2lmcmFtZUJveCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIFByaXNtLmhpZ2hsaWdodEFsbCk7XG5cbiAgZnVuY3Rpb24gYWRkTGluZU51bWJlcnMocHJlKSB7XG5cbiAgICB2YXIgbGluZXNOdW0gPSAoMSArIHByZS5pbm5lckhUTUwuc3BsaXQoJ1xcbicpLmxlbmd0aCk7XG4gICAgdmFyIGxpbmVOdW1iZXJzV3JhcHBlcjtcblxuICAgIHZhciBsaW5lcyA9IG5ldyBBcnJheShsaW5lc051bSk7XG4gICAgbGluZXMgPSBsaW5lcy5qb2luKCc8c3Bhbj48L3NwYW4+Jyk7XG5cbiAgICBsaW5lTnVtYmVyc1dyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgbGluZU51bWJlcnNXcmFwcGVyLmNsYXNzTmFtZSA9ICdsaW5lLW51bWJlcnMtcm93cyc7XG4gICAgbGluZU51bWJlcnNXcmFwcGVyLmlubmVySFRNTCA9IGxpbmVzO1xuXG4gICAgaWYgKHByZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKSkge1xuICAgICAgcHJlLnN0eWxlLmNvdW50ZXJSZXNldCA9ICdsaW5lbnVtYmVyICcgKyBOdW1iZXIocHJlLmRhdGFzZXQuc3RhcnQpIC0gMTtcbiAgICB9XG5cbiAgICBwcmUuYXBwZW5kQ2hpbGQobGluZU51bWJlcnNXcmFwcGVyKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gYWRkQmxvY2tIaWdobGlnaHQocHJlKSB7XG5cbiAgICB2YXIgbGluZXMgPSBwcmUuZGF0YXNldC5oaWdobGlnaHRCbG9jaztcblxuICAgIGlmICghbGluZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgcmFuZ2VzID0gbGluZXMucmVwbGFjZSgvXFxzKy9nLCAnJykuc3BsaXQoJywnKTtcblxuICAgIC8qanNoaW50IC1XMDg0ICovXG4gICAgZm9yICh2YXIgaSA9IDAsIHJhbmdlOyByYW5nZSA9IHJhbmdlc1tpKytdOykge1xuICAgICAgcmFuZ2UgPSByYW5nZS5zcGxpdCgnLScpO1xuXG4gICAgICB2YXIgc3RhcnQgPSArcmFuZ2VbMF0sXG4gICAgICAgICAgZW5kID0gK3JhbmdlWzFdIHx8IHN0YXJ0O1xuXG5cbiAgICAgIHZhciBtYXNrID0gJzxkaXYgY2xhc3M9XCJibG9jay1oaWdobGlnaHRcIiBkYXRhLXN0YXJ0PVwiJytzdGFydCsnXCIgZGF0YS1lbmQ9XCInK2VuZCsnXCI+JyArXG4gICAgICAgIG5ldyBBcnJheShzdGFydCArIDEpLmpvaW4oJ1xcbicpICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJtYXNrXCI+JyArIG5ldyBBcnJheShlbmQgLSBzdGFydCArIDIpLmpvaW4oJ1xcbicpICsgJzwvZGl2PjwvZGl2Pic7XG5cbiAgICAgIHByZS5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlckJlZ2luXCIsIG1hc2spO1xuICAgIH1cblxuICB9XG5cblxuICBmdW5jdGlvbiBhZGRJbmxpbmVIaWdobGlnaHQocHJlKSB7XG4gICAgdmFyIHJhbmdlcyA9IHByZS5kYXRhc2V0LmhpZ2hsaWdodElubGluZTtcblxuICAgIHZhciBjb2RlRWxlbSA9IHByZS5xdWVyeVNlbGVjdG9yKCdjb2RlJyk7XG5cbiAgICByYW5nZXMgPSByYW5nZXMgPyByYW5nZXMuc3BsaXQoXCIsXCIpIDogW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBpZWNlID0gcmFuZ2VzW2ldLnNwbGl0KCc6Jyk7XG4gICAgICB2YXIgbGluZU51bSA9ICtwaWVjZVswXSwgc3RyUmFuZ2UgPSBwaWVjZVsxXS5zcGxpdCgnLScpO1xuICAgICAgdmFyIHN0YXJ0ID0gK3N0clJhbmdlWzBdLCBlbmQgPSArc3RyUmFuZ2VbMV07XG4gICAgICB2YXIgbWFzayA9ICc8ZGl2IGNsYXNzPVwiaW5saW5lLWhpZ2hsaWdodFwiPicgK1xuICAgICAgICBuZXcgQXJyYXkobGluZU51bSArIDEpLmpvaW4oJ1xcbicpICtcbiAgICAgICAgbmV3IEFycmF5KHN0YXJ0ICsgMSkuam9pbignICcpICtcbiAgICAgICAgJzxzcGFuIGNsYXNzPVwibWFza1wiPicgKyBuZXcgQXJyYXkoZW5kIC0gc3RhcnQgKyAxKS5qb2luKCcgJykgKyAnPC9zcGFuPjwvZGl2Pic7XG5cbiAgICAgIGNvZGVFbGVtLmluc2VydEFkamFjZW50SFRNTChcImFmdGVyQmVnaW5cIiwgbWFzayk7XG4gICAgfVxuICB9XG5cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBoaWdobGlnaHQgaW5saW5lXG4gICAgdmFyIGNvZGVQcmVFbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3ByZVtjbGFzcyo9XCJsYW5ndWFnZS1cIl0nKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29kZVByZUVsZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY29kZVByZUVsZW0gPSBjb2RlUHJlRWxlbXNbaV07XG5cbiAgICAgIC8vIGFscmVhZHkgaGlnaGxpZ2h0ZWRcbiAgICAgIGlmIChjb2RlUHJlRWxlbS5jb2RlKSBjb250aW51ZTtcblxuICAgICAgY29kZVByZUVsZW0uY29kZSA9IHVuZXNjKGNvZGVQcmVFbGVtLmlubmVySFRNTCk7XG5cbiAgICAgIC8vIHdyYXAgPHByZT4uLi48L3ByZT4gY29udGVudCBpbiA8cHJlPjxjb2RlPi4uLjwvY29kZT48L3ByZT5cbiAgICAgIHZhciBjb2RlRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NvZGUnKTtcbiAgICAgIHdoaWxlKGNvZGVQcmVFbGVtLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgY29kZUVsZW0uYXBwZW5kQ2hpbGQoY29kZVByZUVsZW0uZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgICBjb2RlUHJlRWxlbS5hcHBlbmRDaGlsZChjb2RlRWxlbSk7XG5cbiAgICAgIFByaXNtLmhpZ2hsaWdodEVsZW1lbnQoY29kZUVsZW0pO1xuXG4gICAgICBhZGRMaW5lTnVtYmVycyhjb2RlUHJlRWxlbSk7XG4gICAgICBhZGRCbG9ja0hpZ2hsaWdodChjb2RlUHJlRWxlbSk7XG4gICAgICBhZGRJbmxpbmVIaWdobGlnaHQoY29kZVByZUVsZW0pO1xuICAgICAgbmV3IENvZGVCb3goY29kZVByZUVsZW0pO1xuICAgIH1cblxuXG4gICAgdmFyIGlmcmFtZVJlc3VsdEVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaWZyYW1lLnJlc3VsdF9faWZyYW1lJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlmcmFtZVJlc3VsdEVsZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWZyYW1lRWxlbSA9IGlmcmFtZVJlc3VsdEVsZW1zW2ldO1xuICAgICAgbmV3IElmcmFtZUJveChpZnJhbWVFbGVtKTtcbiAgICB9XG4gIH0pO1xuXG59O1xuXG5cbi8vIGZpeG1lOiByZXF1aXJlIGxvZGFzaC5lc2NhcGUgaW5zdGVhZFxuZnVuY3Rpb24gZXNjKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2Moc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvJmFtcDsvZywgJyYnKVxuICAgIC5yZXBsYWNlKC8mbHQ7L2csICc8JylcbiAgICAucmVwbGFjZSgvJmd0Oy9nLCAnPicpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIGF0dHJzID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcblxuICBpZiAoYWMgfHwgYmMpIHtcbiAgICBhYyA9IGFjIHx8IFtdO1xuICAgIGJjID0gYmMgfHwgW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xuICB9XG5cbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbnVsbHModmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xufVxuXG4vKipcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpLmZpbHRlcihudWxscykuam9pbignICcpIDogdmFsO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuIiwiUHJpc20ubGFuZ3VhZ2VzLmNsaWtlID0ge1xuXHQnY29tbWVudCc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSlcXC9cXCpbXFx3XFxXXSo/XFwqXFwvL2csXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcOl0pXFwvXFwvLio/KFxccj9cXG58JCkvZyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF0sXG5cdCdzdHJpbmcnOiAvKFwifCcpKFxcXFw/LikqP1xcMS9nLFxuXHQnY2xhc3MtbmFtZSc6IHtcblx0XHRwYXR0ZXJuOiAvKCg/Oig/OmNsYXNzfGludGVyZmFjZXxleHRlbmRzfGltcGxlbWVudHN8dHJhaXR8aW5zdGFuY2VvZnxuZXcpXFxzKyl8KD86Y2F0Y2hcXHMrXFwoKSlbYS16MC05X1xcLlxcXFxdKy9pZyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGluc2lkZToge1xuXHRcdFx0cHVuY3R1YXRpb246IC8oXFwufFxcXFwpL1xuXHRcdH1cblx0fSxcblx0J2tleXdvcmQnOiAvXFxiKGlmfGVsc2V8d2hpbGV8ZG98Zm9yfHJldHVybnxpbnxpbnN0YW5jZW9mfGZ1bmN0aW9ufG5ld3x0cnl8dGhyb3d8Y2F0Y2h8ZmluYWxseXxudWxsfGJyZWFrfGNvbnRpbnVlKVxcYi9nLFxuXHQnYm9vbGVhbic6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvZyxcblx0J2Z1bmN0aW9uJzoge1xuXHRcdHBhdHRlcm46IC9bYS16MC05X10rXFwoL2lnLFxuXHRcdGluc2lkZToge1xuXHRcdFx0cHVuY3R1YXRpb246IC9cXCgvXG5cdFx0fVxuXHR9LFxuXHQnbnVtYmVyJzogL1xcYi0/KDB4W1xcZEEtRmEtZl0rfFxcZCpcXC4/XFxkKyhbRWVdLT9cXGQrKT8pXFxiL2csXG5cdCdvcGVyYXRvcic6IC9bLStdezEsMn18IXw8PT98Pj0/fD17MSwzfXwmezEsMn18XFx8P1xcfHxcXD98XFwqfFxcL3xcXH58XFxefFxcJS9nLFxuXHQnaWdub3JlJzogLyYobHR8Z3R8YW1wKTsvZ2ksXG5cdCdwdW5jdHVhdGlvbic6IC9be31bXFxdOygpLC46XS9nXG59O1xuIiwiUHJpc20ubGFuZ3VhZ2VzLmNvZmZlZXNjcmlwdCA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2phdmFzY3JpcHQnLCB7XG5cdCdjb21tZW50JzogW1xuXHRcdC8oWyNdezN9XFxzKlxccj9cXG4oLipcXHMqXFxyKlxcbiopXFxzKj9cXHI/XFxuWyNdezN9KS9nLFxuXHRcdC8oXFxzfF4pKFsjXXsxfVteI15cXHJeXFxuXXsyLH0/KFxccj9cXG58JCkpL2dcblx0XSxcblx0J2tleXdvcmQnOiAvXFxiKHRoaXN8d2luZG93fGRlbGV0ZXxjbGFzc3xleHRlbmRzfG5hbWVzcGFjZXxleHRlbmR8YXJ8bGV0fGlmfGVsc2V8d2hpbGV8ZG98Zm9yfGVhY2h8b2Z8cmV0dXJufGlufGluc3RhbmNlb2Z8bmV3fHdpdGh8dHlwZW9mfHRyeXxjYXRjaHxmaW5hbGx5fG51bGx8dW5kZWZpbmVkfGJyZWFrfGNvbnRpbnVlKVxcYi9nXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnY29mZmVlc2NyaXB0JywgJ2tleXdvcmQnLCB7XG5cdCdmdW5jdGlvbic6IHtcblx0XHRwYXR0ZXJuOiAvW2EtenxBLXpdK1xccypbOnw9XVxccyooXFwoWy58YS16XFxzfCx8Onx7fH18XFxcInxcXCd8PV0qXFwpKT9cXHMqLSZndDsvZ2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnZnVuY3Rpb24tbmFtZSc6IC9bXz9hLXotfEEtWi1dKyhcXHMqWzp8PV0pfCBAW18/JD9hLXotfEEtWi1dKyhcXHMqKXwgL2csXG5cdFx0XHQnb3BlcmF0b3InOiAvWy0rXXsxLDJ9fCF8PT8mbHQ7fD0/Jmd0O3w9ezEsMn18KCZhbXA7KXsxLDJ9fFxcfD9cXHx8XFw/fFxcKnxcXC8vZ1xuXHRcdH1cblx0fSxcblx0J2F0dHItbmFtZSc6IC9bXz9hLXotfEEtWi1dKyhcXHMqOil8IEBbXz8kP2Etei18QS1aLV0rKFxccyopfCAvZ1xufSk7XG4iLCJzZWxmID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKVxuXHQ/IHdpbmRvdyAgIC8vIGlmIGluIGJyb3dzZXJcblx0OiAoXG5cdFx0KHR5cGVvZiBXb3JrZXJHbG9iYWxTY29wZSAhPT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlKVxuXHRcdD8gc2VsZiAvLyBpZiBpbiB3b3JrZXJcblx0XHQ6IHt9ICAgLy8gaWYgaW4gbm9kZSBqc1xuXHQpO1xuXG4vKipcbiAqIFByaXNtOiBMaWdodHdlaWdodCwgcm9idXN0LCBlbGVnYW50IHN5bnRheCBoaWdobGlnaHRpbmdcbiAqIE1JVCBsaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwL1xuICogQGF1dGhvciBMZWEgVmVyb3UgaHR0cDovL2xlYS52ZXJvdS5tZVxuICovXG5cbnZhciBQcmlzbSA9IChmdW5jdGlvbigpe1xuXG4vLyBQcml2YXRlIGhlbHBlciB2YXJzXG52YXIgbGFuZyA9IC9cXGJsYW5nKD86dWFnZSk/LSg/IVxcKikoXFx3KylcXGIvaTtcblxudmFyIF8gPSBzZWxmLlByaXNtID0ge1xuXHR1dGlsOiB7XG5cdFx0ZW5jb2RlOiBmdW5jdGlvbiAodG9rZW5zKSB7XG5cdFx0XHRpZiAodG9rZW5zIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBUb2tlbih0b2tlbnMudHlwZSwgXy51dGlsLmVuY29kZSh0b2tlbnMuY29udGVudCksIHRva2Vucy5hbGlhcyk7XG5cdFx0XHR9IGVsc2UgaWYgKF8udXRpbC50eXBlKHRva2VucykgPT09ICdBcnJheScpIHtcblx0XHRcdFx0cmV0dXJuIHRva2Vucy5tYXAoXy51dGlsLmVuY29kZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdG9rZW5zLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHlwZTogZnVuY3Rpb24gKG8pIHtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdCAoXFx3KylcXF0vKVsxXTtcblx0XHR9LFxuXG5cdFx0Ly8gRGVlcCBjbG9uZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gKGUuZy4gdG8gZXh0ZW5kIGl0KVxuXHRcdGNsb25lOiBmdW5jdGlvbiAobykge1xuXHRcdFx0dmFyIHR5cGUgPSBfLnV0aWwudHlwZShvKTtcblxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ09iamVjdCc6XG5cdFx0XHRcdFx0dmFyIGNsb25lID0ge307XG5cblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbykge1xuXHRcdFx0XHRcdFx0aWYgKG8uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0XHRjbG9uZVtrZXldID0gXy51dGlsLmNsb25lKG9ba2V5XSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGNsb25lO1xuXG5cdFx0XHRcdGNhc2UgJ0FycmF5Jzpcblx0XHRcdFx0XHRyZXR1cm4gby5zbGljZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbztcblx0XHR9XG5cdH0sXG5cblx0bGFuZ3VhZ2VzOiB7XG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiAoaWQsIHJlZGVmKSB7XG5cdFx0XHR2YXIgbGFuZyA9IF8udXRpbC5jbG9uZShfLmxhbmd1YWdlc1tpZF0pO1xuXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gcmVkZWYpIHtcblx0XHRcdFx0bGFuZ1trZXldID0gcmVkZWZba2V5XTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxhbmc7XG5cdFx0fSxcblxuXHRcdC8vIEluc2VydCBhIHRva2VuIGJlZm9yZSBhbm90aGVyIHRva2VuIGluIGEgbGFuZ3VhZ2UgbGl0ZXJhbFxuXHRcdGluc2VydEJlZm9yZTogZnVuY3Rpb24gKGluc2lkZSwgYmVmb3JlLCBpbnNlcnQsIHJvb3QpIHtcblx0XHRcdHJvb3QgPSByb290IHx8IF8ubGFuZ3VhZ2VzO1xuXHRcdFx0dmFyIGdyYW1tYXIgPSByb290W2luc2lkZV07XG5cdFx0XHR2YXIgcmV0ID0ge307XG5cblx0XHRcdGZvciAodmFyIHRva2VuIGluIGdyYW1tYXIpIHtcblxuXHRcdFx0XHRpZiAoZ3JhbW1hci5oYXNPd25Qcm9wZXJ0eSh0b2tlbikpIHtcblxuXHRcdFx0XHRcdGlmICh0b2tlbiA9PSBiZWZvcmUpIHtcblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgbmV3VG9rZW4gaW4gaW5zZXJ0KSB7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGluc2VydC5oYXNPd25Qcm9wZXJ0eShuZXdUb2tlbikpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXRbbmV3VG9rZW5dID0gaW5zZXJ0W25ld1Rva2VuXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldFt0b2tlbl0gPSBncmFtbWFyW3Rva2VuXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcm9vdFtpbnNpZGVdID0gcmV0O1xuXHRcdH0sXG5cblx0XHQvLyBUcmF2ZXJzZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gd2l0aCBEZXB0aCBGaXJzdCBTZWFyY2hcblx0XHRERlM6IGZ1bmN0aW9uKG8sIGNhbGxiYWNrKSB7XG5cdFx0XHRmb3IgKHZhciBpIGluIG8pIHtcblx0XHRcdFx0Y2FsbGJhY2suY2FsbChvLCBpLCBvW2ldKTtcblxuXHRcdFx0XHRpZiAoXy51dGlsLnR5cGUobykgPT09ICdPYmplY3QnKSB7XG5cdFx0XHRcdFx0Xy5sYW5ndWFnZXMuREZTKG9baV0sIGNhbGxiYWNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRoaWdobGlnaHRBbGw6IGZ1bmN0aW9uKGFzeW5jLCBjYWxsYmFjaykge1xuXHRcdHZhciBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2NvZGVbY2xhc3MqPVwibGFuZ3VhZ2UtXCJdLCBbY2xhc3MqPVwibGFuZ3VhZ2UtXCJdIGNvZGUsIGNvZGVbY2xhc3MqPVwibGFuZy1cIl0sIFtjbGFzcyo9XCJsYW5nLVwiXSBjb2RlJyk7XG5cblx0XHRmb3IgKHZhciBpPTAsIGVsZW1lbnQ7IGVsZW1lbnQgPSBlbGVtZW50c1tpKytdOykge1xuXHRcdFx0Xy5oaWdobGlnaHRFbGVtZW50KGVsZW1lbnQsIGFzeW5jID09PSB0cnVlLCBjYWxsYmFjayk7XG5cdFx0fVxuXHR9LFxuXG5cdGhpZ2hsaWdodEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFzeW5jLCBjYWxsYmFjaykge1xuXHRcdC8vIEZpbmQgbGFuZ3VhZ2Vcblx0XHR2YXIgbGFuZ3VhZ2UsIGdyYW1tYXIsIHBhcmVudCA9IGVsZW1lbnQ7XG5cblx0XHR3aGlsZSAocGFyZW50ICYmICFsYW5nLnRlc3QocGFyZW50LmNsYXNzTmFtZSkpIHtcblx0XHRcdHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuXHRcdH1cblxuXHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdGxhbmd1YWdlID0gKHBhcmVudC5jbGFzc05hbWUubWF0Y2gobGFuZykgfHwgWywnJ10pWzFdO1xuXHRcdFx0Z3JhbW1hciA9IF8ubGFuZ3VhZ2VzW2xhbmd1YWdlXTtcblx0XHR9XG5cblx0XHRpZiAoIWdyYW1tYXIpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBTZXQgbGFuZ3VhZ2Ugb24gdGhlIGVsZW1lbnQsIGlmIG5vdCBwcmVzZW50XG5cdFx0ZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKGxhbmcsICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykgKyAnIGxhbmd1YWdlLScgKyBsYW5ndWFnZTtcblxuXHRcdC8vIFNldCBsYW5ndWFnZSBvbiB0aGUgcGFyZW50LCBmb3Igc3R5bGluZ1xuXHRcdHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblxuXHRcdGlmICgvcHJlL2kudGVzdChwYXJlbnQubm9kZU5hbWUpKSB7XG5cdFx0XHRwYXJlbnQuY2xhc3NOYW1lID0gcGFyZW50LmNsYXNzTmFtZS5yZXBsYWNlKGxhbmcsICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykgKyAnIGxhbmd1YWdlLScgKyBsYW5ndWFnZTtcblx0XHR9XG5cblx0XHR2YXIgY29kZSA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG5cblx0XHRpZighY29kZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBlbnYgPSB7XG5cdFx0XHRlbGVtZW50OiBlbGVtZW50LFxuXHRcdFx0bGFuZ3VhZ2U6IGxhbmd1YWdlLFxuXHRcdFx0Z3JhbW1hcjogZ3JhbW1hcixcblx0XHRcdGNvZGU6IGNvZGVcblx0XHR9O1xuXG5cdFx0Xy5ob29rcy5ydW4oJ2JlZm9yZS1oaWdobGlnaHQnLCBlbnYpO1xuXG5cdFx0aWYgKGFzeW5jICYmIHNlbGYuV29ya2VyKSB7XG5cdFx0XHR2YXIgd29ya2VyID0gbmV3IFdvcmtlcihfLmZpbGVuYW1lKTtcblxuXHRcdFx0d29ya2VyLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRlbnYuaGlnaGxpZ2h0ZWRDb2RlID0gVG9rZW4uc3RyaW5naWZ5KEpTT04ucGFyc2UoZXZ0LmRhdGEpLCBsYW5ndWFnZSk7XG5cblx0XHRcdFx0Xy5ob29rcy5ydW4oJ2JlZm9yZS1pbnNlcnQnLCBlbnYpO1xuXG5cdFx0XHRcdGVudi5lbGVtZW50LmlubmVySFRNTCA9IGVudi5oaWdobGlnaHRlZENvZGU7XG5cblx0XHRcdFx0Y2FsbGJhY2sgJiYgY2FsbGJhY2suY2FsbChlbnYuZWxlbWVudCk7XG5cdFx0XHRcdF8uaG9va3MucnVuKCdhZnRlci1oaWdobGlnaHQnLCBlbnYpO1xuXHRcdFx0fTtcblxuXHRcdFx0d29ya2VyLnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0bGFuZ3VhZ2U6IGVudi5sYW5ndWFnZSxcblx0XHRcdFx0Y29kZTogZW52LmNvZGVcblx0XHRcdH0pKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRlbnYuaGlnaGxpZ2h0ZWRDb2RlID0gXy5oaWdobGlnaHQoZW52LmNvZGUsIGVudi5ncmFtbWFyLCBlbnYubGFuZ3VhZ2UpXG5cblx0XHRcdF8uaG9va3MucnVuKCdiZWZvcmUtaW5zZXJ0JywgZW52KTtcblxuXHRcdFx0ZW52LmVsZW1lbnQuaW5uZXJIVE1MID0gZW52LmhpZ2hsaWdodGVkQ29kZTtcblxuXHRcdFx0Y2FsbGJhY2sgJiYgY2FsbGJhY2suY2FsbChlbGVtZW50KTtcblxuXHRcdFx0Xy5ob29rcy5ydW4oJ2FmdGVyLWhpZ2hsaWdodCcsIGVudik7XG5cdFx0fVxuXHR9LFxuXG5cdGhpZ2hsaWdodDogZnVuY3Rpb24gKHRleHQsIGdyYW1tYXIsIGxhbmd1YWdlKSB7XG5cdFx0dmFyIHRva2VucyA9IF8udG9rZW5pemUodGV4dCwgZ3JhbW1hcik7XG5cdFx0cmV0dXJuIFRva2VuLnN0cmluZ2lmeShfLnV0aWwuZW5jb2RlKHRva2VucyksIGxhbmd1YWdlKTtcblx0fSxcblxuXHR0b2tlbml6ZTogZnVuY3Rpb24odGV4dCwgZ3JhbW1hciwgbGFuZ3VhZ2UpIHtcblx0XHR2YXIgVG9rZW4gPSBfLlRva2VuO1xuXG5cdFx0dmFyIHN0cmFyciA9IFt0ZXh0XTtcblxuXHRcdHZhciByZXN0ID0gZ3JhbW1hci5yZXN0O1xuXG5cdFx0aWYgKHJlc3QpIHtcblx0XHRcdGZvciAodmFyIHRva2VuIGluIHJlc3QpIHtcblx0XHRcdFx0Z3JhbW1hclt0b2tlbl0gPSByZXN0W3Rva2VuXTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsZXRlIGdyYW1tYXIucmVzdDtcblx0XHR9XG5cblx0XHR0b2tlbmxvb3A6IGZvciAodmFyIHRva2VuIGluIGdyYW1tYXIpIHtcblx0XHRcdGlmKCFncmFtbWFyLmhhc093blByb3BlcnR5KHRva2VuKSB8fCAhZ3JhbW1hclt0b2tlbl0pIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBwYXR0ZXJucyA9IGdyYW1tYXJbdG9rZW5dO1xuXHRcdFx0cGF0dGVybnMgPSAoXy51dGlsLnR5cGUocGF0dGVybnMpID09PSBcIkFycmF5XCIpID8gcGF0dGVybnMgOiBbcGF0dGVybnNdO1xuXG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHBhdHRlcm5zLmxlbmd0aDsgKytqKSB7XG5cdFx0XHRcdHZhciBwYXR0ZXJuID0gcGF0dGVybnNbal0sXG5cdFx0XHRcdFx0aW5zaWRlID0gcGF0dGVybi5pbnNpZGUsXG5cdFx0XHRcdFx0bG9va2JlaGluZCA9ICEhcGF0dGVybi5sb29rYmVoaW5kLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmRMZW5ndGggPSAwLFxuXHRcdFx0XHRcdGFsaWFzID0gcGF0dGVybi5hbGlhcztcblxuXHRcdFx0XHRwYXR0ZXJuID0gcGF0dGVybi5wYXR0ZXJuIHx8IHBhdHRlcm47XG5cblx0XHRcdFx0Zm9yICh2YXIgaT0wOyBpPHN0cmFyci5sZW5ndGg7IGkrKykgeyAvLyBEb27igJl0IGNhY2hlIGxlbmd0aCBhcyBpdCBjaGFuZ2VzIGR1cmluZyB0aGUgbG9vcFxuXG5cdFx0XHRcdFx0dmFyIHN0ciA9IHN0cmFycltpXTtcblxuXHRcdFx0XHRcdGlmIChzdHJhcnIubGVuZ3RoID4gdGV4dC5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIFNvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCBBQk9SVCwgQUJPUlQhXG5cdFx0XHRcdFx0XHRicmVhayB0b2tlbmxvb3A7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHN0ciBpbnN0YW5jZW9mIFRva2VuKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRwYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG5cblx0XHRcdFx0XHR2YXIgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMoc3RyKTtcblxuXHRcdFx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRcdFx0aWYobG9va2JlaGluZCkge1xuXHRcdFx0XHRcdFx0XHRsb29rYmVoaW5kTGVuZ3RoID0gbWF0Y2hbMV0ubGVuZ3RoO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgZnJvbSA9IG1hdGNoLmluZGV4IC0gMSArIGxvb2tiZWhpbmRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hbMF0uc2xpY2UobG9va2JlaGluZExlbmd0aCksXG5cdFx0XHRcdFx0XHRcdGxlbiA9IG1hdGNoLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0dG8gPSBmcm9tICsgbGVuLFxuXHRcdFx0XHRcdFx0XHRiZWZvcmUgPSBzdHIuc2xpY2UoMCwgZnJvbSArIDEpLFxuXHRcdFx0XHRcdFx0XHRhZnRlciA9IHN0ci5zbGljZSh0byArIDEpO1xuXG5cdFx0XHRcdFx0XHR2YXIgYXJncyA9IFtpLCAxXTtcblxuXHRcdFx0XHRcdFx0aWYgKGJlZm9yZSkge1xuXHRcdFx0XHRcdFx0XHRhcmdzLnB1c2goYmVmb3JlKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dmFyIHdyYXBwZWQgPSBuZXcgVG9rZW4odG9rZW4sIGluc2lkZT8gXy50b2tlbml6ZShtYXRjaCwgaW5zaWRlKSA6IG1hdGNoLCBhbGlhcyk7XG5cblx0XHRcdFx0XHRcdGFyZ3MucHVzaCh3cmFwcGVkKTtcblxuXHRcdFx0XHRcdFx0aWYgKGFmdGVyKSB7XG5cdFx0XHRcdFx0XHRcdGFyZ3MucHVzaChhZnRlcik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoc3RyYXJyLCBhcmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gc3RyYXJyO1xuXHR9LFxuXG5cdGhvb2tzOiB7XG5cdFx0YWxsOiB7fSxcblxuXHRcdGFkZDogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgaG9va3MgPSBfLmhvb2tzLmFsbDtcblxuXHRcdFx0aG9va3NbbmFtZV0gPSBob29rc1tuYW1lXSB8fCBbXTtcblxuXHRcdFx0aG9va3NbbmFtZV0ucHVzaChjYWxsYmFjayk7XG5cdFx0fSxcblxuXHRcdHJ1bjogZnVuY3Rpb24gKG5hbWUsIGVudikge1xuXHRcdFx0dmFyIGNhbGxiYWNrcyA9IF8uaG9va3MuYWxsW25hbWVdO1xuXG5cdFx0XHRpZiAoIWNhbGxiYWNrcyB8fCAhY2FsbGJhY2tzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGZvciAodmFyIGk9MCwgY2FsbGJhY2s7IGNhbGxiYWNrID0gY2FsbGJhY2tzW2krK107KSB7XG5cdFx0XHRcdGNhbGxiYWNrKGVudik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgVG9rZW4gPSBfLlRva2VuID0gZnVuY3Rpb24odHlwZSwgY29udGVudCwgYWxpYXMpIHtcblx0dGhpcy50eXBlID0gdHlwZTtcblx0dGhpcy5jb250ZW50ID0gY29udGVudDtcblx0dGhpcy5hbGlhcyA9IGFsaWFzO1xufTtcblxuVG9rZW4uc3RyaW5naWZ5ID0gZnVuY3Rpb24obywgbGFuZ3VhZ2UsIHBhcmVudCkge1xuXHRpZiAodHlwZW9mIG8gPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT0gJ1tvYmplY3QgQXJyYXldJykge1xuXHRcdHJldHVybiBvLm1hcChmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gVG9rZW4uc3RyaW5naWZ5KGVsZW1lbnQsIGxhbmd1YWdlLCBvKTtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdHZhciBlbnYgPSB7XG5cdFx0dHlwZTogby50eXBlLFxuXHRcdGNvbnRlbnQ6IFRva2VuLnN0cmluZ2lmeShvLmNvbnRlbnQsIGxhbmd1YWdlLCBwYXJlbnQpLFxuXHRcdHRhZzogJ3NwYW4nLFxuXHRcdGNsYXNzZXM6IFsndG9rZW4nLCBvLnR5cGVdLFxuXHRcdGF0dHJpYnV0ZXM6IHt9LFxuXHRcdGxhbmd1YWdlOiBsYW5ndWFnZSxcblx0XHRwYXJlbnQ6IHBhcmVudFxuXHR9O1xuXG5cdGlmIChlbnYudHlwZSA9PSAnY29tbWVudCcpIHtcblx0XHRlbnYuYXR0cmlidXRlc1snc3BlbGxjaGVjayddID0gJ3RydWUnO1xuXHR9XG5cblx0aWYgKG8uYWxpYXMpIHtcblx0XHR2YXIgYWxpYXNlcyA9IF8udXRpbC50eXBlKG8uYWxpYXMpID09PSAnQXJyYXknID8gby5hbGlhcyA6IFtvLmFsaWFzXTtcblx0XHRBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShlbnYuY2xhc3NlcywgYWxpYXNlcyk7XG5cdH1cblxuXHRfLmhvb2tzLnJ1bignd3JhcCcsIGVudik7XG5cblx0dmFyIGF0dHJpYnV0ZXMgPSAnJztcblxuXHRmb3IgKHZhciBuYW1lIGluIGVudi5hdHRyaWJ1dGVzKSB7XG5cdFx0YXR0cmlidXRlcyArPSBuYW1lICsgJz1cIicgKyAoZW52LmF0dHJpYnV0ZXNbbmFtZV0gfHwgJycpICsgJ1wiJztcblx0fVxuXG5cdHJldHVybiAnPCcgKyBlbnYudGFnICsgJyBjbGFzcz1cIicgKyBlbnYuY2xhc3Nlcy5qb2luKCcgJykgKyAnXCIgJyArIGF0dHJpYnV0ZXMgKyAnPicgKyBlbnYuY29udGVudCArICc8LycgKyBlbnYudGFnICsgJz4nO1xuXG59O1xuXG5pZiAoIXNlbGYuZG9jdW1lbnQpIHtcblx0aWYgKCFzZWxmLmFkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHQvLyBpbiBOb2RlLmpzXG5cdFx0cmV0dXJuIHNlbGYuUHJpc207XG5cdH1cbiBcdC8vIEluIHdvcmtlclxuXHRzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldnQpIHtcblx0XHR2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpLFxuXHRcdCAgICBsYW5nID0gbWVzc2FnZS5sYW5ndWFnZSxcblx0XHQgICAgY29kZSA9IG1lc3NhZ2UuY29kZTtcblxuXHRcdHNlbGYucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoXy51dGlsLmVuY29kZShfLnRva2VuaXplKGNvZGUsIF8ubGFuZ3VhZ2VzW2xhbmddKSkpKTtcblx0XHRzZWxmLmNsb3NlKCk7XG5cdH0sIGZhbHNlKTtcblxuXHRyZXR1cm4gc2VsZi5QcmlzbTtcbn1cblxuLy8gR2V0IGN1cnJlbnQgc2NyaXB0IGFuZCBoaWdobGlnaHRcbnZhciBzY3JpcHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0Jyk7XG5cbnNjcmlwdCA9IHNjcmlwdFtzY3JpcHQubGVuZ3RoIC0gMV07XG5cbmlmIChzY3JpcHQpIHtcblx0Xy5maWxlbmFtZSA9IHNjcmlwdC5zcmM7XG5cblx0aWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgIXNjcmlwdC5oYXNBdHRyaWJ1dGUoJ2RhdGEtbWFudWFsJykpIHtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgXy5oaWdobGlnaHRBbGwpO1xuXHR9XG59XG5cbnJldHVybiBzZWxmLlByaXNtO1xuXG59KSgpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBQcmlzbTtcbn1cbiIsIlByaXNtLmxhbmd1YWdlcy5jc3Muc2VsZWN0b3IgPSB7XG5cdHBhdHRlcm46IC9bXlxce1xcfVxcc11bXlxce1xcfV0qKD89XFxzKlxceykvZyxcblx0aW5zaWRlOiB7XG5cdFx0J3BzZXVkby1lbGVtZW50JzogLzooPzphZnRlcnxiZWZvcmV8Zmlyc3QtbGV0dGVyfGZpcnN0LWxpbmV8c2VsZWN0aW9uKXw6OlstXFx3XSsvZyxcblx0XHQncHNldWRvLWNsYXNzJzogLzpbLVxcd10rKD86XFwoLipcXCkpPy9nLFxuXHRcdCdjbGFzcyc6IC9cXC5bLTpcXC5cXHddKy9nLFxuXHRcdCdpZCc6IC8jWy06XFwuXFx3XSsvZ1xuXHR9XG59O1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdjc3MnLCAnaWdub3JlJywge1xuXHQnaGV4Y29kZSc6IC8jW1xcZGEtZl17Myw2fS9naSxcblx0J2VudGl0eSc6IC9cXFxcW1xcZGEtZl17MSw4fS9naSxcblx0J251bWJlcic6IC9bXFxkJVxcLl0rL2dcbn0pOyIsIlByaXNtLmxhbmd1YWdlcy5jc3MgPSB7XG5cdCdjb21tZW50JzogL1xcL1xcKltcXHdcXFddKj9cXCpcXC8vZyxcblx0J2F0cnVsZSc6IHtcblx0XHRwYXR0ZXJuOiAvQFtcXHctXSs/Lio/KDt8KD89XFxzKnspKS9naSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCdwdW5jdHVhdGlvbic6IC9bOzpdL2dcblx0XHR9XG5cdH0sXG5cdCd1cmwnOiAvdXJsXFwoKFtcIiddPykuKj9cXDFcXCkvZ2ksXG5cdCdzZWxlY3Rvcic6IC9bXlxce1xcfVxcc11bXlxce1xcfTtdKig/PVxccypcXHspL2csXG5cdCdwcm9wZXJ0eSc6IC8oXFxifFxcQilbXFx3LV0rKD89XFxzKjopL2lnLFxuXHQnc3RyaW5nJzogLyhcInwnKShcXFxcPy4pKj9cXDEvZyxcblx0J2ltcG9ydGFudCc6IC9cXEIhaW1wb3J0YW50XFxiL2dpLFxuXHQncHVuY3R1YXRpb24nOiAvW1xce1xcfTs6XS9nLFxuXHQnZnVuY3Rpb24nOiAvWy1hLXowLTldKyg/PVxcKCkvaWdcbn07XG5cbmlmIChQcmlzbS5sYW5ndWFnZXMubWFya3VwKSB7XG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ21hcmt1cCcsICd0YWcnLCB7XG5cdFx0J3N0eWxlJzoge1xuXHRcdFx0cGF0dGVybjogLzxzdHlsZVtcXHdcXFddKj8+W1xcd1xcV10qPzxcXC9zdHlsZT4vaWcsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J3RhZyc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvPHN0eWxlW1xcd1xcV10qPz58PFxcL3N0eWxlPi9pZyxcblx0XHRcdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAudGFnLmluc2lkZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMuY3NzXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0iLCJQcmlzbS5sYW5ndWFnZXMuaHR0cCA9IHtcbiAgICAncmVxdWVzdC1saW5lJzoge1xuICAgICAgICBwYXR0ZXJuOiAvXihQT1NUfEdFVHxQVVR8REVMRVRFfE9QVElPTlN8UEFUQ0h8VFJBQ0V8Q09OTkVDVClcXGJcXHNodHRwcz86XFwvXFwvXFxTK1xcc0hUVFBcXC9bMC05Ll0rL2csXG4gICAgICAgIGluc2lkZToge1xuICAgICAgICAgICAgLy8gSFRUUCBWZXJiXG4gICAgICAgICAgICBwcm9wZXJ0eTogL15cXGIoUE9TVHxHRVR8UFVUfERFTEVURXxPUFRJT05TfFBBVENIfFRSQUNFfENPTk5FQ1QpXFxiL2csXG4gICAgICAgICAgICAvLyBQYXRoIG9yIHF1ZXJ5IGFyZ3VtZW50XG4gICAgICAgICAgICAnYXR0ci1uYW1lJzogLzpcXHcrL2dcbiAgICAgICAgfVxuICAgIH0sXG4gICAgJ3Jlc3BvbnNlLXN0YXR1cyc6IHtcbiAgICAgICAgcGF0dGVybjogL15IVFRQXFwvMS5bMDFdIFswLTldKy4qL2csXG4gICAgICAgIGluc2lkZToge1xuICAgICAgICAgICAgLy8gU3RhdHVzLCBlLmcuIDIwMCBPS1xuICAgICAgICAgICAgcHJvcGVydHk6IC9bMC05XStbQS1aXFxzLV0rJC9nXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIEhUVFAgaGVhZGVyIG5hbWVcbiAgICBrZXl3b3JkOiAvXltcXHctXSs6KD89LispL2dtXG59O1xuXG4vLyBDcmVhdGUgYSBtYXBwaW5nIG9mIENvbnRlbnQtVHlwZSBoZWFkZXJzIHRvIGxhbmd1YWdlIGRlZmluaXRpb25zXG52YXIgaHR0cExhbmd1YWdlcyA9IHtcbiAgICAnYXBwbGljYXRpb24vanNvbic6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0LFxuICAgICdhcHBsaWNhdGlvbi94bWwnOiBQcmlzbS5sYW5ndWFnZXMubWFya3VwLFxuICAgICd0ZXh0L3htbCc6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXAsXG4gICAgJ3RleHQvaHRtbCc6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXBcbn07XG5cbi8vIEluc2VydCBlYWNoIGNvbnRlbnQgdHlwZSBwYXJzZXIgdGhhdCBoYXMgaXRzIGFzc29jaWF0ZWQgbGFuZ3VhZ2Vcbi8vIGN1cnJlbnRseSBsb2FkZWQuXG5mb3IgKHZhciBjb250ZW50VHlwZSBpbiBodHRwTGFuZ3VhZ2VzKSB7XG4gICAgaWYgKGh0dHBMYW5ndWFnZXNbY29udGVudFR5cGVdKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge307XG4gICAgICAgIG9wdGlvbnNbY29udGVudFR5cGVdID0ge1xuICAgICAgICAgICAgcGF0dGVybjogbmV3IFJlZ0V4cCgnKGNvbnRlbnQtdHlwZTpcXFxccyonICsgY29udGVudFR5cGUgKyAnW1xcXFx3XFxcXFddKj8pXFxcXG5cXFxcbltcXFxcd1xcXFxXXSonLCAnZ2knKSxcbiAgICAgICAgICAgIGxvb2tiZWhpbmQ6IHRydWUsXG4gICAgICAgICAgICBpbnNpZGU6IHtcbiAgICAgICAgICAgICAgICByZXN0OiBodHRwTGFuZ3VhZ2VzW2NvbnRlbnRUeXBlXVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdodHRwJywgJ2tleXdvcmQnLCBvcHRpb25zKTtcbiAgICB9XG59XG4iLCJQcmlzbS5sYW5ndWFnZXMuamF2YSA9IFByaXNtLmxhbmd1YWdlcy5leHRlbmQoJ2NsaWtlJywge1xuXHQna2V5d29yZCc6IC9cXGIoYWJzdHJhY3R8Y29udGludWV8Zm9yfG5ld3xzd2l0Y2h8YXNzZXJ0fGRlZmF1bHR8Z290b3xwYWNrYWdlfHN5bmNocm9uaXplZHxib29sZWFufGRvfGlmfHByaXZhdGV8dGhpc3xicmVha3xkb3VibGV8aW1wbGVtZW50c3xwcm90ZWN0ZWR8dGhyb3d8Ynl0ZXxlbHNlfGltcG9ydHxwdWJsaWN8dGhyb3dzfGNhc2V8ZW51bXxpbnN0YW5jZW9mfHJldHVybnx0cmFuc2llbnR8Y2F0Y2h8ZXh0ZW5kc3xpbnR8c2hvcnR8dHJ5fGNoYXJ8ZmluYWx8aW50ZXJmYWNlfHN0YXRpY3x2b2lkfGNsYXNzfGZpbmFsbHl8bG9uZ3xzdHJpY3RmcHx2b2xhdGlsZXxjb25zdHxmbG9hdHxuYXRpdmV8c3VwZXJ8d2hpbGUpXFxiL2csXG5cdCdudW1iZXInOiAvXFxiMGJbMDFdK1xcYnxcXGIweFtcXGRhLWZdKlxcLj9bXFxkYS1mcFxcLV0rXFxifFxcYlxcZCpcXC4/XFxkK1tlXT9bXFxkXSpbZGZdXFxifFxcV1xcZCpcXC4/XFxkK1xcYi9naSxcblx0J29wZXJhdG9yJzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcLl0pKD86XFwrPXxcXCtcXCs/fC09fC0tP3whPT98PHsxLDJ9PT98PnsxLDN9PT98PT0/fCY9fCYmP3xcXHw9fFxcfFxcfD98XFw/fFxcKj0/fFxcLz0/fCU9P3xcXF49P3w6fH4pL2dtLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7IiwiUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHQgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjbGlrZScsIHtcblx0J2tleXdvcmQnOiAvXFxiKGJyZWFrfGNhc2V8Y2F0Y2h8Y2xhc3N8Y29uc3R8Y29udGludWV8ZGVidWdnZXJ8ZGVmYXVsdHxkZWxldGV8ZG98ZWxzZXxlbnVtfGV4cG9ydHxleHRlbmRzfGZhbHNlfGZpbmFsbHl8Zm9yfGZ1bmN0aW9ufGdldHxpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnxpbnN0YW5jZW9mfGludGVyZmFjZXxsZXR8bmV3fG51bGx8cGFja2FnZXxwcml2YXRlfHByb3RlY3RlZHxwdWJsaWN8cmV0dXJufHNldHxzdGF0aWN8c3VwZXJ8c3dpdGNofHRoaXN8dGhyb3d8dHJ1ZXx0cnl8dHlwZW9mfHZhcnx2b2lkfHdoaWxlfHdpdGh8eWllbGQpXFxiL2csXG5cdCdudW1iZXInOiAvXFxiLT8oMHhbXFxkQS1GYS1mXSt8XFxkKlxcLj9cXGQrKFtFZV0tP1xcZCspP3xOYU58LT9JbmZpbml0eSlcXGIvZ1xufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2phdmFzY3JpcHQnLCAna2V5d29yZCcsIHtcblx0J3JlZ2V4Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXi9dKVxcLyg/IVxcLykoXFxbLis/XXxcXFxcLnxbXi9cXHJcXG5dKStcXC9bZ2ltXXswLDN9KD89XFxzKigkfFtcXHJcXG4sLjt9KV0pKS9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cbmlmIChQcmlzbS5sYW5ndWFnZXMubWFya3VwKSB7XG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ21hcmt1cCcsICd0YWcnLCB7XG5cdFx0J3NjcmlwdCc6IHtcblx0XHRcdHBhdHRlcm46IC88c2NyaXB0W1xcd1xcV10qPz5bXFx3XFxXXSo/PFxcL3NjcmlwdD4vaWcsXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J3RhZyc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvPHNjcmlwdFtcXHdcXFddKj8+fDxcXC9zY3JpcHQ+L2lnLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcuaW5zaWRlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlc3Q6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cbiIsIlByaXNtLmxhbmd1YWdlcy5tYXJrdXAgPSB7XG5cdCdjb21tZW50JzogLzwhLS1bXFx3XFxXXSo/LS0+L2csXG5cdCdwcm9sb2cnOiAvPFxcPy4rP1xcPz4vLFxuXHQnZG9jdHlwZSc6IC88IURPQ1RZUEUuKz8+Lyxcblx0J2NkYXRhJzogLzwhXFxbQ0RBVEFcXFtbXFx3XFxXXSo/XV0+L2ksXG5cdCd0YWcnOiB7XG5cdFx0cGF0dGVybjogLzxcXC8/W1xcdzotXStcXHMqKD86XFxzK1tcXHc6LV0rKD86PSg/OihcInwnKShcXFxcP1tcXHdcXFddKSo/XFwxfFteXFxzJ1wiPj1dKykpP1xccyopKlxcLz8+L2dpLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3RhZyc6IHtcblx0XHRcdFx0cGF0dGVybjogL148XFwvP1tcXHc6LV0rL2ksXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9ePFxcLz8vLFxuXHRcdFx0XHRcdCduYW1lc3BhY2UnOiAvXltcXHctXSs/Oi9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdhdHRyLXZhbHVlJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvPSg/OignfFwiKVtcXHdcXFddKj8oXFwxKXxbXlxccz5dKykvZ2ksXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdwdW5jdHVhdGlvbic6IC89fD58XCIvZ1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J3B1bmN0dWF0aW9uJzogL1xcLz8+L2csXG5cdFx0XHQnYXR0ci1uYW1lJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvW1xcdzotXSsvZyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J25hbWVzcGFjZSc6IC9eW1xcdy1dKz86L1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cdH0sXG5cdCdlbnRpdHknOiAvXFwmIz9bXFxkYS16XXsxLDh9Oy9naVxufTtcblxuLy8gUGx1Z2luIHRvIG1ha2UgZW50aXR5IHRpdGxlIHNob3cgdGhlIHJlYWwgZW50aXR5LCBpZGVhIGJ5IFJvbWFuIEtvbWFyb3ZcblByaXNtLmhvb2tzLmFkZCgnd3JhcCcsIGZ1bmN0aW9uKGVudikge1xuXG5cdGlmIChlbnYudHlwZSA9PT0gJ2VudGl0eScpIHtcblx0XHRlbnYuYXR0cmlidXRlc1sndGl0bGUnXSA9IGVudi5jb250ZW50LnJlcGxhY2UoLyZhbXA7LywgJyYnKTtcblx0fVxufSk7XG4iLCJQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdwaHAnLCAndmFyaWFibGUnLCB7XG5cdCd0aGlzJzogL1xcJHRoaXMvZyxcblx0J2dsb2JhbCc6IC9cXCRfPyhHTE9CQUxTfFNFUlZFUnxHRVR8UE9TVHxGSUxFU3xSRVFVRVNUfFNFU1NJT058RU5WfENPT0tJRXxIVFRQX1JBV19QT1NUX0RBVEF8YXJnY3xhcmd2fHBocF9lcnJvcm1zZ3xodHRwX3Jlc3BvbnNlX2hlYWRlcikvZyxcblx0J3Njb3BlJzoge1xuXHRcdHBhdHRlcm46IC9cXGJbXFx3XFxcXF0rOjovZyxcblx0XHRpbnNpZGU6IHtcblx0XHRcdGtleXdvcmQ6IC8oc3RhdGljfHNlbGZ8cGFyZW50KS8sXG5cdFx0XHRwdW5jdHVhdGlvbjogLyg6OnxcXFxcKS9cblx0XHR9XG5cdH1cbn0pOyIsIi8qKlxuICogT3JpZ2luYWwgYnkgQWFyb24gSGFydW46IGh0dHA6Ly9hYWhhY3JlYXRpdmUuY29tLzIwMTIvMDcvMzEvcGhwLXN5bnRheC1oaWdobGlnaHRpbmctcHJpc20vXG4gKiBNb2RpZmllZCBieSBNaWxlcyBKb2huc29uOiBodHRwOi8vbWlsZXNqLm1lXG4gKlxuICogU3VwcG9ydHMgdGhlIGZvbGxvd2luZzpcbiAqIFx0XHQtIEV4dGVuZHMgY2xpa2Ugc3ludGF4XG4gKiBcdFx0LSBTdXBwb3J0IGZvciBQSFAgNS4zKyAobmFtZXNwYWNlcywgdHJhaXRzLCBnZW5lcmF0b3JzLCBldGMpXG4gKiBcdFx0LSBTbWFydGVyIGNvbnN0YW50IGFuZCBmdW5jdGlvbiBtYXRjaGluZ1xuICpcbiAqIEFkZHMgdGhlIGZvbGxvd2luZyBuZXcgdG9rZW4gY2xhc3NlczpcbiAqIFx0XHRjb25zdGFudCwgZGVsaW1pdGVyLCB2YXJpYWJsZSwgZnVuY3Rpb24sIHBhY2thZ2VcbiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMucGhwID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhbmR8b3J8eG9yfGFycmF5fGFzfGJyZWFrfGNhc2V8Y2Z1bmN0aW9ufGNsYXNzfGNvbnN0fGNvbnRpbnVlfGRlY2xhcmV8ZGVmYXVsdHxkaWV8ZG98ZWxzZXxlbHNlaWZ8ZW5kZGVjbGFyZXxlbmRmb3J8ZW5kZm9yZWFjaHxlbmRpZnxlbmRzd2l0Y2h8ZW5kd2hpbGV8ZXh0ZW5kc3xmb3J8Zm9yZWFjaHxmdW5jdGlvbnxpbmNsdWRlfGluY2x1ZGVfb25jZXxnbG9iYWx8aWZ8bmV3fHJldHVybnxzdGF0aWN8c3dpdGNofHVzZXxyZXF1aXJlfHJlcXVpcmVfb25jZXx2YXJ8d2hpbGV8YWJzdHJhY3R8aW50ZXJmYWNlfHB1YmxpY3xpbXBsZW1lbnRzfHByaXZhdGV8cHJvdGVjdGVkfHBhcmVudHx0aHJvd3xudWxsfGVjaG98cHJpbnR8dHJhaXR8bmFtZXNwYWNlfGZpbmFsfHlpZWxkfGdvdG98aW5zdGFuY2VvZnxmaW5hbGx5fHRyeXxjYXRjaClcXGIvaWcsXG5cdCdjb25zdGFudCc6IC9cXGJbQS1aMC05X117Mix9XFxiL2csXG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKShcXC9cXCpbXFx3XFxXXSo/XFwqXFwvfChefFteOl0pKFxcL1xcL3wjKS4qPyhcXHI/XFxufCQpKS9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICdrZXl3b3JkJywge1xuXHQnZGVsaW1pdGVyJzogLyhcXD8+fDxcXD9waHB8PFxcPykvaWcsXG5cdCd2YXJpYWJsZSc6IC8oXFwkXFx3KylcXGIvaWcsXG5cdCdwYWNrYWdlJzoge1xuXHRcdHBhdHRlcm46IC8oXFxcXHxuYW1lc3BhY2VcXHMrfHVzZVxccyspW1xcd1xcXFxdKy9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHRwdW5jdHVhdGlvbjogL1xcXFwvXG5cdFx0fVxuXHR9XG59KTtcblxuLy8gTXVzdCBiZSBkZWZpbmVkIGFmdGVyIHRoZSBmdW5jdGlvbiBwYXR0ZXJuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdwaHAnLCAnb3BlcmF0b3InLCB7XG5cdCdwcm9wZXJ0eSc6IHtcblx0XHRwYXR0ZXJuOiAvKC0+KVtcXHddKy9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fVxufSk7XG5cbi8vIEFkZCBIVE1MIHN1cHBvcnQgb2YgdGhlIG1hcmt1cCBsYW5ndWFnZSBleGlzdHNcbmlmIChQcmlzbS5sYW5ndWFnZXMubWFya3VwKSB7XG5cblx0Ly8gVG9rZW5pemUgYWxsIGlubGluZSBQSFAgYmxvY2tzIHRoYXQgYXJlIHdyYXBwZWQgaW4gPD9waHAgPz5cblx0Ly8gVGhpcyBhbGxvd3MgZm9yIGVhc3kgUEhQICsgbWFya3VwIGhpZ2hsaWdodGluZ1xuXHRQcmlzbS5ob29rcy5hZGQoJ2JlZm9yZS1oaWdobGlnaHQnLCBmdW5jdGlvbihlbnYpIHtcblx0XHRpZiAoZW52Lmxhbmd1YWdlICE9PSAncGhwJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGVudi50b2tlblN0YWNrID0gW107XG5cblx0XHRlbnYuYmFja3VwQ29kZSA9IGVudi5jb2RlO1xuXHRcdGVudi5jb2RlID0gZW52LmNvZGUucmVwbGFjZSgvKD86PFxcP3BocHw8XFw/KVtcXHdcXFddKj8oPzpcXD8+KS9pZywgZnVuY3Rpb24obWF0Y2gpIHtcblx0XHRcdGVudi50b2tlblN0YWNrLnB1c2gobWF0Y2gpO1xuXG5cdFx0XHRyZXR1cm4gJ3t7e1BIUCcgKyBlbnYudG9rZW5TdGFjay5sZW5ndGggKyAnfX19Jztcblx0XHR9KTtcblx0fSk7XG5cblx0Ly8gUmVzdG9yZSBlbnYuY29kZSBmb3Igb3RoZXIgcGx1Z2lucyAoZS5nLiBsaW5lLW51bWJlcnMpXG5cdFByaXNtLmhvb2tzLmFkZCgnYmVmb3JlLWluc2VydCcsIGZ1bmN0aW9uKGVudikge1xuXHRcdGlmIChlbnYubGFuZ3VhZ2UgPT09ICdwaHAnKSB7XG5cdFx0XHRlbnYuY29kZSA9IGVudi5iYWNrdXBDb2RlO1xuXHRcdFx0ZGVsZXRlIGVudi5iYWNrdXBDb2RlO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gUmUtaW5zZXJ0IHRoZSB0b2tlbnMgYWZ0ZXIgaGlnaGxpZ2h0aW5nXG5cdFByaXNtLmhvb2tzLmFkZCgnYWZ0ZXItaGlnaGxpZ2h0JywgZnVuY3Rpb24oZW52KSB7XG5cdFx0aWYgKGVudi5sYW5ndWFnZSAhPT0gJ3BocCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMCwgdDsgdCA9IGVudi50b2tlblN0YWNrW2ldOyBpKyspIHtcblx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlLnJlcGxhY2UoJ3t7e1BIUCcgKyAoaSArIDEpICsgJ319fScsIFByaXNtLmhpZ2hsaWdodCh0LCBlbnYuZ3JhbW1hciwgJ3BocCcpKTtcblx0XHR9XG5cblx0XHRlbnYuZWxlbWVudC5pbm5lckhUTUwgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlO1xuXHR9KTtcblxuXHQvLyBXcmFwIHRva2VucyBpbiBjbGFzc2VzIHRoYXQgYXJlIG1pc3NpbmcgdGhlbVxuXHRQcmlzbS5ob29rcy5hZGQoJ3dyYXAnLCBmdW5jdGlvbihlbnYpIHtcblx0XHRpZiAoZW52Lmxhbmd1YWdlID09PSAncGhwJyAmJiBlbnYudHlwZSA9PT0gJ21hcmt1cCcpIHtcblx0XHRcdGVudi5jb250ZW50ID0gZW52LmNvbnRlbnQucmVwbGFjZSgvKFxce1xce1xce1BIUFswLTldK1xcfVxcfVxcfSkvZywgXCI8c3BhbiBjbGFzcz1cXFwidG9rZW4gcGhwXFxcIj4kMTwvc3Bhbj5cIik7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBBZGQgdGhlIHJ1bGVzIGJlZm9yZSBhbGwgb3RoZXJzXG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3BocCcsICdjb21tZW50Jywge1xuXHRcdCdtYXJrdXAnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvPFteP11cXC8/KC4qPyk+L2csXG5cdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5tYXJrdXBcblx0XHR9LFxuXHRcdCdwaHAnOiAvXFx7XFx7XFx7UEhQWzAtOV0rXFx9XFx9XFx9L2dcblx0fSk7XG59XG4iLCJQcmlzbS5sYW5ndWFnZXMucHl0aG9uPSB7IFxuXHQnY29tbWVudCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkjLio/KFxccj9cXG58JCkvZyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCdzdHJpbmcnOiAvXCJcIlwiW1xcc1xcU10rP1wiXCJcInwoXCJ8JykoXFxcXD8uKSo/XFwxL2csXG5cdCdrZXl3b3JkJyA6IC9cXGIoYXN8YXNzZXJ0fGJyZWFrfGNsYXNzfGNvbnRpbnVlfGRlZnxkZWx8ZWxpZnxlbHNlfGV4Y2VwdHxleGVjfGZpbmFsbHl8Zm9yfGZyb218Z2xvYmFsfGlmfGltcG9ydHxpbnxpc3xsYW1iZGF8cGFzc3xwcmludHxyYWlzZXxyZXR1cm58dHJ5fHdoaWxlfHdpdGh8eWllbGQpXFxiL2csXG5cdCdib29sZWFuJyA6IC9cXGIoVHJ1ZXxGYWxzZSlcXGIvZyxcblx0J251bWJlcicgOiAvXFxiLT8oMHgpP1xcZCpcXC4/W1xcZGEtZl0rXFxiL2csXG5cdCdvcGVyYXRvcicgOiAvWy0rXXsxLDJ9fD0/Jmx0O3w9PyZndDt8IXw9ezEsMn18KCYpezEsMn18KCZhbXA7KXsxLDJ9fFxcfD9cXHx8XFw/fFxcKnxcXC98fnxcXF58JXxcXGIob3J8YW5kfG5vdClcXGIvZyxcblx0J2lnbm9yZScgOiAvJihsdHxndHxhbXApOy9naSxcblx0J3B1bmN0dWF0aW9uJyA6IC9be31bXFxdOygpLC46XS9nXG59O1xuXG4iLCIvKipcbiAqIE9yaWdpbmFsIGJ5IFNhbXVlbCBGbG9yZXNcbiAqXG4gKiBBZGRzIHRoZSBmb2xsb3dpbmcgbmV3IHRva2VuIGNsYXNzZXM6XG4gKiBcdFx0Y29uc3RhbnQsIGJ1aWx0aW4sIHZhcmlhYmxlLCBzeW1ib2wsIHJlZ2V4XG4gKi9cblByaXNtLmxhbmd1YWdlcy5ydWJ5ID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdjb21tZW50JzogLyNbXlxcclxcbl0qKFxccj9cXG58JCkvZyxcblx0J2tleXdvcmQnOiAvXFxiKGFsaWFzfGFuZHxCRUdJTnxiZWdpbnxicmVha3xjYXNlfGNsYXNzfGRlZnxkZWZpbmVfbWV0aG9kfGRlZmluZWR8ZG98ZWFjaHxlbHNlfGVsc2lmfEVORHxlbmR8ZW5zdXJlfGZhbHNlfGZvcnxpZnxpbnxtb2R1bGV8bmV3fG5leHR8bmlsfG5vdHxvcnxyYWlzZXxyZWRvfHJlcXVpcmV8cmVzY3VlfHJldHJ5fHJldHVybnxzZWxmfHN1cGVyfHRoZW58dGhyb3d8dHJ1ZXx1bmRlZnx1bmxlc3N8dW50aWx8d2hlbnx3aGlsZXx5aWVsZClcXGIvZyxcblx0J2J1aWx0aW4nOiAvXFxiKEFycmF5fEJpZ251bXxCaW5kaW5nfENsYXNzfENvbnRpbnVhdGlvbnxEaXJ8RXhjZXB0aW9ufEZhbHNlQ2xhc3N8RmlsZXxTdGF0fEZpbGV8Rml4bnVtfEZsb2FkfEhhc2h8SW50ZWdlcnxJT3xNYXRjaERhdGF8TWV0aG9kfE1vZHVsZXxOaWxDbGFzc3xOdW1lcmljfE9iamVjdHxQcm9jfFJhbmdlfFJlZ2V4cHxTdHJpbmd8U3RydWN0fFRNU3xTeW1ib2x8VGhyZWFkR3JvdXB8VGhyZWFkfFRpbWV8VHJ1ZUNsYXNzKVxcYi8sXG5cdCdjb25zdGFudCc6IC9cXGJbQS1aXVthLXpBLVpfMC05XSpbPyFdP1xcYi9nXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgncnVieScsICdrZXl3b3JkJywge1xuXHQncmVnZXgnOiB7XG5cdFx0cGF0dGVybjogLyhefFteL10pXFwvKD8hXFwvKShcXFsuKz9dfFxcXFwufFteL1xcclxcbl0pK1xcL1tnaW1dezAsM30oPz1cXHMqKCR8W1xcclxcbiwuO30pXSkpL2csXG5cdFx0bG9va2JlaGluZDogdHJ1ZVxuXHR9LFxuXHQndmFyaWFibGUnOiAvW0AkXStcXGJbYS16QS1aX11bYS16QS1aXzAtOV0qWz8hXT9cXGIvZyxcblx0J3N5bWJvbCc6IC86XFxiW2EtekEtWl9dW2EtekEtWl8wLTldKls/IV0/XFxiL2dcbn0pO1xuIiwiUHJpc20ubGFuZ3VhZ2VzLnNjc3MgPSBQcmlzbS5sYW5ndWFnZXMuZXh0ZW5kKCdjc3MnLCB7XG5cdCdjb21tZW50Jzoge1xuXHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKShcXC9cXCpbXFx3XFxXXSo/XFwqXFwvfFxcL1xcLy4qPyhcXHI/XFxufCQpKS9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0Ly8gYXR1cmxlIGlzIGp1c3QgdGhlIEAqKiosIG5vdCB0aGUgZW50aXJlIHJ1bGUgKHRvIGhpZ2hsaWdodCB2YXIgJiBzdHVmZnMpXG5cdC8vICsgYWRkIGFiaWxpdHkgdG8gaGlnaGxpZ2h0IG51bWJlciAmIHVuaXQgZm9yIG1lZGlhIHF1ZXJpZXNcblx0J2F0cnVsZSc6IC9AW1xcdy1dKyg/PVxccysoXFwofFxce3w7KSkvZ2ksXG5cdC8vIHVybCwgY29tcGFzc2lmaWVkXG5cdCd1cmwnOiAvKFstYS16XSstKSp1cmwoPz1cXCgpL2dpLFxuXHQvLyBDU1Mgc2VsZWN0b3IgcmVnZXggaXMgbm90IGFwcHJvcHJpYXRlIGZvciBTYXNzXG5cdC8vIHNpbmNlIHRoZXJlIGNhbiBiZSBsb3QgbW9yZSB0aGluZ3MgKHZhciwgQCBkaXJlY3RpdmUsIG5lc3RpbmcuLilcblx0Ly8gYSBzZWxlY3RvciBtdXN0IHN0YXJ0IGF0IHRoZSBlbmQgb2YgYSBwcm9wZXJ0eSBvciBhZnRlciBhIGJyYWNlIChlbmQgb2Ygb3RoZXIgcnVsZXMgb3IgbmVzdGluZylcblx0Ly8gaXQgY2FuIGNvbnRhaW4gc29tZSBjYXJhY3RlcnMgdGhhdCBhcmVuJ3QgdXNlZCBmb3IgZGVmaW5pbmcgcnVsZXMgb3IgZW5kIG9mIHNlbGVjdG9yLCAmIChwYXJlbnQgc2VsZWN0b3IpLCBvciBpbnRlcnBvbGF0ZWQgdmFyaWFibGVcblx0Ly8gdGhlIGVuZCBvZiBhIHNlbGVjdG9yIGlzIGZvdW5kIHdoZW4gdGhlcmUgaXMgbm8gcnVsZXMgaW4gaXQgKCB7fSBvciB7XFxzfSkgb3IgaWYgdGhlcmUgaXMgYSBwcm9wZXJ0eSAoYmVjYXVzZSBhbiBpbnRlcnBvbGF0ZWQgdmFyXG5cdC8vIGNhbiBcInBhc3NcIiBhcyBhIHNlbGVjdG9yLSBlLmc6IHByb3BlciN7JGVydHl9KVxuXHQvLyB0aGlzIG9uZSB3YXMgYXJkIHRvIGRvLCBzbyBwbGVhc2UgYmUgY2FyZWZ1bCBpZiB5b3UgZWRpdCB0aGlzIG9uZSA6KVxuXHQnc2VsZWN0b3InOiAvKFteQDtcXHtcXH1cXChcXCldPyhbXkA7XFx7XFx9XFwoXFwpXXwmfFxcI1xce1xcJFstX1xcd10rXFx9KSspKD89XFxzKlxceyhcXH18XFxzfFteXFx9XSsoOnxcXHspW15cXH1dKykpL2dtXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnc2NzcycsICdhdHJ1bGUnLCB7XG5cdCdrZXl3b3JkJzogL0AoaWZ8ZWxzZSBpZnxlbHNlfGZvcnxlYWNofHdoaWxlfGltcG9ydHxleHRlbmR8ZGVidWd8d2FybnxtaXhpbnxpbmNsdWRlfGZ1bmN0aW9ufHJldHVybnxjb250ZW50KXwoPz1AZm9yXFxzK1xcJFstX1xcd10rXFxzKStmcm9tL2lcbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdzY3NzJywgJ3Byb3BlcnR5Jywge1xuXHQvLyB2YXIgYW5kIGludGVycG9sYXRlZCB2YXJzXG5cdCd2YXJpYWJsZSc6IC8oKFxcJFstX1xcd10rKXwoI1xce1xcJFstX1xcd10rXFx9KSkvaVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ3Njc3MnLCAnaWdub3JlJywge1xuXHQncGxhY2Vob2xkZXInOiAvJVstX1xcd10rL2ksXG5cdCdzdGF0ZW1lbnQnOiAvXFxCIShkZWZhdWx0fG9wdGlvbmFsKVxcYi9naSxcblx0J2Jvb2xlYW4nOiAvXFxiKHRydWV8ZmFsc2UpXFxiL2csXG5cdCdudWxsJzogL1xcYihudWxsKVxcYi9nLFxuXHQnb3BlcmF0b3InOiAvXFxzKyhbLStdezEsMn18PXsxLDJ9fCE9fFxcfD9cXHx8XFw/fFxcKnxcXC98XFwlKVxccysvZ1xufSk7XG4iLCJQcmlzbS5sYW5ndWFnZXMuc3FsPSB7IFxuXHQnY29tbWVudCc6IHtcblx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSkoXFwvXFwqW1xcd1xcV10qP1xcKlxcL3woKC0tKXwoXFwvXFwvKXwjKS4qPyhcXHI/XFxufCQpKS9nLFxuXHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0fSxcblx0J3N0cmluZycgOiB7XG5cdFx0cGF0dGVybjogLyhefFteQF0pKFwifCcpKFxcXFw/W1xcc1xcU10pKj9cXDIvZyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH0sXG5cdCd2YXJpYWJsZSc6IC9AW1xcdy4kXSt8QChcInwnfGApKFxcXFw/W1xcc1xcU10pKz9cXDEvZyxcblx0J2Z1bmN0aW9uJzogL1xcYig/OkNPVU5UfFNVTXxBVkd8TUlOfE1BWHxGSVJTVHxMQVNUfFVDQVNFfExDQVNFfE1JRHxMRU58Uk9VTkR8Tk9XfEZPUk1BVCkoPz1cXHMqXFwoKS9pZywgLy8gU2hvdWxkIHdlIGhpZ2hsaWdodCB1c2VyIGRlZmluZWQgZnVuY3Rpb25zIHRvbz9cblx0J2tleXdvcmQnOiAvXFxiKD86QUNUSU9OfEFERHxBRlRFUnxBTEdPUklUSE18QUxURVJ8QU5BTFlaRXxBUFBMWXxBU3xBU0N8QVVUSE9SSVpBVElPTnxCQUNLVVB8QkRCfEJFR0lOfEJFUktFTEVZREJ8QklHSU5UfEJJTkFSWXxCSVR8QkxPQnxCT09MfEJPT0xFQU58QlJFQUt8QlJPV1NFfEJUUkVFfEJVTEt8Qll8Q0FMTHxDQVNDQURFfENBU0NBREVEfENBU0V8Q0hBSU58Q0hBUiBWQVJZSU5HfENIQVJBQ1RFUiBWQVJZSU5HfENIRUNLfENIRUNLUE9JTlR8Q0xPU0V8Q0xVU1RFUkVEfENPQUxFU0NFfENPTFVNTnxDT0xVTU5TfENPTU1FTlR8Q09NTUlUfENPTU1JVFRFRHxDT01QVVRFfENPTk5FQ1R8Q09OU0lTVEVOVHxDT05TVFJBSU5UfENPTlRBSU5TfENPTlRBSU5TVEFCTEV8Q09OVElOVUV8Q09OVkVSVHxDUkVBVEV8Q1JPU1N8Q1VSUkVOVHxDVVJSRU5UX0RBVEV8Q1VSUkVOVF9USU1FfENVUlJFTlRfVElNRVNUQU1QfENVUlJFTlRfVVNFUnxDVVJTT1J8REFUQXxEQVRBQkFTRXxEQVRBQkFTRVN8REFURVRJTUV8REJDQ3xERUFMTE9DQVRFfERFQ3xERUNJTUFMfERFQ0xBUkV8REVGQVVMVHxERUZJTkVSfERFTEFZRUR8REVMRVRFfERFTll8REVTQ3xERVNDUklCRXxERVRFUk1JTklTVElDfERJU0FCTEV8RElTQ0FSRHxESVNLfERJU1RJTkNUfERJU1RJTkNUUk9XfERJU1RSSUJVVEVEfERPfERPVUJMRXxET1VCTEUgUFJFQ0lTSU9OfERST1B8RFVNTVl8RFVNUHxEVU1QRklMRXxEVVBMSUNBVEUgS0VZfEVMU0V8RU5BQkxFfEVOQ0xPU0VEIEJZfEVORHxFTkdJTkV8RU5VTXxFUlJMVkx8RVJST1JTfEVTQ0FQRXxFU0NBUEVEIEJZfEVYQ0VQVHxFWEVDfEVYRUNVVEV8RVhJVHxFWFBMQUlOfEVYVEVOREVEfEZFVENIfEZJRUxEU3xGSUxFfEZJTExGQUNUT1J8RklSU1R8RklYRUR8RkxPQVR8Rk9MTE9XSU5HfEZPUnxGT1IgRUFDSCBST1d8Rk9SQ0V8Rk9SRUlHTnxGUkVFVEVYVHxGUkVFVEVYVFRBQkxFfEZST018RlVMTHxGVU5DVElPTnxHRU9NRVRSWXxHRU9NRVRSWUNPTExFQ1RJT058R0xPQkFMfEdPVE98R1JBTlR8R1JPVVB8SEFORExFUnxIQVNIfEhBVklOR3xIT0xETE9DS3xJREVOVElUWXxJREVOVElUWV9JTlNFUlR8SURFTlRJVFlDT0x8SUZ8SUdOT1JFfElNUE9SVHxJTkRFWHxJTkZJTEV8SU5ORVJ8SU5OT0RCfElOT1VUfElOU0VSVHxJTlR8SU5URUdFUnxJTlRFUlNFQ1R8SU5UT3xJTlZPS0VSfElTT0xBVElPTiBMRVZFTHxKT0lOfEtFWXxLRVlTfEtJTEx8TEFOR1VBR0UgU1FMfExBU1R8TEVGVHxMSU1JVHxMSU5FTk98TElORVN8TElORVNUUklOR3xMT0FEfExPQ0FMfExPQ0t8TE9OR0JMT0J8TE9OR1RFWFR8TUFUQ0h8TUFUQ0hFRHxNRURJVU1CTE9CfE1FRElVTUlOVHxNRURJVU1URVhUfE1FUkdFfE1JRERMRUlOVHxNT0RJRklFUyBTUUwgREFUQXxNT0RJRll8TVVMVElMSU5FU1RSSU5HfE1VTFRJUE9JTlR8TVVMVElQT0xZR09OfE5BVElPTkFMfE5BVElPTkFMIENIQVIgVkFSWUlOR3xOQVRJT05BTCBDSEFSQUNURVJ8TkFUSU9OQUwgQ0hBUkFDVEVSIFZBUllJTkd8TkFUSU9OQUwgVkFSQ0hBUnxOQVRVUkFMfE5DSEFSfE5DSEFSIFZBUkNIQVJ8TkVYVHxOT3xOTyBTUUx8Tk9DSEVDS3xOT0NZQ0xFfE5PTkNMVVNURVJFRHxOVUxMSUZ8TlVNRVJJQ3xPRnxPRkZ8T0ZGU0VUU3xPTnxPUEVOfE9QRU5EQVRBU09VUkNFfE9QRU5RVUVSWXxPUEVOUk9XU0VUfE9QVElNSVpFfE9QVElPTnxPUFRJT05BTExZfE9SREVSfE9VVHxPVVRFUnxPVVRGSUxFfE9WRVJ8UEFSVElBTHxQQVJUSVRJT058UEVSQ0VOVHxQSVZPVHxQTEFOfFBPSU5UfFBPTFlHT058UFJFQ0VESU5HfFBSRUNJU0lPTnxQUkVWfFBSSU1BUll8UFJJTlR8UFJJVklMRUdFU3xQUk9DfFBST0NFRFVSRXxQVUJMSUN8UFVSR0V8UVVJQ0t8UkFJU0VSUk9SfFJFQUR8UkVBRFMgU1FMIERBVEF8UkVBRFRFWFR8UkVBTHxSRUNPTkZJR1VSRXxSRUZFUkVOQ0VTfFJFTEVBU0V8UkVOQU1FfFJFUEVBVEFCTEV8UkVQTElDQVRJT058UkVRVUlSRXxSRVNUT1JFfFJFU1RSSUNUfFJFVFVSTnxSRVRVUk5TfFJFVk9LRXxSSUdIVHxST0xMQkFDS3xST1VUSU5FfFJPV0NPVU5UfFJPV0dVSURDT0x8Uk9XUz98UlRSRUV8UlVMRXxTQVZFfFNBVkVQT0lOVHxTQ0hFTUF8U0VMRUNUfFNFUklBTHxTRVJJQUxJWkFCTEV8U0VTU0lPTnxTRVNTSU9OX1VTRVJ8U0VUfFNFVFVTRVJ8U0hBUkUgTU9ERXxTSE9XfFNIVVRET1dOfFNJTVBMRXxTTUFMTElOVHxTTkFQU0hPVHxTT01FfFNPTkFNRXxTVEFSVHxTVEFSVElORyBCWXxTVEFUSVNUSUNTfFNUQVRVU3xTVFJJUEVEfFNZU1RFTV9VU0VSfFRBQkxFfFRBQkxFU3xUQUJMRVNQQUNFfFRFTVAoPzpPUkFSWSk/fFRFTVBUQUJMRXxURVJNSU5BVEVEIEJZfFRFWFR8VEVYVFNJWkV8VEhFTnxUSU1FU1RBTVB8VElOWUJMT0J8VElOWUlOVHxUSU5ZVEVYVHxUT3xUT1B8VFJBTnxUUkFOU0FDVElPTnxUUkFOU0FDVElPTlN8VFJJR0dFUnxUUlVOQ0FURXxUU0VRVUFMfFRZUEV8VFlQRVN8VU5CT1VOREVEfFVOQ09NTUlUVEVEfFVOREVGSU5FRHxVTklPTnxVTlBJVk9UfFVQREFURXxVUERBVEVURVhUfFVTQUdFfFVTRXxVU0VSfFVTSU5HfFZBTFVFfFZBTFVFU3xWQVJCSU5BUll8VkFSQ0hBUnxWQVJDSEFSQUNURVJ8VkFSWUlOR3xWSUVXfFdBSVRGT1J8V0FSTklOR1N8V0hFTnxXSEVSRXxXSElMRXxXSVRIfFdJVEggUk9MTFVQfFdJVEhJTnxXT1JLfFdSSVRFfFdSSVRFVEVYVClcXGIvZ2ksXG5cdCdib29sZWFuJzogL1xcYig/OlRSVUV8RkFMU0V8TlVMTClcXGIvZ2ksXG5cdCdudW1iZXInOiAvXFxiLT8oMHgpP1xcZCpcXC4/W1xcZGEtZl0rXFxiL2csXG5cdCdvcGVyYXRvcic6IC9cXGIoPzpBTEx8QU5EfEFOWXxCRVRXRUVOfEVYSVNUU3xJTnxMSUtFfE5PVHxPUnxJU3xVTklRVUV8Q0hBUkFDVEVSIFNFVHxDT0xMQVRFfERJVnxPRkZTRVR8UkVHRVhQfFJMSUtFfFNPVU5EUyBMSUtFfFhPUilcXGJ8Wy0rXXsxfXwhfFs9PD5dezEsMn18KCYpezEsMn18XFx8P1xcfHxcXD98XFwqfFxcLy9naSxcblx0J3B1bmN0dWF0aW9uJzogL1s7W1xcXSgpYCwuXS9nXG59OyIsInJlcXVpcmUoJ2NsaWVudC9wb2x5ZmlsbCcpO1xudmFyIGRlbGVnYXRlID0gcmVxdWlyZSgnY2xpZW50L2RlbGVnYXRlJyk7XG52YXIgcHJpc20gPSByZXF1aXJlKCdjbGllbnQvcHJpc20nKTtcbnZhciBjbG9zZXN0ID0gcmVxdWlyZSgnY2xpZW50L2RvbS9jbG9zZXN0Jyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIGluaXRUYXNrQnV0dG9ucygpO1xuICBwcmlzbSgpO1xufTtcblxuXG5mdW5jdGlvbiBpbml0VGFza0J1dHRvbnMoKSB7XG4gIC8vIHNvbHV0aW9uIGJ1dHRvblxuICBkZWxlZ2F0ZShkb2N1bWVudC5ib2R5LCAnLnRhc2tzX19zb2x1dGlvbicsICdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY2xvc2VzdChldmVudC50YXJnZXQsICcudGFza3NfX3Rhc2snKS5jbGFzc0xpc3QudG9nZ2xlKCd0YXNrc19fdGFza19hbnN3ZXJfb3BlbicpO1xuICB9KTtcblxuICAvLyBjbG9zZSBzb2x1dGlvbiBidXR0b25cbiAgZGVsZWdhdGUoZG9jdW1lbnQuYm9keSwgJy50YXNrc19fYW5zd2VyLWNsb3NlJywgJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjbG9zZXN0KGV2ZW50LnRhcmdldCwgJy50YXNrc19fdGFzaycpLmNsYXNzTGlzdC50b2dnbGUoJ3Rhc2tzX190YXNrX2Fuc3dlcl9vcGVuJyk7XG4gIH0pO1xuXG4gIC8vIGV2ZXJ5IHN0ZXAgYnV0dG9uIChpZiBhbnkgc3RlcHMpXG4gIGRlbGVnYXRlKGRvY3VtZW50LmJvZHksICcudGFza3NfX3N0ZXAtc2hvdycsICdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY2xvc2VzdChldmVudC50YXJnZXQsICcudGFza3NfX3N0ZXAnKS5jbGFzc0xpc3QudG9nZ2xlKCd0YXNrc19fc3RlcF9vcGVuJyk7XG4gIH0pO1xufVxuIl19
