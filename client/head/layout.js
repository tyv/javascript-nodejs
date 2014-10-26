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
document.addEventListener('DOMContentLoaded', onWindowScrollAndResize);

function compactifySidebar() {
  var sidebar = document.querySelector('.sidebar');

  var sidebarContent = sidebar.querySelector('.sidebar__content');
  var sidebarInner = sidebar.querySelector('.sidebar__inner');

  var hasStickyFooter = sidebar.classList.contains('sidebar_sticky-footer');
  var isCompact = sidebar.classList.contains('sidebar_compact');

  if (isCompact) {
    var emptySpaceSize;
    if (hasStickyFooter) {
      emptySpaceSize = sidebarContent.lastElementChild.getBoundingClientRect().top -
      sidebarContent.lastElementChild.previousElementSibling.getBoundingClientRect().bottom;
    } else {
      emptySpaceSize = sidebarContent.getBoundingClientRect().bottom -
      sidebarContent.lastElementChild.getBoundingClientRect().bottom;
    }

    //console.log("decompact?", emptySpaceSize);

    // enough space to occupy the full height in decompacted form without scrollbar
    if (emptySpaceSize > 150) {
      sidebar.classList.remove('sidebar_compact');
    }

  } else {
    if (sidebarInner.scrollHeight > sidebarInner.clientHeight) {
      //console.log("compact!");
      sidebar.classList.add('sidebar_compact');
    }
  }


}

function onscroll() {

  var sitetoolbar = document.querySelector('.sitetoolbar');
  if (!sitetoolbar) {
    log("no sitetoolbar");
    return; // page in a no-top-nav layout
  }

  var sitetoolbarHeight = sitetoolbar.offsetHeight;

  var sidebar = document.querySelector('.sidebar');

  if (sidebar) {
    sidebar.style.top = Math.max(sitetoolbar.getBoundingClientRect().bottom, 0) + 'px';
    compactifySidebar();
  }

  var browserScrollCause = getBrowserScrollCause();
  log("scrollCause", browserScrollCause);

  if (browserScrollCause !== null) {
    log("browser scroll");
    // browser-initiated scroll: never show navigation (except on top), try to hide it
    // if page top - user will see the nav and the header
    // if not page top - user will see the header when opening a link with #hash
    //   (without a sitetoolbar which would overlay it)
    lastPageYOffset = window.pageYOffset;
    return;
  }

  // now we are in the middle of the page or at the end
  // let's see if the user scrolls up or down

  var scrollDirection = window.pageYOffset > lastPageYOffset ? 'down' : 'up';

  //console.log("HERE", scrollDirection, window.pageYOffset, window.pageYOffset > sitetoolbarHeight + 20,     window.pageYOffset + document.documentElement.clientHeight < document.documentElement.scrollHeight - 60);
  if (scrollDirection == 'up' &&
      // not at page top
    window.pageYOffset > sitetoolbarHeight + 20 &&
      // not at page bottom (may be bounce)
    window.pageYOffset + document.documentElement.clientHeight < document.documentElement.scrollHeight - 60
  ) {
    document.body.classList.add('page_bottom-nav');
  } else {
    document.body.classList.remove('page_bottom-nav');
  }

  lastPageYOffset = window.pageYOffset;

}
