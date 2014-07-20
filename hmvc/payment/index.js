var mongoose = require('mongoose');
var Transaction = mongoose.model.Transaction;

exports.createTransaction = function* (amount, orderNum, type) {
  return yield new Transaction({
    amount: amount,
    orderNum: orderNum,
    paymentType: type
  }).persist();
};

