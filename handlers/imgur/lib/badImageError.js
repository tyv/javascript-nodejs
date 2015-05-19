var inherits = require('inherits');

function BadImageError(msg) {
  Error.call(this, msg);
  this.message = msg;
  this.name = 'BadImageError';
}
inherits(BadImageError, Error);


module.exports = BadImageError;
