"use strict";

const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const sendMail = require('mailer').send;
const config = require('config');
const _ = require('lodash');

exports.get = function*() {
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
    });
  }

  this.locals.email = subscription ? subscription.email :
    this.user ? this.user.email : null;

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

