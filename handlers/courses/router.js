var Router = require('koa-router');

var router = module.exports = new Router();

router.get('/', require('./controller/frontpage').get);
router.get('/:course', require('./controller/course').get);

// same controller for new signups & existing orders
router.get('/groups/:group/signup', require('./controller/signup').get);
router.get('/orders/:orderNumber(\\d+)', require('./controller/signup').get);

router.get('/groups/:group/info', require('./controller/groupInfo').get);
router.all('/invite/:inviteToken?', require('./controller/invite').all);

// for profile
router.get('/user/:userById', require('./controller/coursesByUser').get);
