var fs = require('fs');
var parse = require('sshconf/parse');
var merge = require('sshconf/merge');

module.exports = function *readHostFromSSHConfig(host) {

  var configFile = process.env.HOME + '/.ssh/config';
  if (!fs.existsSync(configFile)) return null;

  var sshConfig = yield function(callback) {
    fs.createReadStream(configFile, {encoding: 'utf8'})
      .pipe(parse())
      .pipe(merge(callback));
  };

  /*
  sshConfig.hosts is array of:
   { Host: [ 'nightly' ],
   HostName: '123.45.67.89',
   ForwardAgent: 'yes',
   User: 'root' }
   */

  var hostInfo = sshConfig.hosts.filter(function(item) {
    return item.Host[0] == host;
  })[0];

  if (!hostInfo) return null;
  return hostInfo;
};
