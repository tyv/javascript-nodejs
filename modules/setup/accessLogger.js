//const logger = require('koa-logger');

module.exports = function(app) {
  app.use(function* (next) {
    this.log.info({req: this.req});
    yield next;
  });
};
