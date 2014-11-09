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

router.get('/me', mustBeAuthenticated, loadByReq, id.get);
router.patch('/me', mustBeAuthenticated, loadByReq, id.patch);
//router.post('/me', id.patch);
router.del('/me', mustBeAuthenticated, loadByReq, id.del);

router.get('/:id', loadById, id.get);
router.patch('/:id', loadById, id.patch);
router.del('/:id', loadById, id.del);

function* loadByReq(next) {
  this.params.user = this.req.user;
  yield next;
}

function* loadById(next) {

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
  if (['GET', 'OPTIONS', 'HEAD'].indexOf(this.method) != -1) {
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
    yield next;
  } else {
    this.throw(403, "Операция запрещена");
  }
}
