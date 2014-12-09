// http://dom.spec.whatwg.org/#mutation-method-macro
function mutation(nodes) {
  if (!nodes.length) {
    throw new Error('DOM Exception 8');
  } else if (nodes.length === 1) {
    return typeof nodes[0] === 'string' ? document.createTextNode(nodes[0]) : nodes[0];
  } else {
    var
      fragment = document.createDocumentFragment(),
      length = nodes.length,
      index = -1,
      node;

    while (++index < length) {
      node = nodes[index];

      fragment.appendChild(typeof node === 'string' ? document.createTextNode(node) : node);
    }

    return fragment;
  }
}

var methods = {
  // safari = webkitMatchesSelector
  matches: Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector,
  replace: function replace() {
    if (this.parentNode) {
      this.parentNode.replaceChild(mutation(arguments), this);
    }
  },
  prepend: function prepend() {
    this.insertBefore(mutation(arguments), this.firstChild);
  },
  append: function append() {
    this.appendChild(mutation(arguments));
  },
  remove: function() {
    var parentNode = this.parentNode;
    if (parentNode) {
      return parentNode.removeChild(this);
    }
  },
  before: function before() {
    if (this.parentNode) {
      this.parentNode.insertBefore(mutation(arguments), this);
    }
  },

  after:   function after() {
    if (this.parentNode) {
      this.parentNode.insertBefore(mutation(arguments), this.nextSibling);
    }
  },
  closest: function(selector) {
    var node = this;

    while (node) {
      if (node.matches(selector)) return node;
      else node = node.parentElement;
    }
    return null;
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
      bubbles:    false,
      cancelable: false,
      detail:     undefined
    };
    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };

  CustomEvent.prototype = Object.create(window.Event.prototype);
}

