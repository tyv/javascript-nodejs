const mongoose = require('lib/mongoose');

const shimmer = require('shimmer');
const clsNamespace = require('continuation-local-storage').getNamespace('app');

shimmer.wrap(mongoose.Mongoose.prototype.Promise.prototype, 'on', function (original) {
  return function(event, callback) {
    callback = clsNamespace.bind(callback);
    return original.call(this, event, callback);
  };
});


exports.boot = function*() {

  if (process.env.NODE_ENV == 'production') {
    yield function(callback) {
      mongoose.waitConnect(callback);
    };
  }

  /* in ebook no elasticsearch, so I don't boot it here
   var elastic = elasticClient();
   yield elastic.ping({
   requestTimeout: 1000
   });
   */
};


exports.close = function*() {
  yield function(callback) {
    mongoose.disconnect(callback);
  };
};
