
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use( mountHandlerMiddleware('/newsletter', __dirname) );

  // allow to post from javascript.ru
  // subscriptions require confirmation anyway, so disabling CSRF is safe
  app.csrfChecker.ignore.add('/newsletter/subscribe');
};

exports.Newsletter = require('./models/newsletter');
exports.Subscription = require('./models/subscription');
