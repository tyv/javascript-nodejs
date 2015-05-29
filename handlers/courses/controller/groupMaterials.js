var bytes = require('bytes');
var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');

// Group info for a participant, with user instructions on how to login
exports.get = function*() {

  var group = this.locals.group = this.groupBySlug;

  if (!group.materials) {
    this.throw(404);
  }

  this.locals.title = "Материалы для обучения\n" + group.title;

  var participant = group.participants.filter(function(p) {
    return String(p.user) == String(this.user._id);
  }.bind(this))[0];

  this.locals.participant = participant;

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

  this.body = this.render('groupMaterials', {
    videoKey: participant.videoKey
  });
};
