'use strict';
var stylus = require('stylus');
var thunkify = require('thunkify');

var src = process.cwd() + '/app';
var dest = process.cwd() + '/www';

// the middleware only triggers on .css,
// it compiles styl -> css, but does not send anything
var middleware = thunkify(stylus.middleware({
  src: src,
  dest: dest
}));

module.exports = function(app) {
  app.use(function *(next) {
    // compile if needed
    yield middleware(this.req, this.res);
    // send compiled
    yield next;
  });
};

