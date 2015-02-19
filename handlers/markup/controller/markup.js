var join = require('path').join;

exports.get = function *get(next) {
  var path = this.params.path;
  this.body = this.render(path);
};

