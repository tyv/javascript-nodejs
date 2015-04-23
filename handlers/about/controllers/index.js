var sendMail = require('mailer').send;
var path = require('path');
var config = require('config');

exports.get = function*() {
  this.locals.siteToolbarCurrentSection = "about";
  this.body = this.render('index');
};
