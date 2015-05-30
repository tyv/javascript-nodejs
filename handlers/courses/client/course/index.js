var newsletter = require('newsletter/client');
var Spinner = require('client/spinner');
var xhr = require('client/xhr');

initNewsletterForm();

initSignupButton();

function initNewsletterForm() {

  var form = document.querySelector('[data-newsletter-subscribe-form]');
  if (!form) return;

  form.onsubmit = function(event) {
    event.preventDefault();
    newsletter.submitSubscribeForm(form);
  };

}

function initSignupButton() {

  var link = document.querySelector('[data-group-signup-link]');
  if (!link) return;

  link.onclick = function(event) {

    if (window.currentUser) {
      return;
    }

    event.preventDefault();

    var spinner = new Spinner({
      elem:      link,
      size:      'small',
      class:     'submit-button__spinner',
      elemClass: 'submit-button_progress'
    });
    spinner.start();

    require.ensure('auth/client/authModal', function() {
      spinner.stop();
      var AuthModal = require('auth/client/authModal');
      new AuthModal({
        callback: function() {
          window.location.href = link.href;
        }
      });
    }, 'authClient');
  };

}
