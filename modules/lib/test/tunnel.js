const spawn = require('child_process').spawn;
const config = require('config');

const log = require('log')();

// use -tt flag to force terminal, otherwise it fail
var tunnel = spawn('ssh', ['-tt', '-R', '1212:localhost:80', config.test.e2e.sshUser + '@' + config.test.e2e.sshHost], {
  stdio: 'pipe'
});

tunnel.stdin.end();

tunnel.stderr.setEncoding('utf8');
tunnel.stdout.setEncoding('utf8');

// an error means no tunnel (we die)
tunnel.stderr.on('data', function(data) {
  if (data.startsWith('Killed')) return;
  if (data.startsWith('setsockopt')) return; // setsockopt TCP_NODELAY: Invalid argument
  throw new Error(data.trim());
});

var tunnelReady = false;

tunnel.stdout.on('data', function(data) {
  log.debug(data);
  tunnelReady = true;
});

module.exports = function*() {

  yield function(callback) {

    function poll() {
      if (tunnelReady) callback();
      else setTimeout(poll, 100);
    }

    poll();
  };

};

// don't make the process wait for the child to end, but instead kill it
tunnel.unref();
process.once('exit', function() {
  tunnel.kill();
});
