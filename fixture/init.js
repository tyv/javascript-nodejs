const mongoose = require('mongoose');

var OrderTemplate = require('payments').OrderTemplate;
var Newsletter = require('newsletter').Newsletter;
var User = require('users').User;

exports.OrderTemplate = [
  {
    title:       "Язык JavaScript",
    description: "600+ стр, PDF + EPUB (10Mb)",
    slug:        "js",
    module:      'ebook',
    amount:      10,
    data:        {
      file: "tutorial/1.zip"
    }
  },
  {
    title:       "Документ, события, интерфейсы",
    description: "380+ стр, PDF + EPUB (8Mb)",
    slug:        "ui",
    module:      'ebook',
    amount:      10,
    data:        {
      file: "tutorial/2.zip"
    }
  },
  {
    title:       "Две книги сразу",
    description: "2 PDF + 2 EPUB, (18Mb)",
    slug:        "js-ui",
    module:      'ebook',
    amount:      15,
    data:        {
      file: "tutorial/12.zip"
    }
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
  profileName:   'tester',
  password:      "123456",
  verifiedEmail: true
}];

