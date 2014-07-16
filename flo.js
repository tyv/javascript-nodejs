/* DEPRECATED NOT USED (livereload instead) */

var flo = require('fb-flo');
var fs  = require('fs');

var server = flo(
  './www/',
  {
    port: 8888,
    host: 'localhost',
    verbose: true,
    glob: [
      '**/*.{js,css,html,png}'
    ]
  },
  function resolver(filepath, callback) {
    console.log('Reloading \'' + filepath + '\' with flo...');
    var file = './www/' + filepath;
    callback({
      resourceURL : filepath,
      contents    : fs.readFileSync(file),
      reload      : filepath.match(/\.(js|html)$/)
    });
  }
);
