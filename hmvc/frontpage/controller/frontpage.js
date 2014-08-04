
exports.get = function *get (next) {
  this.body = this.render(__dirname, 'index', {
    title: 'Hello, world'
  });
};

