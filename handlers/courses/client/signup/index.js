var SignupWidget = require('./signupWidget');

initSignupWidget();

function initSignupWidget() {

  var signupWidget = document.querySelector('[data-elem="signup"]');
  if (!signupWidget) return;

  new SignupWidget({
    elem: signupWidget
  });
}

