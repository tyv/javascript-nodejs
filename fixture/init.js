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
    weight:      1,
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
    weight:      2,
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
    weight:      3,
    amount:      15,
    data:        {
      file: "tutorial/js-ui.zip"
    }
  },
  {
    title: "Оплата счёта javascript.ru",
    module: 'invoice',
    slug: 'invoice'
  }
];

exports.Newsletter = [
  {
    title: "Курс и скринкасты по Node.JS / IO.JS",
    slug:  "nodejs",
    period: "бывают редко",
    weight: 1,
    internal: false
  },
  {
    title: "Курс JavaScript/DOM/интерфейсы",
    period: "раз в 1.5-2 месяца",
    weight: 0,
    internal: false,
    slug:  "js"
  },
  {
    title: "Другие продвинутые скринкасты, курсы, конференции и мастер-классы по JavaScript",
    period: "редко",
    weight: 2,
    internal: false,
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

