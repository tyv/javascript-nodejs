var mongoose = require('mongoose');
var assert = require('assert');
var request = require('koa-request');
var config = require('config');
var Schema = mongoose.Schema;
var _ = require('lodash');
var log = require('log')();

var REMOTE_OFF = true;

var schema = new Schema({
  description: {
    type:    String,
    default: ""
  },
  webPath:     {
    type:   String,
    unique: true,
    required: true
  },
  plunkId:     {
    type: String,
    required: true
  },
  files: [{
    filename:    String,
    content: String
  }]
});

schema.methods.getUrl = function() {
  return 'http://plnkr.co/edit/' + this.plunkId + '?p=preview';
};

/**
 * Merges files into the current plunk
 * @param files
 * @returns {boolean} new files list to post w/ nulls where files are deleted
 */
schema.methods.mergeAndSyncRemote = function*(files) {

  var changes = {};

  /* delete this.files which are absent in files */
  for (var i = 0; i < this.files.length; i++) {
    var file = this.files[i];
    if (!files[file.filename]) {
      this.files.splice(i--, 1);
      changes[file.filename] = null; // for submitting to plnkr
    }
  }

  for (var name in files) {
    var existingFile = this.files.find(function(item) { return item.filename == name });
    if (existingFile) {
      if (existingFile.content == files[name].content) continue;
      existingFile.content = files[name].content;
    } else {
      this.files.push(files[name]);
    }
    changes[name] = files[name];
  }

  if (_.isEmpty(changes)) {
    log.debug("no changes, skip updating");
    return;
  }

  if (this.plunkId) {
    log.debug("update remotely", this.webPath, this.plunkId);
    yield* Plunk.updateRemote(this.plunkId, changes);
  } else {
    log.debug("create plunk remotely", this.webPath);
    this.plunkId = yield* Plunk.createRemote(this.description, this.files);
  }

  yield this.persist();

};

schema.statics.createRemote = function*(description, files) {

  if (REMOTE_OFF) {
    return Math.random().toString(36).slice(2);
  }

  var filesObj = {};
  files.forEach(function(file) {
    filesObj[file.filename] = {
      filename: file.filename,
      content: file.content
    }; // no _id
  });

  var form = {
    description: description,
    tags:        [],
    files:       filesObj,
    private:     true
  };

  var result = yield request({
    method:  'POST',
    headers: {'Content-Type': 'application/json'},
    json:    true,
    url: "http://api.plnkr.co/plunks/?sessid=" + config.plnkrAuthId,
    body:    JSON.stringify(form)
  });

  assert.equal(result.statusCode, 201);

  return result.body.id;

};

schema.statics.updateRemote = function* (plunkId, changes) {


  if (REMOTE_OFF) {
    return;
  }

  var form = {
    tags:        {},
    files:       changes
  };

  var result = yield request({
    method:  'POST',
    headers: {'Content-Type': 'application/json'},
    json:    true,
    url: "http://api.plnkr.co/plunks/" + plunkId + "?sessid=" + config.plnkrAuthId,
    body:    JSON.stringify(form)
  });

  assert.equal(result.statusCode, 200);
};


var Plunk = module.exports = mongoose.model('Plunk', schema);


