var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var path = require('path');
const Transaction = require('../../models/transaction');
var bankConfig = require('config').payments.modules.banksimple;
const moment = require('moment');

// Load the docx file as a binary
// @see https://github.com/open-xml-templating/docxtemplater
var invoiceDocContent = fs.readFileSync(path.join(__dirname, "course-invoice.docx"), "binary");

exports.get = function*() {
  yield this.loadTransaction();

  if (!this.transaction) {
    this.log.debug("No transaction");
    this.throw(404);
  }

  if (this.transaction.status != Transaction.STATUS_PENDING || this.transaction.paymentMethod != 'invoice') {
    this.log.debug("Improper TX", this.transaction.toObject());
  }

  var invoiceDoc = new Docxtemplater(invoiceDocContent);

  invoiceDoc.setData({
    COMPANY_NAME: bankConfig.COMPANY_NAME,
    INN: bankConfig.INN,
    ACCOUNT: bankConfig.ACCOUNT,
    BANK: bankConfig.BANK,
    СORR_ACC: bankConfig.CORR_ACC,
    BIK: bankConfig.BIK,
    TRANSACTION_NUMBER: String(this.transaction.number),
    TRANSACTION_DATE: moment(this.transaction.created).format('DD.MM.YYYY'),
    PAYMENT_DESCRIPTION: `Информационно-консультационные услуги`,
    AMOUNT: this.transaction.amount
  });

  // apply replacements
  invoiceDoc.render();

  this.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  this.body = invoiceDoc.getZip().generate({type:"nodebuffer"});

};
