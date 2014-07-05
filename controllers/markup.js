var join = require('path').join;

exports.get = function *get (next) {
  var path = join('markup', this.params[0]);
  console.log(this.params);
  console.log(this.params[0]);
  yield this.render(path);
};

