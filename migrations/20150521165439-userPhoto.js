var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var yargs = require('yargs');

var User = require('users').User;
var ImgurImage = require('imgur').ImgurImage;

exports.up = function*() {
  // mongoose definition changed, must access through the native driver
  var userObjects = yield function(callback) {
    User.collection.find({}).toArray(callback);
  };

  yield ImgurImage.remove({});

  for (var i = 0; i < userObjects.length; i++) {
    var user = userObjects[i];
    if (!user.photo) continue;
    console.log(user.photo);
    var imgurImage = yield ImgurImage.createFromResponse({ success: true, data: user.photo});
    yield function(callback) {
      User.collection.update(
        {_id: user._id},
        {$set: { photo: imgurImage.link } },
        callback
      );
    };
  }
};

exports.down = function*() {

};
