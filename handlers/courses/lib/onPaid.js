const Order = require('payments').Order;
const path = require('path');
const log = require('log')();
const sendMail = require('mailer').send;
const CourseInvite = require('../models/courseInvite');
const CourseGroup = require('../models/courseGroup');
const sendOrderInvites = require('./sendOrderInvites');

// not a middleware
// can be called from CRON
module.exports = function* (order) {

  yield Order.populate(order, {path: 'user'});

  var group = yield CourseGroup.findById(order.data.group).exec();

  var emails = order.data.emails;

  // order.user is the only one registered person, we know all about him
  var orderUserIsParticipant = ~emails.indexOf(order.user.email);

  // is there anyone except the user?
  var orderHasParticipantsExceptUser = emails.length > 1 || emails[0] != order.user.email;

  yield sendMail({
    templatePath: path.join(__dirname, '..', 'templates', 'success-email'),
    from: 'orders',
    to: order.email,
    orderNumber: order.number,
    subject: "Подтверждение оплаты за курс, заказ " + order.number,
    orderUserIsParticipant: orderUserIsParticipant,
    orderHasOtherParticipants: orderHasParticipantsExceptUser
  });


  if (orderUserIsParticipant) {
    group.participants.push({
      user: order.user._id,
      courseName: order.data.contactName
    });
    yield group.persist();
  }

  yield* sendOrderInvites(order);

  order.status = Order.STATUS_SUCCESS;

  yield order.persist();

  log.debug("Order success: " + order.number);
};
