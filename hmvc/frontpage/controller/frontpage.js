
exports.get = function *get (next) {
  this.render(__dirname, 'index', {
    title: 'Hello, world'
  });
};

