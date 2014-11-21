const spawn = require('child_process').spawn;
const config = require('config');

module.exports = function*() {

  // use -tt flag to force terminal, otherwise it fail
  var tunnel = spawn('ssh', ['-tt', '-R', '1212:localhost:80', config.test.e2e.sshUser + '@' + config.test.e2e.sshHost]);


  tunnel.stderr.setEncoding('utf8');
  tunnel.stdout.setEncoding('utf8');

  // an error means no tunnel (we die)
  tunnel.stderr.on('data', function(data) {
    if (data.startsWith('Killed')) return;
    console.log("ERR", data);
    throw data;
  });

  // wait for first input (tunnel ready)
  yield function(callback) {
    tunnel.stdout.on('data', function(data) {
      console.log(data);
      callback();
    });
  };

  return tunnel;
};
