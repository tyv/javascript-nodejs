
document.addEventListener('click', onSearchClick);

var initialized = false;

// toggle search on/off, autofocus on input when "on"
function onSearchClick(event) {
  if (!event.target.closest) return; // svg

  var searchToggle = event.target.closest('.sitetoolbar__search-toggle');

  if (searchToggle) {
    if (!initialized) initialize();
    toggle();
  }
}

function initialize() {
  var sitetoolbar = document.querySelector('.sitetoolbar');

  var input = sitetoolbar.querySelector('.sitetoolbar__search-input input');

  input.onkeydown = function(e) {
    if (e.keyCode == 27) {
      this.value = "";
      toggle();
    }
  };

  input.onblur = function(e) {
    toggle();
  };

  initialized = true;
}

function toggle() {
  var paranja,
      sitetoolbar = document.querySelector('.sitetoolbar');

  sitetoolbar.classList.toggle('sitetoolbar_search_open');

  var input = sitetoolbar.querySelector('.sitetoolbar__search-input input');

  if (sitetoolbar.classList.contains('sitetoolbar_search_open')) {

    input.focus();

    paranja = document.createElement('div');
    paranja.className = 'sitetoolbar sitetoolbar__search-paranja';
    paranja.style.top = sitetoolbar.offsetHeight + 'px';

    document.body.appendChild(paranja);
    document.body.classList.add('paranja-open');


  } else {

    paranja = document.querySelector('.sitetoolbar__search-paranja');
    paranja.parentNode.removeChild(paranja);
    document.body.classList.remove('paranja-open');

  }
}