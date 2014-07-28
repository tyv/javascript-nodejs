const mongoose = require('mongoose');
const passport = require('koa-passport');
const config = require('config');


module.exports = function(app) {

  app.use(passport.initialize());
  app.use(passport.session());

};
