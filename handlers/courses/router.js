var Router = require('koa-router');
var mustBeAuthenticated = require('auth').mustBeAuthenticated;
var mustBeParticipantOrTeacher = require('./lib/mustBeParticipantOrTeacher');
var mustBeParticipant = require('./lib/mustBeParticipant');
var mustBeTeacher = require('./lib/mustBeTeacher');
var mustBeAdmin = require('auth').mustBeAdmin;
var router = module.exports = new Router();

router.param('userById', require('users').routeUserById);
router.param('groupBySlug', require('./lib/routeGroupBySlug'));

router.get('/register-participants/:groupBySlug', mustBeAdmin, require('./controller/registerParticipants').get);


router.get('/', require('./controller/frontpage').get);
router.get('/:course', require('./controller/course').get);

// same controller for new signups & existing orders
router.get('/groups/:groupBySlug/signup', require('./controller/signup').get);
router.get('/orders/:orderNumber(\\d+)', require('./controller/signup').get);

router.get('/groups/:groupBySlug/info', mustBeParticipantOrTeacher, require('./controller/groupInfo').get);
router.get('/groups/:groupBySlug/materials', mustBeParticipantOrTeacher, require('./controller/groupMaterials').get);
router.post('/groups/:groupBySlug/materials', mustBeTeacher, require('./controller/groupMaterials').post);

// not groups/:groupBySlug/* url,
// because the prefix /course/download must be constant for nginx to proxy *.zip to node
router.get('/download/:groupBySlug/:filename', mustBeParticipantOrTeacher, require('./controller/groupMaterialsDownload').get);

router.all('/groups/:groupBySlug/feedback', mustBeParticipant, require('./controller/groupFeedbackEdit').all);

router.get('/:course/reviews', require('./controller/courseReviews').get);

router.get('/feedback/:feedbackNumber', require('./controller/groupFeedbackShow').get);

router.patch('/participants', require('./controller/participants').patch);
router.get('/download/participant/:participantId/certificate.jpg', mustBeAuthenticated, require('./controller/participantCertificateDownload').get);


router.all('/invite/:inviteToken?', require('./controller/invite').all);

// for profile
router.get('/profile/:userById', mustBeAuthenticated, require('./controller/coursesByUser').get);

