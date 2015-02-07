//require('./preventDocumentScroll');
var showLinkType = require('./showLinkType');
var load2x = require('./load2x');

exports.init = function() {
  showLinkType();

  if (window.devicePixelRatio > 1) {
    load2x();
  }

};



//window.footer = module.exports;