//require('./preventDocumentScroll');
var showLinkType = require('./showLinkType');
var load2x = require('./load2x');
var trackSticky = require('client/trackSticky');

exports.init = function() {
  showLinkType();

  if (window.devicePixelRatio > 1) {
    load2x();
  }

  window.addEventListener('scroll', trackSticky);
  trackSticky();
};

exports.trackSticky = trackSticky;