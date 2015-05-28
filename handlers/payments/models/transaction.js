var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var TransactionLog = require('./transactionLog');

/**
 * Transaction is an actual payment attempt (successful or not) for something
 * - Order may exist without any transactions (pay later)
 * - Transaction has it's own separate number (payment attempt)
 * - Transaction amount can be different from order amount (partial payment)
 * - Every transaction save generates a log record
 * @type {Schema}
 */
var schema = new Schema({
  order:         {
    type: Schema.Types.ObjectId,
    ref:  'Order',
    required: true
  },
  amount:        {
    type:     Number,
    required: true
  },

  // which method created this TX
  paymentMethod:        {
    type:     String,
    required: true
  },

  currency: {
    // sometimes needed, e.g. paypal allows many currencies
    type:   String,
    enum: ['USD', 'EUR', 'RUB']
  },
  // payment method may initiate the payment
  // and provide the token value to track it
  // other details are also possible
  paymentDetails: {
    type: {
      nextRetry: Number, // for Ya.Money processPayments
      processing: Boolean, // for Ya.Money processPayments & Paypal PDT/IPN locking not to onPaid twice,
      oauthToken: String, // for Ya.Money processPayments
      requestId: String, //  for Ya.Money processPayments,

      // for invoices
      companyName: String,
      agreementRequired: Boolean,
      contractHead: String,
      companyAddress: String,
      bankDetails: String
    },
    default: {}
  },

  // transaction number, external analog for _id
  // always a number to be accepted by any payment system
  // random, not autoincrement, because more convenient for development, doesn't repeat on dropdb
  number: {
    type: Number,
    default: function() {
      // webmoney requires transaction number to be a number 0 < LMI_PAYMENT_NO < 2147483647
      return parseInt(crypto.randomBytes(4).toString('hex'), 16) % 2147483647;
    },
    unique: true
  },
  created:       {
    type:    Date,
    required: true,
    default: Date.now
  },
  modified:       {
    type:    Date
  },
  status:        {
    type: String,
    required: true
  },
  statusMessage: {
    type: String
  }
});

// Awaiting for the payment system callback,
// when the user opens the order, let him wait and refresh the page
// we don't know if it's an offline payment or not
schema.statics.STATUS_PENDING = 'pending';

schema.statics.STATUS_SUCCESS = 'success';

schema.statics.STATUS_FAIL = 'fail';

// autolog all changes
schema.pre('save', function logChanges(next) {

  var log = new TransactionLog({
    transaction: this._id,
    event:       'save',
    data:        {
      status:        this.status,
      statusMessage: this.statusMessage,
      amount:        this.amount
    }
  });

  log.save(function(err, doc) {
    next(err);
  });
});

schema.pre('save', function(next){
  this.modified = new Date();
  next();
});

// allow many failed transactions
// forbid many pending/successful
schema.pre('validate', function ensureSingleTransactionPerOrder(next) {
  Transaction.findOne({
    order: this.order,
    status: {
      $in: [
        Transaction.STATUS_PENDING,
        Transaction.STATUS_SUCCESS // enforce payment with a single tx
      ]
    },
    _id: {
      $ne: this._id
    }
  }, function (err, tx) {
    if (err) return next(err);
    if (tx) return next(new Error("A transaction " + tx._id + " with status " + tx.status + " already exists for the same order " + tx.order));
    next();
  });
});



/*
schema.methods.getStatusDescription = function() {
  if (this.status == Transaction.STATUS_SUCCESS) {
    return 'Оплата прошла успешно.';
  }
  if (this.status == Transaction.STATUS_PENDING) {
    return 'Оплата ожидается, о её успешномо окончании вы будете извещены по e-mail.';
  }

  if (this.status == Transaction.STATUS_FAIL) {
    var result = 'Оплата не прошла';
    if (this.statusMessage) result += ': ' + this.statusMessage;
    return result + '.';
  }

  if (!this.status) {
    return 'нет информации об оплате';
  }

  throw new Error("неподдерживаемый статус транзакции");
};
*/

schema.methods.logRequest = function*(event, request) {
  yield this.log(event, {url: request.originalUrl, body: request.body});
};

// log anything related to the transaction
schema.methods.log = function*(event, data) {

  if (typeof event != "string") {
    throw new Error("event name must be a string");
  }

  var options = {
    transaction: this._id,
    event: event,
    data: data
  };

  var log = new TransactionLog(options);
  yield log.persist();
};

/* jshint -W003 */
var Transaction = module.exports = mongoose.model('Transaction', schema);

