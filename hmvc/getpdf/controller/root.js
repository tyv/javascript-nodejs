exports.get = function*(next) {

  this.locals.paymentMethods = require('../paymentMethods').methods;

  this.render(__dirname, 'root');
};
