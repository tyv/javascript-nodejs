var getBrowserScrollCause = require('client/dom/getBrowserScrollCause');

var lastPageYOffset = 0;

var requestAnimationFrameId;

var DEBUG = false;
function log() {
  if (DEBUG) {
    console.log.apply(console, arguments);
  }
}

var TABLET_WIDTH = 840;

(function() {

  // don't handle onscroll more often than animation
  function onWindowScrollAndResizeThrottled() {
    log("onWindowScrollAndResizeThrottled", requestAnimationFrameId);
    if (requestAnimationFrameId) return;

    requestAnimationFrameId = window.requestAnimationFrame(function() {
      onWindowScrollAndResize();
      requestAnimationFrameId = null;
    });

  }

  window.addEventListener('scroll', onWindowScrollAndResizeThrottled);
  window.addEventListener('resize', onWindowScrollAndResizeThrottled);
  document.addEventListener('DOMContentLoaded', onWindowScrollAndResizeThrottled);

})();

function compactifySidebar() {
  log("compactifySidebar");
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

    log("decompact?", emptySpaceSize);

    // enough space to occupy the full height in decompacted form without scrollbar
    if (emptySpaceSize > 150) {
      sidebar.classList.remove('sidebar_compact');
    }

  } else {
    log(sidebarInner.scrollHeight, sidebarInner.clientHeight);
    if (sidebarInner.scrollHeight > sidebarInner.clientHeight) {
      log("compact!");
      sidebar.classList.add('sidebar_compact');
    }
  }


}

function onWindowScrollAndResize() {

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

  setUserScaleIfTablet();

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

function setUserScaleIfTablet() {
  var isTablet = document.documentElement.clientWidth <= TABLET_WIDTH;
  var content = document.querySelector('meta[name="viewport"]').content;
  content = content.replace(/user-scalable=\w+/, 'user-scalable=' + (isTablet ? 'yes' : 'no'));
  document.querySelector('meta[name="viewport"]').content = content;
}