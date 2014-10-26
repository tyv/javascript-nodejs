var throttle = require('lib/throttle');



/*
var resetSidebarSize = throttle(function() {

  var sidebar = document.querySelector('.sidebar__inner');
  if (!sidebar) return;

  var sidebarContent = sidebar.querySelector('.sidebar__content');

  if (sidebar.scrollHeight == sidebar.clientHeight) {
    console.log(sidebar.scrollHeight, sidebar.clientHeight);
    sidebar.classList.add('sidebar__spacey');
  } else {
    sidebar.classList.remove('sidebar__spacey');
  }

  // todo: go back from compact?

  window.requestAnimationFrame(resetSidebarSize);

}, 200);

window.requestAnimationFrame(resetSidebarSize);
  */