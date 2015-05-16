var SignupWidget = require('./signupWidget');
var prism = require('client/prism');
var newsletter = require('newsletter/client');
var gaHitCallback = require('gaHitCallback');
var Spinner = require('client/spinner');
var xhr = require('client/xhr');

exports.init = function() {

  initSignupWidget();

  initNewsletterForm();

  prism.init();

  initSignupButton();

};

function initSignupWidget() {

  var signupWidget = document.querySelector('[data-elem="signup"]');
  if (signupWidget) {
    new SignupWidget({
      elem: signupWidget
    });
  }
}

function initNewsletterForm() {

  var form = document.querySelector('[data-newsletter-subscribe-form]');

  form.onsubmit = function(event) {
    event.preventDefault();
    newsletter.submitSubscribeForm(form);
  };

}

function initSignupButton() {

  var link = document.querySelector('[data-group-signup-link]');

  link.onclick = function(e) {

    if (window.currentUser) {
      return;
    }

    e.preventDefault();


    var spinner = new Spinner({
      elem:      link,
      size:      'small',
      class:     'submit-button__spinner',
      elemClass: 'submit-button_progress'
    });
    spinner.start();

    require.ensure('auth/client', function() {
      spinner.stop();
      var AuthModal = require('auth/client').AuthModal;
      new AuthModal({
        callback: function() {
          window.location.href = link.href;
        }
      });
    }, 'authClient');
  };

}
