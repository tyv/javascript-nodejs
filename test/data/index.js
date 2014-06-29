"use strict";

var mongoose = require('lib/mongoose');
var log = require('lib/log')(module);
var co = require('co');
var thunk = require('thunkify');
var db = mongoose.connection.db;

//log.debugOn();

function *createEmptyDb() {

  function *open() {

    if (mongoose.connection.readyState == 1) { // connected
      return;
    }

    yield thunk(mongoose.connection.on)('open');

  }

  function *clearDatabase() {

    var collections = yield thunk(db.collectionNames)();

    var collectionNames = collections
      .map(function(collection) {
        var collectionName = collection.name.slice(db.databaseName.length + 1);
        if (collectionName.indexOf('system.') === 0) {
          return null;
        }
        return collectionName;
      })
      .filter(function(name) {
        return name;
      });

    yield collectionNames.map(function(name) {
      log.debug("drop ", name);
      return thunk(db.dropCollection)(name);
    });

  }

  // wait till indexes are complete, especially unique
  // required to throw errors
  function *ensureIndexes() {

    yield mongoose.modelNames().map(function(modelName) {
      var model = mongoose.models[modelName];
      return thunk(model.ensureIndexes.bind(model))();
    });

  }

  // ensure that capped collections are actually capped
  function *ensureCapped() {

    yield mongoose.modelNames().map(function(modelName) {
      var model = mongoose.models[modelName];
      var schema = model.schema;
      if (!schema.options.capped) return;

      return thunk(db.command)({convertToCapped: model.collection.name, size: schema.options.capped});
    });
  }

  log.debug("co");

  yield open;
  log.debug("open");

  yield clearDatabase;
  log.debug("clear");

  yield ensureIndexes;
  log.debug('indexes');

  yield ensureCapped;
  log.debug('capped');

}

// not using pow-mongoose-fixtures, becuae it fails with capped collections
// it calls remove() on them => everything dies
function *loadDb(dataFile) {
  yield createEmptyDb;

  var modelsData = require('test/data/' + dataFile);

  yield Object.keys(modelsData).map(function(modelName) {
    return loadModel(modelName, modelsData[modelName]);
  });
}

function *loadModel(name, data) {

  var Model = mongoose.models[name];

  yield data.map(function(itemData) {
    var model = new Model(itemData);
    log.debug("save", itemData);
    return model.persist();
  });

}

exports.loadDb = loadDb;
exports.createEmptyDb = createEmptyDb;

/*
Usage:
co(loadDb('sampleDb'))(function(err) {
  if (err) throw err;
  mongoose.connection.close();
});*/