module.exports = function() {
  window.addEventListener('scroll', trackSticky);
  trackSticky();
};


function trackSticky() {

  var stickyElems = document.querySelectorAll('[data-sticky]');

  for (var i = 0; i < stickyElems.length; i++) {
    var stickyElem = stickyElems[i];

    if (stickyElem.getBoundingClientRect().top < 0) {
      // become fixed
      if (stickyElem.style.cssText) {
        throw new Error("data-sticky element may not have style");
      }

      var placeholder = createPlaceholder(stickyElem);
      
      stickyElem.parentNode.insertBefore(placeholder, stickyElem);
      stickyElem.style.position = 'fixed';
      stickyElem.style.top = 0;
      stickyElem.style.zIndex = 1;
      stickyElem.style.background = 'white'; // non-transparent to cover the text
      stickyElem.style.margin = 0;
      stickyElem.style.width = placeholder.offsetWidth + 'px'; // keep same width as before
      stickyElem.placeholder = placeholder;
    } else if (stickyElem.placeholder && stickyElem.placeholder.getBoundingClientRect().top > 0) {
      // become non-fixed
      stickyElem.style.cssText = '';
      stickyElem.placeholder.remove();
      stickyElem.placeholder = null;
    }
  }

}

/**
 * Creates a placeholder w/ same size & margin
 * @param elem
 * @returns {*|!HTMLElement}
 */
function createPlaceholder(elem) {
  var placeholder = document.createElement('div');
  var style = getComputedStyle(elem);
  placeholder.style.width = elem.offsetWidth + 'px';
  placeholder.style.marginLeft = style.marginLeft;
  placeholder.style.marginRight = style.marginRight;
  placeholder.style.height = elem.offsetHeight + 'px';
  placeholder.style.marginBottom = style.marginBottom;
  placeholder.style.marginTop = style.marginTop;
  return placeholder;
}