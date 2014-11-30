
document.addEventListener('click', function(event) {
  if (event.target.dataset.sidebarToggle === undefined) return;

  document.querySelector('.page').classList.toggle('page_sidebar_on');

  if (document.querySelector('.page').classList.contains('page_sidebar_on')) {
    delete localStorage.noSidebar;
  } else {
    localStorage.noSidebar = 1;
  }


});
