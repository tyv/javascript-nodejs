
exports.get = function *get (next) {


  this.body = {
    username: this.req.user.username,
    email: this.req.user.email,
    created: this.req.user.created
  };

};


