var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var yargs = require('yargs');

var Subscription = require('newsletter').Subscription;

exports.up = function*() {

  yield function(callback) {
    Subscription.collection.remove({confirmed: false}, callback);
  };

  yield function(callback) {
    Subscription.collection.update(
        {},
        { $unset: { confirmed: 1 } }, {multi: true}, callback);
  };

};

exports.down = function*() {
  throw new Error("Rollback not implemented");
};
