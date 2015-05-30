// plain login
var User = require('users').User;
var jade = require('lib/serverJade');
var path = require('path');
var config = require('config');
var sendMail = require('mailer').send;


exports.get = function* () {

  // logged in?
  if (this.user) {
    this.redirect('/');
    return;
  }

  console.log(this.flash);

  this.locals.authOptions = {
    successRedirect: this.flash.successRedirect || '/',
    message: this.flash.messages[0]
  };

  this.body = this.render('login');
};
