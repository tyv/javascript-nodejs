const gulp = require('gulp');
const mocha = require('gulp-mocha');
const assert = require('assert');

require('should');
require('co-mocha');
require('lib/requireJade');

module.exports = function(options) {

  return function() {
    assert(process.env.NODE_ENV == 'test', "NODE_ENV=test must be set");

    return gulp.src(options.glob)
      .pipe(mocha(options));
  };

};

