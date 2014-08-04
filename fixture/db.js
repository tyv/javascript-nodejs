const mongoose = require('mongoose');

var OrderTemplate = require('payments').OrderTemplate;
var User = require('auth/models/user');

exports.OrderTemplate = [
  {
    title:    "Основы JavaScript",
    description: "500 стр, 10мб",
    slug:     "jsbasics",
    amount:   1
  },
  {
    title:    "JS-DOM",
    description: "400 стр, 8мб",
    slug:     "dom",
    amount:   1
  },
  {
    title:    "Две книги сразу",
    description: "500 стр, 8мб",
    slug:     "api",
    amount:   1
  }
];

exports.User = [{
  email: "mk@javascript.ru",
  displayName: "Tester",
  password: "123456"
}];
