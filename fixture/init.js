const mongoose = require('mongoose');

var OrderTemplate = require('payments').OrderTemplate;
var Newsletter = require('newsletter').Newsletter;
var User = require('users').User;

exports.OrderTemplate = [
  {
    title:       "Основы JavaScript",
    description: "600+ стр, PDF + EPUB (10Mb)",
    slug:        "jsbasics",
    module:      'ebook',
    amount:      10,
    data:        {
      file: "tutorial/jsbasics.zip"
    }
  },
  {
    title:       "JS-DOM",
    description: "400 стр, 8мб",
    slug:        "dom",
    module:      'ebook',
    amount:      1
  },
  {
    title:       "Две книги сразу",
    description: "500 стр, 8мб",
    slug:        "api",
    module:      'ebook',
    amount:      1
  }
];

exports.Newsletter = [
  {
    title: "Курс Node.JS",
    slug:  "nodejs"
  }
];

exports.User = [{
  email:         "mk@javascript.ru",
  displayName:   "Tester",
  password:      "123456",
  verifiedEmail: true
}];

