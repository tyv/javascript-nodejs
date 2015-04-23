const gp = require('gulp-load-plugins')();
const _ = require('lodash');

module.exports = function(options) {

  return function(callback) {
    gp.nodemon(options);
  };

};
