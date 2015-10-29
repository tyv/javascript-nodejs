'use strict';

var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use( mountHandlerMiddleware('/newsletter', __dirname) );

  // allow to post from javascript.ru
  // subscriptions require confirmation anyway, so disabling CSRF is safe
  app.csrfChecker.ignore.add('/newsletter/subscribe');
};

let Newsletter = exports.Newsletter = require('./models/newsletter');
let Subscription = exports.Subscription = require('./models/subscription');

exports.populateContext = function* (context) {

  /*
  let subscription = null;
  if (context.user) {
    subscription = context.locals.subscription = yield Subscription.findOne({
      email: context.user.email
    });
  }
*/
  var newsletters = yield Newsletter.find({}).sort({weight: 1}).exec();

  context.locals.newsletters = newsletters.map(function(newsletter) {
    return {
      slug:       newsletter.slug,
      title:      newsletter.title,
      period:     newsletter.period
      // mongoose array can #indexOf ObjectIds
      // subscribed: subscription && ~subscription.newsletters.indexOf(newsletter._id)
    };
  });
};
