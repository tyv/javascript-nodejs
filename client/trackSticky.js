module.exports = trackSticky;


function trackSticky() {

  var stickyElems = document.querySelectorAll('[data-sticky]');

  for (var i = 0; i < stickyElems.length; i++) {
    var stickyElem = stickyElems[i];

    if (stickyElem.getBoundingClientRect().top < 0) {
      // become fixed
      if (stickyElem.style.cssText) {
        // inertia: happens when scrolled fast too much to bottom
        // http://ilyakantor.ru/screen/2015-02-24_1555.swf
        return;
      }

      var savedLeft = stickyElem.getBoundingClientRect().left;
      var placeholder = createPlaceholder(stickyElem);

      stickyElem.parentNode.insertBefore(placeholder, stickyElem);

      document.body.appendChild(stickyElem);
      stickyElem.classList.add('sticky');
      stickyElem.style.position = 'fixed';
      stickyElem.style.top = 0;
      stickyElem.style.left = savedLeft + 'px';
      // zIndex > 1001, because overlays have lower zindexes, and trackSticky is used in overlays too,
      // e.g site map, and they have zindex 1000-10000
      stickyElem.style.zIndex = 10001;
      stickyElem.style.background = 'white'; // non-transparent to cover the text
      stickyElem.style.margin = 0;
      stickyElem.style.width = placeholder.offsetWidth + 'px'; // keep same width as before
      stickyElem.placeholder = placeholder;
    } else if (stickyElem.placeholder && stickyElem.placeholder.getBoundingClientRect().top > 0) {
      // become non-fixed
      stickyElem.style.cssText = '';
      stickyElem.classList.remove('sticky');
      stickyElem.placeholder.parentNode.insertBefore(stickyElem, stickyElem.placeholder);
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