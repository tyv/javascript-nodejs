

document.addEventListener('click', onSearchClick);


// toggle search on/off, autofocus on input when "on"
function onSearchClick(event) {
  var searchToggle = event.target.closest('.sitetoolbar__search-toggle');

  if (searchToggle) {
    var sitetoolbar = document.querySelector('.sitetoolbar');
    sitetoolbar.classList.toggle('sitetoolbar_search_open');
    if (sitetoolbar.classList.contains('sitetoolbar_search_open')) {
      sitetoolbar.querySelector('.sitetoolbar__search-query input').focus();
    }
  }
}