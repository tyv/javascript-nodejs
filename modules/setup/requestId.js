var uuid = require('node-uuid').v4;

// RequestCaptureStream wants "req_id" to identify the request
// we take it from upper chain (varnish? nginx on top?) OR generate
module.exports = function(app) {
  app.use(function*(next) {
    /* jshint -W106 */
    this.reqId = this.get('X-Request-Id') || uuid();
    yield next;
  });
};
