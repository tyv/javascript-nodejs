const mongoose = require('mongoose');
const countries = require('countries');
const CourseFeedback = require('../models/courseFeedback');
const CourseGroup = require('../models/courseGroup');
const User = require('users').User;
const _ = require('lodash');

exports.get = function*() {

  var number = +this.params.feedbackNumber;

  var courseFeedback = this.locals.courseFeedback = yield CourseFeedback.findOne({number: number}).populate('group participant').exec();

  if (!courseFeedback) {
    this.throw(404);
  }

  yield CourseGroup.populate(courseFeedback.group, 'course');

  var authorOrAdmin = this.user.isAdmin || String(this.user._id) == String(courseFeedback.participant.user);
  this.locals.authorOrAdmin = authorOrAdmin;

  if (!courseFeedback.isPublic && !authorOrAdmin) {
    this.throw(403, "Отзыв не публичный");
  }

  this.locals.participantUser = yield User.findById(courseFeedback.participant.user).exec();

  var group = this.locals.group = courseFeedback.group;

  this.locals.title = "Отзыв\n" + group.title;

  this.locals.countries = countries.all;

  if (authorOrAdmin) {
    this.locals.editLink = `/courses/groups/${courseFeedback.group.slug}/feedback`;
  }

  this.body = this.render('feedback/show');

};

