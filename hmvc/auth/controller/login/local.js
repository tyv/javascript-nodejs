var passport = require('koa-passport');

exports.post = function*(next) {
  var ctx = this;
  yield passport.authenticate('local', function*(err, user, info) {
    if (err) throw err;
    if (user === false) {
      ctx.status = 401;
      ctx.body = { error: "Неверный email или пароль" };
    } else {
      yield ctx.logIn(user);
      ctx.body = {
        username: user.username,
        email: user.email
      };
    }
  }).call(this, next);
};

