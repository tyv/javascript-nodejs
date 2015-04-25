// must be above router, because router uses auth (which uses user)
// cyclic require here

exports.User = require('./models/user');

var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {

  app.use( mountHandlerMiddleware('/users', __dirname) );

  app.use(function*(next) {
    Object.defineProperty(this, 'isAdmin', {
      get: function() {
        return this.user && this.user.isAdmin;
      }
    });
    yield* next;
  });

  app.multipartParser.ignore.add('/users/:id'); // also handles /users/me

};

