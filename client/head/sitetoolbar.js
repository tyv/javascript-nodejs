
document.addEventListener('click', onSearchClick);


// toggle search on/off, autofocus on input when "on"
function onSearchClick(event) {

  var searchToggle = event.target.closest('.sitetoolbar__search-toggle');

  if (searchToggle) {
    event.preventDefault();
    toggle();
  }
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


    if (!input.onkeydown) {
      input.onkeydown = function(e) {
        if (e.keyCode == 27) {
          this.value = "";
          toggle();
        }
      };
    }

    if (!input.onblur) {
      input.onblur = function(e) {
        toggle()
      };
    }
  } else {

    paranja = document.querySelector('.sitetoolbar__search-paranja');
    paranja.parentNode.removeChild(paranja);

  }
}