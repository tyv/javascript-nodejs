const spawn = require('child_process').spawn;
const config = require('config');
const path = require('path');
const fs = require('fs');
const log = require('log')();

// only 1 tunnel on the host
killOldPid();

var pidFilePath = path.join(config.tmpRoot, 'e2eTunnel.pid');
var tunnelReady = false;

module.exports = function*() {
  if (tunnelReady) return;
  yield spawnSsh;
  tunnelReady = true;
};


function spawnSsh(callback) {

// use -tt flag to force terminal, otherwise it fail
  var tunnel = spawn('ssh', ['-tt', '-R', '1212:localhost:80', config.test.e2e.sshUser + '@' + config.test.e2e.sshHost], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  tunnel.stderr.setEncoding('utf8');
  tunnel.stdout.setEncoding('utf8');

// an error means the tunnel is unusable
  tunnel.stderr.on('data', function(data) {
    if (data.startsWith('Killed')) return; // Will get killed eventually
    if (data.startsWith('setsockopt')) return; // e.g setsockopt TCP_NODELAY: Invalid argument
    // otherwise stop all further processing (gulp plumbered task should not continue too)
    setImmediate(function() {
      process.exit(1);
    });
    throw new Error(data);
  });

  tunnel.stdout.on('data', function(data) {
    log.debug(data);
    fs.writeFileSync(pidFilePath, tunnel.pid.toString());
    if (callback) callback();
    callback = null;
  });


// don't make the process wait for the child to end, but instead kill it
  tunnel.unref();
  process.once('exit', function() {
    tunnel.kill();
  });

// tunnel.stdout & tunnel.stderr are net.Socket streams
// must unref them in addition
  tunnel.stdout.unref();
  tunnel.stderr.unref();


  return tunnel;
}

function killOldPid() {
  try {
    var oldPid = fs.readFileSync(pidFilePath);
    process.kill(oldPid);
  } catch (e) {
    // no file or no kill, who cares, we tried out best
  }
}