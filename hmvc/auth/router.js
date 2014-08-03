var Router = require('koa-router');
var form = require('./controller/form');
var user = require('./controller/user');
var register = require('./controller/register');
var logout = require('./controller/logout');
var mustBeAuthenticated = require('./lib/mustBeAuthenticated');
var passport = require('koa-passport');

var router = module.exports = new Router();

router.get('/form', form.get);
router.get('/user', mustBeAuthenticated, user.get);

router.post('/login/local',
  passport.authenticate('local'),
  function*(next) {
    // only if auth succeeds, we answer...
    this.body = {
      displayName: this.req.user.displayName,
      email: this.req.user.email
    };
  }
);

router.post('/logout', logout.post);

if (process.env.NODE_ENV == 'development') {
  router.get('/out', require('./out').get);
}

router.post('/register', register.post);

// The request will be redirected to Facebook for authentication, so this
// function will not be called.
router.get('/login/facebook',
  passport.authenticate('facebook', { display: 'popup', scope: ['email'] })
);


router.get('/callback/facebook',
  // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
  passport.authenticate('facebook', { successRedirect: '/auth/popup-success', failureRedirect: '/auth/popup-failure' })
);

router.get('/login/github',
  passport.authenticate('github', { scope: ['user:email'] })
);


router.get('/callback/github',
  // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
  passport.authenticate('github', { successRedirect: '/auth/popup-success', failureRedirect: '/auth/popup-failure' })
);

router.get('/login/yandex',
  passport.authenticate('yandex')
);

router.get('/callback/yandex',
  // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
  passport.authenticate('yandex', { successRedirect: '/auth/popup-success', failureRedirect: '/auth/popup-failure' })
);


// FIXME: GOOGLE DOES NOT WORK, need fixed passport-google-oauth or kind of..
// One additional note is that you will now be required to register your application
// at https://console.developers.google.com and create a client ID and secret
// (which are used in the passport module).
router.get('/login/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'] })
);

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
router.get('/callback/google',
  passport.authenticate('google', { successRedirect: '/auth/popup-success', failureRedirect: '/auth/popup-failure' })
);


router.get('/popup-success', function*() {
  this.render(__dirname, 'popup-success');
});
router.get('/popup-failure', function*() {
  this.render(__dirname, 'popup-failure');
});
