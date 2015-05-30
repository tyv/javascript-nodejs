var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;
var mustBeParticipant = require('./lib/mustBeParticipant');
var router = module.exports = new Router();

router.param('userById', require('users').routeUserById);
router.param('groupBySlug', require('./lib/routeGroupBySlug'));

router.get('/', require('./controller/frontpage').get);
router.get('/:course', require('./controller/course').get);

// same controller for new signups & existing orders
router.get('/groups/:groupBySlug/signup', require('./controller/signup').get);
router.get('/orders/:orderNumber(\\d+)', require('./controller/signup').get);

router.get('/groups/:groupBySlug/info', mustBeParticipant, require('./controller/groupInfo').get);
router.get('/groups/:groupBySlug/materials', mustBeParticipant, require('./controller/groupMaterials').get);

// not groups/:groupBySlug/* url,
// because the prefix /course/download must be constant for nginx to proxy *.zip to node
router.get('/download/:groupBySlug/:filename', mustBeParticipant, require('./controller/groupMaterialsDownload').get);

router.all('/groups/:groupBySlug/feedback', mustBeParticipant, require('./controller/groupFeedbackEdit').all);

router.get('/feedback/:feedbackNumber', require('./controller/groupFeedbackShow').get);

router.patch('/participants', require('./controller/participants').patch);

router.all('/invite/:inviteToken?', require('./controller/invite').all);

// for profile
router.get('/profile/:userById', mustBeAuthenticated, require('./controller/coursesByUser').get);

