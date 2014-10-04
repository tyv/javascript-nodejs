var findClosest = require('client/dom/findClosest');

module.exports = function() {

  var tooltipSpan = null;
  var shiftX = 8;
  var shiftY = 10;

  function updatePosition(event) {
    tooltipSpan.style.left = Math.min(event.clientX + shiftX, window.innerWidth - tooltipSpan.offsetWidth) + 'px';
    tooltipSpan.style.top = Math.min(event.clientY + shiftY, window.innerHeight - tooltipSpan.offsetHeight) + 'px';
  }

  // TODO: show tooltip for next/prev buttons with next/prev title
  document.addEventListener('mouseover', function(event) {
    var link = findClosest(event.target, 'a');
    if (!link) return;

    //if (!link.hasAttribute(''))

    tooltipSpan = document.createElement('span');
    tooltipSpan.className = 'link__type';
    tooltipSpan.setAttribute('data-url', link.getAttribute('href') || "My Title Name");

    document.body.appendChild(tooltipSpan);
    updatePosition(event);

    document.addEventListener('mousemove', updatePosition);
  });

  document.addEventListener('mouseout', function() {
    if (!tooltipSpan) return;

    document.removeEventListener('mousemove', updatePosition);
    tooltipSpan.remove();
    tooltipSpan = null;
  });
};
