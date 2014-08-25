var config = require('config');
exports.get = function* (next) {

  this.body = this.render('account', {
    title: 'Учетная запись',
    authProvidersNames: Object.keys(config.authProviders)
  });
};

