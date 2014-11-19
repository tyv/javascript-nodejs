var Router = require('koa-router');
var config = require('config');
var register = require('./controller/register');
var verify = require('./controller/verify');
var reverify = require('./controller/reverify');
var disconnect = require('./controller/disconnect');
var forgot = require('./controller/forgot');
var forgotRecover = require('./controller/forgotRecover');
var logout = require('./controller/logout');
var mustBeAuthenticated = require('./lib/mustBeAuthenticated');
var mustNotBeAuthenticated = require('./lib/mustNotBeAuthenticated');
var passport = require('koa-passport');

require('./strategies');

var router = module.exports = new Router();

router.post('/login/local', function*(next) {
  var ctx = this;

  // only callback-form of authenticate allows to assign ctx.body=info if 401
  yield passport.authenticate('local', function*(err, user, info) {
    if (err) throw err;
    if (user === false) {
      ctx.status = 401;
      ctx.body = info;
    } else {
      yield ctx.login(user);
      ctx.body = "";
    }
  }).call(this, next);
});

router.post('/logout', mustBeAuthenticated, logout.post);

if (process.env.NODE_ENV == 'development') {
  router.get('/out', require('./out').get); // GET logout for DEV
}

router.post('/register', mustNotBeAuthenticated, register.post);
router.post('/forgot', mustNotBeAuthenticated, forgot.post);

router.get('/verify/:verifyEmailToken', verify.get);
router.get('/forgot-recover/:passwordResetToken', mustNotBeAuthenticated, forgotRecover.get);
router.post('/forgot-recover', forgotRecover.post);

router.post('/reverify', reverify.post);

for (var providerName in config.authProviders) {
  var provider = config.authProviders[providerName];

  // login
  router.get('/login/' + providerName, passport.authenticate(providerName, provider.passportOptions));

  // connect with existing profile
  router.get('/connect/' + providerName, mustBeAuthenticated, passport.authorize(providerName, provider.passportOptions));

  // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
  router.get('/callback/' + providerName, passport.authenticate(providerName, {
      failureMessage:  true,
      successRedirect: '/auth/popup-success',
      failureRedirect: '/auth/popup-failure'
    })
  );
}

// disconnect with existing profile
router.post('/disconnect/:providerName', mustBeAuthenticated, disconnect.post);

/*
 router.get('/mail', function*(next) {
 require('lib/mailer').sendMail({
 from: 'iliakan@javascript.ru',
 to: 'iliakan@gmail.com',
 subject: 'hello',
 text: 'hello world!'
 }, function() {
 console.log(arguments);
 });
 this.body = "test";
 });
 */


/*if (err) return next(err);
 if (!user) { return res.redirect('/signin') }
 *         res.redirect('/account');
 *       }
 { successRedirect: '/auth/popup-success', failureRedirect: '/auth/popup-failure' })*/

router.get('/popup-success', function*() {
  this.body = this.render('popup-success');
});

router.get('/popup-failure', function*() {
  var reason = this.session.messages ? this.session.messages[0] : '';
  delete this.session.messages;

  this.body = this.render('popup-failure', { reason: reason });
});
