var scrollbarHeight = require('./getScrollbarHeight')();

module.exports = function(document) {
  var height = document.documentElement.scrollHeight || document.body.scrollHeight;

  if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
    // got a horiz scroll, let's add it
    height += scrollbarHeight;
  }

  return height;
};
