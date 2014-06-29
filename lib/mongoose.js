var mongoose = require('mongoose');

// mongoose.set('debug', true);

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
  schema.method('persist', function(body) {
    var model = this;

    return function(callback) {
      if (body) model.set(body);
      model.save(callback);
    };
  });
  schema.method('destroy', function() {
    var model = this;

    return function(callback) {
      model.remove(callback);
    };
  });
});

module.exports = mongoose;

// models use mongoose that's why we require them AFTER module.exports = mongoose
require('models');