const mongoose = require('mongoose');
const countries = require('countries');
const CourseFeedback = require('../models/courseFeedback');
const CourseParticipant = require('../models/courseParticipant');
const CourseGroup = require('../models/courseGroup');
const User = require('users').User;
const _ = require('lodash');
const renderSimpledown = require('renderSimpledown');
const CacheEntry = require('cache').CacheEntry;

module.exports = function*(courseFeedback, user) {

  var doRender = renderFeedback.bind(null, courseFeedback, user);

  if (user) {
    if (courseFeedback.userCache.equals(user._id) || courseFeedback.teacherCache.equals(user._id) || user.isAdmin) {
      return yield* doRender();
    }
  }

  return yield* CacheEntry.getOrGenerate({
    key:  'coursefeedback:' + courseFeedback.number,
    tags: ['coursefeedback']
  }, doRender);


};

function* renderFeedback(courseFeedback, user) {
  yield CourseFeedback.populate(courseFeedback, 'group participant');
  yield CourseGroup.populate(courseFeedback.group, 'course teacher');
  yield CourseParticipant.populate(courseFeedback.participant, "user");

  var authorOrAdmin = false;
  if (user) {
    if (user.isAdmin || user._id.equals(courseFeedback.participant.user._id)) {
      authorOrAdmin = true;
    }
  }

  var isTeacher = user && (user.isAdmin || user._id.equals(courseFeedback.group.teacher._id));

  var rendered = {
    photo:             courseFeedback.photo || courseFeedback.participant.user.getPhotoUrl(),
    author:            {
      userId: courseFeedback.participant.user._id,
      link: courseFeedback.participant.user.getProfileUrl(),
      name: courseFeedback.participant.fullName
    },
    country:           courseFeedback.country,
    city:              courseFeedback.city,
    created:           courseFeedback.created,
    aboutLink:         courseFeedback.aboutLink,
    stars:             courseFeedback.stars,
    recommend:         courseFeedback.recommend,
    course:            {
      link: courseFeedback.group.course.getUrl(),
      titleShort: courseFeedback.group.course.titleShort || courseFeedback.group.course.title,
      title: courseFeedback.group.course.title
    },
    teacher:           {
      link: courseFeedback.group.teacher.getProfileUrl(),
      name: courseFeedback.group.teacher.displayName
    },
    content:           renderSimpledown(courseFeedback.content, {trusted: false}),
    isTeacher:         isTeacher,
    number:            courseFeedback.number,
    teacherComment:    courseFeedback.teacherComment ? renderSimpledown(courseFeedback.teacherComment, {trusted: false}) : '',
    teacherCommentRaw: isTeacher ? (courseFeedback.teacherComment || '') : '',
    editLink:          authorOrAdmin ? `/courses/groups/${courseFeedback.group.slug}/feedback` : null
  };


  return rendered;

}
