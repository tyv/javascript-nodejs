var Router = require('koa-router');

var router = module.exports = new Router();

var callback = require('./controller/callback');
var success = require('./controller/success');
var fail = require('./controller/fail');


// webmoney server posts here (in background)
router.post('/callback', function* (next) {
  if (this.request.body.LMI_PREREQUEST == '1') {
    yield* callback.prerequest.call(this, next);
  } else {
    yield* callback.post.call(this, next);
  }
});

// webmoney server redirects here if payment successful
router.post('/success', success.post);

// webmoney server redirects here if payment failed
router.post('/fail', fail.post);


