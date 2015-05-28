var Spinner = require('client/spinner');
var xhr = require('client/xhr');
var notification = require('client/notification');

function submitSubscribeForm(form, onSuccess) {

  if (!form.elements.email.value) {
    return;
  }

  const request = xhr({
    method: 'POST',
    url:    form.action,
    body:   {
      email: form.elements.email.value,
      slug: form.elements.slug.value
    }
  });

  var submitButton = form.querySelector('[type="submit"]');

  var spinner = new Spinner({
    elem:      submitButton,
    size:      'small',
    elemClass: 'button_loading'
  });
  spinner.start();
  submitButton.disabled = true;

  request.addEventListener('loadend', ()=> {
    spinner.stop();
    submitButton.disabled = false;
  });

  var formLabel = form.getAttribute('data-newsletter-subscribe-form');

  request.addEventListener('success', function(event) {
    if (this.status == 200) {

      window.metrika.reachGoal('NEWSLETTER-SUBSCRIBE', {
        form: formLabel
      });
      window.ga('send', 'event', 'newsletter', 'subscribe', formLabel);

      new notification.Success(event.result.message, 'slow');
      onSuccess && onSuccess();
    } else {

      window.metrika.reachGoal('NEWSLETTER-SUBSCRIBE-FAIL', {
        form: formLabel
      });
      window.ga('send', 'event', 'newsletter', 'subscribe-fail', formLabel);

      new notification.Error(event.result.message);
    }
  });

}

exports.submitSubscribeForm = submitSubscribeForm;
