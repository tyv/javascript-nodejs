var Spinner = require('client/spinner');
var xhr = require('client/xhr');
var notification = require('client/notification');

function init() {
  document.onsubmit = function(e) {
    if (e.target.hasAttribute("data-newsletter-subscribe-form")) {
      e.preventDefault();
      submitSubscribeForm(e.target);
    }
  };

}

function submitSubscribeForm(form) {

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

  request.addEventListener('success', function(event) {
    if (this.status == 200) {
      new notification.Success(event.result.message);
    } else {
      new notification.Error(event.result.message);
    }
  });


}

exports.init = init;
