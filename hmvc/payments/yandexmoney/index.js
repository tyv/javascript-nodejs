const config = require('config');
const jade = require('jade');
const path = require('path');

var router = require('./router');

exports.middleware = router.middleware();

exports.renderForm = require('./renderForm');
