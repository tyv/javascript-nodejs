var lastPageYOffset;

var ignoreJump = false;
var requestAnimationFrameId;

// when I scroll down on MacOS, Chrome does the bounce trick
// At the page bottom it is possible to scroll below the page, and then it goes back (inertia)
// the problem is that the actual scroll for mouse down goes a little bit up
var tolerance = {
  up:   10, // big enough to ignore chrome fallback
  upAtBottom: 60,
  down: 10
};

// defer event registration to handle browser
// potentially restoring previous scroll position
setTimeout(init, 200);

function init() {
  lastPageYOffset = window.pageYOffset;

  window.addEventListener('scroll', onscroll);
}

function onscroll() {
  if (requestAnimationFrameId) return;

  requestAnimationFrameId = window.requestAnimationFrame(function() {
    showHideSiteToolbar();
    requestAnimationFrameId = null;
  });

}

function showHideSiteToolbar() {
  if (isScrollOutOfDocument()) { // Ignore bouncy scrolling in OSX
    return;
  }

  var scrollTop = window.pageYOffset;

  var scrollDirection = scrollTop > lastPageYOffset ? 'down' : 'up';
  var scrollDiff = Math.abs(scrollTop - lastPageYOffset);

//  console.log("scrollDiff", scrollDiff);

  // если прокрутили мало - ничего не делаем, но и точку отсчёта не меняем
  if (tolerance[scrollDirection] > scrollDiff) return;

  // в MacOs при прокрутке вниз возможен инерционный отскок наверх
  // если мы внизу страницы, то tolerance выше
  var scrollBottom = getDocumentHeight() - scrollTop - window.innerHeight;
  if (scrollDirection == 'up' && scrollBottom < tolerance.upAtBottom && scrollTop > tolerance.upAtBottom) return;

  lastPageYOffset = scrollTop;

  if (ignoreJump) return;

//  console.log(scrollDirection, scrollDiff, tolerance[scrollDirection]);


  if (scrollTop === 0 || scrollDirection == 'up') {
    document.body.classList.remove('scrolled-out');
    return;
  }

  if (scrollDirection == 'down') {
    document.body.classList.add('scrolled-out');
  }

}

/**
 * determines if the scroll position is outside of document boundaries
 * @param  {int}  currentScrollY the current y scroll position
 * @return {bool} true if out of bounds, false otherwise
 */
function isScrollOutOfDocument() {
  var pastTop = window.pageYOffset < 0,
      pastBottom = window.pageYOffset + window.innerHeight > getDocumentHeight();

  return pastTop || pastBottom;
}

/**
 * Gets the height of the document
 * @see http://james.padolsey.com/javascript/get-document-height-cross-browser/
 * @return {int} the height of the document in pixels
 */
function getDocumentHeight() {
  var body = document.body,
      documentElement = document.documentElement;

  return Math.max(
    body.scrollHeight, documentElement.scrollHeight,
    body.offsetHeight, documentElement.offsetHeight,
    body.clientHeight, documentElement.clientHeight
  );
}

/*
 window.addEventListener('scroll', function() {
 console.log(window.pageYOffset);
 // setTimeout(function() {
 if (window.pageYOffset < lastPageYOffset || window.pageYOffset < 5) {
 console.log("UP");
 // scrolled up
 document.body.classList.remove('scrolled-out');
 } else if (window.pageYOffset > lastPageYOffset + 30) {
 console.log("DOWN");
 // scrolled down, hide nav
 document.body.classList.add('scrolled-out');
 }

 lastPageYOffset = window.pageYOffset;
 // }, 100);
 });
 */
// don't autoscroll after a click on a navigation header
document.addEventListener('click', function() {
  ignoreJump = true;
  setTimeout(function() {
    ignoreJump = false;
  }, 0);
});
