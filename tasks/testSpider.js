const gulp = require('gulp');
const spawn = require('child_process').spawn;

/**
 * wget: wget -o log -nd --delete-after -e robots=off -w 0 -r -p http://javascript.in/tutorial/map
 *   Reports bad links... But does not tell where the bad link comes from
 *
 * selenium: no easy way to track 404/500s
 *
 * phantomjs (casperjs): works
 *
 * @returns {Function}
 */

module.exports = function() {

  return function(callback) {

    var child = spawn('./node_modules/casperjs/bin/casperjs',
      [
        '--start-url=http://javascript.in/tutorial/map',
        '--required-values=http://javascript.in',
        '--skipped-values=http://disqus.com',
        '--file-location=./tmp/',
        '--engine=slimerjs',
        'node_modules/casperjs-spider/spider.js'
      ],
      {
        stdio: 'pipe',
        encoding: 'utf-8'
      });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('exit', function(code, signal) {
      callback(code);
    });

  };

};

