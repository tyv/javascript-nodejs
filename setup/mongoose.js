const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');

module.exports = function(app) {

  return function(callback) {

    if (mongoose.connection.readyState == 1) {
      log.debug("Mongoose was connected already");
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


};