
var log = require('log')();
var imgurRequest = require('./imgurRequest');
var BadImageError = require('./badImageError');
var ImgurImage = require('../models/imgurImage');

module.exports = function*(url) {

  log.debug("transload", url);
  var response = yield imgurRequest('image', {
    formData: {
      type:  'url',
      image: url
    }
  });

  yield ImgurImage.createFromResponse(response);
};

