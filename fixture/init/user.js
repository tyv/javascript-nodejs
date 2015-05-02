const mongoose = require('mongoose');

var User = require('users').User;

exports.User = [{
  email:         "mk@javascript.ru",
  displayName:   "Tester",
  profileName:   'tester',
  password:      "123456",
  verifiedEmail: true
}, {
  email:         "iliakan@javascript.ru",
  displayName:   "Ilya Kantor",
  profileName:   'iliakan',
  password:      "123456",
  verifiedEmail: true
}];

