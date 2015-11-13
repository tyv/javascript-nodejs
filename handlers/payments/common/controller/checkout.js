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
exports.post = function*(next) {

  yield* this.loadOrder();

  var paymentMethod = paymentMethods[this.request.body.paymentMethod];

  if (!paymentMethod) {
    this.throw(403, "Unsupported payment method");
  }

  if (!this.order) {
    // if we don't have the order in our database, then make a new one
    // (use the incoming order post for that, but don't trust all its fields)
    this.log.debug("new order, template:", this.request.body.orderTemplate);

    var orderTemplate = yield OrderTemplate.findOne({
      slug: this.request.body.orderTemplate
    }).exec();

    if (!orderTemplate) {
      this.throw(404);
    }

    this.log.debug("orderTemplate", orderTemplate);

    try {
      this.order = yield* require(orderTemplate.module).createOrderFromTemplate(orderTemplate, this.user, this.request.body);
    } catch (e) {
      if (e instanceof OrderCreateError) {
        this.status = 400;
        this.body = {
          message: e.message
        };
        return;
      } else {
        throw e;
      }
    }


    if (this.user && !~this.user.profileTabsEnabled.indexOf('orders')) {
      this.user.profileTabsEnabled.addToSet('orders');
      yield this.user.persist();
    }

    saveOrderNumberToSession(this.session, this.order);
  } else {

    // Many waiting transactions not allowed.
    // The old one must had been cancelled before this.
    yield* this.order.cancelPendingTransactions("смена способа оплаты.");

  }

  this.log.debug("order", this.order);

  // creates transaction and returns the form to submit for its payment OR the result
  var transaction = yield* paymentMethod.createTransaction(this.order, this.request.body);
  this.log.debug("new transaction", transaction.toObject());

  var form = yield* paymentMethod.renderForm(transaction, this.order);

  yield* transaction.log('form', form);

  this.body = {
    form: form,
    orderNumber: this.order.number
  };

};

function saveOrderNumberToSession(session, order) {
  if (!session.orders) {
    session.orders = [];
  }
  session.orders.push(order.number);
}
