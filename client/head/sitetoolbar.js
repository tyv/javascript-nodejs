var lastPageYOffset = window.pageYOffset;


var ignoreJump = false;

window.addEventListener('scroll', function() {
  console.log(window.pageYOffset);
  if (ignoreJump) return;
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

// don't autoscroll after a click on a navigation header
document.addEventListener('click', function() {
  ignoreJump = true;
  setTimeout(function() {
    ignoreJump = false;
  }, 0);
});
