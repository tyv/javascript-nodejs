var Order = require('payments').Order;

// pending for a week => cancel without a notice
module.exports = function*(order) {
  if (order.created < new Date() - 7 * 24 * 86400 * 1e3) {
    yield order.persist({
      status: Order.STATUS_CANCEL
    });
  }
};
