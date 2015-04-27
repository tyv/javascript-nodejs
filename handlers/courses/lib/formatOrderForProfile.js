var CourseGroup = require('courses').CourseGroup;
var User = require('users').User;
var _ = require('lodash');
var getOrderInfo = require('payments').getOrderInfo;

module.exports = function* formatCourseOrder(order) {

  var group = yield CourseGroup.findOne({
    slug: order.data.slug
  }).populate('course').exec();

  if (!group) {
    this.log.error("Not found group for order", order.toObject());
    this.throw(404);
  }

  var users = yield User.find({
    email: {
      $in: order.emails
    }
  }).exec();

  var usersByEmail = _.groupBy(users, function(user) {
    return user.email;
  });

  var groupParticipantsByUser = _.groupBy(group.participants, function(participant) {
    return participant.user;
  });

  var orderToShow = {
    created:      order.created,
    title:        group.title,
    number:       order.number,
    module:       order.module,
    amount:       order.amount,
    count:        order.data.count,
    contactName:  order.data.contactName,
    contactPhone: order.data.contactPhone,
    participants: order.emails.map(function(email) {
      return {
        email:    email,
        accepted: Boolean(groupParticipantsByUser[usersByEmail[email]._id])
      };
    })

  };

  var orderInfo = yield* getOrderInfo(order);

  orderToShow.orderInfo = _.pluck(orderInfo, ['status', 'statusText', 'accent', 'description', 'linkToProfile']);

  return orderToShow;
};
