
// DEPRECATED NOT USED
exports.get = function *get (next) {
  this.body = {
    login:    this.render('login-form'),
    register: this.render('register-form'),
    forgot:   this.render('forgot-form')
  };

  this.expires = 600;
};
