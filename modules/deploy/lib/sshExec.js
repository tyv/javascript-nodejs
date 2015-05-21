/**
 * Executes ssh command
 * NB: DOES NOT KEEP STATE BETWEEN COMMANDS
 * WILL NOT WORK: `cd` ... `do smth`
 * @param cmd command string to execute
 * @param client ssh2 client (must be connected)
 * @returns {Promise} rejects if code!=0
 */
module.exports = function* execOverSSH(client, cmd, options) {

  options = options || {};
  if (!("pty" in options)) options.pty = true;

  var stream = yield function(callback) {
    // certain commands like `git clone` require pty
    client.exec(cmd, options, callback);
  };

  return yield new Promise(function(resolve, reject) {

    stream.on('close', function(code, signal) {
      if (code) reject(new Error(`SSH command exited, ${signal ? 'signal:' + signal : ''} code:${code}`));
      else resolve();
    });

    stream.on('data', function(data) {
      console.log(data.toString());
    });

    stream.stderr.on('data', function(data) {
      console.error(data.toString());
    });
  });


};

