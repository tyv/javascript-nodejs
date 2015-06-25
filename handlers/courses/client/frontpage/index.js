
initParticipantsSlider();

function initParticipantsSlider() {
  var slider = document.querySelector('[data-participants-slider]');

  var list = slider.querySelector('ul');
  var arrowLeft = slider.querySelector('.participants-logos__arr_left');
  var arrowRight = slider.querySelector('.participants-logos__arr_right');

  var transformX = 0;

  render();

  arrowLeft.onclick = function() {
    transformX -= list.clientWidth;
    if (transformX < 0) transformX = 0;

    render();
  };

  arrowRight.onclick = function() {
    transformX = Math.min(transformX + list.clientWidth, list.scrollWidth - list.clientWidth);
    render();
  };

  function render() {

    list.style.transform = `translateX(${-transformX}px)`;

    if (transformX === 0) {
      slider.classList.add('participants-logos__slider_disable_left');
    } else {
      slider.classList.remove('participants-logos__slider_disable_left');
    }

    if (transformX == list.scrollWidth - list.clientWidth) {
      slider.classList.add('participants-logos__slider_disable_right');
    } else {
      slider.classList.remove('participants-logos__slider_disable_right');
    }

  }

}
