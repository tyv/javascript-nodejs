const payments = require('payments');
var OrderTemplate = payments.OrderTemplate;

exports.get = function*() {
  this.nocache();

  var orderTemplates = yield OrderTemplate.find({}).exec();

  this.locals.orderTemplates = orderTemplates;

  this.locals.sitetoolbar = true;
  this.locals.title = "Покупка учебника JavaScript";

  this.locals.user = this.req.user;

  this.locals.paymentMethods = {};
  for(var key in payments.methods) {
    this.locals.paymentMethods[key] = { name: key, title: payments.methods[key].title };
    delete this.locals.paymentMethods.banksimple; // not for ebook
  }

  this.body = this.render('new-order');
};
