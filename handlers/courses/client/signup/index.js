var SignupWidget = require('./signupWidget');

exports.init = function() {

  initSignupWidget();

};

function initSignupWidget() {

  var signupWidget = document.querySelector('[data-elem="signup"]');
  if (!signupWidget) return;

  new SignupWidget({
    elem: signupWidget
  });
}

