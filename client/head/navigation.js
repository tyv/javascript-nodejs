// navigation starts to work right now
document.addEventListener('keydown', navigate);

var ctrlOrAlt = ~navigator.userAgent.toLowerCase().indexOf("mac os x") ? 'ctrl' : 'alt';

function navigate(event) {
  // don't react on Ctrl-> <- if in text
  if (~['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName)) return;

  if (!event[ctrlOrAlt + 'Key']) return;

  var rel = null;
  switch (event.keyCode) {
  case 0x25:
    rel = 'next';
    break;
  case 0x27:
    rel = 'prev';
    break;
  }

  var link = document.querySelector('link[rel="' + rel + '"]');
  if (!link) return;

  document.location = link.href;
  event.preventDefault();

}


document.addEventListener('DOMContentLoaded', function() {
  var keyDesc = ctrlOrAlt[0].toUpperCase() + ctrlOrAlt.slice(1);

  var shortcut;

  var next = document.querySelector('link[rel="next"]');
  if (next) {
    shortcut = document.querySelector('a[href="' + next.getAttribute('href') + '"] .page__nav-text-shortcut');
    shortcut.innerHTML = keyDesc + ' + <span class="page__nav-text-arr">→</span>';
  }

  var prev = document.querySelector('link[rel="prev"]');
  if (prev) {
    shortcut = document.querySelector('a[href="' + prev.getAttribute('href') + '"] .page__nav-text-shortcut');
    shortcut.innerHTML = keyDesc + ' + <span class="page__nav-text-arr">←</span>';
  }

});
