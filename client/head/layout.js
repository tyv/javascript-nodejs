var getBrowserScrollCause = require('client/dom/getBrowserScrollCause');
var getDocumentHeight = require('client/dom/getDocumentHeight');

var lastPageYOffset = 0;

var requestAnimationFrameId;

var lastState = '';

var DEBUG = false;
function log() {
  if (DEBUG) {
    console.log.apply(console, arguments);
  }
}

// don't handle onscroll more often than animation
function onWindowScrollAndResize() {
  log("onWindowScrollAndResize", requestAnimationFrameId);
  if (requestAnimationFrameId) return;

  requestAnimationFrameId = window.requestAnimationFrame(function() {
    onscroll();
    requestAnimationFrameId = null;
  });

}

window.addEventListener('scroll', onWindowScrollAndResize);
window.addEventListener('resize', onWindowScrollAndResize);


function onscroll() {
  log("onscroll");
  if (isScrollOutOfDocument()) { // Ignore bouncy scrolling in OSX
    log("isScrollOutOfDocument");
    return;
  }

  var sitetoolbar = document.querySelector('.sitetoolbar');
  if (!sitetoolbar) {
    log("no siteoolbar");
    return; // page in a no-top-nav layout
  }

  var sitetoolbarHeight = sitetoolbar.offsetHeight;

  var sidebar = document.querySelector('.sidebar');


  sidebar.style.top = Math.max(sitetoolbar.getBoundingClientRect().bottom, 0) + 'px';
  console.log(sidebar.style.top, "!");
  return;

  var browserScrollCause = getBrowserScrollCause();
  log("scrollCause", browserScrollCause);


  if (browserScrollCause !== null) {
    log("browser scroll");
    // browser-initiated scroll: never show navigation (except on top), try to hide it
    // if page top - user will see the nav and the header
    // if not page top - user will see the header when opening a link with #hash
    //   (without a sitetoolbar which would overlay it)
    lastPageYOffset = window.pageYOffset;

    if (window.pageYOffset > sitetoolbarHeight) {
      setState('out');
    } else {
      setState('');
    }
    return;
  }


  if (lastState == 'in' && window.pageYOffset < 3) {
    log("close to top");
    // if close to page top, no scrolled state apply
    lastPageYOffset = window.pageYOffset;
    setState('');
    return;
  }


  if (lastState === '' && window.pageYOffset < sitetoolbarHeight) {
    log("close to top");
    // if close to page top, no scrolled state apply
    lastPageYOffset = window.pageYOffset;
    return;
  }


  // now we are in the middle of the page or at the end
  // let's see if the user scrolls up or down

  var scrollDirection = window.pageYOffset > lastPageYOffset ? 'down' : 'up';
  var scrollDiff = Math.abs(window.pageYOffset - lastPageYOffset);

  log("scrollDiff", scrollDiff);

  // если прокрутили мало - ничего не делаем, но и точку отсчёта не меняем
  if (tolerance[scrollDirection] > scrollDiff) return;

  lastPageYOffset = window.pageYOffset;

  // в MacOs при прокрутке вниз возможен инерционный отскок наверх
  // если мы внизу страницы, то tolerance выше
  var scrollBottom = getDocumentHeight() - window.pageYOffset - window.innerHeight;
  if (scrollDirection == 'up' && scrollBottom < tolerance.upAtBottom && window.pageYOffset > tolerance.upAtBottom) return;

  log(scrollDirection, scrollDiff, tolerance[scrollDirection]);

  if (scrollDirection == 'up') {
    log("scroll up");
    setState('in');
    return;
  }

  if (scrollDirection == 'down') {
    log("scroll down");
    setState('out');
    return;
  }

}

/**
 * determines if the scroll position is outside of document boundaries
 * @return {bool} true if out of bounds, false otherwise
 */
function isScrollOutOfDocument() {
  // no document yet
  if (document.readyState != 'complete') return false;

  var pastTop = window.pageYOffset < 0;
  var pastBottom = window.pageYOffset + document.documentElement.clientHeight > getDocumentHeight();

  log("pastTop", pastTop, "pastBottom", pastBottom);

  return pastTop || pastBottom;
}
