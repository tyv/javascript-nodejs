
function OrderCreateError(message) {
  this.name = "OrderCreateError";
  this.message = message;
}

OrderCreateError.prototype = Object.create(Error.prototype);
OrderCreateError.prototype.constructor = OrderCreateError;

module.exports = OrderCreateError;
