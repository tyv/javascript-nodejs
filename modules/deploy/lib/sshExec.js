var gutil = require('gulp-util');

/**
 * Executes ssh command
 * NB: DOES NOT KEEP STATE BETWEEN COMMANDS
 * WILL NOT WORK: `cd` ... `do smth`
 * @param cmd command string to execute
 * @param client ssh2 client (must be connected)
 * @returns {Promise} rejects if code!=0
 */
module.exports = function*(client, cmd, options) {

  options = options || {};

  // certain commands like `git clone` require pty
  if (!("pty" in options)) options.pty = true;

  var stream = yield function(callback) {
    gutil.log('sshExec', cmd);
    client.exec(cmd, options, callback);
  };

  return yield new Promise(function(resolve, reject) {

    var output = '';

    stream.on('close', function(code, signal) {

      if (code) {
        var error = new Error(`SSH command exited, ${signal ? 'signal:' + signal : ''} code:${code}`);
        error.signal = signal;
        error.code = code;
        reject(error);
      }
      else resolve(output);
    });

    stream.on('data', function(data) {
      output += data.toString();
      console.log(data.toString());
    });

    stream.stderr.on('data', function(data) {
      output += data.toString();
      console.error(data.toString());
    });
  });


};

