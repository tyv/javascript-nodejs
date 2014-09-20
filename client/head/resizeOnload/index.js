var iframeResize = require('./iframeResize');
var closest = require('client/dom/closest');
var throttle = require('lib/throttle');
// track resized iframes in window.onresize
var onResize = [];

function iframeResizeAsync(iframe, callback) {
  // delay to let the code inside the iframe finish
  setTimeout(function() {
    iframeResize(iframe, callback);
  }, 0);
}


exports.iframe = function(iframe) {
  function resize() {
    iframeResizeAsync(iframe, function(err, height) {
      if (err) console.error(err);
      if (height) iframe.style.height = height + 'px';
    });
  }

  resize();
  onResize.push(resize);
};

exports.complexCode = function(iframe) {
  function resize() {
    iframeResizeAsync(iframe, function(err, height) {
      if (err) console.error(err);
      // 30 px is the margin around the iframe
      console.log(height);
      if (height) closest(iframe, '[data-complex-code-content]').style.height = +height + 30 + 'px';
    });
  }

  resize();
  onResize.push(resize);
};



window.addEventListener('resize', throttle(function() {
  console.log("RESIZE");
  onResize.forEach(function(resize) {
    resize();
  });
}, 200));
