var inherits = require('inherits');

function ParseError(tag, message) {
  Error.call(this, message);
  this.tag = tag;
  this.message = message;
  this.name = 'ParseError';
}

inherits(ParseError, Error);

module.exports = ParseError;
