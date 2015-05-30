var co = require('co');
var gutil = require('gulp-util');
var Order = require('../models/order');

/**
 * Update prod build dir from master, rebuild and commit to prod
 * @returns {Function}
 */
module.exports = function() {

  var args = require('yargs')
    .example('gulp payments:order:paid --number 484')
    .demand(['number'])
    .argv;

  return function() {

    return co(function*() {

      var order = yield Order.findOne({number: args.number}).exec();

      order.status = Order.STATUS_PAID;

      yield* order.onPaid();

    });

  };
};

