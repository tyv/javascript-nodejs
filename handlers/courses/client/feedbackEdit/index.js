var thumb = require('client/image').thumb;
var PhotoLoadWidget = require('../lib/photoLoadWidget');
var notification = require('client/notification');

function init() {

  initFeedbackForm();

}




function initFeedbackForm() {

  var feedbackForm = document.querySelector('[data-feedback-form]');

  feedbackForm.onsubmit = function(event) {
    var starInput = [].filter.call(
      feedbackForm.querySelectorAll('[name="stars"]'),
      function(input) { return input.checked; }
    );

    if (!starInput.length) {
      // actually an error, but let's show it nicely
      new notification.Success("Поставьте, пожалуйста, курсу оценку.");
      document.querySelector('.rating-chooser').parentNode.scrollIntoView();
      window.scrollBy(0, -100);
      event.preventDefault();
      return;
    }

    if (!feedbackForm.elements.content.value) {
      new notification.Error("Вы забыли написать текст отзыва.");
      feedbackForm.elements.content.scrollIntoView();
      window.scrollBy(0, -100);
      event.preventDefault();
      return;
    }

  };


  var photoWidgetElem = feedbackForm.querySelector('[data-photo-load]');

  new PhotoLoadWidget({
    elem: photoWidgetElem,
    onSuccess: function(imgurImage) {
      feedbackForm.querySelector('.course-feedback__userpic-img').src = thumb(imgurImage.link, 86, 86);
      photoWidgetElem.querySelector('i').style.backgroundImage = `url('${thumb(imgurImage.link, 64, 64)}')`;
      photoWidgetElem.querySelector('input').value = imgurImage.imgurId;
    },
    onLoadStart: function() {
      photoWidgetElem.classList.add('modal-overlay_light');
      feedbackForm.querySelector('button[type="submit"]').disabled = true;
    },
    onLoadEnd: function() {
      photoWidgetElem.classList.remove('modal-overlay_light');
      feedbackForm.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

init();
