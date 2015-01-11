var Router = require('koa-router');

var query = require('./controllers/query');


var router = module.exports = new Router();

/**
 * REST API
 * /users/me   GET PATCH DEL
 * /users/:id  GET PATCH DEL (for admin or self)
 */

router.get('/', query.get);
