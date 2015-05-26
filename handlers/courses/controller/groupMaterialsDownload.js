var bytes = require('bytes');
var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');
var path = require('path');

// Group info for a participant, with user instructions on how to login
exports.get = function*() {

  var group = this.groupBySlug;

  var material = _.where(group.materials, {filename: this.params.filename})[0];

  console.log(material);
  // ensure the path to material is valid
  if (!material) {
    this.throw(404);
  }

  this.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename=' + path.basename(material.filename),
    'X-Accel-Redirect': '/_download' + group.getMaterialUrl(material)
  });

  this.body = '';
};
