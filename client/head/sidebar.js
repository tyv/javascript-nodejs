
document.addEventListener('click', onClick);

document.addEventListener('keydown', onKeyDown);

function toggle() {

  document.querySelector('.page').classList.toggle('page_sidebar_on');

  if (document.querySelector('.page').classList.contains('page_sidebar_on')) {
    delete localStorage.noSidebar;
  } else {
    localStorage.noSidebar = 1;
  }

}

function onClick(event) {
  if (event.target.dataset.sidebarToggle === undefined) return;

  toggle();
}


function onKeyDown(event) {
  // don't react on Ctrl-> <- if in text
  if (~['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName)) return;

  if (event.keyCode != "S".charCodeAt(0)) return;

  if (~navigator.userAgent.toLowerCase().indexOf("mac os x")) {
    if (!event.metaKey || !event.altKey) return;
  } else {
    if (!event.altKey) return;
  }

  toggle();
  event.preventDefault();

}
