var CourseGroup = require('courses').CourseGroup;
var CourseParticipant = require('courses').CourseParticipant;
var User = require('users').User;
var _ = require('lodash');
var getOrderInfo = require('payments').getOrderInfo;
var paymentMethods = require('./paymentMethods');

module.exports = function* formatCourseOrder(order) {

  var group = yield CourseGroup.findById(order.data.group).populate('course');

  if (!group) {
    this.log.error("Not found group for order", order.toObject());
    this.throw(404);
  }

  var users = yield User.find({
    email: {
      $in: order.data.emails
    }
  });

  var usersByEmail = _.indexBy(users, 'email');

  var groupParticipants = yield CourseParticipant.find({group: order.data.group});

  var groupParticipantsByUser = _.indexBy(groupParticipants, 'user');

  var orderToShow = {
    created:      order.created,
    title:        group.title,
    number:       order.number,
    module:       order.module,
    amount:       order.amount,
    count:        order.data.count,
    contactName:  order.data.contactName,
    contactPhone: order.data.contactPhone,
    courseUrl:    group.course.getUrl(),
    participants: order.data.emails.map(function(email) {
      return {
        email:    email,
        inGroup: Boolean(usersByEmail[email] && groupParticipantsByUser[usersByEmail[email]._id])
      };
    })

  };

  var orderInfo = yield* getOrderInfo(order);

  orderToShow.orderInfo = _.pick(orderInfo, ['status', 'statusText', 'descriptionProfile']);

  if (orderInfo.transaction) {
    orderToShow.paymentMethod = paymentMethods[orderInfo.transaction.paymentMethod].title;
  }

  return orderToShow;
};
