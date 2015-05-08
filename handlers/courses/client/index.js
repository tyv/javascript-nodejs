var SignupWidget = require('./signupWidget');
var prism = require('client/prism');

exports.init = function() {

  var signupWidget = document.querySelector('[data-elem="signup"]');
  if (signupWidget) {
    new SignupWidget({
      elem: signupWidget
    });
  }

  prism.init();

};
