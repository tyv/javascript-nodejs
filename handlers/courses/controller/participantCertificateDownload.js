var config = require('config');
var CourseParticipant = require('../models/courseParticipant');
var CourseGroup = require('../models/courseGroup');
var _ = require('lodash');
var moment = require('momentWithLocale');
var path = require('path');
var mongoose = require('mongoose');
var exec = require('child_process').exec;

// Group info for a participant, with user instructions on how to login
exports.get = function*() {

  var id = this.params.participantId;
  try {
    new mongoose.Types.ObjectId(id);
  } catch (e) {
    // cast error (invalid id)
    this.throw(404);
  }

  var participant = yield CourseParticipant.findOne({
    _id: id,
    isActive: true
  }).populate('group').exec();

  if (!participant) {
    this.throw(404);
  }

  if (String(participant.user) != String(this.user._id)) {
    this.throw(403);
  }
  yield CourseGroup.populate(participant.group, {path: 'course'});

  var dateStart = moment(participant.group.dateStart).format('DD.MM.YYYY');
  var dateEnd = moment(participant.group.dateEnd).format('DD.MM.YYYY');

  var cmd = `/usr/bin/convert ${config.projectRoot}/extra/courses/cert-blank-300dpi.jpg \
    -font ${config.projectRoot}/extra/courses/font/calibri.ttf -pointsize 70 \
   -annotate +900+1050 'Настоящим удостоверяется, что с ${dateStart} по ${dateEnd}' \
   -fill "#7F0000" -pointsize 140 -annotate +900+1250 '${participant.fullName}' \
   -fill black -pointsize 70 -annotate +900+1400 'прошёл(а) обучение по программе' \
   -fill black -pointsize 70 -annotate +900+1500 '"${participant.group.course.title}"' \
    jpeg:-`;

  //console.log(cmd);
  /*
   var cmd = `/opt/local/bin/convert ${config.projectRoot}/extra/courses/cert-blank-600dpi.jpg \
   -font ${config.projectRoot}/extra/courses/font/calibri.ttf -pointsize 140 \
   -annotate +1800+2100 'Настоящим удостоверяется, что с ${dateStart} по ${dateEnd}' \
   -fill "#7F0000" -pointsize 280 -annotate +1800+2500 '${participant.fullName}' \
   -fill black -pointsize 140 -annotate +1800+2800 'прошёл(а) обучение по программе' \
   -fill black -pointsize 140 -annotate +1800+3000 '${participant.group.course.title}' \
   -`;*/

  var buffer = yield function(callback) {
    exec(cmd, {
        encoding:  'buffer',
        timeout:   10000,
        maxBuffer: 50 * 1024 * 1025
      },
      function(error, stdout, stderr) {
        callback(error ? stderr : null, stdout);
      });
  };

  this.set({
    'Content-Type': 'image/jpeg'
  });

  this.body = buffer;
};
