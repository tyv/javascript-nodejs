var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var path = require('path');
const Transaction = require('../../models/transaction');
var invoiceConfig = require('config').payments.modules.invoice;
const moment = require('moment');
const priceInWords = require('textUtil/priceInWords');

// Same generic invoice for all modules
var invoiceDocContent = fs.readFileSync(path.join(__dirname, "../doc/invoice.docx"), "binary");

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

  var invoiceDoc = getInvoice(this.transaction);

  this.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  this.body = invoiceDoc.getZip().generate({type:"nodebuffer"});

};

function getInvoice(transaction) {
  var invoiceDoc = new Docxtemplater(invoiceDocContent);

  var data = {
    COMPANY_NAME: invoiceConfig.COMPANY_NAME,
    COMPANY_ADDRESS: invoiceConfig.COMPANY_ADDRESS,
    INN: invoiceConfig.INN,
    ACCOUNT: invoiceConfig.ACCOUNT,
    BANK: invoiceConfig.BANK,
    CORR_ACC: invoiceConfig.CORR_ACC,
    BIK: invoiceConfig.BIK,
    TRANSACTION_NUMBER: String(transaction.number),
    TRANSACTION_DATE: moment(transaction.created).format('DD.MM.YYYY'),
    BUYER_COMPANY_NAME: transaction.paymentDetails.companyName,
    PAYMENT_DESCRIPTION: `Оплата за информационно-консультационные услуги по счёту ${transaction.number}`,
    AMOUNT: transaction.amount + 'р.',
    AMOUNT_IN_WORDS: priceInWords(transaction.amount),
    SIGN_TITLE: invoiceConfig.SIGN_TITLE,
    SIGN_NAME: invoiceConfig.SIGN_NAME,
    SIGN_SHORT_NAME: invoiceConfig.SIGN_SHORT_NAME
  };

  invoiceDoc.setData(data);

  // apply replacements
  invoiceDoc.render();

  return invoiceDoc;
}
