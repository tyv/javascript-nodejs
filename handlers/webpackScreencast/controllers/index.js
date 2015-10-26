'use strict';

var sendMail = require('mailer').send;
var path = require('path');
var config = require('config');

var CourseGroup = require('courses').CourseGroup;
var Course = require('courses').Course;
var money = require('money');
var moment = require('momentWithLocale');
const Subscription = require('newsletter').Subscription;
const Newsletter = require('newsletter').Newsletter;

exports.get = function*() {
  this.locals.siteToolbarCurrentSection = "webpack-screencast";

  let subscription = null;
  if (this.user) {
    subscription = this.locals.subscription = yield Subscription.findOne({
      email: this.user.email
    });
  }

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

  this.body = this.render('index');
};
