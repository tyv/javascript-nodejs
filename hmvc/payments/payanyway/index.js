const jade = require('jade');
const path = require('path');
var config = require('config');
var payment = require('payment');

var router = require('./router');

exports.middleware = router.middleware();

exports.renderForm = require('./renderForm');

