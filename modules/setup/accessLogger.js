// adapted koa-logger for bunyan
var Counter = require('passthrough-counter');

module.exports = function(app) {
  app.use(function *logger(next) {
    // request
    var req = this.req;

    var start = Date.now();
    this.log.info({event: "request-start", method: req.method, url: req.url},
      "--> %s %s", req.method, req.url);

    try {
      yield next;
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, null, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    var length = this.responseLength;
    var body = this.body;
    var counter;
    if (null === length && body && body.readable) {
      this.body = body
        .pipe(counter = new Counter())
        .on('error', this.onerror);
    }

    // log when the response is finished or closed,
    // whichever happens first.
    var ctx = this;
    var res = this.res;

    var onfinish = done.bind(null, 'finish');
    var onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event) {
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(ctx, start, counter ? counter.length : length, null, event);
    }

    /**
     * Log helper.
     */

    function log(ctx, start, len, err, event) {
      // get the status code of the response
      var status = err ? (err.status || 500) : (ctx.status || 404);

      // set the color of the status code;
      var s = status / 100 | 0;

      // get the human readable response length
      var length;
      if (~[204, 205, 304].indexOf(status)) {
        length = 0;
      } else if (null === len) {
        length = 0;
      } else {
        length = len;
      }

      ctx.log[err ? 'error' : 'info']({
        event:    "request-end",
        method:   ctx.method,
        url:      req.originalUrl,
        status:   status,
        timeDuration: Date.now() - start,
        length:   length
      }, "<-- %s %s", ctx.method, ctx.originalUrl);
    }

  });
};
