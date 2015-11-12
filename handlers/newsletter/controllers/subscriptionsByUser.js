"use strict";

const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const _ = require('lodash');

/**
 * The order form is sent to checkout when it's 100% valid (client-side code validated it)
 * It uses order.module.createOrderFromTemplate to create an order, it can throw if something's wrong
 * the order CANNOT be changed after submitting to payment
 * @param next
 */
exports.get = function*(next) {

  var user = this.userById;

  if (!this.user._id.equals(user._id) && !this.isAdmin) {
    this.throw(403);
  }

  var subscription = yield Subscription.findOne({
    email: this.user.email
  });


  var newsletters = yield Newsletter.find({}).sort({weight: 1}).exec();

  var newslettersFormatted = newsletters.map(function(newsletter) {
    return {
      slug:       newsletter.slug,
      title:      newsletter.title,
      period:     newsletter.period,
      // mongoose array can #indexOf ObjectIds
      subscribed: Boolean(subscription && ~subscription.newsletters.indexOf(newsletter._id))
    };
  });


  this.body = newslettersFormatted;

};


