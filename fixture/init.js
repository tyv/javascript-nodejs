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
      file: "tutorial/js.zip"
    }
  },
  {
    title:       "Документ, события, интерфейсы",
    description: "380+ стр, PDF + EPUB (8Mb)",
    slug:        "ui",
    module:      'ebook',
    amount:      10,
    data:        {
      file: "tutorial/ui.zip"
    }
  },
  {
    title:       "Две книги сразу",
    description: "2xPDF + 2xEPUB, (18Mb)",
    slug:        "js-ui",
    module:      'ebook',
    amount:      15,
    data:        {
      file: "tutorial/js-ui.zip"
    }
  }
];

exports.Newsletter = [
  {
    title: "Курс Node.JS",
    slug:  "nodejs"
  },
  {
    title: "Курс JavaScript / DOM / Интерфейсы",
    slug:  "js"
  },
  {
    title: "Продвинутые курсы, мастер-классы и конференции по JavaScript",
    slug:  "advanced"
  }
];

exports.User = [{
  email:         "mk@javascript.ru",
  displayName:   "Tester",
  profileName:   'tester',
  password:      "123456",
  verifiedEmail: true
}];

