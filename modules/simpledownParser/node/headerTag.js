var VerbatimText = require('./verbatimText');
var inherits = require('inherits');

/**
 * HeaderTag comes from # HEADERS
 * It has preformatted text (actually, only `...` is allowed)
 */
function HeaderTag(level, anchor, text) {

  if (typeof level != "number") {
    throw new Error("Level must be a number");
  }

  if (typeof anchor != "string") {
    throw new Error("Anchor must be a string");
  }

  if (!anchor) {
    throw new Error("Anchor must not be empty!");
  }

  VerbatimText.call(this, text);

  this.level = level;
  this.anchor = anchor;
}
inherits(HeaderTag, VerbatimText);

HeaderTag.prototype.getType = function() {
  return 'HeaderTag';
};

module.exports = HeaderTag;
