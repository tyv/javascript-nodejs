
exports.post = function*(next) {
  this.cookies.set('remember'); // remove "remember me" cookie
  this.cookies.set('remember.sig');

  this.cookies.set('sid'); // logout removes sid, but not sid.sig (3rd party bug?)
  this.cookies.set('sid.sig');

  this.logout();
  this.session = null;
  this.redirect('/');
};

