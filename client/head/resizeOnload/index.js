var iframeResize = require('./iframeResize');
var findClosest = require('client/dom/findClosest');
var throttle = require('lib/throttle');
// track resized iframes in window.onresize
var onResize = [];

exports.iframe = function(iframe) {
  function resize() {
    iframeResize.async(iframe, function(err, height) {
      if (err) console.error(err);
      if (height) iframe.style.height = height + 'px';
    });
  }

  resize();
  onResize.push(resize);
};

exports.codeTabs = function(iframe, initialHeight) {
  function resize() {

    // add arrows if needed
    var elem = findClosest(iframe, '.code-tabs');
    var contentElem = findClosest(iframe, '[data-code-tabs-content]');
    var switchesElem = elem.querySelector('[data-code-tabs-switches]');
    var switchesElemItems = switchesElem.firstElementChild;

    if (switchesElemItems.offsetWidth > switchesElem.offsetWidth) {
      elem.classList.add('code-tabs_scroll');
    } else {
      elem.classList.remove('code-tabs_scroll');
    }

    // resize iframe only if no initial height is set
    // so it's better not to set initial height to iframes, otherwise they won't autoresize on window resize
    if (!initialHeight) {
      iframeResize.async(iframe, function(err, height) {
        if (err) console.error(err);
        // 30 px is the margin around the iframe
        if (height) contentElem.style.height = +height + 30 + 'px';
      });
    }

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
