require('./matches');

function findDelegateTarget(event, selector) {
  var currentNode = event.target;

  while (currentNode) {
    if (currentNode.matches(selector)) {
      return currentNode;
    }

    if (currentNode != event.currentTarget) {
      currentNode = currentNode.parentElement;
    }
  }
  return null;
}

// IE doesn't have EventTarget, corresponding methods are in Node
var prototype = (window.EventTarget || Node).prototype;


prototype.on = function(eventName, selector, handler) {
  this.addEventListener(eventName, function(event) {
    var found = findDelegateTarget(event, selector);

    // currentTarget is read only, I can not fix it
    // Object.create wrapper would break event.preventDefault()
    // so, keep in mind:
    // --> event.currentTarget is top-level element!

    event.delegateTarget = event.currentTarget; // for copat. with jQuery
    if (found) {
      handler.call(found, event);
    }
  });
};

prototype.off = function() {
  throw new Error("Not implemented (you need it? write an issue)");
};
