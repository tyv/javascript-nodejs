
require('styles');

require('client/polyfill');

try {
  window.localStorage.testProperty = 1;
  delete window.localStorage.testProperty;
} catch(e) {
  // localStorage disabled or forbidden
  try {
    window.localStorage = {};
    // so that operations on it won't fail
  } catch(e) {
    /* can happen TypeError: Attempted to assign to readonly property. */
  }
}

if (!window.localStorage) { // disabled

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

