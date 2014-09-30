var getBrowserScrollCause = require('client/dom/getBrowserScrollCause');
var getDocumentHeight = require('client/dom/getDocumentHeight');

var lastPageYOffset = 0;

var requestAnimationFrameId;

var lastState = '';
// adds [data-scroll-prev] && [data-scroll] attributes
// both the previous and the next state => for CSS animation to draw the transition
function setState(newState) {
  document.body.setAttribute('data-scroll-prev', document.body.getAttribute('data-scroll') || '');

  if (!newState) {
    document.body.removeAttribute('data-scroll');
  } else {
    document.body.setAttribute('data-scroll', newState);
  }
  lastState = newState;
}


// when I scroll down on MacOS, Chrome does the bounce trick
// At the page bottom it is possible to scroll below the page, and then it goes back (inertia)
// the problem is that the actual scroll for mouse down goes a little bit up
var tolerance = {
  up:         10, // big enough to ignore chrome fallback
  upAtBottom: 60,
  down:       10
};

// don't handle onscroll more often than animation
window.addEventListener('scroll', function() {
  if (requestAnimationFrameId) return;

  requestAnimationFrameId = window.requestAnimationFrame(function() {
    onscroll();
    requestAnimationFrameId = null;
  });

});

function onscroll() {
  if (isScrollOutOfDocument()) { // Ignore bouncy scrolling in OSX
    return;
  }

  var sitetoolbar = document.querySelector('.sitetoolbar');
  var sitetoolbarHeight = sitetoolbar.offsetHeight;

  var browserScrollCause = getBrowserScrollCause();
//  console.log("scrollCause", browserScrollCause);


  if (browserScrollCause !== null) {
//    console.log("browser scroll");
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
//    console.log("close to top");
    // if close to page top, no scrolled state apply
    lastPageYOffset = window.pageYOffset;
    setState('');
    return;
  }


  if (lastState === '' && window.pageYOffset < sitetoolbarHeight) {
//    console.log("close to top");
    // if close to page top, no scrolled state apply
    lastPageYOffset = window.pageYOffset;
    return;
  }


  // now we are in the middle of the page or at the end
  // let's see if the user scrolls up or down

  var scrollDirection = window.pageYOffset > lastPageYOffset ? 'down' : 'up';
  var scrollDiff = Math.abs(window.pageYOffset - lastPageYOffset);

//  console.log("scrollDiff", scrollDiff);

  // если прокрутили мало - ничего не делаем, но и точку отсчёта не меняем
  if (tolerance[scrollDirection] > scrollDiff) return;

  lastPageYOffset = window.pageYOffset;

  // в MacOs при прокрутке вниз возможен инерционный отскок наверх
  // если мы внизу страницы, то tolerance выше
  var scrollBottom = getDocumentHeight() - window.pageYOffset - window.innerHeight;
  if (scrollDirection == 'up' && scrollBottom < tolerance.upAtBottom && window.pageYOffset > tolerance.upAtBottom) return;

//  console.log(scrollDirection, scrollDiff, tolerance[scrollDirection]);


  if (scrollDirection == 'up') {
//    console.log("scroll up");
    setState('in');
    return;
  }

  if (scrollDirection == 'down') {
//    console.log("scroll down");
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

  var pastTop = window.pageYOffset < 0,
      pastBottom = window.pageYOffset + window.innerHeight > getDocumentHeight();

  return pastTop || pastBottom;
}
