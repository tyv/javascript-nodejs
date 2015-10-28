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
const newsLetterPopulateContext = require('newsletter').populateContext;

exports.get = function*() {
  this.locals.siteToolbarCurrentSection = "nodejs-screencast";

  yield* newsLetterPopulateContext(this);


  this.body = this.render('index');
};
