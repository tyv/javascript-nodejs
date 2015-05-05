var KoaRouter = require('koa-router');
var inherits = require('inherits');
var mongoose = require('mongoose');
var User = require('users').User;

function Router() {
  KoaRouter.apply(this, arguments);

  this.param('userById', function*(id, next) {

    try {
      new mongoose.Types.ObjectId(id);
    } catch (e) {
      // cast error (invalid id)
      this.throw(404);
    }

    var user = yield User.findById(id).exec();

    if (!user) {
      this.throw(404);
    }

    this.userById = user;

    yield* next;
  });
}

inherits(Router, KoaRouter);

module.exports = Router;
