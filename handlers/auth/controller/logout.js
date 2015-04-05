
exports.post = function*(next) {
  this.cookies.set('remember'); // remove "remember me" cookie
  this.logout();
  this.redirect('/');
};

