var co = require('co');
var fs = require('fs');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const Letter = require('../models/letter');
const sendMail = require('sendMail');
const config = require('config');


module.exports = function(options) {

  return function() {

    return co(function* () {

      var letters = yield Letter.find({
        sent: false
      }).exec();

      for (var i = 0; i < letters.length; i++) {
        var letter = letters[i];

        yield sendMail(letter.data);

        letter.sent = true;
        yield letter.persist();
      }

    });
  };
};


