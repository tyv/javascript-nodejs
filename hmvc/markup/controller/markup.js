var join = require('path').join;

exports.get = function *get(next) {

  var path = this.params[0];
  this.body = this.render(__dirname, path);
};

