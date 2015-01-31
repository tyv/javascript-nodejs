var Router = require('koa-router');

var index = require('./controllers/index');

var router = module.exports = new Router();

/**
 * REST API
 * /users/me   GET PATCH DEL
 * /users/:id  GET PATCH DEL (for admin or self)
 */

router.get('/', index.get);
