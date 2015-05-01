var config = require('config');

module.exports = function*(next) {

  if (process.env.NODE_ENV == 'development' || this.isAdmin) {
    yield* next;
  } else {
    this.throw(403);
  }
};
