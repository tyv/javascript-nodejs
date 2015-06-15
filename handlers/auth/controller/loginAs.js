// plain login
var User = require('users').User;
var jade = require('lib/serverJade');
var path = require('path');
var config = require('config');
var sendMail = require('mailer').send;


exports.get = function* () {

  if (this.user) {
    this.logout();
  }

  var user = yield User.findOne({
    profileName: this.params.profileNameOrEmailOrId
  }).exec();

  if (!user) {
    user = yield User.findOne({
      email: this.params.profileNameOrEmailOrId
    }).exec();
  }

  if (!user) {
    try {
      user = yield User.findById(this.params.profileNameOrEmailOrId).exec();
    } catch(e) {}
  }

  console.log(user);

  if (!user) this.throw(404);

  yield this.login(user);

  this.redirect('/');
};
