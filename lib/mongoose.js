var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.mongoose.uri, config.mongoose.options);


// plugin from https://github.com/LearnBoost/mongoose/issues/1859
// yield.. .persist() or .destroy() for generators instead of save/remove
mongoose.plugin(function(schema) {
  schema.method('persist', function(body) {
    var model = this;

    return function(callback) {
      model.set(body);
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


