var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var path = require('path');
const Transaction = require('../../models/transaction');
var invoiceConfig = require('config').payments.modules.invoice;
const moment = require('moment');
const priceInWords = require('textUtil/priceInWords');

exports.get = function*() {
  yield this.loadTransaction();

  if (!this.transaction) {
    this.log.debug("No transaction");
    this.throw(404);
  }

  if (this.transaction.status != Transaction.STATUS_PENDING || this.transaction.paymentMethod != 'invoice') {
    this.log.debug("Improper transaction", this.transaction.toObject());
    this.throw(400);
  }

  var orderModule = require(this.transaction.order.module);
  var invoiceDoc = yield orderModule.getAgreement(this.transaction);

  this.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  this.body = invoiceDoc.getZip().generate({type:"nodebuffer"});

};
