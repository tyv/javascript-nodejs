var stylus = require('stylus');
var send = require('koa-send');

exports.get = function *(next) {
  this.root = process.cwd() + '/app';
  yield stylus
    .middleware(this.root)
    .bind(null, this.req, this.res);
  yield next;
  yield send(this, this.path, {root: this.root});
};