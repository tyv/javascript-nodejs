var co = require('co');
var gutil = require('gulp-util');
var Transaction = require('../models/transaction');
var Order = require('../models/order');

/**
 * Mark TX as paid
 * @returns {Function}
 */
module.exports = function() {

  var args = require('yargs')
    .example('gulp payments:transaction:paid --number 12345678')
    .demand(['number'])
    .argv;

  return function() {

    return co(function*() {

      var transaction = yield Transaction.findOne({number: args.number}).populate('order').exec();

      if (!transaction) {
        throw new Error("No transaction with number " + args.number);
      }


      if (transaction.order.status == Order.STATUS_PAID && !args.force) {
        throw new Error("Order already paid " + transaction.order.number);
      }

      yield transaction.log('payments:transaction:paid');

      yield transaction.persist({
        status: Transaction.STATUS_SUCCESS
      });

      transaction.order.status = Order.STATUS_PAID;

      yield* transaction.order.onPaid();

    });

  };
};

