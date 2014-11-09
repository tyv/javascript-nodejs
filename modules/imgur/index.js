var request = require('koa-request');
var config = require('config');
var log = require('log')();
var inherits = require('inherits');
var _ = require('lodash');

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

exports.uploadBuffer = function*(mime, buffer) {
  // the same code actually
  return yield* exports.uploadStream(mime, buffer);
};

exports.uploadStream = function*(mime, stream) {

  var response = yield* imgurRequest('image', {
    headers: {
      'Content-Type':  mime
    },
    formData:    {
      type:  'file',
      image: stream
    }
  });

  if (!response.success) {
    throw new BadImageError(response.data.error);
  }

  return response.data;
};


function* imgurRequest(serviceName, options) {
  var response = yield request.post(_.merge({
    url:     config.imgur.url + serviceName,
    headers: {'Authorization': 'Client-ID ' + config.imgur.clientId},
    json:    true
  }, options));

  if (response.statusCode != 200 && response.statusCode != 400) {
    log.error("Imgur error", {res: response});
    throw new Error("Error communicating with imgur service.");
  }

  return response.body;

}
