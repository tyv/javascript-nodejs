var co = require('co');
var app = require('app');
var config = require('config');

module.exports = function() {
  return function() {

    return co(require('app').waitBootAndListen(config.server.host, config.server.port));

  };
};

