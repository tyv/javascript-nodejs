const gulp = require('gulp');
const spawn = require('child_process').spawn;

module.exports = function() {

  return function(callback) {

    var child = spawn('./node_modules/casperjs/bin/casperjs',
      [
        '--start-url=http://javascript.in/tutorial/map',
        '--required-values=javascript.in',
        '--file-location=./tmp/',
        'node_modules/casperjs-spider/spider.js'
      ],
      {
        stdio: 'pipe',
        encoding: 'utf-8'
      });

    child.stdout.on('data', function (data) {
      process.stdin.write(data);
    });

    child.stderr.on('data', function (data) {
      process.stderr.write(data);
    });

    child.on('exit', function(code, signal) {
      callback(code);
    });

  };

};

