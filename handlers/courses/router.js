var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;
var router = module.exports = new Router();

router.param('userById', require('users').routeUserById);
router.param('groupBySlug', require('./lib/routeGroupBySlug'));

router.get('/', require('./controller/frontpage').get);
router.get('/:course', require('./controller/course').get);

// same controller for new signups & existing orders
router.get('/groups/:groupBySlug/signup', require('./controller/signup').get);
router.get('/orders/:orderNumber(\\d+)', require('./controller/signup').get);

router.get('/groups/:groupBySlug/info', require('./controller/groupInfo').get);
router.get('/groups/:groupBySlug/materials', require('./controller/groupMaterials').get);
router.all('/invite/:inviteToken?', require('./controller/invite').all);

// for profile
router.get('/profile/:userById', mustBeAuthenticated, require('./controller/coursesByUser').get);
