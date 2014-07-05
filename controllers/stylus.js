var stylus = require('stylus');

exports.get = function *(next) {
  yield stylus
    .middleware(process.cwd() + '/app')
    .bind(null, this.req, this.res)(next);
};