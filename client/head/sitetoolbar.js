
document.addEventListener('click', onSearchClick);

var initialized = false;

var sitetoolbarClassName = document.documentElement.lang === 'ru' ? 'sitetoolbar' : 'sitetoolbar-light';
var sitetoolbarSelector = '.' + sitetoolbarClassName;

// toggle search on/off, autofocus on input when "on"
function onSearchClick(event) {

  if (!event.target.closest) return; // svg

  var searchToggle = event.target.closest(sitetoolbarSelector + '__search-toggle');

  if (searchToggle) {
    if (!initialized) initialize();
    toggle();
  }
}

function initialize() {

  var sitetoolbar = document.querySelector(sitetoolbarSelector);

  var input = sitetoolbar.querySelector(sitetoolbarSelector + '__search-input input');
  var find = sitetoolbar.querySelector(sitetoolbarSelector + '__find');

  var possibleSubmit;

  find.onmousedown = function(e) {
    possibleSubmit = true
  };

  input.onkeydown = function(e) {
    if (e.keyCode == 27) {
      this.value = "";
      toggle();
    }
  };

  input.onblur = function(e) {
    !possibleSubmit && toggle()
  };

  initialized = true;
}

function toggle() {

  var paranja,
      sitetoolbar = document.querySelector(sitetoolbarSelector);
    console.log(123);
  sitetoolbar.classList.toggle(sitetoolbarClassName + '_search_open');

  var input = sitetoolbar.querySelector(sitetoolbarSelector + '__search-input input');

  if (sitetoolbar.classList.contains(sitetoolbarClassName + '_search_open')) {

    input.focus();

    paranja = document.createElement('div');
    paranja.className = sitetoolbarClassName + ' ' + sitetoolbarClassName + '__search-paranja';
    paranja.style.top = sitetoolbar.offsetHeight + 'px';

    document.body.appendChild(paranja);
    document.body.classList.add('paranja-open');


  } else {

    paranja = document.querySelector(sitetoolbarSelector + '__search-paranja');
    paranja.parentNode.removeChild(paranja);
    document.body.classList.remove('paranja-open');

  }
}
