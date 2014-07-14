'use strict';
const stylus = require('stylus');
const thunkify = require('thunkify');
const nib = require('nib');
const src = process.cwd() + '/app';
const dest = process.cwd() + '/www';

// the middleware only triggers on .css,
// it compiles styl -> css, but does not send anything
const middleware = thunkify(stylus.middleware({
  src: src,
  dest: dest,
  compile: function(str, path){
    return stylus(str)
      .set('filename', path)
      .set('linenos', true)
      .use(nib());
  }

}));

module.exports = function(app) {
  app.use(function *(next) {
    // compile if needed (doesn't send)
    yield middleware(this.req, this.res);
    // continue the middleware stack (will send compiled if was a *.css request)
    yield next;
  });
};

