var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var path = require('path');
var invoiceConfig = require('config').payments.modules.invoice;
const moment = require('moment');

// Load the docx file as a binary
// @see https://github.com/open-xml-templating/docxtemplater
var docContent = fs.readFileSync(path.join(__dirname, "doc/agreement.docx"), "binary");

// this.transaction exists
module.exports = function(transaction) {

  var invoiceDoc = new Docxtemplater(docContent);

  invoiceDoc.setData({
    COMPANY_NAME: invoiceConfig.COMPANY_NAME,
    INN: invoiceConfig.INN,
    ACCOUNT: invoiceConfig.ACCOUNT,
    BANK: invoiceConfig.BANK,
    CORR_ACC: invoiceConfig.CORR_ACC,
    BIK: invoiceConfig.BIK,
    TRANSACTION_NUMBER: String(this.transaction.number),
    TRANSACTION_DATE: moment(this.transaction.created).format('DD.MM.YYYY'),
    PAYMENT_DESCRIPTION: `Информационно-консультационные услуги`,
    AMOUNT: this.transaction.amount
  });

  // apply replacements
  invoiceDoc.render();

  return invoiceDoc;
};

