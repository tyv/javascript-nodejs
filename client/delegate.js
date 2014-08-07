require('./polyfill/dom4');

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
function delegate(topElement, selector, eventName, handler) {
  topElement.addEventListener(eventName, function(event) {
    var found = findDelegateTarget(event, selector);

    // currentTarget is read only, I can not overwrite it to the "found" element
    // Object.create wrapper would break event.preventDefault()
    // so, keep in mind:
    // --> event.currentTarget is always the top-level (delegating) element!
    // use "this" to get the found target

    event.delegateTarget = event.currentTarget; // for compat. with jQuery

    if (found) {
      handler.call(found, event);
    }
  });
}

module.exports = delegate;

