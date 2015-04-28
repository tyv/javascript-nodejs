var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var path = require('path');
var invoiceConfig = require('config').payments.modules.invoice;
const moment = require('moment');
const CourseGroup = require('../models/courseGroup');

// Load the docx file as a binary
// @see https://github.com/open-xml-templating/docxtemplater
var docContent = fs.readFileSync(path.join(__dirname, "doc/agreement.docx"), "binary");

// this.transaction exists
module.exports = function*(transaction) {

  var invoiceDoc = new Docxtemplater(docContent);

  var group = yield CourseGroup.findById(transaction.order.data.group).exec();

  if (!group) {
    this.throw(400, "Нет группы");
  }

  invoiceDoc.setData({
    COMPANY_NAME: invoiceConfig.COMPANY_NAME,
    INN: invoiceConfig.INN,
    ACCOUNT: invoiceConfig.ACCOUNT,
    BANK: invoiceConfig.BANK,
    CORR_ACC: invoiceConfig.CORR_ACC,
    BIK: invoiceConfig.BIK,
    OGRNIP: invoiceConfig.OGRNIP,
    PHONE: invoiceConfig.PHONE,
    SIGN_TITLE: invoiceConfig.SIGN_TITLE,
    SIGN_NAME: invoiceConfig.SIGN_NAME,
    SIGN_SHORT_NAME: invoiceConfig.SIGN_SHORT_NAME,
    ORDER_NUMBER: String(transaction.order.number),
    ORDER_DATE: moment(transaction.order.created).format('DD.MM.YYYY'),
    INVOICE_CONTRACT_HEAD: transaction.paymentDetails.contractHead || "... В ЛИЦЕ ... НА ОСНОВАНИИ ...",
    COMPANY_INVOICE_HEAD: invoiceConfig.COMPANY_INVOICE_HEAD,
    GROUP_DURATION_DATE: moment(group.dateStart).format('DD.MM.YYYY') + ' - ' + moment(group.dateEnd).format('DD.MM.YYYY'),
    END_DATE: moment(group.dateEnd).format('DD.MM.YYYY'),
    GROUP_TIME: group.timeDesc,
    TRANSACTION_NUMBER: String(transaction.number),
    TRANSACTION_DATE: moment(transaction.created).format('DD.MM.YYYY'),
    INVOICE_COMPANY_NAME: transaction.paymentDetails.companyName,
    INVOICE_COMPANY_ADDRESS: transaction.paymentDetails.companyAddress,
    INVOICE_BANK_DETAILS: transaction.paymentDetails.bankDetails,
    AMOUNT: transaction.amount
  });

  // apply replacements
  invoiceDoc.render();

  return invoiceDoc;
};

