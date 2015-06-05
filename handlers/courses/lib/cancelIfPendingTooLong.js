var Order = require('payments').Order;
var User = require('users').User;
var CourseGroup = require('../models/courseGroup');
var assert = require('assert');
const mailer = require('mailer');
var gutil = require('gulp-util');
var path = require('path');

// pending for a week => cancel without a notice
module.exports = function*(order) {

  assert(order.user);

  // wait for a week, do nothing

  if (order.created > new Date() - 7 * 24 * 86400 * 1e3) {
    return;
  }

  var ordersSameGroupAndUser = yield Order.find({
    user:         order.user,
    'data.group': order.data.group
  }).exec();

  var orderSuccessSameGroupAndUser = ordersSameGroupAndUser.filter(function(order) {
    return order.status == Order.STATUS_SUCCESS;
  })[0];

  var orderUser = yield User.findById(order.user).exec();
  var orderGroup = yield CourseGroup.findById(order.data.group).exec();

  assert(orderGroup);
  assert(orderUser);

  yield* mailer.send({
    from:                         'orders',
    templatePath:                 path.join(__dirname, '../templates/orderCancelEmail'),
    to:                           [{email: orderUser.email}],
    orderSuccessSameGroupAndUser: orderSuccessSameGroupAndUser,
    orderUser:                    orderUser,
    orderGroup:                   orderGroup,
    order:                        order,
    subject:                      "[Курсы, система регистрации] Отмена заказа " + order.number + " на сайте javascript.ru"
  });

  gutil.log("Sent letter to " + orderUser.email);


  yield order.persist({
    status: Order.STATUS_CANCEL
  });

};
