var paymentMethods = require('../../lib/methods');
var Order = require('../../models/order');
var OrderTemplate = require('../../models/orderTemplate');
var OrderCreateError = require('../../lib/orderCreateError');

/**
 * The order form is sent to checkout when it's 100% valid (client-side code validated it)
 * It uses order.module.createOrderFromTemplate to create an order, it can throw if something's wrong
 * the order CANNOT be changed after submitting to payment
 * @param next
 */
exports.get = function*(next) {

  var user = this.params.userById;

  if (String(this.req.user._id) != String(user._id)) {
    this.throw(403);
  }

  var orders = yield* Order.find({user: user._id}).sort({created: 1}).exec();

  this.body = {};
  /*
  // TODO: SHOW ORDERS FOR ANGULAR CONTROLLER
  results = results.map(function(result) {
    return {
      created: result.created,
      quizTitle: result.quizTitle,
      quizUrl: result.quiz && result.quiz.getUrl(),
      score: result.score,
      level: result.level,
      levelTitle: result.levelTitle,
      time: result.time
    };
  });

  this.body = results;*/
};

