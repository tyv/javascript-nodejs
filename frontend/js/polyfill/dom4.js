
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
  matches: Element.prototype.matchesSelector || Element.prototype.msMatchesSelector,
  prepend: function() {
    var node = mutationMacro(arguments);
    this.insertBefore(node, this.firstChild);
  },
  append: function() {
    this.appendChild(mutationMacro(arguments));
  },
  before: function() {
    var parentNode = this.parentNode;
    if (parentNode) {
      parentNode.insertBefore(mutationMacro(arguments), this);
    }
  },
  after: function() {
    var parentNode = this.parentNode,
        nextSibling = this.nextSibling,
        node = mutationMacro(arguments);
    if (parentNode) {
      parentNode.insertBefore(node, nextSibling);
    }
  },
  replace: function() {
      var parentNode = this.parentNode;
      if (parentNode) {
        parentNode.replaceChild(mutationMacro(arguments), this);
      }
  },
  remove: function() {
    var parentNode = this.parentNode;
    if (parentNode) {
      parentNode.removeChild(this);
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
} catch(e) {

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
