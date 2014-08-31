var lastPageYOffset = window.pageYOffset;


var ignoreJump = false;

window.addEventListener('scroll', function() {
  if (ignoreJump) return;
  if (window.pageYOffset > lastPageYOffset) {
    // scrolled down, hide nav
    document.body.classList.add('scrolled-out');
  } else {
    // scrolled up
    document.body.classList.remove('scrolled-out');
  }
  lastPageYOffset = window.pageYOffset;
});

// don't autoscroll when a click on a navigation header
document.addEventListener('click', function() {
  ignoreJump = true;
  setTimeout(function() {
    ignoreJump = false;
  }, 0);
});
