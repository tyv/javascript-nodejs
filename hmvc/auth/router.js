var Router = require('koa-router');
var user = require('./controller/user');
var register = require('./controller/register');
var verify = require('./controller/verify');
var reverify = require('./controller/reverify');
var forgot = require('./controller/forgot');
var forgotRecover = require('./controller/forgotRecover');
var logout = require('./controller/logout');
var mustBeAuthenticated = require('./lib/mustBeAuthenticated');
var passport = require('koa-passport');

var router = module.exports = new Router();

router.get('/user', mustBeAuthenticated, user.get);

router.post('/login/local', function*(next) {
  var ctx = this;
  // only callback-form of authenticate allows to answer reason if 401
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

router.post('/logout', logout.post);

if (process.env.NODE_ENV == 'development') {
  router.get('/out', require('./out').get); // GET logout for DEV
}

router.post('/register', register.post);
router.post('/forgot', forgot.post);

router.get('/verify/:verifyEmailToken', verify.get);
router.get('/forgot-recover/:passwordResetToken', forgotRecover.get);
router.post('/forgot-recover', forgotRecover.post);

router.post('/reverify', reverify.post);

// The request will be redirected to Facebook for authentication
router.get('/login/facebook',
  passport.authenticate('facebook', { display: 'popup', scope: ['email'] })
);

router.get('/login/github',
  passport.authenticate('github', { scope: 'user:email' })
);

router.get('/login/vkontakte',
  passport.authenticate('vkontakte', {scope: 'email'})
);

router.get('/login/yandex',
  passport.authenticate('yandex')
);

router.get('/login/google',
  passport.authenticate('google', {
    scope: [
      // https://www.googleapis.com/auth/plus.login - request access to circles (not needed)

      // 'https://www.googleapis.com/auth/plus.profile.emails.read' - also works
      'profile',
      'email'
    ]
  })
);

// callback is same
['facebook', 'github', 'vkontakte', 'yandex', 'google'].forEach(function(providerName) {
  // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_

  router.get('/callback/' + providerName, passport.authenticate(providerName, {
      failureMessage:  true,
      successRedirect: '/auth/popup-success',
      failureRedirect: '/auth/popup-failure'
    })
  );
});

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
