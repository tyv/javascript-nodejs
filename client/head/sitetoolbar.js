

document.addEventListener('click', onSearchClick);


// toggle search on/off, autofocus on input when "on"
function onSearchClick(event) {
  var searchToggle = event.target.closest('.sitetoolbar__search-toggle');

  if (searchToggle) {
    toggle();
  }
}

function toggle() {
  var sitetoolbar = document.querySelector('.sitetoolbar');
  sitetoolbar.classList.toggle('sitetoolbar_search_open');

  var input = sitetoolbar.querySelector('.sitetoolbar__search-query input');
  if (sitetoolbar.classList.contains('sitetoolbar_search_open')) {
    input.focus();

    if (!input.onkeydown) {
      input.onkeydown = function(e) {
        if (e.keyCode == 27) {
          this.value = "";
          toggle();
        }
      };
    }
  }
}