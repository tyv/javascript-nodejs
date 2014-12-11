//require('./preventDocumentScroll');
var showLinkType = require('./showLinkType');

exports.init = function() {
  showLinkType();
};

window.footer = module.exports;