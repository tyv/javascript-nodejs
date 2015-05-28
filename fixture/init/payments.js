const mongoose = require('mongoose');
require('payments');

exports.Transaction = [];
exports.TransactionLog = [];
exports.Discount = [{
  code: "DISCOUNT",
  discount: 1
}];
exports.Order = [];

exports.OrderTemplate = [
  {
    title:       "Язык JavaScript",
    description: "600+ стр, PDF + EPUB (10Mb)",
    slug:        "js",
    module:      'ebook',
    weight:      1,
    amount:      2,
    data:        {
      file: "tutorial/js.zip"
    }
  },
  {
    title:       "Документ, события, интерфейсы",
    description: "380+ стр, PDF + EPUB (8Mb)",
    slug:        "ui",
    module:      'ebook',
    weight:      2,
    amount:      2,
    data:        {
      file: "tutorial/ui.zip"
    }
  },
  {
    title:       "Две книги сразу",
    description: "2xPDF + 2xEPUB, (18Mb)",
    slug:        "js-ui",
    module:      'ebook',
    weight:      3,
    amount:      2,
    data:        {
      file: "tutorial/js-ui.zip"
    }
  },
  {
    module: 'courses',
    slug: 'course'
  }
];

