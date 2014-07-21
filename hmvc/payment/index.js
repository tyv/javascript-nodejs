exports.loadOrderMiddleware = require('./lib/loadOrderMiddleware');
exports.loadTransactionMiddleware = require('./lib/loadTransactionMiddleware');

exports.loadMiddleware = function(field) {
  return function* (next) {
    yield* exports.loadTransactionMiddleware.call(this);
    yield* exports.loadOrderMiddleware.call(this);
    yield* next;
  };
};
