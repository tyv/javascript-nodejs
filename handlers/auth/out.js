exports.get = function*(next) {
  this.logout();
  this.redirect('/');
};
