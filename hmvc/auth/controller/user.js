
exports.get = function *get (next) {

  this.body = {
    displayName: this.req.user.displayName,
    email: this.req.user.email,
    created: this.req.user.created
  };

};


