var config = require('config');

module.exports = function*(next) {
  if (process.env.NODE_ENV == 'development' ||
    this.isAuthenticated() && this.user.isAdmin ||
    this.get('X-Admin-Key') === config.adminKey // service may authorize with header
    ) {
    yield* next;
  } else {
    this.throw(403);
  }
};
