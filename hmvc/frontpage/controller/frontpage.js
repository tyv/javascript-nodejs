
exports.get = function *get (next) {
  this.body = this.render('index', {
    title: 'Hello, world'
  });
};

