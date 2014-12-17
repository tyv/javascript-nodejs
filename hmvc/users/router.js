var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;
var User = require('./models/user');
var mongoose = require('mongoose');
var router = module.exports = new Router();
var id = require('./controllers/id');

/**
 * REST API
 * /users/me   GET PATCH DEL
 * /users/:id  GET PATCH DEL (for admin or self)
 */

router.get('/me', mustBeAuthenticated, loadUserByReq, id.get);
router.patch('/me', mustBeAuthenticated, loadUserByReq, id.patch);
//router.post('/me', id.patch);
router.del('/me', mustBeAuthenticated, loadUserByReq, id.del);

router.get('/:id', loadUserById, id.get);
router.patch('/:id', loadUserById, id.patch);
router.del('/:id', loadUserById, id.del);

function* loadUserByReq(next) {

  //yield function(callback) {}

  this.params.user = this.req.user;
  yield* next;
}

function* loadUserById(next) {

  try {
    mongoose.Types.ObjectId.fromString(this.params.id);
  } catch (e) {
    // cast error (invalid id)
    this.throw(404);
  }

  var user = yield User.findById(this.params.id).exec();

  if (!user) {
    this.throw(404);
  }

  var allowed = false;

  // public info open to everyone
  if (~['GET', 'OPTIONS', 'HEAD'].indexOf(this.method)) {
    allowed = true;
  }

  // modification allowed to admin or user himself
  if (this.req.user) {
    if (this.req.user._id == user._id || this.req.user.isAdmin) {
      allowed = true;
    }
  }

  if (allowed) {
    this.params.user = user;
    yield* next;
  } else {
    this.throw(403, "Not enough permissions");
  }
}
