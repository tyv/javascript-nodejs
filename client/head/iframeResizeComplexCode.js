var iframeResize = require('./iframeResize');
var closest = require('client/dom/closest');

function iframeResizeComplexCode(iframe) {
  iframeResize(iframe, function(err, height) {
    if (err) console.error(err);
    // 30 px is the margin around the iframe
    else closest(iframe, '[data-complex-code-content]').style.height = +height + 30 + 'px';
  });
}

module.exports = iframeResizeComplexCode;
