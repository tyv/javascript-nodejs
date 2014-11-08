var config = require('config');
exports.get = function* (next) {

  this.locals.sitetoolbar = true;

  this.locals.title = user.displayName;

  this.body = this.render('account', {
    title: 'Учетная запись',
    authProvidersNames: Object.keys(config.authProviders)
  });
};

