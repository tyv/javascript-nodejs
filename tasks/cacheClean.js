const gulp = require('gulp');
const mongoose = require('config/mongoose');

const CacheEntry = require('cache').CacheEntry;

module.exports = function() {

  return function(callback) {
    CacheEntry.remove(function(err) {
      if (err) return callback(err);
      mongoose.disconnect();
      callback();
    });
  };

};

