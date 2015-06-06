var co = require('co');
var gutil = require('gulp-util');
var Order = require('../models/order');

/**
 * Update prod build dir from master, rebuild and commit to prod
 * @returns {Function}
 */
module.exports = function() {

  return function() {

    return co(function*() {

      var lastNumber = 0;
      while(true) {

        var order = yield Order.findOne({
          status: Order.STATUS_PENDING,
          number: { $gt: lastNumber }
        }).sort({number: 1}).exec();

        if (!order) break;
        lastNumber = order.number;

        yield* order.cancelIfPendingTooLong();
      }
    });

  };
};

