var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var yargs = require('yargs');

var User = require('users').User;

exports.up = function*() {
  var users = User.find({}).exec();

  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    console.log(user);

  }

};

exports.down = function*() {

};
