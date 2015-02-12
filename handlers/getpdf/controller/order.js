const payments = require('payments');
var Order = payments.Order;
var OrderTemplate = payments.OrderTemplate;
var Transaction = payments.Transaction;

exports.get = function*() {
  this.nocache();

  var orderTemplate = yield OrderTemplate.findOne({
    slug: this.params.orderTemplate
  }).exec();

  if (!orderTemplate) {
    this.throw(404);
  }

  this.locals.orderTemplate = this.params.orderTemplate;

  // this order is not saved anywhere,
  // it's only used to initially fill the form
  // order.isNew = true!
  this.order = Order.createFromTemplate(orderTemplate, {
    module: 'getpdf',
    itemUrl: '/getpdf/' + orderTemplate.slug,
    user:   this.req.user && this.req.user._id,
    email: this.req.user ? this.req.user.email : ''
  });

  this.locals.sitetoolbar = true;
  this.locals.title = "Покупка: " + this.order.title;

  this.locals.order = this.order;

  this.locals.user = this.req.user;

  this.locals.paymentMethods = {};
  for(var key in payments.methods) {
    this.locals.paymentMethods[key] = { name: key, title: payments.methods[key].title };
  }

  this.body = this.render('order');
};
