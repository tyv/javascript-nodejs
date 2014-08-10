var Router = require('koa-router');
var loginRegisterForm = require('./controller/login-register-form');
var user = require('./controller/user');
var register = require('./controller/register');
var logout = require('./controller/logout');
var mustBeAuthenticated = require('./lib/mustBeAuthenticated');
var passport = require('koa-passport');

var router = module.exports = new Router();

//router.get('/login-register-form', loginRegisterForm.get);
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

// FIXME: GOOGLE DOES NOT WORK, probably need need https://github.com/sqrrrl/passport-google-plus
router.get('/login/google',
  passport.authenticate('google', { scope: 'email' })
);

// callback is same
['facebook', 'github', 'vkontakte', 'yandex', 'google'].forEach(function(providerName) {
  router.get('/callback/' + providerName,
    // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
    passport.authenticate(providerName, { successRedirect: '/auth/popup-success', failureRedirect: '/auth/popup-failure' })
  );
});


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



router.get('/popup-success', function*() {
  this.body = this.render('popup-success');
});
router.get('/popup-failure', function*() {
  this.body = this.render('popup-failure');
});
