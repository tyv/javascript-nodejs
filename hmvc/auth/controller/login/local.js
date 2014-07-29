var passport = require('koa-passport');

exports.post = function*(next) {
  var ctx = this;
  yield passport.authenticate('local', function*(err, user, info) {
    // missing credentials ?!?
//    console.log("HERE 2", err, user, info);
    if (err) throw err;
    if (user === false) {
      ctx.status = 401;
      ctx.body = { success: false };
    } else {
      yield ctx.login(user);
      ctx.body = { success: true };
    }
  }).call(this, next);
};

