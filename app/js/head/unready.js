
// cancel clicks on <a class="unready"> and <button class="unready">
document.addEventListener("click", function(e) {
  var target = event.target;
  while(target) {
    if (~["a","button"].indexOf(target.tagName) && target.classList.contains('unready')) {
      event.preventDefault();
      return;
    }
    target = target.parentElement;
  }
});

// cancel submits of <form class="unready">
document.addEventListener("submit", function(e) {
  if (e.target.classList.contains('unready')) {
    event.preventDefault();
  }
});
