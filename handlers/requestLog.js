
exports.init = function(app) {
  app.use(function*(next) {

    /* jshint -W106 */
    this.log = app.log.child({
      requestId: this.requestId
    });

    // fixme: remove (passport js issue fixed)
    this.request.log = this.log; // passport.js strategy passes req around

    yield* next;
  });

};
