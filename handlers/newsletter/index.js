
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use( mountHandlerMiddleware('/newsletter', __dirname) );
};

exports.Newsletter = require('./models/newsletter');
exports.Subscription = require('./models/subscription');