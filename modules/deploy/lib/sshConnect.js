var Client = require('ssh2').Client;
var readHostFromSSHConfig = require('../lib/readHostFromSSHConfig');
var config = require('config');

module.exports = function*(host) {

  var client = new Client();

  var sshHostConfig = yield* readHostFromSSHConfig(host);
  var host = sshHostConfig ? sshHostConfig.HostName : host;

  var options = {
    privateKey: config.deploy.privateKey,
    user: config.deploy.user,
    host: host
  };

  client.connect(options);

  yield function(callback) {
    client.on('ready', callback);
  };

  return client;
};
