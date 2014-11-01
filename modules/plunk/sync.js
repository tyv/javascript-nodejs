var request = require('koa-request');
var config = require('config');
var assert = require('assert');
var readFs = require('./readFs');
var writeMeta = require('./writeMeta');
var _ = require('lodash');
var log = require('log')();

function* sync(dir) {
  log.debug("sync", dir);
  var plunk = yield* readFs(dir);

  if (!plunk) return false;

  log.debug("read plunk", plunk);

  var existingPlunk;
  if (plunk.meta.id) {
    existingPlunk = yield* fetch(plunk.meta.id);
  }

  log.debug("existing plunk", existingPlunk);

  if (existingPlunk) {
    yield* update(existingPlunk, plunk);
    writeMeta(dir, existingPlunk.id);
  } else {
    var id = yield* create(plunk);
    writeMeta(dir, id);
  }

}

function* create(plunk) {

  var form = {
    description: '',
    tags:        [],
    files:       _.cloneDeep(plunk.files),
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
}


function* update(existingPlunk, plunk) {

  var form = {
    description: '',
    tags:        {},
    files:       _.cloneDeep(plunk.files)
  };

  // explicitly fileName:null for all removed files
  for (var fileName in existingPlunk.files) {
    if (!form.files[fileName]) {
      form.files[fileName] = null;
    }
  }

  for (var fileName in form.files) {
    if (form.files[fileName] == null) continue; // file is deleted
    if (form.files[fileName].content == existingPlunk.files[fileName].content) {
      delete form.files[fileName]; // same file, remove from update
    }
  }

  if (_.isEmpty(form.files)) {
    log.debug("Existing plunk is up to date");
    return;
  }

  var result = yield request({
    method:  'POST',
    headers: {'Content-Type': 'application/json'},
    json:    true,
    url: "http://api.plnkr.co/plunks/" + existingPlunk.id + "?sessid=" + config.plnkrAuthId,
    body:    JSON.stringify(form)
  });

  assert.equal(result.statusCode, 200);
}

function* fetch(id) {
  var existingPlunkResponse = yield request({
    headers: {'Content-Type': 'application/json'},
    url: "http://api.plnkr.co/plunks/" + id + "?sessid=" + config.plnkrAuthId,
    json:    true
  });

  assert.equal(existingPlunkResponse.statusCode, 200, "Incorrect response code");
  return existingPlunkResponse.body;
}


module.exports = sync;
/*
var dir = '/js/javascript-nodejs/javascript-tutorial/01-js/09-prototypes/05-class-inheritance/03-clock-class/solution';
require('co')(sync(dir))(function(err, res) {
  if (err) console.error(err.message, err.stack);
  else console.log(res);
});
*/