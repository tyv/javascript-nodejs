var request = require('request');
var config = require('config');
var log = require('log')();
var inherits = require('inherits');
var _ = require('lodash');
var mime = require('mime');

//require('request-debug')(request);

function BadImageError(msg) {
  Error.call(this, msg);
  this.message = msg;
  this.name = 'BadImageError';
}
inherits(BadImageError, Error);

exports.transload = function*(url) {

  log.debug("transload", url);
  var response = yield imgurRequest('image', {
    formData: {
      type:  'url',
      image: url
    }
  });

  if (!response.success) {
    throw new BadImageError(response.data.error);
  }

  return response.data;
};

exports.uploadBuffer = function*(fileName, buffer) {
  // the same code actually
  return yield* exports.uploadStream(fileName, buffer.length, buffer);
};

/*
custom_file: {
      value:  fs.createReadStream('/dev/urandom'),
        options: {
        filename: 'topsecret.jpg',
          contentType: 'image/jpg'
      }
*/

/**
 * Uploads a stream (file or multiparty part or...)
 * @param fileName fileName (for mime)
 * @param knownLength contentLength (from file stream request could get it, but not from multiparty part)
 * @param stream
 * @returns {*}
 */
exports.uploadStream = function*(fileName, knownLength, stream) {

  if (!knownLength) {
    throw new BadImageError("Пустое изображение.");
  }
  var mimeType = mime.lookup(fileName);

  var response = yield* imgurRequest('image', {
    formData: {
      type:  'file',
      image: {
        value: stream,
        options: {
          filename: fileName,
          contentType: mimeType,
          knownLength: knownLength
        }
      }
    }
  });

  if (!response.success) {
    throw new BadImageError(response.data.error);
  }

  return response.data;
};


function* imgurRequest(serviceName, options) {
  options = _.merge({
    method:  'POST',
    url:     config.imgur.url + serviceName,
    headers: {'Authorization': 'Client-ID ' + config.imgur.clientId},
    json:    true
  }, options);

  var response = yield function(callback) {
    request(options, function(error, response) {
      callback(error, response);
    });
  };

  if (response.statusCode != 200 && response.statusCode != 400) {
    log.error("Imgur error", {res: response});
    throw new Error("Error communicating with imgur service.");
  }

  return response.body;

}
