var request = require('koa-request');
var config = require('config');
var log = require('log')();
var inherits = require('inherits');

function BadImageError(msg) {
  Error.call(this, msg);
  this.name = 'BadImageError';
}
inherits(BadImageError, Error);

exports.transload = function*(url) {

  log.debug("transload", url);
  var result = yield imgurRequest('image', {
    type:  'url',
    image: url
  });

  if (!result.success) {
    throw new BadImageError(response.body.data.error);
  }

  return result.data;

};

function* imgurRequest(serviceName, formData) {
  var response = yield request.post({
    url:      config.imgur.url + serviceName + '.json',
    headers:  {'Authorization': 'Client-ID ' + config.imgur.clientId},
    json:     true,
    formData: formData
  });

  if (response.statusCode != 200) {
    log.error("Imgur error", {res: response});
    throw new Error("Error communicating with imgur service.");
  }

  return response.body;

}
