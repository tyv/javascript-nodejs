const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const sendMail = require('mailer').send;
const config = require('config');
const _ = require('lodash');

exports.get = function*() {
  this.nocache();

  var subscription = yield Subscription.findOne({
    accessKey: this.params.accessKey
  }).exec();

  if (!subscription) {
    this.throw(404, "Нет такой подписки.");
  }

  var newsletters = yield Newsletter.find({}).sort({weight: 1}).exec();


  this.locals.newsletters = newsletters.map(function(newsletter) {
    return {
      slug:       newsletter.slug,
      title:      newsletter.title,
      period:     newsletter.period,
      // mongoose array can #indexOf ObjectIds
      subscribed: ~subscription.newsletters.indexOf(newsletter._id)
    };
  });

  this.locals.accessKey = this.params.accessKey;

  this.body = this.render('subscriptions');

};


exports.post = function*() {

  var subscription = yield Subscription.findOne({
    accessKey: this.params.accessKey
  }).exec();

  if (!subscription) {
    this.throw(404, "Нет такой подписки.");
  }

  if (this.request.body.remove) {
    yield subscription.destroy();
    this.body = this.render('removed');
    return;
  }

  var slugs = this.request.body.slug || [];

  if (!Array.isArray(slugs)) {
    slugs = [slugs];
  }
  slugs = slugs.map(String);

  var newsletters = yield Newsletter.find({
    slug: {
      $in: slugs
    }
  }).exec();

  subscription.newsletters = _.pluck(newsletters, '_id');

  yield subscription.persist();

  this.addFlashMessage('success', "Настройки обновлены.");

  this.redirect('/newsletter/subscriptions/' + this.params.accessKey);

};

