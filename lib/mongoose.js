/**
 * This file must be required at least ONCE.
 * After it's done, one can use require('mongoose')
 *
 * In web-app: this is done at init phase
 * In tests: in mocha.opts
 * In gulpfile: in beginning
 */

var mongoose = require('mongoose');
var requireTree = require('require-tree');
var path = require('path');
var fs = require('fs');
var log = require('javascript-log')(module);

//mongoose.set('debug', true);

var config = require('config');
var _ = require('lodash');

mongoose.connect(config.mongoose.uri, config.mongoose.options);

// bind context now for thunkify without bind
_.bindAll(mongoose.connection);
_.bindAll(mongoose.connection.db);

// plugin from https://github.com/LearnBoost/mongoose/issues/1859
// yield.. .persist() or .destroy() for generators instead of save/remove
// mongoose 3.10 will not need that (!)
mongoose.plugin(function(schema) {
  schema.methods.persist = function(body) {
    var model = this;

    return function(callback) {
      if (body) model.set(body);
      model.save(callback);
    };
  };
  schema.methods.destroy = function() {
    var model = this;

    return function(callback) {
      model.remove(callback);
    };
  };

  schema.statics.destroy = function(query) {
    return function(callback) {
      this.remove(query, callback);
    }.bind(this);
  };
});

mongoose.waitConnect = function(callback) {
  if (mongoose.connection.readyState == 1) {
    setImmediate(callback);
  } else {
    // we wait either for an error
    // OR
    // for a successful connection
    mongoose.connection.on("connected", onConnected);
    mongoose.connection.on("error", onError);
  }

  function onConnected() {
    log.debug("Mongoose has just connected");
    cleanUp();
    callback();
  }

  function onError(err) {
    log.debug('Failed to connect to DB', err);
    cleanUp();
    callback(err);
  }

  function cleanUp() {
    mongoose.connection.removeListener("connected", onConnected);
    mongoose.connection.removeListener("error", onError);
  }
};



module.exports = mongoose;

//requireTree('../model');
/*
// models may want this mongoose that's why we require them AFTER module.exports = mongoose
requireModels();

function requireModels() {
  var root = process.cwd();

  requireTree(path.join(root, 'model'));

  var hmvcApps = fs.readdirSync(path.join(root, 'hmvc'));
  hmvcApps.forEach(function(hmvcDir) {
    var modelPath = path.join(path.join(root), 'hmvc', hmvcDir, 'model');
    if (fs.existsSync(modelPath)) requireTree(modelPath);
  });
}
*/
