
exports.get = function *get (next) {
  this.render('index', {
    title: 'Hello, world'
  });
};

