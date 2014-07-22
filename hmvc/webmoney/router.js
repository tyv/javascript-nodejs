var Router = require('koa-router');
var payment = require('payment');

var router = module.exports = new Router();

var result = require('./controller/result');
var success = require('./controller/success');
var fail = require('./controller/fail');
var wait = require('./controller/wait');

// webmoney server posts here (in background)
router.post('/result', function* (next) {
  if (this.request.body.LMI_PREREQUEST == '1') {
    yield* result.prerequest.call(this, next);
  } else {
    yield* result.post.call(this, next);
  }
});

// webmoney server redirects here if payment successful
router.get('/success', success.get);
// but if transaction status is not yet received, we wait...
router.post('/wait', wait.post);

// webmoney server redirects here if payment failed
router.get('/fail', fail.get);


