
// cancel clicks on <a class="unready"> and <button class="unready">
document.addEventListener("click", function(event) {
  var target = event.target;
  while(target) {
    if (~["A","BUTTON"].indexOf(target.tagName) && target.classList.contains('unready')) {
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
