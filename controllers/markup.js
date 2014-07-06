var join = require('path').join;

exports.get = function *get(next) {
//  console.log(this.params);
  var path = join('markup', this.params[0]);
  yield this.render(path);
};

