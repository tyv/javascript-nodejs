var join = require('path').join;

exports.get = function *get(next) {

  var path = this.params[0];
  this.render(__dirname, path);
};

