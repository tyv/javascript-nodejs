var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');

// Group info for a participant, with user instructions on how to login
exports.get = function*() {

  var group = this.locals.group = this.groupBySlug;

  this.locals.title = "Материалы для обучения\n" + group.title;

  this.body = this.render('groupMaterials', {
    videoKey: participant.videoKey
  });
};
