var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var path = require('path');
const Transaction = require('../../models/transaction');
var bankConfig = require('config').payments.modules.banksimpleua;
const priceInWords = require('textUtil/priceInWords');
const moment = require('moment');

// Load the docx file as a binary
// @see https://github.com/open-xml-templating/docxtemplater
var invoiceDocContent = fs.readFileSync(path.join(__dirname, "invoice.docx"), "binary");

exports.get = function*() {
  yield this.loadTransaction();

  if (!this.transaction) {
    this.log.debug("No transaction");
    this.throw(404);
  }

  if (this.transaction.status != Transaction.STATUS_PENDING || this.transaction.paymentMethod != 'banksimpleua') {
    this.log.debug("Improper TX", this.transaction.toObject());
  }

  var invoiceDoc = new Docxtemplater(invoiceDocContent);

  invoiceDoc.setData({
    COMPANY_NAME: bankConfig.COMPANY_NAME,
    EDRPOU: bankConfig.EDRPOU,
    ACCOUNT: bankConfig.ACCOUNT,
    TRANSACTION_NUMBER: String(this.transaction.number),
    TRANSACTION_DATE: moment(this.transaction.created).format('DD.MM.YYYY'),
    PAYMENT_DESCRIPTION: `Информационно-консультационные услуги, счёт ${this.transaction.number}`,
    AMOUNT: this.transaction.amount,
    AMOUNT_WORDS: priceInWords(this.transaction.amount, 'ua')
  });

  // apply replacements
  invoiceDoc.render();

  this.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  this.body = invoiceDoc.getZip().generate({type:"nodebuffer"});

};
