
require('client/polyfill');

if (window.localStorage) { // disabled
  window.localStorage = {};
}

require('./unready');

//exports.init = require('./init');
exports.login = require('./login');

require('./logout');
exports.Modal = require('./modal');
exports.fontTest = require('./fontTest');
exports.resizeOnload = require('./resizeOnload');
require('./layout');
require('./sitetoolbar');
require('./sidebar');
require('./navigationArrows');
require('./hover');
require('./runDemo');
require('./trackLinks');

// must use CommonsChunkPlugin
// to ensure that other modules use exactly this (initialized) client/notify
require('client/notification').init();
