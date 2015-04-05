const mongoose = require('mongoose');
const passport = require('koa-passport');
const config = require('config');
const User = require('users').User;
const RememberMeStrategy = require('./rememberMeStrategy');
const RememberMeToken = require('./rememberMeToken');

// auto logs in X-Test-User-Id when testing
exports.init = function(app) {

  // this strategy stands aside from others, because it has no route
  // works automatically, just as sessions (and essentialy is a session add-on)

  var options = config.auth.rememberMe;
  passport.use(new RememberMeStrategy(options, RememberMeToken.consume, RememberMeToken.issue));

  app.use(passport.authenticate('remember-me'));

  app.use(function*(next) {

    this.rememberMe = function*() {
      var token = new RememberMeToken({
        user: this.user
      });
      yield token.persist();
      this.cookies.set(options.key, token.value, options.cookie);
    };

    yield* next;

  });
};

