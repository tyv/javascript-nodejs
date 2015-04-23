
const Transaction = require('../models/transaction');
const path = require('path');

exports.renderForm = require('./renderForm');

// TX gets this status when created
exports.createTransaction = function*(order, body) {


  var transaction = new Transaction({
    order:  order._id,
    amount: order.amount,
    status: Transaction.STATUS_PENDING,
    paymentMethod: path.basename(__dirname),
    paymentDetails: {
      companyName: String(body.invoiceCompanyName),
      agreementRequired: Boolean(body.invoiceAgreementRequired),
      contractHead: String(body.invoiceContractHead),
      companyAddress: String(body.invoiceCompanyAddress),
      bankDetails: String(body.invoiceBankDetails)
    }
  });

  yield transaction.persist();

  return transaction;
};

exports.info = {
  title:   "Счёт на компанию",
  subtitle: '(для юрлиц из России)',
  name:    path.basename(__dirname)
};
