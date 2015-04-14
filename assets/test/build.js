var async = require('async');
var request = require('request');
var fs = require('fs');
var ejs = require('ejs');


var libUrls = {
  mocha_js: 'https://cdnjs.cloudflare.com/ajax/libs/mocha/2.2.4/mocha.min.js',
  mocha_css: 'https://cdnjs.cloudflare.com/ajax/libs/mocha/2.2.4/mocha.css',
  sinon_js: 'http://sinonjs.org/releases/sinon-1.14.1.js',
  chai_js: 'https://cdnjs.cloudflare.com/ajax/libs/chai/2.2.0/chai.js'
};

function asyncObjectMap( obj, func, cb ) {
    var i, arr = [], keys = Object.keys( obj );
    for ( i = 0; i < keys.length; i += 1 ) {
        arr[i] = obj[keys[i]];
    }
    async.map( arr, func, function( err, data ) {
        if ( err ) { return cb( err ); }

        var res = {};
        for ( i = 0; i < data.length; i += 1 ) {
            res[keys[i]] = data[i];
        }

        return cb( err, res );
    } );
}

function fetch(file, cb){
  request.get(file, function(err, response, body){
    if (err) {
      cb(err);
    } else {
      cb(null, body); // First param indicates error, null=> no error
    }
  });
}

var template = fs.readFileSync('libs.ejs', 'utf-8');

asyncObjectMap(libUrls, fetch, function(err, libContent){
  if (err) {
    throw err;
  }
  libContent.mocha_css += "\n#mocha pre.error {white-space: pre-wrap;}\n";

  var result = ejs.render(template, libContent);

  fs.writeFileSync('./libs.js', result);
});
