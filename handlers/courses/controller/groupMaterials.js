'use strict';

var bytes = require('bytes');
var Course = require('../models/course');
var sendMail = require('mailer').send;
var path = require('path');
var CourseGroup = require('../models/courseGroup');
var CourseParticipant = require('../models/courseParticipant');
var _ = require('lodash');
var multiparty = require('multiparty');
var config = require('config');
var fs = require('mz/fs');

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

exports.post = function*() {

  var self = this;

  var group = this.groupBySlug;

  self.files = {};
  yield new Promise(function(resolve, reject) {

    var form = new multiparty.Form({
      autoFields: true,
      autoFiles: true,
      maxFilesSize: 512*1024*1024 // 512MB max file size
    });

    // multipart file must be the last
    form.on('file', function(name, file) {
      self.files[name] = file;
    });

    form.on('error', reject);


    form.on('field', function(name, value) {
      self.request.body[name] = value;
    });

    form.on('close', resolve);

    form.parse(self.req);
  });

  var file = this.files.materials;
  /*
    file example: (@see multiparty)
  { fieldName: 'materials',
   originalFilename: '10_types_intro_protected.zip',
   path: '/var/folders/41/nsmzxxxn0fx7c656wngnq_wh0000gn/T/3o-PzBrAMsX5W35KZ5JH0HKw.zip',
   headers:
   { 'content-disposition': 'form-data; name="materials"; filename="10_types_intro_protected.zip"',
   'content-type': 'application/zip' },
   size: 14746520 }
   */

  var participants = yield CourseParticipant.find({
    isActive: true,
    shouldNotifyMaterials: true,
    group: group._id
  }).populate('user');

  // remove old file with same name just in case
  for(let i=0; i<group.materials.length; i++) {
    if (group.materials[i].filename == file.originalFilename) {
      group.materials.splice(i--, 1);
    }
  }

  var material = {
    title:    file.originalFilename,
    filename: file.originalFilename
  };

  var filePath = `${config.downloadRoot}/courses/${group.slug}/${material.filename}`;

  yield fs.rename(file.path, filePath);

  group.materials.unshift(material);

  yield group.persist();

  var recipients = participants
    .map(function(participant) {
      return {email: participant.user.email, name: participant.fullName};
    });

  yield sendMail({
    templatePath: path.join(__dirname, '../templates/email/materials'),
    subject:      "Добавлены материалы курса",
    to:           recipients, // recipients
    comment:      this.request.body.comment,
    link:         config.server.siteHost + `/courses/groups/${group.slug}/materials`,
    fileLink:     config.server.siteHost + `/courses/download/${group.slug}/${material.filename}`,
    fileTitle:    material.title
  });

  this.addFlashMessage('success', 'Материал добавлен, уведомления разосланы.');

  this.redirect(this.originalUrl);
};

