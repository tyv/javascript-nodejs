"use strict";

const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const sendMail = require('mailer').send;
const config = require('config');
const _ = require('lodash');

exports.get = function*() {
  console.log("HERE");
  this.nocache();

  var subscription;

  if (this.params.accessKey) {
    subscription = yield Subscription.findOne({
      accessKey: this.params.accessKey
    }).exec();

    if (!subscription) {
      this.throw(404);
    }
  } else if (this.user) {
    subscription = yield Subscription.findOne({
      email: this.user.email
    }).exec();
  }

  this.locals.accessKey = this.params.accessKey;
  this.locals.subscription = subscription;

  var newsletters = yield Newsletter.find({}).sort({weight: 1}).exec();

  this.locals.newsletters = newsletters.map(function(newsletter) {
    return {
      slug:       newsletter.slug,
      title:      newsletter.title,
      period:     newsletter.period,
      // mongoose array can #indexOf ObjectIds
      subscribed: subscription && ~subscription.newsletters.indexOf(newsletter._id)
    };
  });

  this.body = this.render('frontpage');

};

/*
exports.post = function*() {

  var slugs = this.request.body.slug || [];

  if (!Array.isArray(slugs)) {
    slugs = [slugs];
  }
  slugs = slugs.map(String);

  if (this.user) {
    // for auth user subscribe w/o confirmations
    let subscription = yield Subscription.findOne({
      email: this.user.email
    }).exec();

    if (subscription && this.request.body.remove) {
      yield subscription.destroy();
      this.body = this.render('removed');
      return;
    }

    if (!subscription) {
      subscription = new Subscription({
        email:       this.user.email,
        newsletters: []
      });
    }

    // maybe subscription for this user exists and is unconfirmed?
    // then make it confirmed, cause auth user submits it
    subscription.confirmed = true;

    let newsletters = yield Newsletter.find({
      slug: {
        $in: slugs
      }
    }).exec();

    subscription.newsletters = _.pluck(newsletters, '_id');

    yield subscription.persist();

    this.addFlashMessage('success', "Настройки обновлены.");

    this.redirect('/newsletter');
    return;
  }

  // for anon user we must request confirmation
  let subscription = yield Subscription.findOne({
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

*/
