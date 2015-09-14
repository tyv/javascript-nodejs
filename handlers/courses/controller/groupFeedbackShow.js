const mongoose = require('mongoose');
const countries = require('countries');
const CourseFeedback = require('../models/courseFeedback');
const CourseParticipant = require('../models/courseParticipant');
const CourseGroup = require('../models/courseGroup');
const User = require('users').User;
const _ = require('lodash');
const renderSimpledown = require('renderSimpledown');

exports.get = function*() {

  var number = +this.params.feedbackNumber;

  var courseFeedback = yield CourseFeedback.findOne({number: number}).populate('group participant');

  if (!courseFeedback) {
    this.throw(404);
  }

  yield CourseGroup.populate(courseFeedback.group, 'course teacher');
  yield CourseParticipant.populate(courseFeedback.participant, "user");

  var authorOrAdmin = false;
  if (this.user) {
    if (this.isAdmin || String(this.user._id) == String(courseFeedback.participant.user._id)) {
      authorOrAdmin = true;
    }
  }

  if (!courseFeedback.isPublic && !authorOrAdmin) {
    this.throw(403, "Отзыв не публичный");
  }

  var group = this.locals.group = courseFeedback.group;

  this.locals.title = "Отзыв\n" + group.title;
  this.locals.headTitle = "Отзыв на " + group.title;

  this.locals.countries = countries.all;

  var isTeacher = this.user && (this.isAdmin || String(this.user._id) == String(group.teacher._id));

  this.locals.courseFeedback = {
    photo:     courseFeedback.photo || courseFeedback.participant.user.getPhotoUrl(),
    author:    {
      link: courseFeedback.participant.user.getProfileUrl(),
      name: courseFeedback.participant.fullName
    },
    country:   courseFeedback.country,
    city:      courseFeedback.city,
    created:   courseFeedback.created,
    aboutLink: courseFeedback.aboutLink,
    stars:     courseFeedback.stars,
    recommend: courseFeedback.recommend,
    course:    {
      title: group.course.title
    },
    teacher: {
      link: "/courses/teacher/" + group.teacher.profileName,
      name: group.teacher.displayName
    },
    content:   renderSimpledown(courseFeedback.content, {trusted: false}),
    isTeacher: isTeacher,
    number: courseFeedback.number,
    teacherComment: courseFeedback.teacherComment ? renderSimpledown(courseFeedback.teacherComment, {trusted: false}) : '',
    teacherCommentRaw: isTeacher ? (courseFeedback.teacherComment || '') : ''
  };

  if (authorOrAdmin) {
    courseFeedback.editLink = `/courses/groups/${courseFeedback.group.slug}/feedback`;
  }

  courseFeedback.share = true;

  this.body = this.render('feedback/show');


};

