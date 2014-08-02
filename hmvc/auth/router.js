var Router = require('koa-router');
var form = require('./controller/form');
var user = require('./controller/user');
var local = require('./controller/login/local');
var register = require('./controller/register');
var logout = require('./controller/logout');
var mustBeAuthenticated = require('./lib/mustBeAuthenticated');
var passport = require('koa-passport');

var router = module.exports = new Router();

router.get('/form', form.get);
router.get('/user', mustBeAuthenticated, user.get);

router.post('/login/local', local.post);

router.post('/logout', logout.post);
router.post('/register', register.post);

// The request will be redirected to Facebook for authentication, so this
// function will not be called.
router.get('/login/facebook',
  passport.authenticate('facebook', { display: 'popup', scope: ['email'] })
);


router.get('/callback/facebook',
  // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
  passport.authenticate('facebook', { successRedirect: '/auth/popup-success', failureRedirect: '/auth/popup-failure' },
  function*(next) {
    debugger;
  })
);
router.get('/popup-success', function*() {
  this.render(__dirname, 'popup-success');
});
router.get('/popup-failure', function*() {
  this.render(__dirname, 'popup-failure');
});
