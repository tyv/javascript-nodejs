var Spinner = require('client/spinner');
var xhr = require('client/xhr');
var notification = require('client/notification');

function submitSubscribeForm(form, onSuccess) {

  if (!form.elements.email.value) {
    return;
  }

  var slugElems = form.elements.slug;

  var slugs = [];


  if (slugElems.length) {
    // checkboxes
    for (var i = 0; i < slugElems.length; i++) {
      var slugElem = slugElems[i];
      if (!slugElem.checked) continue;
      slugs.push(slugElem.value);
    }

  } else {
    // single element, explicit slug
    slugs.push(slugElems.value);
  }

  if (!slugs.length) {
    new notification.Info("Выберите рассылки из списка.");
    return;
  }

  var body = {
    email: form.elements.email.value,
    slug: slugs
    // no remove/replace => action is "add"
  };

  const request = xhr({
    method: 'POST',
    url:    form.action,
    body:   body
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
      form.elements.email.value = '';
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
