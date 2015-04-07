// adapted koa-logger for bunyan
var Counter = require('passthrough-counter');

exports.init = function(app) {
  app.use(function *logger(next) {
    // request
    var req = this.req;

    var start = Date.now();
    this.log.info("--> %s %s", req.method, req.url, {
      event: "request-start",
      method: req.method,
      url: req.url,
      referer: this.request.get('referer'),
      ua: this.request.get('user-agent')
    });

    try {
      yield next;
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, err);
      throw err;
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
      log(ctx, start, null, event);
    }

    /**
     * Log helper.
     */

    function log(ctx, start, err, event) {
      // get the status code of the response
      var status = err ? (err.status || 500) : (ctx.status || 404);

      // set the color of the status code;
      var s = status / 100 | 0;

      ctx.log[err ? 'error' : 'info'](
        "<-- %s %s", ctx.method, ctx.url, {
        event:    "request-end",
        method:   ctx.method,
        url:      req.url,
        status:   status,
        timeDuration: Date.now() - start
      });
    }

  });
};
