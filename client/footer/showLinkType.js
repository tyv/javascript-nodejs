var findClosest = require('client/dom/findClosest');

module.exports = function() {

  var tooltipSpan = null;
  var shiftX = 8;
  var shiftY = 10;

  function updatePosition(event) {
    var left = event.clientX + shiftX;
    if (left + tooltipSpan.offsetWidth > document.documentElement.clientWidth) { // if beyond the right document border
      // mirror to the left
      left = Math.max(0, event.clientX - shiftX - tooltipSpan.offsetWidth);
    }
    tooltipSpan.style.left = left + 'px';

    var top = event.clientY + shiftY;
    if (top + tooltipSpan.offsetHeight > document.documentElement.clientHeight) {
      top = Math.max(0, event.clientY - shiftY - tooltipSpan.offsetHeight);
    }

    tooltipSpan.style.top = top + 'px';
  }

  // we show tooltip element for any link hover, but few of them actually get styled
  document.addEventListener('mouseover', function(event) {
    var link = findClosest(event.target, 'a');

    if (!link) return;

    tooltipSpan = document.createElement('span');
    tooltipSpan.className = 'link__type';

    if (link.getAttribute('data-tooltip')) {
      tooltipSpan.setAttribute('data-tooltip', link.getAttribute('data-tooltip'));
    } else {
      tooltipSpan.setAttribute('data-url', link.getAttribute('href'));
    }

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
