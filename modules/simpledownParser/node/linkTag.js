var CompositeTag = require('./compositeTag');
var inherits = require('inherits');

/**
 * ReferenceTag is an unresolved link
 * It should be transformed to TagNode when all [ref]'s are ready
 */
function LinkTag(children, attrs) {
  if (typeof attrs.href != "string") {
    throw new Error("Href must be a string");
  }

  CompositeTag.call(this, "a", children, attrs);
}
inherits(LinkTag, CompositeTag);

LinkTag.prototype.getType = function() {
  return 'LinkTag';
};

module.exports = LinkTag;

