
module.exports = function(app) {
  app.use(function*(next) {

    /* jshint -W106 */
    this.log = app.log.child({
      reqId: this.reqId
    });
    this.req.log = this.log; // passport.js strategy passes req around

    yield next;
  });
};
