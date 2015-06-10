var co = require('co');
var gutil = require('gulp-util');
var Order = require('../models/order');

module.exports = function() {

  var args = require('yargs')
    .example('gulp payments:order:paid --number 484')
    .demand(['number'])
    .argv;

  return function() {

    return co(function*() {

      var order = yield Order.findOne({number: args.number}).exec();

      if (!order) {
        throw new Error("No order with number " + args.number);
      }

      if (order.status == Order.STATUS_SUCCESS && !args.force) {
        throw new Error("Order already success " + args.number);
      }

      yield* order.onPaid();

      yield order.persist({
        status: Order.STATUS_SUCCESS
      });

    });

  };
};

