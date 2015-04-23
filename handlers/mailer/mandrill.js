var config = require('config');
var mandrill = require('mandrill-api/mandrill');

var mandrillClient = new mandrill.Mandrill(config.mailer.mandrill.apiKey);

//console.log(require('util').inspect(mandrillClient));

for(var key in mandrillClient) {
  if (mandrillClient[key].master) {
    promisifyMandrillApi(mandrillClient[key]);
  }
}

function promisifyMandrillApi(api) {
  for(var key in Object.getPrototypeOf(api)) {
    var value = api[key];

    if (typeof value != 'function') {
      return;
    }

    promisifyMandrillApiMethod(api, key);
  }
}

function promisifyMandrillApiMethod(api, methodName) {
  var prev = api[methodName];
  api[methodName] = function(opts) {
    return new Promise(function(resolve, reject) {
      prev.call(api, opts, resolve, reject);
    });
  };
}

module.exports = mandrillClient;