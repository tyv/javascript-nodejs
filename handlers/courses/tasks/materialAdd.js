var co = require('co');
var gutil = require('gulp-util');
var yargs = require('yargs');
var CourseMaterial = require('../models/courseMaterial');
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');
var path = require('path');

module.exports = function() {

  return function() {

    var argv = require('yargs')
      // file should be in download/courses/js-1/js-basic.zip
      .usage('gulp courses:materials:add --group js-1 --title "Введение" --file js-basic.zip')
      .demand(['group', 'file'])
      .argv;


    return co(function*() {
      var group = yield CourseGroup.findOne({slug: argv.group}).exec();

      if (!group) {
        throw new Error("No group:" + argv.group);
      }

      if (_.some(group.materials, {filename: argv.file})) {
        throw new Error(`Material ${argv.file} already exists in group ${argv.group}`);
      }

      group.materials.push({
        title: argv.title || argv.file,
        filename: argv.file
      });

      yield group.persist();

      gutil.log(`Added ${argv.file} to group ${argv.group}`);
    });

  };

};
