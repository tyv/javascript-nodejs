const mongoose = require('mongoose');

var OrderTemplate = require('payments').OrderTemplate;
var User = require('users').User;

exports.OrderTemplate = [
  {
    title:       "Основы JavaScript",
    description: "600+ стр, PDF + EPUB (10Mb)",
    slug:        "jsbasics",
    module:      'getpdf',
    amount:      10,
    data:        {
      file: "tutorial/jsbasics.zip"
    }
  },
  {
    title:       "JS-DOM",
    description: "400 стр, 8мб",
    slug:        "dom",
    module:      'getpdf',
    amount:      1
  },
  {
    title:       "Две книги сразу",
    description: "500 стр, 8мб",
    slug:        "api",
    module:      'getpdf',
    amount:      1
  }
];


exports.User = [{
  email:         "mk@javascript.ru",
  displayName:   "Tester",
  password:      "123456",
  verifiedEmail: true
}];

