var SignupWidget = require('./signupWidget');

exports.init = function() {

  var signupWidget = document.querySelector('[data-elem="signup"]');
  if (signupWidget) {
    new SignupWidget({
      elem: signupWidget
    });
  }

};
