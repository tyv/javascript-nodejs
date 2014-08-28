var lastPageYOffset = window.pageYOffset;

window.addEventListener('scroll', function() {
  if (window.pageYOffset > lastPageYOffset) {
    // scrolled down
    document.body.classList.add('scrolled-out');
  } else {
    // scrolledup
    document.body.classList.remove('scrolled-out');
  }
  lastPageYOffset = window.pageYOffset;
});
