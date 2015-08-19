var bytes = require('bytes');
var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var CourseParticipant = require('../models/courseParticipant');
var _ = require('lodash');

// Group info for a participant, with user instructions on how to login
exports.get = function*() {

  var group = this.locals.group = this.groupBySlug;

  if (!group.materials) {
    this.throw(404);
  }

  this.locals.title = "Материалы для обучения\n" + group.title;

  this.locals.participant = this.participant;

  this.locals.teacher = this.teacher;

  var materials = this.locals.materials = [];
  for (var i = 0; i < group.materials.length; i++) {
    var material = group.materials[i];
    materials.push({
      title:   material.title,
      created: material.created,
      url:     group.getMaterialUrl(material),
      size:    bytes(yield* group.getMaterialFileSize(material))
    });
  }

  this.body = this.render('groupMaterials');
};
