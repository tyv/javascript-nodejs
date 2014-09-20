var iframeResize = require('./iframeResize');
var closest = require('client/dom/closest');

function iframeResizeComplexCode(iframe) {
  iframeResize(iframe, function(err, height) {
    if (err) console.error(err);
    else closest(iframe, '[data-complex-code-content]').style.height = height + 'px';
  });
}

module.exports = iframeResizeComplexCode;
